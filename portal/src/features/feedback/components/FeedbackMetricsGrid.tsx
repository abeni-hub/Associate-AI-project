import React from 'react';
import { MetricCard } from '../../shared';
import type { FeedbackMetricsGridProps } from '../types/feedback.types';

export const FeedbackMetricsGrid: React.FC<FeedbackMetricsGridProps> = ({
  metrics,
  isLoading,
}) => {
  return (
    <div className="metric-grid compact-metrics">
      <MetricCard
        icon="message"
        label="All responses"
        value={isLoading ? '...' : metrics.total}
        note="Active feedback queue"
        tone="teal"
      />
      <MetricCard
        icon="clock"
        label="Open items"
        value={isLoading ? '...' : metrics.open}
        note="Awaiting first review"
        tone="gold"
      />
      <MetricCard
        icon="activity"
        label="In review"
        value={isLoading ? '...' : metrics.inReview}
        note="Actively being resolved"
        tone="blue"
      />
      <MetricCard
        icon="check"
        label="Resolution rate"
        value={isLoading ? '...' : `${metrics.resolutionRate}%`}
        note="Resolved responses"
        tone="sage"
      />
    </div>
  );
};

export default FeedbackMetricsGrid;

