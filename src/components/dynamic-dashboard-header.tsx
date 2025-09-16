'use client';

import dynamic from 'next/dynamic';

// Dynamically import the DashboardHeader and disable SSR
const DynamicDashboardHeader = dynamic(
  () => import('@/components/dashboard-header'),
  { ssr: false }
);

export default DynamicDashboardHeader;
