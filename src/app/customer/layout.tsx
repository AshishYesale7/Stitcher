'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import DynamicDashboardHeader from '@/components/dynamic-dashboard-header';

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/customer/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DynamicDashboardHeader showSidebarTrigger={false} />
      {children}
    </div>
  );
}
