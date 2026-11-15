export type MetricTone = 'teal' | 'sage' | 'gold' | 'blue';

export interface MetricCardProps {
  icon: string;
  label: string;
  value: string | number;
  note: string;
  trend?: string;
  tone?: MetricTone;
  onMenuClick?: () => void;
  className?: string;
}

