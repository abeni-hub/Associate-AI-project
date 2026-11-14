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
      <div className={`${styles.iconWrapper} ${styles[tone] ?? styles.teal}`}>
        <Icon name={icon} size={18} />
      </div>

      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.label} title={label}>
            {label}
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
                <Icon name="dots" size={14} />
              </button>
            )}
          </div>
        </div>

        <div className={styles.valueRow}>
          <span className={styles.value}>{value}</span>
          {note && (
            <span className={styles.note} title={note}>
              {note}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default MetricCard;
