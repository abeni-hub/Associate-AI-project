import React from 'react';
import { Icon } from '../../shared';
import type { LoginPanelHeaderProps } from '../types/auth.types';
import styles from '../styles/loginForm.module.css';

export const LoginPanelHeader: React.FC<LoginPanelHeaderProps> = ({ className = '' }) => {
  return (
    <div className={`${styles.panelTop} ${className}`.trim()}>
      <span className={styles.secureLabel}>
        <Icon name="lock" size={14} /> SECURE ADMIN ACCESS
      </span>
      <span className={styles.languageChip}>
        <Icon name="globe" size={14} /> EN <Icon name="chevron" size={13} />
      </span>
    </div>
  );
};

export default LoginPanelHeader;

