"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { navigationItems, type NavigationItem } from '@/config/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bell, CircleUser, LogOut } from 'lucide-react';

const getActiveKey = (pathname: string) => {
  const match = navigationItems.find(item => pathname.startsWith(item.href));
  return match?.key ?? 'dashboard';
};

const NavigationList = ({ items }: { items: NavigationItem[] }) => {
  const pathname = usePathname();
  const activeKey = useMemo(() => getActiveKey(pathname), [pathname]);

  return (
    <SidebarMenu>
      {items.map(item => {
        const isActive = activeKey === item.key;
        return (
          <SidebarMenuItem key={item.key}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground hidden xl:block">
                  {item.description}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
};

const UserActions = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex items-center gap-2 p-2">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-6" />
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label="User menu"
        onClick={toggleSidebar}
      >
        <CircleUser className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const SidebarNavigation = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="bg-sidebar border-r border-sidebar-border">
          <SidebarHeader className="gap-1">
            <SidebarTrigger className="md:hidden" />
            <div className="flex items-center justify-between p-2">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  LIMI Hotels
                </span>
                <p className="text-sm font-semibold">Staff Operations</p>
              </div>
            </div>
            <SidebarSeparator />
          </SidebarHeader>
          <SidebarContent className="border-t border-sidebar-border/60">
            <SidebarGroup>
              <SidebarGroupLabel>Operations</SidebarGroupLabel>
              <SidebarGroupContent>
                <NavigationList items={navigationItems} />
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarSeparator />
            <UserActions />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="bg-background">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
};
