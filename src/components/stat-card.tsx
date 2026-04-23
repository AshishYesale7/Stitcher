'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: 'default' | 'green' | 'blue' | 'orange' | 'purple' | 'red';
  className?: string;
}

const colorStyles: Record<string, { bg: string; icon: string; border: string }> = {
  default: { bg: 'bg-card', icon: 'text-primary', border: 'border-border' },
  green: { bg: 'bg-emerald-500/10', icon: 'text-emerald-500', border: 'border-emerald-500/20' },
  blue: { bg: 'bg-blue-500/10', icon: 'text-blue-500', border: 'border-blue-500/20' },
  orange: { bg: 'bg-amber-500/10', icon: 'text-amber-500', border: 'border-amber-500/20' },
  purple: { bg: 'bg-purple-500/10', icon: 'text-purple-500', border: 'border-purple-500/20' },
  red: { bg: 'bg-red-500/10', icon: 'text-red-500', border: 'border-red-500/20' },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'default',
  className,
}: StatCardProps) {
  const styles = colorStyles[color];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5',
        styles.bg,
        styles.border,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              <span
                className={cn(
                  'font-semibold',
                  trend.value >= 0 ? 'text-emerald-500' : 'text-red-500'
                )}
              >
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            color === 'default' ? 'bg-primary/10' : styles.bg
          )}
        >
          <Icon className={cn('h-6 w-6', styles.icon)} />
        </div>
      </div>
      {/* Decorative gradient blob */}
      <div
        className={cn(
          'absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl',
          color === 'green' && 'bg-emerald-500',
          color === 'blue' && 'bg-blue-500',
          color === 'orange' && 'bg-amber-500',
          color === 'purple' && 'bg-purple-500',
          color === 'red' && 'bg-red-500',
          color === 'default' && 'bg-primary'
        )}
      />
    </div>
  );
}
