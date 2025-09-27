import type { Metadata } from 'next';
import { Suspense } from 'react';

import { SidebarNavigation } from '@/components/layout/sidebar-nav';
import { Breadcrumbs } from '@/components/layout/top-bar/breadcrumbs';
import { ThemeToggle } from '@/components/layout/top-bar/theme-toggle';

export const metadata: Metadata = {
  title: 'Staff Dashboard',
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarNavigation>
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <Suspense>
            <Breadcrumbs />
          </Suspense>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 bg-muted/30 p-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-6">{children}</div>
        </main>
      </div>
    </SidebarNavigation>
  );
}
