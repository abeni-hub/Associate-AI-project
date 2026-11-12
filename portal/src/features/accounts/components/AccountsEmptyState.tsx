import React from 'react';
import styles from '../styles/accounts.module.css';

export const AccountsEmptyState: React.FC = () => {
  return (
    <div className={styles.emptyState}>
      <b>No accounts found</b>
      <p>Try adjusting your search filters or create an account.</p>
    </div>
  );
};

export default AccountsEmptyState;

