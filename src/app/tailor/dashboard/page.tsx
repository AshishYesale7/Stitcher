'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { subscribeToOrders, type Order } from '@/lib/firestore-helpers';
import StatCard from '@/components/stat-card';
import OrderStatusBadge from '@/components/order-status-badge';
import { Loader2, Package, Users, IndianRupee, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const PIE_COLORS = ['#f59e0b', '#8b5cf6', '#10b981', '#06b6d4', '#ef4444', '#6b7280'];

function getMonthlyRevenue(orders: Order[]) {
  const months: Record<string, number> = {};
  const now = new Date();
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    months[key] = 0;
  }
  orders.forEach((order) => {
    if (
      (order.status === 'completed' || order.status === 'delivered') &&
      order.createdAt?.toDate
    ) {
      const d = order.createdAt.toDate();
      const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (months[key] !== undefined) {
        months[key] += order.amount || 0;
      }
    }
  });
  return Object.entries(months).map(([month, revenue]) => ({ month, revenue }));
}

function getStatusBreakdown(orders: Order[]) {
  const counts: Record<string, number> = {};
  orders.forEach((order) => {
    counts[order.status] = (counts[order.status] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    accepted: 'Accepted',
    in_progress: 'In Progress',
    completed: 'Completed',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
}

export default function TailorDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const totalOrders = orders.length;
  const activeOrders = orders.filter(
    (o) => o.status === 'in_progress' || o.status === 'accepted' || o.status === 'pending'
  ).length;
  const uniqueCustomers = new Set(orders.map((o) => o.customerId)).size;
  const totalEarnings = orders
    .filter((o) => o.status === 'completed' || o.status === 'delivered')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  const revenueData = getMonthlyRevenue(orders);
  const statusData = getStatusBreakdown(orders);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s an overview of your business.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={Package}
          color="blue"
          subtitle="All time"
        />
        <StatCard
          title="Active Orders"
          value={activeOrders}
          icon={TrendingUp}
          color="orange"
          subtitle="Pending + In Progress"
        />
        <StatCard
          title="Customers"
          value={uniqueCustomers}
          icon={Users}
          color="purple"
          subtitle="Unique customers"
        />
        <StatCard
          title="Total Earnings"
          value={`₹${totalEarnings.toLocaleString()}`}
          icon={IndianRupee}
          color="green"
          subtitle="From completed orders"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border rounded-2xl">
          <CardHeader>
            <CardTitle className="font-headline">Revenue Overview</CardTitle>
            <CardDescription>Monthly earnings for the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(260, 60%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(260, 60%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(260, 60%, 50%)"
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Pie */}
        <Card className="border rounded-2xl">
          <CardHeader>
            <CardTitle className="font-headline">Order Status</CardTitle>
            <CardDescription>Current status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                    >
                      {statusData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend
                      formatter={(value: string) => getStatusLabel(value)}
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [value, getStatusLabel(name)]}
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No orders yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">Recent Orders</CardTitle>
            <CardDescription>Your latest orders</CardDescription>
          </div>
          <Link href="/tailor/orders">
            <Button variant="ghost" size="sm" className="gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-3 px-2 font-medium">Customer</th>
                    <th className="text-left py-3 px-2 font-medium">Garment</th>
                    <th className="text-left py-3 px-2 font-medium">Status</th>
                    <th className="text-right py-3 px-2 font-medium">Amount</th>
                    <th className="text-right py-3 px-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-2 font-medium">
                        {order.customerName}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {order.garmentType}
                      </td>
                      <td className="py-3 px-2">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-2 text-right font-semibold">
                        ₹{(order.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right text-muted-foreground">
                        {order.createdAt?.toDate
                          ? order.createdAt.toDate().toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No orders yet</p>
              <p className="text-xs mt-1">Orders will appear here when customers place them</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
