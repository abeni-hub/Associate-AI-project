import React from 'react';
import { MetricCard } from '../../shared';
import { useLanguage } from '../../shared/i18n';
import type { FeedbackMetricsGridProps } from '../types/feedback.types';

export const FeedbackMetricsGrid: React.FC<FeedbackMetricsGridProps> = ({
  metrics,
  isLoading,
}) => {
  const { t } = useLanguage();

  return (
    <div className="metric-grid">
      <MetricCard
        icon="message"
        label={t('feedback.totalSubmissions', 'Total Submissions')}
        value={isLoading ? '...' : metrics.total}
        note={t('feedback.queueNote', 'Active citizen queue')}
        tone="teal"
      />
      <MetricCard
        icon="clock"
        label={t('feedback.openCases', 'Open Cases')}
        value={isLoading ? '...' : metrics.open}
        note={t('feedback.awaitingReviewNote', 'Awaiting review')}
        tone="gold"
      />
      <MetricCard
        icon="activity"
        label={t('feedback.underReview', 'Under Review')}
        value={isLoading ? '...' : metrics.inReview}
        note={t('feedback.investigatedNote', 'Actively investigated')}
        tone="blue"
      />
      <MetricCard
        icon="check"
        label={t('feedback.resolvedRate', 'Resolution Rate')}
        value={isLoading ? '...' : `${metrics.resolutionRate}%`}
        note={`${metrics.resolved} ${t('feedback.resolvedCasesNote', 'resolved cases')}`}
        tone="sage"
      />
    </div>
  );
};

export default FeedbackMetricsGrid;
