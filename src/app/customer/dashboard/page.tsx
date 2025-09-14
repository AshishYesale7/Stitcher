import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Customer Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to your dashboard. We will build the UI here.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            This is a placeholder card. We can now begin building the new UI components.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
