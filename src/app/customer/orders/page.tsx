'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { subscribeToCustomerOrders, type Order } from '@/lib/firestore-helpers';
import OrderStatusBadge from '@/components/order-status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Package, User, Shirt, IndianRupee, Calendar, FileText, CheckCircle2, Clock, Truck } from 'lucide-react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

const STATUS_STEPS = ['pending', 'accepted', 'in_progress', 'completed', 'delivered'];

function OrderTimeline({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.indexOf(status);
  const isCancelled = status === 'cancelled';

  return (
    <div className="flex items-center gap-1 mt-4">
      {STATUS_STEPS.map((step, idx) => {
        const isDone = !isCancelled && idx <= currentIdx;
        const isCurrent = !isCancelled && idx === currentIdx;
        return (
          <div key={step} className="flex items-center flex-1">
            <div className={`h-2.5 w-2.5 rounded-full shrink-0 transition-all ${isDone ? 'bg-emerald-500 scale-110' : 'bg-muted-foreground/20'} ${isCurrent ? 'ring-4 ring-emerald-500/20' : ''}`} />
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${isDone && idx < currentIdx ? 'bg-emerald-500' : 'bg-muted-foreground/20'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderDetailDialog({ order }: { order: Order }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs rounded-full">Details</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">Order Details</DialogTitle>
          <DialogDescription>Order #{order.id.slice(0, 8)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2"><Shirt className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Garment</p><p className="text-sm font-medium">{order.garmentType}</p></div></div>
            <div className="flex items-center gap-2"><IndianRupee className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Amount</p><p className="text-sm font-semibold">₹{(order.amount || 0).toLocaleString()}</p></div></div>
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Placed On</p><p className="text-sm">{order.createdAt?.toDate?.()?.toLocaleDateString() || '—'}</p></div></div>
            <div><p className="text-xs text-muted-foreground mb-1">Status</p><OrderStatusBadge status={order.status} /></div>
          </div>
          {order.designDetails && <div><p className="text-xs text-muted-foreground mb-1">Design Details</p><p className="text-sm bg-muted p-3 rounded-xl">{order.designDetails}</p></div>}
          {order.notes && <div><p className="text-xs text-muted-foreground mb-1">Notes</p><p className="text-sm bg-muted p-3 rounded-xl">{order.notes}</p></div>}
          <div><p className="text-xs text-muted-foreground mb-1">Progress</p><OrderTimeline status={order.status} /></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setIsLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToCustomerOrders(user.uid, (data) => { setOrders(data); setIsLoading(false); });
    return () => unsub();
  }, [user]);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  if (isLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">My Orders</h1>
        <p className="text-muted-foreground mt-1">Track all your orders in real-time.</p>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="all" className="rounded-lg text-xs">All ({orders.length})</TabsTrigger>
          <TabsTrigger value="pending" className="rounded-lg text-xs">Pending</TabsTrigger>
          <TabsTrigger value="in_progress" className="rounded-lg text-xs">In Progress</TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg text-xs">Completed</TabsTrigger>
          <TabsTrigger value="delivered" className="rounded-lg text-xs">Delivered</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((order) => (
            <Card key={order.id} className="border rounded-2xl hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Shirt className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{order.garmentType}</h3>
                      <p className="text-sm text-muted-foreground">{order.designDetails?.slice(0, 50) || 'No details'}{order.designDetails?.length > 50 ? '...' : ''}</p>
                      <p className="text-xs text-muted-foreground mt-1">{order.createdAt?.toDate?.()?.toLocaleDateString() || ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">₹{(order.amount || 0).toLocaleString()}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <OrderDetailDialog order={order} />
                  </div>
                </div>
                <OrderTimeline status={order.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="font-semibold text-lg">No orders yet</p>
          <p className="text-sm mt-1">Place an order from the Tailors page to get started.</p>
        </div>
      )}
    </div>
  );
}
