
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
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Loader2, User, Palette, Users, Edit2, Building, BookType, Landmark } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import type { LoggedInUser, DocumentDepartmentValue, DocumentTypeValue, UserRoleValue } from "@/lib/types";
import { ADMIN_DEPARTMENT, DEFAULT_DOCUMENT_DEPARTMENTS, DEFAULT_DOCUMENT_TYPES, UserRole } from "@/lib/types";
import { initialMockUsers } from "@/app/login/page"; 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";


const profileFormSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }).max(50, { message: "O nome não pode exceder 50 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um endereço de e-mail válido." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type Theme = "light" | "dark" | "system" | "feminine" | "professional" | "playful" | "serif-classic";

const localStorageThemeKey = "docflow-active-theme"; 
const localStorageProfileNameKey = "docflow-profile-name"; // Specific key for profile name
const ALL_USERS_STORAGE_KEY = "docflow-all-users";
const localStorageDocumentTypesKey = "docflow-document-types";
const localStorageDepartmentsKey = "docflow-document-departments";


export default function SettingsPage() {
  const { toast } = useToast();
  const { user: loggedInUser, login: updateAuthContextUser } = useAuth(); // login here is used to update context
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme>("system");

  const [manageableUsers, setManageableUsers] = useState<LoggedInUser[]>([]);
  const [isSavingUserDepartments, setIsSavingUserDepartments] = useState(false);

  const [availableDocumentTypes, setAvailableDocumentTypes] = useState<DocumentTypeValue[]>([]);
  const [newDocumentType, setNewDocumentType] = useState("");
  const [isAddingDocType, setIsAddingDocType] = useState(false);

  const [availableDepartments, setAvailableDepartments] = useState<DocumentDepartmentValue[]>([]);
  const [newDepartment, setNewDepartment] = useState("");
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);


  const isAdmin = loggedInUser?.role === UserRole.ADMIN && (loggedInUser?.departments || []).includes(ADMIN_DEPARTMENT);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  useEffect(() => {
    setIsLoadingConfig(true);
    try {
      const storedTypes = localStorage.getItem(localStorageDocumentTypesKey);
      setAvailableDocumentTypes(storedTypes ? JSON.parse(storedTypes) : [...DEFAULT_DOCUMENT_TYPES]);

      const storedDepts = localStorage.getItem(localStorageDepartmentsKey);
      setAvailableDepartments(storedDepts ? JSON.parse(storedDepts) : [...DEFAULT_DOCUMENT_DEPARTMENTS]);
      
      const storedTheme = localStorage.getItem(localStorageThemeKey) as Theme | null;
      if (storedTheme && ["light", "dark", "system", "feminine", "professional", "playful", "serif-classic"].includes(storedTheme)) {
        setSelectedTheme(storedTheme);
      }

    } catch (error) {
      console.error("Erro ao carregar configurações do localStorage:", error);
      setAvailableDocumentTypes([...DEFAULT_DOCUMENT_TYPES]);
      setAvailableDepartments([...DEFAULT_DOCUMENT_DEPARTMENTS]);
    } finally {
      setIsLoadingConfig(false);
    }
  }, []);


  useEffect(() => {
    if (loggedInUser) {
      const storedProfileName = localStorage.getItem(localStorageProfileNameKey);
      profileForm.reset({
        name: storedProfileName || loggedInUser.name, // Prefer localStorage name if exists, then context
        email: loggedInUser.email,
      });
    }
  }, [loggedInUser, profileForm]);


  useEffect(() => {
    if (isAdmin) {
      try {
        const storedUsersString = localStorage.getItem(ALL_USERS_STORAGE_KEY);
        if (storedUsersString) {
           const usersFromStorage: LoggedInUser[] = JSON.parse(storedUsersString);
           const usersWithDepartmentsEnsured = usersFromStorage.map(u => ({
            ...u,
            departments: Array.isArray(u.departments) ? u.departments : (typeof u.departments === 'string' ? [u.departments as DocumentDepartmentValue] : [])
           }));
           setManageableUsers(usersWithDepartmentsEnsured);
        } else {
          const usersWithIdsAndArrayDepartments = initialMockUsers.map(u => ({ 
            ...u, 
            id: crypto.randomUUID(),
            departments: Array.isArray(u.departments) ? u.departments : [u.departments as DocumentDepartmentValue] 
          }));
          localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(usersWithIdsAndArrayDepartments));
          setManageableUsers(usersWithIdsAndArrayDepartments as LoggedInUser[]);
        }
      } catch (error) {
        console.error("Erro ao carregar usuários gerenciáveis:", error);
        const usersWithIdsAndArrayDepartments = initialMockUsers.map(u => ({ 
          ...u, 
          id: crypto.randomUUID(),
          departments: Array.isArray(u.departments) ? u.departments : [u.departments as DocumentDepartmentValue] 
        }));
        setManageableUsers(usersWithIdsAndArrayDepartments as LoggedInUser[]); 
      }
    }
  }, [isAdmin]);

  const handleProfileSubmit = (values: ProfileFormValues) => {
    setIsSubmittingProfile(true);
    try {
      localStorage.setItem(localStorageProfileNameKey, values.name);
      if (loggedInUser) {
        const updatedUser: LoggedInUser = { ...loggedInUser, name: values.name, email: loggedInUser.email }; // email remains from auth context
        updateAuthContextUser(updatedUser); // This updates the context and localStorage for loggedInUser
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

  const handleUserDepartmentCheckboxChange = (userId: string, departmentValue: DocumentDepartmentValue, checked: boolean) => {
    setManageableUsers(prevUsers =>
      prevUsers.map(user => {
        if (user.id === userId) {
          const currentDepartments = Array.isArray(user.departments) ? user.departments : [];
          let newDepartments: DocumentDepartmentValue[];
          if (checked) {
            newDepartments = [...currentDepartments, departmentValue];
          } else {
            newDepartments = currentDepartments.filter(dept => dept !== departmentValue);
          }
          // Ensure ADMIN_DEPARTMENT is always present for admins and not removable if it's their defining role
          if (user.role === UserRole.ADMIN && user.email === loggedInUser?.email && !newDepartments.includes(ADMIN_DEPARTMENT)) {
            newDepartments.push(ADMIN_DEPARTMENT);
          }
          return { ...user, departments: newDepartments };
        }
        return user;
      })
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

  const handleAddDocumentType = () => {
    if (!newDocumentType.trim()) {
      toast({ title: "Tipo Inválido", description: "O nome do tipo de documento não pode ser vazio.", variant: "destructive" });
      return;
    }
    if (availableDocumentTypes.map(t => t.toLowerCase()).includes(newDocumentType.trim().toLowerCase())) {
      toast({ title: "Tipo Duplicado", description: "Este tipo de documento já existe.", variant: "destructive" });
      return;
    }
    setIsAddingDocType(true);
    try {
      const updatedTypes = [...availableDocumentTypes, newDocumentType.trim()];
      setAvailableDocumentTypes(updatedTypes);
      localStorage.setItem(localStorageDocumentTypesKey, JSON.stringify(updatedTypes));
      toast({ title: "Tipo de Documento Adicionado", description: `"${newDocumentType.trim()}" foi adicionado.` });
      setNewDocumentType("");
    } catch (error) {
      console.error("Erro ao adicionar tipo de documento:", error);
      toast({ title: "Erro", description: "Não foi possível adicionar o tipo de documento.", variant: "destructive" });
    } finally {
      setIsAddingDocType(false);
    }
  };

  const handleAddDepartment = () => {
    if (!newDepartment.trim()) {
      toast({ title: "Local Inválido", description: "O nome do local/departamento não pode ser vazio.", variant: "destructive" });
      return;
    }
    if (availableDepartments.map(d => d.toLowerCase()).includes(newDepartment.trim().toLowerCase())) {
      toast({ title: "Local Duplicado", description: "Este local/departamento já existe.", variant: "destructive" });
      return;
    }
     if (newDepartment.trim() === ADMIN_DEPARTMENT) {
      toast({ title: "Local Inválido", description: `O local/departamento "${ADMIN_DEPARTMENT}" é reservado para o administrador.`, variant: "destructive" });
      return;
    }
    setIsAddingDepartment(true);
    try {
      const updatedDepts = [...availableDepartments, newDepartment.trim()];
      setAvailableDepartments(updatedDepts);
      localStorage.setItem(localStorageDepartmentsKey, JSON.stringify(updatedDepts));
      toast({ title: "Local/Departamento Adicionado", description: `"${newDepartment.trim()}" foi adicionado.` });
      setNewDepartment("");
    } catch (error) {
      console.error("Erro ao adicionar local/departamento:", error);
      toast({ title: "Erro", description: "Não foi possível adicionar o local/departamento.", variant: "destructive" });
    } finally {
      setIsAddingDepartment(false);
    }
  };


  if (!loggedInUser || isLoadingConfig) {
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
          <CardDescription>Altere seu nome de exibição. O e-mail, departamento(s) e papel são definidos pelo seu perfil de login e/ou administrador.</CardDescription>
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
                <FormLabel>Departamento(s)</FormLabel>
                <Input value={(loggedInUser.departments || []).join(', ')} disabled />
              </FormItem>
               <FormItem>
                <FormLabel>Papel</FormLabel>
                <Input value={loggedInUser.role === UserRole.ADMIN ? 'Administrador (Recursos Humanos)' : 'Funcionário'} disabled />
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
            {[
              { value: "light", label: "Claro" },
              { value: "dark", label: "Escuro" },
              { value: "system", label: "Padrão do Sistema" },
              { value: "feminine", label: "Feminino" },
              { value: "professional", label: "Profissional" },
              { value: "playful", label: "Divertido" },
              { value: "serif-classic", label: "Serifa Clássico" },
            ].map(themeOption => (
               <Label key={themeOption.value} htmlFor={`theme-${themeOption.value}`} className="font-normal cursor-pointer flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-accent/50 transition-colors"> 
                <RadioGroupItem value={themeOption.value} id={`theme-${themeOption.value}`} />
                <span>{themeOption.label}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {isAdmin && (
        <>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Gerenciar Departamentos de Funcionários</CardTitle>
              <CardDescription>Designe os departamentos aos quais cada funcionário tem acesso.</CardDescription>
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
                        <TableHead>Departamentos Designados</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {manageableUsers.filter(u => u.email !== loggedInUser.email) 
                        .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <div className="space-y-2 border rounded-md p-2 max-h-48 overflow-y-auto">
                              {availableDepartments
                                .filter(dept => dept !== ADMIN_DEPARTMENT) // Don't show ADMIN_DEPARTMENT as an assignable option here for others
                                .map(deptValue => (
                                <div key={deptValue} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`dept-${user.id}-${deptValue}`}
                                    checked={(user.departments || []).includes(deptValue)}
                                    onCheckedChange={(checked) => {
                                      handleUserDepartmentCheckboxChange(user.id, deptValue, !!checked);
                                    }}
                                  />
                                  <Label htmlFor={`dept-${user.id}-${deptValue}`} className="font-normal text-sm">{deptValue}</Label>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {manageableUsers.filter(u => u.email === loggedInUser.email).map(user => (
                          <TableRow key={user.id}>
                              <TableCell>{user.name} (Você)</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                  <div className="space-y-2 border rounded-md p-2">
                                      {(user.departments || []).map(dept => (
                                          <div key={dept} className="flex items-center space-x-2">
                                              <Checkbox id={`selfdept-${dept}`} checked readOnly disabled />
                                              <Label htmlFor={`selfdept-${dept}`} className="font-normal text-sm">{dept} {dept === ADMIN_DEPARTMENT ? "(Admin)" : ""}</Label>
                                          </div>
                                      ))}
                                      <p className="text-xs text-muted-foreground italic mt-1">Seu(s) departamento(s) principal(is) não podem ser alterados aqui.</p>
                                  </div>
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
                Salvar Departamentos dos Funcionários
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><BookType className="h-5 w-5 text-primary" /> Gerenciar Tipos de Documento</CardTitle>
                <CardDescription>Adicione novos tipos de documento que podem ser usados no sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2 items-end">
                    <div className="flex-grow">
                        <Label htmlFor="newDocumentType">Novo Tipo de Documento</Label>
                        <Input 
                            id="newDocumentType"
                            value={newDocumentType}
                            onChange={(e) => setNewDocumentType(e.target.value)}
                            placeholder="Ex: Relatório Técnico"
                            className="mt-1"
                        />
                    </div>
                    <Button onClick={handleAddDocumentType} disabled={isAddingDocType || !newDocumentType.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        {isAddingDocType && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Adicionar Tipo
                    </Button>
                </div>
                <div>
                    <h4 className="font-medium text-muted-foreground mb-2">Tipos Atuais:</h4>
                    {availableDocumentTypes.length > 0 ? (
                        <ul className="list-disc list-inside pl-4 text-sm text-foreground space-y-1 max-h-40 overflow-y-auto border rounded-md p-2">
                            {availableDocumentTypes.map(type => <li key={type}>{type}</li>)}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">Nenhum tipo de documento cadastrado.</p>
                    )}
                </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><Landmark className="h-5 w-5 text-primary" /> Gerenciar Locais/Departamentos</CardTitle>
                <CardDescription>Adicione novos locais ou departamentos que podem ser associados a documentos e funcionários. O local "{ADMIN_DEPARTMENT}" é reservado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2 items-end">
                    <div className="flex-grow">
                        <Label htmlFor="newDepartment">Novo Local/Departamento</Label>
                        <Input 
                            id="newDepartment"
                            value={newDepartment}
                            onChange={(e) => setNewDepartment(e.target.value)}
                            placeholder="Ex: Setor de Compras"
                            className="mt-1"
                        />
                    </div>
                    <Button onClick={handleAddDepartment} disabled={isAddingDepartment || !newDepartment.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        {isAddingDepartment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Adicionar Local
                    </Button>
                </div>
                <div>
                    <h4 className="font-medium text-muted-foreground mb-2">Locais/Departamentos Atuais:</h4>
                    {availableDepartments.length > 0 ? (
                        <ul className="list-disc list-inside pl-4 text-sm text-foreground space-y-1 max-h-40 overflow-y-auto border rounded-md p-2">
                            {availableDepartments.map(dept => <li key={dept}>{dept} {dept === ADMIN_DEPARTMENT ? <span className="text-xs italic text-muted-foreground">(Departamento Admin - não editável aqui)</span> : ""}</li>)}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">Nenhum local/departamento cadastrado.</p>
                    )}
                </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}


