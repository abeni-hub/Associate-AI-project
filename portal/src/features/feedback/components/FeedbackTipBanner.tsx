import React from 'react';
import { Icon } from '../../shared';
import type { FeedbackTipBannerProps } from '../types/feedback.types';
import styles from '../styles/feedbackTipBanner.module.css';

export const FeedbackTipBanner: React.FC<FeedbackTipBannerProps> = ({
  title = 'Respectful follow-up builds trust',
  description = 'Share feedback only with the administrators responsible for its sub-city and bureau.',
}) => {
  return (
    <aside className={styles.banner} aria-label="Governance notice">
      <span className={styles.iconWrapper}>
        <Icon name="shield" size={17} />
      </span>
      <div className={styles.content}>
        <strong className={styles.title}>{title}</strong>
        <span className={styles.description}>{description}</span>
      </div>
    </aside>
  );
};

export default FeedbackTipBanner;

