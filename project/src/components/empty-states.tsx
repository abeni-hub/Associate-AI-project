import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-16 px-4', className)}>
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground/60">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md text-sm text-muted-foreground text-balance">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

interface LoadingStateProps {
  className?: string;
  rows?: number;
}

export function TableLoading({ className, rows = 5 }: LoadingStateProps) {
  return (
    <div className={cn('space-y-3 p-4', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-4 w-48 shimmer rounded" />
          <div className="h-4 w-24 shimmer rounded" />
          <div className="h-4 w-32 shimmer rounded" />
          <div className="h-4 w-20 shimmer rounded" />
          <div className="h-4 w-16 shimmer rounded" />
        </div>
      ))}
    </div>
  );
}

export function PageLoading({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-24', className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  );
}
