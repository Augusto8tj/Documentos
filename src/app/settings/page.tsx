
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
import { Loader2, User, Palette, Users, Edit2, Building } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import type { LoggedInUser } from "@/lib/types";
import { DocumentDepartment } from "@/lib/types";
import { initialMockUsers } from "@/app/login/page"; // Import initial mock users
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


const profileFormSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }).max(50, { message: "O nome não pode exceder 50 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um endereço de e-mail válido." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type Theme = "light" | "dark" | "system" | "feminine" | "professional" | "playful" | "serif-classic";

const localStorageThemeKey = "docflow-active-theme"; 
const localStorageProfileKey = "docflow-profile-settings";
const ALL_USERS_STORAGE_KEY = "docflow-all-users";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user: loggedInUser, login: updateAuthContextUser } = useAuth();
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme>("system");

  const [manageableUsers, setManageableUsers] = useState<LoggedInUser[]>([]);
  const [isSavingUserDepartments, setIsSavingUserDepartments] = useState(false);

  const isAdmin = loggedInUser?.department === DocumentDepartment.RECURSOS_HUMANOS;

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: loggedInUser?.name || "",
      email: loggedInUser?.email || "",
    },
  });

  useEffect(() => {
    if (loggedInUser) {
      profileForm.reset({
        name: loggedInUser.name,
        email: loggedInUser.email,
      });
    }
    const storedProfileSettings = localStorage.getItem(localStorageProfileKey);
    if (storedProfileSettings) {
        try {
            const profile = JSON.parse(storedProfileSettings) as ProfileFormValues;
            if (profile.name && profile.name !== loggedInUser?.name) profileForm.setValue("name", profile.name);
        } catch (error) {
            console.error("Erro ao carregar configurações de perfil do localStorage:", error);
        }
    }

  }, [loggedInUser, profileForm]);

  useEffect(() => {
    const storedTheme = localStorage.getItem(localStorageThemeKey) as Theme | null;
    if (storedTheme && ["light", "dark", "system", "feminine", "professional", "playful", "serif-classic"].includes(storedTheme)) {
      setSelectedTheme(storedTheme);
    }
  }, []);

  // Load manageable users for admin
  useEffect(() => {
    if (isAdmin) {
      try {
        const storedUsersString = localStorage.getItem(ALL_USERS_STORAGE_KEY);
        if (storedUsersString) {
          setManageableUsers(JSON.parse(storedUsersString));
        } else {
          // Initialize if not present (should be initialized by login page, but as fallback)
          const usersWithIds = initialMockUsers.map(u => ({ ...u, id: crypto.randomUUID() }));
          localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(usersWithIds));
          setManageableUsers(usersWithIds);
        }
      } catch (error) {
        console.error("Erro ao carregar usuários gerenciáveis:", error);
        setManageableUsers(initialMockUsers.map(u => ({ ...u, id: crypto.randomUUID() }))); // Fallback
      }
    }
  }, [isAdmin]);

  const handleProfileSubmit = (values: ProfileFormValues) => {
    setIsSubmittingProfile(true);
    try {
      localStorage.setItem(localStorageProfileKey, JSON.stringify({ name: values.name }));
      if (loggedInUser) {
        const updatedUser: LoggedInUser = { ...loggedInUser, name: values.name };
        updateAuthContextUser(updatedUser);
      }
      toast({
        title: "Perfil Atualizado",
        description: "Suas informações de perfil foram salvas.",
      });
    } catch (error) {
      toast({
        title: "Erro ao Salvar Perfil",
        description: "Não foi possível salvar seu perfil.",
        variant: "destructive",
      });
      console.error("Erro ao salvar perfil:", error);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme);
    localStorage.setItem(localStorageThemeKey, theme);
    
    document.documentElement.classList.remove("dark", "theme-feminine", "theme-professional", "theme-playful", "theme-serif-classic");

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "feminine") {
      document.documentElement.classList.add("theme-feminine");
    } else if (theme === "professional") {
      document.documentElement.classList.add("theme-professional");
    } else if (theme === "playful") {
      document.documentElement.classList.add("theme-playful");
    } else if (theme === "serif-classic") {
      document.documentElement.classList.add("theme-serif-classic");
    } else if (theme === "system") { 
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      }
    }
    window.dispatchEvent(new StorageEvent('storage', { key: localStorageThemeKey, newValue: theme }));
    
    let themeName = "Padrão do Sistema";
    if (theme === "light") themeName = "Claro";
    else if (theme === "dark") themeName = "Escuro";
    else if (theme === "feminine") themeName = "Feminino";
    else if (theme === "professional") themeName = "Profissional";
    else if (theme === "playful") themeName = "Divertido";
    else if (theme === "serif-classic") themeName = "Serifa Clássico";

     toast({
        title: "Tema Alterado",
        description: `O tema foi definido como ${themeName}.`,
      });
  };

  const handleUserDepartmentChange = (userId: string, newDepartment: DocumentDepartment) => {
    setManageableUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, department: newDepartment } : user
      )
    );
  };

  const handleSaveUserDepartments = () => {
    setIsSavingUserDepartments(true);
    try {
      localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(manageableUsers));
      toast({
        title: "Departamentos Atualizados",
        description: "Os departamentos dos funcionários foram salvos.",
      });
    } catch (error) {
      console.error("Erro ao salvar departamentos dos usuários:", error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setIsSavingUserDepartments(false);
    }
  };


  if (!loggedInUser) {
    return (
      <div className="container mx-auto py-8 space-y-8 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


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
          <CardDescription>Altere seu nome de exibição. O e-mail e departamento são definidos pelo seu perfil de login.</CardDescription>
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
                      <Input placeholder="Seu nome de exibição" {...field} />
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
                    <FormLabel>E-mail (do perfil de login)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu.email@exemplo.com" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Departamento (do perfil de login)</FormLabel>
                <Input value={loggedInUser.department} disabled />
              </FormItem>
               <FormItem>
                <FormLabel>Papel (do perfil de login)</FormLabel>
                <Input value={loggedInUser.role === 'admin' ? 'Administrador (Recursos Humanos)' : 'Funcionário'} disabled />
              </FormItem>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-end">
              <Button type="submit" disabled={isSubmittingProfile} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmittingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Nome
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
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2"
          >
            <Label htmlFor="theme-light" className="font-normal cursor-pointer flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-accent/50 transition-colors"> 
              <RadioGroupItem value="light" id="theme-light" />
              <span>Claro</span>
            </Label>
            <Label htmlFor="theme-dark" className="font-normal cursor-pointer flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-accent/50 transition-colors"> 
              <RadioGroupItem value="dark" id="theme-dark" />
              <span>Escuro</span>
            </Label>
            <Label htmlFor="theme-system" className="font-normal cursor-pointer flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-accent/50 transition-colors"> 
              <RadioGroupItem value="system" id="theme-system" />
              <span>Padrão do Sistema</span>
            </Label>
            <Label htmlFor="theme-feminine" className="font-normal cursor-pointer flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-accent/50 transition-colors"> 
              <RadioGroupItem value="feminine" id="theme-feminine" />
              <span>Feminino</span>
            </Label>
            <Label htmlFor="theme-professional" className="font-normal cursor-pointer flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-accent/50 transition-colors"> 
              <RadioGroupItem value="professional" id="theme-professional" />
              <span>Profissional</span>
            </Label>
            <Label htmlFor="theme-playful" className="font-normal cursor-pointer flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-accent/50 transition-colors"> 
              <RadioGroupItem value="playful" id="theme-playful" />
              <span>Divertido</span>
            </Label>
            <Label htmlFor="theme-serif-classic" className="font-normal cursor-pointer flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-accent/50 transition-colors"> 
              <RadioGroupItem value="serif-classic" id="theme-serif-classic" />
              <span>Serifa Clássico</span>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Gerenciar Departamentos de Funcionários</CardTitle>
            <CardDescription>Altere o departamento associado a cada funcionário. Essas alterações serão refletidas no próximo login do funcionário.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {manageableUsers.length === 0 ? (
              <p className="text-muted-foreground text-center">Nenhum usuário para gerenciar encontrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Departamento Atual</TableHead>
                      <TableHead>Novo Departamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manageableUsers.filter(u => u.email !== loggedInUser.email) // Admin cannot change their own department here
                      .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>
                          <Select
                            value={user.department}
                            onValueChange={(newDept) => handleUserDepartmentChange(user.id, newDept as DocumentDepartment)}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Selecione um departamento" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(DocumentDepartment).map((dept) => (
                                <SelectItem key={dept} value={dept}>
                                  {dept}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                     {manageableUsers.filter(u => u.email === loggedInUser.email).map(user => (
                        <TableRow key={user.id}>
                            <TableCell>{user.name} (Você)</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.department}</TableCell>
                            <TableCell>
                                <span className="text-sm text-muted-foreground italic">Não pode alterar o próprio departamento aqui.</span>
                            </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-6 flex justify-end">
            <Button 
              onClick={handleSaveUserDepartments} 
              disabled={isSavingUserDepartments || manageableUsers.length === 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSavingUserDepartments && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Departamentos
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
