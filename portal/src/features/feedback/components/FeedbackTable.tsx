import React from 'react';
import { Icon } from '../../shared';
import { StatusPill } from '../../shared';
import { TypePill } from '../../shared';
import type { FeedbackTableProps } from '../types/feedback.types';
import styles from '../styles/feedbackTable.module.css';

export const FeedbackTable: React.FC<FeedbackTableProps> = ({
  items,
  onOpen,
  compact = false,
}) => {
  const visibleItems = compact ? items.slice(0, 4) : items;

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>
          <Icon name="message" size={22} />
        </span>
        <h3 className={styles.emptyTitle}>No feedback found</h3>
        <p className={styles.emptyText}>
          Try changing your filters or search keywords.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Feedback</th>
            <th>Service & Office</th>
            <th>Received</th>
            <th>Status</th>
            <th aria-label="Action" style={{ width: '48px' }} />
          </tr>
        </thead>
        <tbody>
          {visibleItems.map((item) => (
            <tr
              key={item.id}
              onClick={() => onOpen(item)}
              className={styles.row}
            >
              <td>
                <div className={styles.idGroup}>
                  <span className={styles.idText}>{item.id}</span>
                  <TypePill type={item.type}>{item.type}</TypePill>
                </div>
                <p className={styles.messageSnippet}>{item.message}</p>
              </td>
              <td>
                <span className={styles.serviceTitle}>{item.service}</span>
                <span className={styles.officeMeta}>
                  {item.bureau} · {item.subcity}
                </span>
              </td>
              <td className={styles.timeCell}>{item.time}</td>
              <td>
                <StatusPill status={item.status}>{item.status}</StatusPill>
              </td>
              <td>
                <button
                  type="button"
                  className={styles.rowAction}
                  aria-label={`Open details for ${item.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen(item);
                  }}
                >
                  <Icon name="arrow" size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FeedbackTable;

