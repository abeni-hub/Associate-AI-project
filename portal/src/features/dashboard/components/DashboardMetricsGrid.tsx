import React from 'react';
import { MetricCard } from '../../shared';
import type { DashboardMetricsGridProps } from '../types/dashboard.types';

export const DashboardMetricsGrid: React.FC<DashboardMetricsGridProps> = ({ metrics }) => {
  return (
    <section className="metric-grid">
      {metrics.map((m) => (
        <MetricCard
          key={m.label}
          icon={m.icon}
          label={m.label}
          value={m.value}
          note={m.note}
          trend={m.trend}
          tone={m.tone}
        />
      ))}
    </section>
  );
};

export default DashboardMetricsGrid;

