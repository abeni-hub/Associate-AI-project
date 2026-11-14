import React from 'react';
import { MetricCard } from '../../shared';
import { useLanguage } from '../../shared/i18n';
import type { AccountsMetricsGridProps } from '../types/accounts.types';

export const AccountsMetricsGrid: React.FC<AccountsMetricsGridProps> = ({
  total,
  active,
  inactive,
  admins,
  offices,
}) => {
  const { t } = useLanguage();

  return (
    <div className="metric-grid">
      <MetricCard
        icon="users"
        label={t('accounts.totalAccounts', 'Total accounts')}
        value={total}
        note="Across administrative hierarchy"
        tone="teal"
      />
      <MetricCard
        icon="check"
        label={t('accounts.activeAccounts', 'Active accounts')}
        value={active}
        note="Confirmed credentials"
        tone="sage"
      />
      <MetricCard
        icon="shield"
        label={t('accounts.administrators', 'Administrators')}
        value={admins ?? (inactive !== undefined ? inactive : 0)}
        note="Privileged access"
        tone="blue"
      />
      <MetricCard
        icon="building"
        label={t('accounts.assignedOffices', 'Assigned offices')}
        value={offices ?? 'All units'}
        note="Connected branch offices"
        tone="gold"
      />
    </div>
  );
};

export default AccountsMetricsGrid;
