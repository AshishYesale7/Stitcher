'use client';

import type { ReactNode } from 'react';
import DashboardHeader from '@/components/dashboard-header';

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader showSidebarTrigger={false} />
      <main>
        {children}
      </main>
    </div>
  );
}
