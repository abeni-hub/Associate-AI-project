import React from 'react';
import { Icon } from '../../shared';
import type { FeedbackNoticeProps } from '../types/feedback.types';
import styles from '../styles/feedbackNotice.module.css';

export const FeedbackNotice: React.FC<FeedbackNoticeProps> = ({ message }) => {
  if (!message) return null;

  return (
    <aside className={styles.notice} role="status" aria-live="polite">
      <span className={styles.icon}>
        <Icon name="check" size={16} />
      </span>
      <span>{message}</span>
    </aside>
  );
};

export default FeedbackNotice;

