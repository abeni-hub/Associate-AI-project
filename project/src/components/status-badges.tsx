import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  JOB_STATUSES,
  ANALYSIS_STATUSES,
  REVIEW_STATUSES,
  ORG_ROLES,
  EMPLOYMENT_TYPES,
} from '@/lib/constants';

type ColorVariant = 'muted' | 'success' | 'warning' | 'destructive' | 'info';

const colorClasses: Record<ColorVariant, string> = {
  muted: 'bg-muted text-muted-foreground border-border',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  info: 'bg-info/10 text-info border-info/20',
};

interface StatusBadgeProps {
  variant: ColorVariant;
  label: string;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({ variant, label, dot, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('font-medium gap-1.5 border', colorClasses[variant], className)}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', `bg-current`)} />}
      {label}
    </Badge>
  );
}

export function JobStatusBadge({ status, className }: { status: string; className?: string }) {
  const entry = JOB_STATUSES.find((s) => s.value === status);
  if (!entry) return null;
  return <StatusBadge variant={entry.color as ColorVariant} label={entry.label} dot className={className} />;
}

export function AnalysisStatusBadge({ status, className }: { status: string; className?: string }) {
  const entry = ANALYSIS_STATUSES.find((s) => s.value === status);
  if (!entry) return null;
  return <StatusBadge variant={entry.color as ColorVariant} label={entry.label} dot className={className} />;
}

export function ReviewStatusBadge({ status, className }: { status: string; className?: string }) {
  const entry = REVIEW_STATUSES.find((s) => s.value === status);
  if (!entry) return null;
  return <StatusBadge variant={entry.color as ColorVariant} label={entry.label} dot className={className} />;
}

export function RoleBadge({ role, className }: { role: string; className?: string }) {
  const entry = ORG_ROLES.find((r) => r.value === role);
  if (!entry) return null;
  return <Badge variant="secondary" className={cn('font-medium', className)}>{entry.label}</Badge>;
}

export function EmploymentTypeBadge({ type, className }: { type: string; className?: string }) {
  const entry = EMPLOYMENT_TYPES.find((t) => t.value === type);
  if (!entry) return null;
  return <Badge variant="outline" className={cn('font-normal text-muted-foreground', className)}>{entry.label}</Badge>;
}
