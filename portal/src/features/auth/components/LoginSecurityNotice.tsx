import React from 'react';
import { Icon } from '../../shared';
import type { LoginSecurityNoticeProps } from '../types/auth.types';
import styles from '../styles/loginForm.module.css';

export const LoginSecurityNotice: React.FC<LoginSecurityNoticeProps> = ({ className = '' }) => {
  return (
    <div className={`${styles.securityNotice} ${className}`.trim()}>
      <span className={styles.securityNoticeIcon}>
        <Icon name="shield" size={15} />
      </span>
      <span>
        Authorized government personnel only. All access attempts and administrative sessions
        are authenticated and audited.
      </span>
    </div>
  );
};

export default LoginSecurityNotice;

