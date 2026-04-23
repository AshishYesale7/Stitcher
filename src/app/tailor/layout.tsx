'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import TailorSidebar from '@/components/tailor-sidebar';
import DynamicDashboardHeader from '@/components/dynamic-dashboard-header';

export default function TailorLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/tailor/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <TailorSidebar />
      </Sidebar>
      <SidebarInset>
        <DynamicDashboardHeader showSidebarTrigger={true} />
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
