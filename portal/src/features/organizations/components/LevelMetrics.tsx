import React from 'react';
import { MetricCard } from '../../shared';

interface LevelMetricsProps {
  isLoading: boolean;
  totalCount: number;
  rootCount: number;
  activeCount: number;
}

export const LevelMetrics: React.FC<LevelMetricsProps> = ({
  isLoading,
  totalCount,
  rootCount,
  activeCount,
}) => {
  return (
    <div className="metric-grid compact-metrics">
      <MetricCard
        icon="layers"
        label="Total tiers configured"
        value={isLoading ? '...' : totalCount}
        note="Statutory hierarchy ranks"
        tone="teal"
      />
      <MetricCard
        icon="building"
        label="Root tiers"
        value={isLoading ? '...' : rootCount}
        note="Independent regional authorities"
        tone="sage"
      />
      <MetricCard
        icon="check"
        label="Active tiers"
        value={isLoading ? '...' : activeCount}
        note="Available in office forms"
        tone="gold"
      />
    </div>
  );
};

