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
  return (
    <article className={`${styles.root} ${className}`.trim()}>
      <div className={styles.header}>
        <span className={`${styles.iconWrapper} ${styles[tone] ?? styles.teal}`}>
          <Icon name={icon} size={18} />
        </span>
        {onMenuClick && (
          <button
            type="button"
            className={styles.menuButton}
            onClick={onMenuClick}
            aria-label={`Options for ${label}`}
          >
            <Icon name="dots" size={17} />
          </button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{label}</div>
      </div>

      <div className={styles.footer}>
        <span className={trend ? styles.trendUp : styles.trendNeutral}>
          {trend ? <span>↗ {trend} · </span> : null}
          {note}
        </span>
      </div>
    </article>
  );
};

export default MetricCard;

