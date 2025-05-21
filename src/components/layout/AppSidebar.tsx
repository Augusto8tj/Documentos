
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { AppLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FilePlus2,
  FileText,
  Users,
  Settings,
  LogOut,
  LifeBuoy,
  GalleryVerticalEnd,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/", label: "Painel", icon: LayoutDashboard },
  { href: "/documents/create", label: "Criar Documento", icon: FilePlus2 },
  { href: "/templates", label: "Modelos", icon: GalleryVerticalEnd },
  // { href: "/documents", label: "Todos os Documentos", icon: FileText }, // Future page
  // { href: "/sharing", label: "Compartilhamento", icon: Users }, // Future page
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 hidden group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center md:flex md:items-center md:gap-2 md:p-4">
        <AppLogo className="h-8 w-8 text-primary group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6" />
        <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
          DocFlow
        </span>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href === "/templates" && pathname.startsWith("/templates"))}
                  tooltip={item.label}
                  className={cn(
                    "justify-start",
                    (pathname === item.href || (item.href === "/templates" && pathname.startsWith("/templates"))) && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
             <Link href="/settings" passHref legacyBehavior>
              <SidebarMenuButton tooltip="Configurações" className="justify-start" isActive={pathname === "/settings"}>
                <Settings className="h-5 w-5" />
                <span>Configurações</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/help" passHref legacyBehavior>
              <SidebarMenuButton tooltip="Ajuda" className="justify-start" isActive={pathname === "/help"}>
                <LifeBuoy className="h-5 w-5" />
                <span>Ajuda</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
