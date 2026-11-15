import React from 'react';
import styles from '../styles/accounts.module.css';

export const AccountsLoadingState: React.FC = () => {
  return (
    <div className={styles.loadingPanel} aria-busy="true" aria-live="polite">
      <div className="loading-spinner" />
      <p className={styles.loadingTitle}>Loading administrator accounts...</p>
      <p className={styles.loadingSubtitle}>Fetching roles and credentials</p>
    </div>
  );
};

export default AccountsLoadingState;

