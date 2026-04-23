'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  subscribeToOrders,
  updateOrderStatus,
  createOrder,
  type Order,
  type OrderStatus,
} from '@/lib/firestore-helpers';
import OrderStatusBadge from '@/components/order-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  Plus,
  MoreHorizontal,
  Package,
  Calendar,
  User,
  Shirt,
  IndianRupee,
  FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['accepted', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: ['delivered'],
  delivered: [],
  cancelled: [],
};

const GARMENT_TYPES = ['Shirt', 'Pants', 'Kurta', 'Saree', 'Blouse', 'Dress', 'Suit', 'Sherwani'];

function NewOrderDialog({ tailorId, onCreated }: { tailorId: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerId: '',
    garmentType: '',
    designDetails: '',
    amount: '',
    notes: '',
  });

  const handleSubmit = async () => {
    if (!form.customerName || !form.garmentType || !form.amount) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill required fields.' });
      return;
    }
    setSaving(true);
    try {
      await createOrder({
        tailorId,
        customerId: form.customerId || `manual_${Date.now()}`,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        garmentType: form.garmentType,
        designDetails: form.designDetails,
        amount: parseFloat(form.amount),
        notes: form.notes,
      });
      toast({ title: 'Order Created', description: 'New order has been added successfully.' });
      setOpen(false);
      setForm({ customerName: '', customerEmail: '', customerId: '', garmentType: '', designDetails: '', amount: '', notes: '' });
      onCreated();
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create order.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-full">
          <Plus className="h-4 w-4" /> New Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Create New Order</DialogTitle>
          <DialogDescription>Add a new order for a customer.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Customer Name *</Label>
            <Input
              placeholder="John Doe"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Customer Email</Label>
            <Input
              placeholder="john@example.com"
              type="email"
              value={form.customerEmail}
              onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Garment Type *</Label>
            <Select onValueChange={(v) => setForm({ ...form, garmentType: v })}>
              <SelectTrigger><SelectValue placeholder="Select garment" /></SelectTrigger>
              <SelectContent>
                {GARMENT_TYPES.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Design Details</Label>
            <Textarea
              placeholder="e.g., silk fabric, mandarin collar"
              value={form.designDetails}
              onChange={(e) => setForm({ ...form, designDetails: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Amount (₹) *</Label>
            <Input
              type="number"
              placeholder="1500"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Any special instructions..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={saving} className="rounded-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OrderDetailDialog({ order }: { order: Order }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <FileText className="mr-2 h-4 w-4" /> View Details
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">Order Details</DialogTitle>
          <DialogDescription>Order #{order.id.slice(0, 8)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="text-sm font-medium">{order.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shirt className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Garment</p>
                <p className="text-sm font-medium">{order.garmentType}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="text-sm font-semibold">₹{(order.amount || 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">
                  {order.createdAt?.toDate?.()?.toLocaleDateString() || '—'}
                </p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <OrderStatusBadge status={order.status} />
          </div>
          {order.designDetails && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Design Details</p>
              <p className="text-sm bg-muted p-3 rounded-xl">{order.designDetails}</p>
            </div>
          )}
          {order.notes && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-sm bg-muted p-3 rounded-xl">{order.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TailorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const unsub = subscribeToOrders(user.uid, (data) => {
      setOrders(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast({ title: 'Status Updated', description: `Order status changed to ${newStatus.replace('_', ' ')}.` });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter);

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
          <h1 className="text-3xl font-bold font-headline tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage and track all your orders.</p>
        </div>
        {user && <NewOrderDialog tailorId={user.uid} onCreated={() => {}} />}
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="all" className="rounded-lg text-xs">All ({orders.length})</TabsTrigger>
          <TabsTrigger value="pending" className="rounded-lg text-xs">Pending ({orders.filter(o => o.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="accepted" className="rounded-lg text-xs">Accepted ({orders.filter(o => o.status === 'accepted').length})</TabsTrigger>
          <TabsTrigger value="in_progress" className="rounded-lg text-xs">In Progress ({orders.filter(o => o.status === 'in_progress').length})</TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg text-xs">Completed ({orders.filter(o => o.status === 'completed').length})</TabsTrigger>
          <TabsTrigger value="delivered" className="rounded-lg text-xs">Delivered ({orders.filter(o => o.status === 'delivered').length})</TabsTrigger>
          <TabsTrigger value="cancelled" className="rounded-lg text-xs">Cancelled ({orders.filter(o => o.status === 'cancelled').length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Orders Table */}
      <Card className="border rounded-2xl">
        <CardContent className="p-0">
          {filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground bg-muted/30">
                    <th className="text-left py-3 px-4 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 font-medium">Garment</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Amount</th>
                    <th className="text-right py-3 px-4 font-medium">Date</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{order.garmentType}</td>
                      <td className="py-4 px-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-4 px-4 text-right font-semibold">
                        ₹{(order.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right text-muted-foreground">
                        {order.createdAt?.toDate?.()?.toLocaleDateString() || '—'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <OrderDetailDialog order={order} />
                            {STATUS_TRANSITIONS[order.status]?.length > 0 && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-xs">Change Status</DropdownMenuLabel>
                                {STATUS_TRANSITIONS[order.status].map((s) => (
                                  <DropdownMenuItem
                                    key={s}
                                    onClick={() => handleStatusChange(order.id, s)}
                                  >
                                    Mark as {s.replace('_', ' ')}
                                  </DropdownMenuItem>
                                ))}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="font-semibold text-lg">No orders found</p>
              <p className="text-sm mt-1">
                {filter === 'all'
                  ? 'Orders will appear here when customers place them.'
                  : `No ${filter.replace('_', ' ')} orders.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
