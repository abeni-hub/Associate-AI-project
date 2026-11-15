import React from 'react';
import { SearchBox } from '../../shared';
import type { FeedbackToolbarProps } from '../types/feedback.types';
import styles from '../styles/feedbackToolbar.module.css';

export const FeedbackToolbar: React.FC<FeedbackToolbarProps> = ({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  return (
    <div className={styles.toolbar}>
      <div className={styles.intro}>
        <h2 className={styles.title}>All citizen responses</h2>
        <p className={styles.description}>
          Feedback is routed to the relevant bureau and sub-city teams.
        </p>
      </div>

      <div className={styles.tools}>
        <SearchBox
          value={search}
          onChange={onSearchChange}
          placeholder="Search feedback..."
        />
        <select
          className={styles.select}
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          aria-label="Filter by feedback type"
        >
          <option>All types</option>
          <option>Complaint</option>
          <option>Suggestion</option>
          <option>Satisfaction</option>
        </select>
        <select
          className={styles.select}
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          aria-label="Filter by feedback status"
        >
          <option>All statuses</option>
          <option>Open</option>
          <option>In review</option>
          <option>Resolved</option>
          <option>Closed</option>
        </select>
      </div>
    </div>
  );
};

export default FeedbackToolbar;

