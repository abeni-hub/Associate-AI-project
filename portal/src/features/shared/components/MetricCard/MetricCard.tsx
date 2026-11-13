import React from 'react';
import { Icon } from '../Icon';
import type { MetricCardProps } from './MetricCard.types';
import styles from './MetricCard.module.css';

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  note,
  trend,
  tone = 'teal',
  onMenuClick,
  className = '',
}) => {
  const trimmedTrend = trend?.trim();
  const isLive = trimmedTrend?.toLowerCase() === 'live';
  const isNegative = trimmedTrend?.startsWith('-');

  return (
    <article
      className={`${styles.root} ${styles[`card_${tone}`] ?? ''} ${className}`.trim()}
    >
      <div className={styles.header}>
        <span className={`${styles.iconWrapper} ${styles[tone] ?? styles.teal}`}>
          <Icon name={icon} size={18} />
        </span>
        <div className={styles.headerActions}>
          {trimmedTrend && (
            <span
              className={`${styles.trendBadge} ${
                isLive
                  ? styles.trendLive
                  : isNegative
                  ? styles.trendNegative
                  : styles.trendPositive
              }`}
            >
              {isLive ? (
                <span className={styles.liveDot} />
              ) : (
                <span className={styles.trendArrow}>{isNegative ? '↓' : '↑'}</span>
              )}
              <span>{trimmedTrend}</span>
            </span>
          )}
          {onMenuClick && (
            <button
              type="button"
              className={styles.menuButton}
              onClick={onMenuClick}
              aria-label={`Options for ${label}`}
            >
              <Icon name="dots" size={16} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{label}</div>
      </div>

      {note && (
        <div className={styles.footer}>
          <span className={styles.noteText}>{note}</span>
        </div>
      )}
    </article>
  );
};

export default MetricCard;

