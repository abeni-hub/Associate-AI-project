import React from 'react';
import { MetricCard } from '../../shared';

export interface ActivityMetricsProps {
  stats: {
    total: number;
    diffsCount: number;
    telemetryCount: number;
    actorsCount: number;
  };
  isLoading: boolean;
  hasData: boolean;
}

export const ActivityMetrics: React.FC<ActivityMetricsProps> = ({
  stats,
  isLoading,
  hasData,
}) => {
  const isPending = isLoading && !hasData;

  return (
    <section className="metric-grid" aria-label="Activity statistics">
      <MetricCard
        icon="activity"
        label="Logged system actions"
        value={isPending ? '...' : stats.total}
        note="Across administrative hierarchy"
        tone="teal"
      />
      <MetricCard
        icon="edit"
        label="State changes & diffs"
        value={isPending ? '...' : stats.diffsCount}
        note="Field-level state transitions"
        tone="gold"
      />
      <MetricCard
        icon="file"
        label="Wire telemetry captured"
        value={isPending ? '...' : stats.telemetryCount}
        note="Includes HTTP request/response bytes"
        tone="blue"
      />
      <MetricCard
        icon="users"
        label="Active system actors"
        value={isPending ? '...' : stats.actorsCount}
        note="Unique administrative operators"
        tone="blue"
      />
    </section>
  );
};

export default ActivityMetrics;

