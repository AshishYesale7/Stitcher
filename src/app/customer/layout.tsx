'use client';

import type { ReactNode } from 'react';
import DynamicDashboardHeader from '@/components/dynamic-dashboard-header';

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <DynamicDashboardHeader showSidebarTrigger={false} />
      <main>
        {children}
      </main>
    </div>
  );
}
