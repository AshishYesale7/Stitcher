import FindTailorView from '@/components/find-tailor-view';

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Find a Tailor</h1>
        <p className="text-muted-foreground mt-1">
          Tell us what you're looking for, and we'll find the best tailors for you.
        </p>
      </div>
      <FindTailorView />
    </div>
  );
}
