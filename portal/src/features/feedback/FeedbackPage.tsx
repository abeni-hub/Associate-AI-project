import React from 'react';
import { PageHeading, Icon } from '../shared';
import {
  useFeedback,
  FeedbackMetricsGrid,
  FeedbackToolbar,
  FeedbackTable,
  FeedbackNotice,
  FeedbackLoadingState,
  FeedbackTipBanner,
} from './index';
import type { NormalizedFeedbackItem } from './types/feedback.types';
import styles from './styles/feedback.module.css';

export interface FeedbackPageProps {
  items?: NormalizedFeedbackItem[];
  onOpen?: (item: NormalizedFeedbackItem) => void;
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({ items: propItems, onOpen: propOnOpen }) => {
  const {
    items,
    metrics,
    isLoading,
    searchQuery,
    typeFilter,
    statusFilter,
    noticeMessage,
    handleOpen,
    handleSearchChange,
    handleTypeFilterChange,
    handleStatusFilterChange,
  } = useFeedback(propItems);

  const activeOnOpen = propOnOpen ?? handleOpen;

  return (
    <>
      <PageHeading
        eyebrow="CITIZEN VOICE"
        title="Feedback inbox"
        subtitle="Read citizen submissions and track inquiries, complaints, and compliments to resolution."
        secondary="Export feedback"
        onSecondary={() => window.alert('Feedback report generated and exported.')}
      />

      <FeedbackNotice message={noticeMessage ?? ''} />

      <FeedbackMetricsGrid metrics={metrics} isLoading={isLoading} />

      <section className="panel feedback-inbox">
        <FeedbackToolbar
          searchQuery={searchQuery}
          typeFilter={typeFilter}
          statusFilter={statusFilter}
          onSearchChange={handleSearchChange}
          onTypeFilterChange={handleTypeFilterChange}
          onStatusFilterChange={handleStatusFilterChange}
        />

        {isLoading ? (
          <FeedbackLoadingState />
        ) : (
          <FeedbackTable items={items} onOpen={activeOnOpen} />
        )}
      </section>

      <FeedbackTipBanner />

      <p className={styles.feedbackFootnote}>
        <Icon name="check" size={13} /> Synchronized with citizen complaints and satisfaction registry
      </p>
    </>
  );
};

export default FeedbackPage;

