
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents/create", label: "Create Document", icon: FilePlus2 },
  // { href: "/documents", label: "All Documents", icon: FileText }, // Future page
  // { href: "/sharing", label: "Sharing", icon: Users }, // Future page
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
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  className={cn(
                    "justify-start",
                    pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground"
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
              <SidebarMenuButton tooltip="Settings" className="justify-start">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Help" className="justify-start">
              <LifeBuoy className="h-5 w-5" />
              <span>Help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
