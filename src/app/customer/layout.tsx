'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import CustomerSidebar from '@/components/customer-sidebar';
import DashboardHeader from '@/components/dashboard-header';

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/customer/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas">
        <CustomerSidebar />
      </Sidebar>
      <SidebarInset>
        <DashboardHeader />
        <main>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
