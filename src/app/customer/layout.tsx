import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import CustomerSidebar from '@/components/customer-sidebar';
import DashboardHeader from '@/components/dashboard-header';

export default function CustomerLayout({ children }: { children: ReactNode }) {
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
