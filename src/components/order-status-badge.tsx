import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/lib/firestore-helpers';
import { cn } from '@/lib/utils';

const statusConfig: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30 dark:text-yellow-400',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-purple-500/15 text-purple-700 border-purple-500/30 dark:text-purple-400',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-teal-500/15 text-teal-700 border-teal-500/30 dark:text-teal-400',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400',
  },
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium text-xs px-2.5 py-0.5 rounded-full',
        config.className
      )}
    >
      {config.label}
    </Badge>
  );
}
