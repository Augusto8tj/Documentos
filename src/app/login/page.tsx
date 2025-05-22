
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import type { LoggedInUser } from '@/lib/types';
import { DocumentDepartment, UserRole } from '@/lib/types';
import { AppLogo } from '@/components/icons';
import { Loader2 } from 'lucide-react';

// Export this for use in settings page initialization
export const initialMockUsers: Omit<LoggedInUser, 'id'>[] = [
  { name: "Admin RH", email: "admin@rh.com", role: 'admin', department: DocumentDepartment.RECURSOS_HUMANOS },
  { name: "Funcionário TI", email: "user@ti.com", role: 'employee', department: DocumentDepartment.TI },
  { name: "Funcionário ADM", email: "user@adm.com", role: 'employee', department: DocumentDepartment.ADMINISTRACAO },
  { name: "Funcionário Gabinete", email: "user@gab.com", role: 'employee', department: DocumentDepartment.GABINETE },
  { name: "Funcionário Financeiro", email: "user@fin.com", role: 'employee', department: DocumentDepartment.FINANCEIRO },
];

const ALL_USERS_STORAGE_KEY = "docflow-all-users";

export default function LoginPage() {
  const { login, isLoading: authLoading } = useAuth();
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<LoggedInUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    setIsLoadingUsers(true);
    try {
      const storedUsersString = localStorage.getItem(ALL_USERS_STORAGE_KEY);
      if (storedUsersString) {
        setAvailableUsers(JSON.parse(storedUsersString));
      } else {
        // Initialize localStorage if empty
        const usersWithIds = initialMockUsers.map(u => ({ ...u, id: crypto.randomUUID() }));
        localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(usersWithIds));
        setAvailableUsers(usersWithIds);
      }
    } catch (error) {
      console.error("Failed to load users from localStorage", error);
      // Fallback to initial mocks if localStorage is corrupt
      const usersWithIds = initialMockUsers.map(u => ({ ...u, id: crypto.randomUUID() }));
      setAvailableUsers(usersWithIds);
    }
    setIsLoadingUsers(false);
  }, []);

  const handleLogin = () => {
    if (!selectedUserEmail) {
      alert("Por favor, selecione um usuário para entrar.");
      return;
    }
    setIsLoggingIn(true);
    const selectedUser = availableUsers.find(u => u.email === selectedUserEmail);
    if (selectedUser) {
      setTimeout(() => {
        login(selectedUser); // login now expects a full LoggedInUser object with id
        setIsLoggingIn(false);
      }, 500);
    } else {
      alert("Usuário selecionado inválido.");
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
          <CardDescription>Selecione seu perfil para continuar.</CardDescription>
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
                    {user.name} ({user.email}) - {user.role === 'admin' ? 'Admin' : 'Funcionário'} ({user.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoggingIn || !selectedUserEmail}>
            {isLoggingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Entrar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
