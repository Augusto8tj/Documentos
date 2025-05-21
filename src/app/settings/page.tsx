
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel, // Used for react-hook-form fields
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, User, Palette } from "lucide-react";
import { Label } from "@/components/ui/label"; // Import standard Label

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }).max(50, { message: "O nome não pode exceder 50 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um endereço de e-mail válido." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type Theme = "light" | "dark" | "system" | "feminine" | "professional";

const localStorageProfileKey = "docflow-profile";
const localStorageThemeKey = "docflow-active-theme"; // Updated key

export default function SettingsPage() {
  const { toast } = useToast();
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme>("system");

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  // Load profile from localStorage
  useEffect(() => {
    const storedProfile = localStorage.getItem(localStorageProfileKey);
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile) as ProfileFormValues;
        profileForm.reset(profile);
      } catch (error) {
        console.error("Erro ao carregar perfil do localStorage:", error);
      }
    }
  }, [profileForm]);

  // Load theme from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem(localStorageThemeKey) as Theme | null;
    if (storedTheme && ["light", "dark", "system", "feminine", "professional"].includes(storedTheme)) {
      setSelectedTheme(storedTheme);
    }
  }, []);


  const handleProfileSubmit = (values: ProfileFormValues) => {
    setIsSubmittingProfile(true);
    try {
      localStorage.setItem(localStorageProfileKey, JSON.stringify(values));
      toast({
        title: "Perfil Atualizado",
        description: "Suas informações de perfil foram salvas localmente.",
      });
    } catch (error) {
      toast({
        title: "Erro ao Salvar Perfil",
        description: "Não foi possível salvar seu perfil. Verifique as permissões do navegador.",
        variant: "destructive",
      });
      console.error("Erro ao salvar perfil no localStorage:", error);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme);
    localStorage.setItem(localStorageThemeKey, theme);
    
    // Remove all theme classes first
    document.documentElement.classList.remove("dark", "theme-feminine", "theme-professional");

    // Apply new theme class
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "feminine") {
      document.documentElement.classList.add("theme-feminine");
    } else if (theme === "professional") {
      document.documentElement.classList.add("theme-professional");
    } else if (theme === "system") { 
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      }
    }
    // For "light", no class is needed as it's the default.

    // Dispatch storage event for ThemeManager to pick up if needed, especially for "system"
    window.dispatchEvent(new StorageEvent('storage', { key: localStorageThemeKey, newValue: theme }));
    
    let themeName = "Padrão do Sistema";
    if (theme === "light") themeName = "Claro";
    else if (theme === "dark") themeName = "Escuro";
    else if (theme === "feminine") themeName = "Feminino";
    else if (theme === "professional") themeName = "Profissional";

     toast({
        title: "Tema Alterado",
        description: `O tema foi definido como ${themeName}.`,
      });
  };


  return (
    <div className="container mx-auto py-8 space-y-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Configurações</h1>
        <p className="text-lg text-muted-foreground mt-1">
          Gerencie suas preferências e configurações do sistema.
        </p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Perfil do Usuário</CardTitle>
          <CardDescription>Estas informações são salvas localmente no seu navegador.</CardDescription>
        </CardHeader>
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu.email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-end">
              <Button type="submit" disabled={isSubmittingProfile} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmittingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Perfil
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Aparência</CardTitle>
          <CardDescription>Escolha como o sistema DocFlow deve aparecer para você.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>Tema</Label> 
          <RadioGroup
            value={selectedTheme}
            onValueChange={(value: string) => handleThemeChange(value as Theme)}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2"
          >
            <div className="flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-accent/50 transition-colors"> 
              <RadioGroupItem value="light" id="theme-light" />
              <Label htmlFor="theme-light" className="font-normal cursor-pointer flex-1"> 
                Claro
              </Label>
            </div>
            <div className="flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-accent/50 transition-colors"> 
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label htmlFor="theme-dark" className="font-normal cursor-pointer flex-1"> 
                Escuro
              </Label>
            </div>
            <div className="flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-accent/50 transition-colors"> 
              <RadioGroupItem value="system" id="theme-system" />
              <Label htmlFor="theme-system" className="font-normal cursor-pointer flex-1"> 
                Padrão do Sistema
              </Label>
            </div>
            <div className="flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-accent/50 transition-colors"> 
              <RadioGroupItem value="feminine" id="theme-feminine" />
              <Label htmlFor="theme-feminine" className="font-normal cursor-pointer flex-1"> 
                Feminino
              </Label>
            </div>
            <div className="flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-accent/50 transition-colors"> 
              <RadioGroupItem value="professional" id="theme-professional" />
              <Label htmlFor="theme-professional" className="font-normal cursor-pointer flex-1"> 
                Profissional
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
