import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Package, Notebook, Archive, User, LogOut } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { FC } from 'react';

const menuItems: { href: string; label: string; icon: FC<LucideProps> }[] = [
  { href: '/customer/tailors', label: 'Tailors', icon: Search },
  { href: '/customer/orders', label: 'Order Tracker', icon: Package },
  { href: '/customer/book-order', label: 'Book Order', icon: Notebook },
  { href: '/customer/archive', label: 'Archive Order', icon: Archive },
  { href: '/customer/profile', label: 'Profile', icon: User },
  { href: '/', label: 'Exit', icon: LogOut },
];

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
       <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Customer Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Navigate through your options below.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link href={item.href} key={item.label}>
              <Card className="bg-card/60 backdrop-blur-sm text-card-foreground hover:bg-primary/90 transition-colors">
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-2 aspect-square">
                  {Icon && <Icon className="w-12 h-12 text-primary" />}
                  <span className="text-sm font-semibold text-center">{item.label}</span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}