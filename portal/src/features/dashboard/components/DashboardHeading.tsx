import React from 'react';
import { Icon } from '../../shared';
import type { DashboardHeadingProps } from '../types/dashboard.types';
import styles from '../styles/dashboardHeading.module.css';

export const DashboardHeading: React.FC<DashboardHeadingProps> = ({
  formattedDate,
  greeting,
  subtitle,
  role,
  isPageLoading,
  onExport,
  onCreate,
}) => {
  return (
    <div className={styles.heading}>
      <div className={styles.titleArea}>
        <span className={styles.eyebrow}>
          <span className={styles.eyebrowLine} />
          {formattedDate}
        </span>
        <h1 className={styles.title}>
          {greeting}
          <span className={styles.titleDot}>.</span>
        </h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      <div className={styles.actions}>
        <button
          className="button secondary"
          onClick={onExport}
          title="Download executive CSV report"
          disabled={isPageLoading}
        >
          <Icon name="download" size={16} /> Export report
        </button>

        {role !== 'super' && (
          <button
            className="button primary"
            onClick={() => onCreate()}
            disabled={isPageLoading}
          >
            <Icon name="plus" size={16} />{' '}
            {role === 'subcity' ? 'Create a service' : 'Update room route'}
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardHeading;

