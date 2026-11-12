import React from 'react';
import { MetricCard } from '../../shared';

interface DocumentMetricsProps {
  isLoading: boolean;
  totalCount: number;
  activeCount: number;
  linkedDocsCount: number;
  totalServiceLinks: number;
}

export const DocumentMetrics: React.FC<DocumentMetricsProps> = ({
  isLoading,
  totalCount,
  activeCount,
  linkedDocsCount,
  totalServiceLinks,
}) => {
  return (
    <section className="metric-grid" aria-label="Documents statistics">
      <MetricCard
        icon="file"
        label="Catalogued documents"
        value={isLoading ? '...' : totalCount}
        note="Standard citizen requirements"
        tone="teal"
      />
      <MetricCard
        icon="check"
        label="Active requirements"
        value={isLoading ? '...' : activeCount}
        note="Ready for service checklists"
        tone="gold"
      />
      <MetricCard
        icon="layers"
        label="Attached to services"
        value={isLoading ? '...' : `${linkedDocsCount} docs`}
        note={`${totalServiceLinks} total service associations`}
        tone="sage"
      />
      <MetricCard
        icon="shield"
        label="Standard compliance"
        value="100%"
        note="City-wide verification standard"
        tone="blue"
      />
    </section>
  );
};

