import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

const menuItems = [
  { href: '/customer/tailors', label: 'Tailors' },
  { href: '/customer/orders', label: 'Order Tracker' },
  { href: '/customer/book-order', label: 'Book Order' },
  { href: '/customer/archive', label: 'Archive Order' },
  { href: '/customer/profile', label: 'Profile' },
  { href: '/', label: 'Exit' },
];

const iconComponents: { [key: string]: React.ElementType } = {
    Tailors: () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-card-foreground"><path d="M15 6v12a3 3 0 0 1-3 3a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3a3 3 0 0 1 3 3Z"/><path d="M11 3.16A2.5 2.5 0 0 1 8.5 1a2.5 2.5 0 0 1 0 5"/><path d="m17.6 11.9-1.1 1.1"/><path d="m14.5 10.4-1.1 1.1"/><path d="M16 16h-1"/><path d="m19 13-2-2"/><path d="M21 10h-1"/><path d="m3.4 11.9 1.1 1.1"/><path d="m6.5 10.4 1.1 1.1"/><path d="M5 16h1"/><path d="m2 13 2-2"/><path d="M3 10h1"/></svg>,
    'Order Tracker': () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-card-foreground"><path d="M21.44 11.05a1 1 0 0 0-1.05-1.05L19 11l-1-3-3-1-3 1v7l6 3z"/><path d="M12 11h-1a2 2 0 0 0-2 2v6H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a1 1 0 0 0-1.56-.95L19 11l-3 4-3-1-3 4h12"/></svg>,
    'Book Order': () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-card-foreground"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2Z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z"/></svg>,
    'Archive Order': () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-card-foreground"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z"/><path d="m9.5 9.5 5 5"/><path d="m14.5 9.5-5 5"/></svg>,
    Profile: () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-card-foreground"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>,
    Exit: () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-card-foreground"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>,
};


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
          const Icon = iconComponents[item.label];
          return (
            <Link href={item.href} key={item.label}>
              <Card className="bg-card/60 backdrop-blur-sm text-card-foreground hover:bg-primary/90 transition-colors">
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-2 aspect-square">
                  {Icon && <Icon />}
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
