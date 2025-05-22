
"use client";

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Loader2 } from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const isLoginPage = pathname === '/login';

  // Se estiver na página de login, renderize apenas o conteúdo da página de login.
  // O AuthProvider lida com o redirecionamento se o usuário já estiver logado.
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Se não estiver na página de login E não houver usuário,
  // o AuthProvider deve redirecionar para /login. Mostramos um loader enquanto isso.
  if (!user && !isLoginPage) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Se houver usuário logado E não estiver na página de login, renderize o layout completo da aplicação.
  if (user && !isLoginPage) {
    return (
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <div className="flex flex-col flex-1 min-h-screen">
          <AppHeader />
          <SidebarInset>
            <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  // Fallback para cobrir qualquer caso não tratado, embora os redirecionamentos devam cuidar disso.
  // Se chegou aqui, é provável que seja um estado de transição breve.
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
