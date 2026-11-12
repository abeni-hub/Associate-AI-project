import React from 'react';
import { MetricCard } from '../../shared';
import type { AccountsMetricsGridProps } from '../types/accounts.types';
import styles from '../styles/accounts.module.css';

export const AccountsMetricsGrid: React.FC<AccountsMetricsGridProps> = ({
  total,
  active,
  inactive,
}) => {
  return (
    <div className={`metric-grid ${styles.compactMetrics}`}>
      <MetricCard
        icon="users"
        label="Total accounts"
        value={total}
        note="Across administrative hierarchy"
        tone="teal"
      />
      <MetricCard
        icon="check"
        label="Active accounts"
        value={active}
        note="Access confirmed"
        tone="sage"
      />
      <MetricCard
        icon="clock"
        label="Inactive accounts"
        value={inactive}
        note="Access suspended"
        tone="gold"
      />
      <MetricCard
        icon="shield"
        label="Security audits"
        value="Synchronized"
        note="Connected to Laravel Sanctum"
        tone="blue"
      />
    </div>
  );
};

export default AccountsMetricsGrid;

