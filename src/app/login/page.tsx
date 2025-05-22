
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import type { LoggedInUser, DocumentDepartmentValue } from '@/lib/types';
import { ADMIN_DEPARTMENT, UserRole, DEFAULT_DOCUMENT_DEPARTMENTS } from '@/lib/types';
import { AppLogo } from '@/components/icons';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Export this for use in settings page initialization
export const initialMockUsers: Omit<LoggedInUser, 'id' | 'password'> & { password?: string }[] = [
  { name: "Admin RH", email: "admin@rh.com", role: UserRole.ADMIN, departments: [ADMIN_DEPARTMENT, ...DEFAULT_DOCUMENT_DEPARTMENTS.filter(d => d !== ADMIN_DEPARTMENT)], password: "123" },
  { name: "Funcionário TI", email: "user@ti.com", role: UserRole.EMPLOYEE, departments: ["Tecnologia da Informação"], password: "123" },
  { name: "Funcionário ADM", email: "user@adm.com", role: UserRole.EMPLOYEE, departments: ["Administração"], password: "123" },
  { name: "Funcionário Gabinete", email: "user@gab.com", role: UserRole.EMPLOYEE, departments: ["Gabinete"], password: "123" },
  { name: "Funcionário Financeiro", email: "user@fin.com", role: UserRole.EMPLOYEE, departments: ["Financeiro"], password: "123" },
  { name: "Ana (TI & ADM)", email: "ana@example.com", role: UserRole.EMPLOYEE, departments: ["Tecnologia da Informação", "Administração"], password: "123" },
];

const ALL_USERS_STORAGE_KEY = "docflow-all-users";

export default function LoginPage() {
  const { login, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<LoggedInUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    setIsLoadingUsers(true);
    let usersToSet: LoggedInUser[];
    let needsStorageUpdate = false;

    try {
      const storedUsersString = localStorage.getItem(ALL_USERS_STORAGE_KEY);
      if (storedUsersString) {
        const usersFromStorage: LoggedInUser[] = JSON.parse(storedUsersString);

        usersToSet = usersFromStorage.map(u => {
          const initialUserDefinition = initialMockUsers.find(initU => initU.email === u.email);
          
          let finalDepartments = Array.isArray(u.departments) ? u.departments : [];
          let finalRole = u.role;
          let finalPassword = u.password || (initialUserDefinition?.password || "123");
          let finalId = u.id || crypto.randomUUID();

          if (u.email === "admin@rh.com" && initialUserDefinition) {
            const initialAdminRole = initialUserDefinition.role;
            const initialAdminDepartments = Array.isArray(initialUserDefinition.departments) 
                                          ? initialUserDefinition.departments 
                                          : [ADMIN_DEPARTMENT];

            if (u.role !== initialAdminRole) {
              finalRole = initialAdminRole;
              needsStorageUpdate = true;
            }
            
            const currentDepartmentsSet = new Set(finalDepartments);
            let adminDepartmentsChanged = false;
            initialAdminDepartments.forEach(dept => {
              if (!currentDepartmentsSet.has(dept)) {
                currentDepartmentsSet.add(dept);
                adminDepartmentsChanged = true;
              }
            });
            if(adminDepartmentsChanged || finalDepartments.length !== currentDepartmentsSet.size){
                finalDepartments = Array.from(currentDepartmentsSet);
                needsStorageUpdate = true;
            }
          } else if (!Array.isArray(u.departments)) {
            finalDepartments = [];
            if (JSON.stringify(u.departments) !== JSON.stringify(finalDepartments)) needsStorageUpdate = true;
          }
           if(u.id !== finalId) needsStorageUpdate = true;
           if(u.password !== finalPassword) needsStorageUpdate = true;


          return {
            ...u,
            id: finalId,
            password: finalPassword,
            role: finalRole,
            departments: finalDepartments,
          };
        });
        
        if (needsStorageUpdate) {
            localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(usersToSet));
        }

      } else {
        // Initialize localStorage if empty
        usersToSet = initialMockUsers.map(u => ({
          id: crypto.randomUUID(),
          name: u.name,
          email: u.email,
          role: u.role,
          password: u.password || "123",
          departments: Array.isArray(u.departments) ? u.departments : [u.departments as DocumentDepartmentValue] 
        })) as LoggedInUser[];
        localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(usersToSet));
      }
      setAvailableUsers(usersToSet);
    } catch (error) {
      console.error("Failed to load or initialize users from localStorage", error);
      // Fallback to initial mocks if localStorage is corrupt or error occurs
      usersToSet = initialMockUsers.map(u => ({
        id: crypto.randomUUID(),
        name: u.name,
        email: u.email,
        role: u.role,
        password: u.password || "123",
        departments: Array.isArray(u.departments) ? u.departments : [u.departments as DocumentDepartmentValue]
      })) as LoggedInUser[];
      setAvailableUsers(usersToSet);
       // Attempt to set localStorage again on error for next load
      try {
        localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(usersToSet));
      } catch (setLocalError){
        console.error("Failed to set localStorage after fallback", setLocalError);
      }
    }
    setIsLoadingUsers(false);
  }, []);

  const handleLogin = () => {
    if (!selectedUserEmail) {
      toast({ title: "Erro de Login", description: "Por favor, selecione um usuário.", variant: "destructive" });
      return;
    }
    if (!passwordInput) {
      toast({ title: "Erro de Login", description: "Por favor, digite a senha.", variant: "destructive" });
      return;
    }

    setIsLoggingIn(true);
    const selectedUser = availableUsers.find(u => u.email === selectedUserEmail);

    if (selectedUser) {
      // SIMULATED PASSWORD CHECK
      if (selectedUser.password === passwordInput) {
        setTimeout(() => {
          login(selectedUser); 
          setIsLoggingIn(false);
        }, 500);
      } else {
        toast({ title: "Erro de Login", description: "Senha incorreta.", variant: "destructive" });
        setIsLoggingIn(false);
      }
    } else {
      toast({ title: "Erro de Login", description: "Usuário selecionado inválido.", variant: "destructive" });
      setIsLoggingIn(false);
    }
  };
  
  if (authLoading || isLoadingUsers) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AppLogo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Bem-vindo ao DocFlow</CardTitle>
          <CardDescription>Selecione seu perfil e digite sua senha para continuar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="user-select">Selecione o Usuário (Simulação)</Label>
            <Select value={selectedUserEmail} onValueChange={setSelectedUserEmail}>
              <SelectTrigger id="user-select" className="w-full">
                <SelectValue placeholder="Escolha um perfil..." />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.email} value={user.email}>
                    {user.name} ({user.email}) - {user.role === UserRole.ADMIN ? 'Admin' : 'Funcionário'} ({(user.departments || []).join(', ')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha (Simulação)</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Digite sua senha" 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleLogin} 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
            disabled={isLoggingIn || !selectedUserEmail || !passwordInput || isLoadingUsers}
          >
            {isLoggingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Entrar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}


    