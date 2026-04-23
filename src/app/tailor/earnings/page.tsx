'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { subscribeToOrders, type Order } from '@/lib/firestore-helpers';
import StatCard from '@/components/stat-card';
import OrderStatusBadge from '@/components/order-status-badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Loader2,
  IndianRupee,
  TrendingUp,
  ShoppingBag,
  Calculator,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const BAR_COLORS = [
  '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#6366f1',
];

function getMonthlyEarnings(orders: Order[]) {
  const months: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString('en-US', { month: 'short' });
    months[key] = 0;
  }
  orders.forEach((order) => {
    if (
      (order.status === 'completed' || order.status === 'delivered') &&
      order.createdAt?.toDate
    ) {
      const d = order.createdAt.toDate();
      const key = d.toLocaleDateString('en-US', { month: 'short' });
      if (months[key] !== undefined) {
        months[key] += order.amount || 0;
      }
    }
  });
  return Object.entries(months).map(([month, earnings]) => ({ month, earnings }));
}

function getGarmentRevenue(orders: Order[]) {
  const garments: Record<string, number> = {};
  orders
    .filter((o) => o.status === 'completed' || o.status === 'delivered')
    .forEach((order) => {
      const type = order.garmentType || 'Other';
      garments[type] = (garments[type] || 0) + (order.amount || 0);
    });
  return Object.entries(garments)
    .map(([garment, revenue]) => ({ garment, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

export default function TailorEarningsPage() {
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

  const completedOrders = orders.filter(
    (o) => o.status === 'completed' || o.status === 'delivered'
  );
  const totalRevenue = completedOrders.reduce((s, o) => s + (o.amount || 0), 0);
  
  const now = new Date();
  const thisMonthOrders = completedOrders.filter((o) => {
    const d = o.createdAt?.toDate?.();
    return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthRevenue = thisMonthOrders.reduce((s, o) => s + (o.amount || 0), 0);
  const avgOrderValue = completedOrders.length > 0
    ? Math.round(totalRevenue / completedOrders.length)
    : 0;

  const monthlyData = getMonthlyEarnings(orders);
  const garmentData = getGarmentRevenue(orders);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Earnings</h1>
        <p className="text-muted-foreground mt-1">Track your revenue and financial performance.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={IndianRupee}
          color="green"
          subtitle="All completed orders"
        />
        <StatCard
          title="This Month"
          value={`₹${thisMonthRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="blue"
          subtitle={now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        />
        <StatCard
          title="Avg. Order Value"
          value={`₹${avgOrderValue.toLocaleString()}`}
          icon={Calculator}
          color="purple"
          subtitle="Per completed order"
        />
        <StatCard
          title="Completed Orders"
          value={completedOrders.length}
          icon={ShoppingBag}
          color="orange"
          subtitle="Delivered & completed"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <Card className="lg:col-span-2 border rounded-2xl">
          <CardHeader>
            <CardTitle className="font-headline">Monthly Revenue</CardTitle>
            <CardDescription>Earnings breakdown for the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                    dataKey="earnings"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#earningsGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Garment Revenue Bar Chart */}
        <Card className="border rounded-2xl">
          <CardHeader>
            <CardTitle className="font-headline">By Garment Type</CardTitle>
            <CardDescription>Revenue per garment category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {garmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={garmentData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(v) => `₹${v}`}
                    />
                    <YAxis
                      type="category"
                      dataKey="garment"
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                      width={70}
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
                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                      {garmentData.map((_, idx) => (
                        <Cell key={idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No earnings data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Table */}
      <Card className="border rounded-2xl">
        <CardHeader>
          <CardTitle className="font-headline">Earnings History</CardTitle>
          <CardDescription>All completed and delivered orders</CardDescription>
        </CardHeader>
        <CardContent>
          {completedOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground bg-muted/30">
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 font-medium">Garment</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {completedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3 px-4 text-muted-foreground">
                        {order.createdAt?.toDate?.()?.toLocaleDateString() || '—'}
                      </td>
                      <td className="py-3 px-4 font-medium">{order.customerName}</td>
                      <td className="py-3 px-4 text-muted-foreground">{order.garmentType}</td>
                      <td className="py-3 px-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        +₹{(order.amount || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <IndianRupee className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="font-semibold text-lg">No earnings yet</p>
              <p className="text-sm mt-1">Revenue will appear here when orders are completed.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
