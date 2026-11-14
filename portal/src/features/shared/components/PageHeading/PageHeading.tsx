import React from 'react';
import { Icon } from '../Icon';
import type { PageHeadingProps } from './PageHeading.types';
import styles from './PageHeading.module.css';

export const PageHeading: React.FC<PageHeadingProps> = ({
  eyebrow,
  title,
  subtitle,
  action,
  onAction,
  actionIcon = 'plus',
  secondary,
  onSecondary,
  secondaryIcon = 'download',
  children,
  className = '',
}) => {
  return (
    <header className={`${styles.root} ${className}`.trim()}>
      <div className={styles.textGroup}>
        <span className={styles.eyebrow}>
          <span className={styles.eyebrowLine} />
          {eyebrow}
        </span>
        <h1 className={styles.title}>
          {title}
          <span className={styles.dot}>.</span>
        </h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      {(action || secondary || children) && (
        <div className={styles.actions}>
          {children}
          {secondary && onSecondary && (
            <button
              type="button"
              className={`${styles.actionButton} ${styles.secondaryButton}`}
              onClick={onSecondary}
            >
              <Icon name={secondaryIcon} size={16} />
              <span>{secondary}</span>
            </button>
          )}
          {action && onAction && (
            <button
              type="button"
              className={`${styles.actionButton} ${styles.primaryButton}`}
              onClick={onAction}
            >
              <Icon name={actionIcon} size={16} />
              <span>{action}</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default PageHeading;

