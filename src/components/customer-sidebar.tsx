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
import { LayoutGrid, Package, MessageCircle, Heart, User, LogOut } from 'lucide-react';
import Logo from '@/components/logo';

const menuItems = [
  { href: '/customer/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/customer/orders', label: 'My Orders', icon: Package },
  { href: '/customer/messages', label: 'Messages', icon: MessageCircle },
  { href: '/customer/saved', label: 'Saved', icon: Heart },
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
            StitchLink
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
