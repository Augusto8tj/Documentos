
"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserCircle, LogOut, LogIn, SettingsIcon, LifeBuoy } from "lucide-react";
import { AppLogo } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export function AppHeader() {
  const { isMobile } = useSidebar();
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
      {isMobile ? (
         <SidebarTrigger className="md:hidden" />
      ) : (
        <div className="hidden md:flex items-center gap-2">
         <SidebarTrigger />
         <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
            <AppLogo className="h-6 w-6 text-primary" />
            <span className="sr-only">Fluxo de Documentos</span>
          </Link>
        </div>
      )}
      
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          {/* Search can be added back if needed */}
        </div>
        <h1 className="text-xl font-semibold text-foreground whitespace-nowrap">Fluxo de Documentos</h1>
        
        {isLoading ? (
          <Skeleton className="h-8 w-8 rounded-full" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserCircle className="h-6 w-6" />
                <span className="sr-only">Alternar menu do usuário</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                 <Link href="/help" className="cursor-pointer">
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  Ajuda
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild variant="outline">
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Entrar
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
