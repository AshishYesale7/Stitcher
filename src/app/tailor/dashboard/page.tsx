import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function TailorDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Tailor Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your orders, customers, and services.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Welcome!</CardTitle>
          <CardDescription>
            This is your tailor dashboard. More features coming soon!
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
