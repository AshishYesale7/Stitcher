'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { LayoutGrid, Package, MessageCircle, Heart, User, LogOut, Search, Notebook, Archive, Ruler } from 'lucide-react';
import Logo from '@/components/logo';

const menuItems = [
  { href: '/customer/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/customer/tailors', label: 'Tailors', icon: Search },
  { href: '/customer/orders', label: 'Order Tracker', icon: Package },
  { href: '/customer/book-order', label: 'Book Order', icon: Notebook },
  { href: '/customer/archive', label: 'Archive Order', icon: Archive },
  { href: '/customer/measurement', label: 'Measurement', icon: Ruler },
  { href: '/customer/profile', label: 'Profile', icon: User },
];

export default function CustomerSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Logo />
          <span className="text-xl font-bold font-headline text-primary-foreground group-data-[collapsible=icon]:hidden">
            Stitcher
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={{ children: 'Log Out' }}>
              <Link href="/">
                <LogOut />
                <span>Log Out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
