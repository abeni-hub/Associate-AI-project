import React from 'react';
import type { StatusPillProps } from './StatusPill.types';
import styles from './StatusPill.module.css';

export const StatusPill: React.FC<StatusPillProps> = ({
  children,
  status,
  className = '',
}) => {
  const resolvedStatus = (status ?? String(children)).toLowerCase().trim();

  const getStyleClass = (): string => {
    switch (resolvedStatus) {
      case 'active':
      case 'resolved':
      case 'published':
        return styles.active;
      case 'inactive':
      case 'draft':
      case 'pending':
        return styles.inactive;
      case 'suspended':
      case 'rejected':
      case 'closed':
        return styles.suspended;
      case 'in-progress':
      case 'in progress':
        return styles.inProgress;
      case 'under-review':
      case 'under review':
        return styles.underReview;
      default:
        return styles.active;
    }
  };

  return (
    <span className={`${styles.pill} ${getStyleClass()} ${className}`.trim()}>
      <i className={styles.dot} aria-hidden="true" />
      <span>{children}</span>
    </span>
  );
};

export default StatusPill;

