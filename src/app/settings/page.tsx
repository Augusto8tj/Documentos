
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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, User, Palette } from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }).max(50, { message: "O nome não pode exceder 50 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um endereço de e-mail válido." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type Theme = "light" | "dark" | "system";

const localStorageProfileKey = "docflow-profile";
const localStorageThemeKey = "docflow-theme";

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
    if (storedTheme && ["light", "dark", "system"].includes(storedTheme)) {
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
    // Disparar um evento de storage para que o RootLayout possa capturar a mudança
    // se estiver ouvindo, ou para que outras abas possam reagir.
    window.dispatchEvent(new StorageEvent('storage', { key: localStorageThemeKey, newValue: theme }));
    
    // A aplicação real do tema (classe 'dark') é feita no RootLayout
    // para garantir consistência e evitar FOUC.
    // No entanto, para feedback imediato aqui, podemos também tentar aplicar:
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else { // system
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
     toast({
        title: "Tema Alterado",
        description: `O tema foi definido como ${theme === "light" ? "Claro" : theme === "dark" ? "Escuro" : "Padrão do Sistema"}.`,
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
          <FormLabel>Tema</FormLabel>
          <RadioGroup
            value={selectedTheme}
            onValueChange={(value: string) => handleThemeChange(value as Theme)}
            className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
          >
            <FormItem className="flex items-center space-x-3 space-y-0">
              <FormControl>
                <RadioGroupItem value="light" id="theme-light" />
              </FormControl>
              <FormLabel htmlFor="theme-light" className="font-normal">
                Claro
              </FormLabel>
            </FormItem>
            <FormItem className="flex items-center space-x-3 space-y-0">
              <FormControl>
                <RadioGroupItem value="dark" id="theme-dark" />
              </FormControl>
              <FormLabel htmlFor="theme-dark" className="font-normal">
                Escuro
              </FormLabel>
            </FormItem>
            <FormItem className="flex items-center space-x-3 space-y-0">
              <FormControl>
                <RadioGroupItem value="system" id="theme-system" />
              </FormControl>
              <FormLabel htmlFor="theme-system" className="font-normal">
                Padrão do Sistema
              </FormLabel>
            </FormItem>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
