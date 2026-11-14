import React from 'react';
import { MetricCard } from '../../shared';
import { useLanguage } from '../../shared/i18n';

export interface DocumentMetricsProps {
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
  const { t } = useLanguage();

  return (
    <section className="metric-grid" aria-label="Documents statistics">
      <MetricCard
        icon="file"
        label={t('documents.totalDocs', 'Total documents')}
        value={isLoading ? '...' : totalCount}
        note="Standard citizen requirements"
        tone="teal"
      />
      <MetricCard
        icon="check"
        label={t('documents.activeDocs', 'Active requirements')}
        value={isLoading ? '...' : activeCount}
        note="Ready for service checklists"
        tone="sage"
      />
      <MetricCard
        icon="layers"
        label={t('documents.linkedDocs', 'Attached to services')}
        value={isLoading ? '...' : `${linkedDocsCount} docs`}
        note={`${totalServiceLinks} total associations`}
        tone="blue"
      />
      <MetricCard
        icon="shield"
        label={t('documents.totalLinks', 'Service links')}
        value={isLoading ? '...' : totalServiceLinks}
        note="Standard compliance"
        tone="gold"
      />
    </section>
  );
};

export default DocumentMetrics;
