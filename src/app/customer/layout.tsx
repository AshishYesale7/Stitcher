'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import DashboardHeader from '@/components/dashboard-header';

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/customer/login';
  const isOnboardingPage = pathname === '/onboarding';

  if (isLoginPage || isOnboardingPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader showSidebarTrigger={false} />
      <main>
        {children}
      </main>
    </div>
  );
}
