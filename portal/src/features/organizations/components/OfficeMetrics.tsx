import React from 'react';
import { MetricCard } from '../../shared';

interface OfficeMetricsProps {
  isLoading: boolean;
  totalCount: number;
  subcityCount: number;
  woredaCount: number;
  bureauCount: number;
}

export const OfficeMetrics: React.FC<OfficeMetricsProps> = ({
  isLoading,
  totalCount,
  subcityCount,
  woredaCount,
  bureauCount,
}) => {
  return (
    <div className="metric-grid compact-metrics">
      <MetricCard
        icon="sitemap"
        label="Total offices"
        value={isLoading ? '...' : totalCount}
        note="All administrative levels"
        tone="teal"
      />
      <MetricCard
        icon="map"
        label="Sub-cities"
        value={isLoading ? '...' : subcityCount}
        note="Level 1 chartered anchors"
        tone="sage"
      />
      <MetricCard
        icon="layers"
        label="Woredas"
        value={isLoading ? '...' : woredaCount}
        note="Level 2 local districts"
        tone="blue"
      />
      <MetricCard
        icon="building"
        label="Sector bureaus"
        value={isLoading ? '...' : bureauCount}
        note="Level 3 public service offices"
        tone="gold"
      />
    </div>
  );
};

