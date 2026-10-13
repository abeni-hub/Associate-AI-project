import { cn } from '@/lib/utils';

interface ScoreRingProps {
  score: number | null | undefined;
  size?: number;
  className?: string;
  showLabel?: boolean;
}

export function ScoreRing({ score, size = 40, className, showLabel = false }: ScoreRingProps) {
  if (score === null || score === undefined) {
    return (
      <div
        className={cn('flex items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 text-muted-foreground/50', className)}
        style={{ width: size, height: size }}
      >
        <span className="text-xs">—</span>
      </div>
    );
  }

  const rounded = Math.round(score);
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (rounded / 100) * circumference;

  const colorClass =
    rounded >= 75 ? 'text-success' : rounded >= 50 ? 'text-info' : rounded >= 30 ? 'text-warning' : 'text-destructive';

  return (
    <div className={cn('relative flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={3}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={3}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('transition-all duration-500', colorClass)}
        />
      </svg>
      <span className={cn('absolute text-xs font-semibold', colorClass)}>
        {rounded}
      </span>
      {showLabel && (
        <span className="sr-only">Match score: {rounded} out of 100</span>
      )}
    </div>
  );
}

interface ScoreBarProps {
  score: number | null | undefined;
  className?: string;
}

export function ScoreBar({ score, className }: ScoreBarProps) {
  if (score === null || score === undefined) {
    return <div className={cn('h-2 w-full rounded-full bg-muted', className)} />;
  }

  const rounded = Math.round(score);
  const color =
    rounded >= 75 ? 'bg-success' : rounded >= 50 ? 'bg-info' : rounded >= 30 ? 'bg-warning' : 'bg-destructive';

  return (
    <div className={cn('h-2 w-full rounded-full bg-muted overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', color)}
        style={{ width: `${rounded}%` }}
      />
    </div>
  );
}
