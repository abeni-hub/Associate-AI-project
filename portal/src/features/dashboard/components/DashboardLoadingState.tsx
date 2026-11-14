import React from 'react';
import styles from '../styles/dashboard.module.css';

export const DashboardLoadingState: React.FC = () => {
  return (
    <section className={styles.loadingPanel} aria-busy="true" aria-live="polite">
      <div className="loading-spinner" />
      <h3 className={styles.loadingTitle}>Loading overview...</h3>
      <p className={styles.loadingSubtitle}>
        Fetching platform metrics, engagement, and citizen feedback
      </p>
    </section>
  );
};

export default DashboardLoadingState;

