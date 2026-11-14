import React from 'react';
import { MetricCard } from '../../shared';
import type { QRMetricsGridProps } from '../types/qrCodes.types';

export const QRMetricsGrid: React.FC<QRMetricsGridProps> = ({ metrics, isLoading }) => {
  return (
    <div className="metric-grid compact-metrics">
      <MetricCard
        icon="qr"
        label="Total posters"
        value={isLoading ? '...' : metrics.total}
        note="Configured citizen touchpoints"
        tone="teal"
      />
      <MetricCard
        icon="check"
        label="Active posters"
        value={isLoading ? '...' : metrics.active}
        note="Live scannable display tokens"
        tone="sage"
      />
      <MetricCard
        icon="message"
        label="Citizen scans"
        value={isLoading ? '...' : metrics.totalScans}
        note="Total feedback visits recorded"
        trend={metrics.totalScans > 0 ? 'Live' : undefined}
        tone="gold"
      />
      <MetricCard
        icon="building"
        label="Connected offices"
        value={isLoading ? '...' : metrics.bureauCount}
        note="Jurisdictions with active posters"
        tone="blue"
      />
    </div>
  );
};

export default QRMetricsGrid;

