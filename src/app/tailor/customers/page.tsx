'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import {
  getCustomersForTailor,
  createConversation,
  type CustomerSummary,
} from '@/lib/firestore-helpers';
import OrderStatusBadge from '@/components/order-status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Loader2,
  Users,
  Search,
  MessageCircle,
  Package,
  IndianRupee,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

function CustomerOrderHistory({ customer }: { customer: CustomerSummary }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 text-xs">
          View Orders <ChevronRight className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">
            Orders with {customer.customerName}
          </DialogTitle>
          <DialogDescription>
            {customer.totalOrders} order{customer.totalOrders !== 1 ? 's' : ''} · ₹{customer.totalSpent.toLocaleString()} total
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto space-y-3 py-2">
          {customer.orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{order.garmentType}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.createdAt?.toDate?.()?.toLocaleDateString() || '—'}
                  </p>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <OrderStatusBadge status={order.status} />
                <p className="text-sm font-semibold">
                  ₹{(order.amount || 0).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TailorCustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    getCustomersForTailor(user.uid)
      .then(setCustomers)
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleMessage = async (customer: CustomerSummary) => {
    if (!user) return;
    try {
      await createConversation(
        user.uid,
        customer.customerId,
        user.displayName || 'Tailor',
        customer.customerName
      );
      router.push('/tailor/messages');
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to start conversation.' });
    }
  };

  const filtered = customers.filter((c) =>
    c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">
            {customers.length} customer{customers.length !== 1 ? 's' : ''} you&apos;ve worked with.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-full bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Customer Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((customer) => (
            <Card
              key={customer.customerId}
              className="border rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 border-2 border-primary/20">
                    <AvatarImage
                      src={
                        customer.photoURL ||
                        `https://picsum.photos/seed/${customer.customerId}/100/100`
                      }
                      alt={customer.customerName}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                      {customer.customerName?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {customer.customerName}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {customer.customerEmail || 'No email'}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className="text-center p-2 rounded-xl bg-muted/50">
                    <Package className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                    <p className="text-lg font-bold">{customer.totalOrders}</p>
                    <p className="text-[10px] text-muted-foreground">Orders</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-muted/50">
                    <IndianRupee className="h-4 w-4 mx-auto text-emerald-500 mb-1" />
                    <p className="text-lg font-bold">₹{customer.totalSpent >= 1000 ? `${(customer.totalSpent / 1000).toFixed(1)}k` : customer.totalSpent}</p>
                    <p className="text-[10px] text-muted-foreground">Spent</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-muted/50">
                    <Calendar className="h-4 w-4 mx-auto text-purple-500 mb-1" />
                    <p className="text-xs font-bold">
                      {customer.lastOrderDate?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || '—'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Last Order</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-full gap-1 text-xs"
                    onClick={() => handleMessage(customer)}
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Message
                  </Button>
                  <CustomerOrderHistory customer={customer} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="font-semibold text-lg">No customers yet</p>
          <p className="text-sm mt-1">
            {searchQuery
              ? 'No customers match your search.'
              : 'Customers will appear here when you receive orders.'}
          </p>
        </div>
      )}
    </div>
  );
}
