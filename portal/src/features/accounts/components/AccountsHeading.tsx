import React from 'react';
import { PageHeading } from '../../shared';

export interface AccountsHeadingProps {
  canCreate: boolean;
  onAdd: () => void;
  onExport: () => void;
}

export const AccountsHeading: React.FC<AccountsHeadingProps> = ({
  canCreate,
  onAdd,
  onExport,
}) => {
  return (
    <PageHeading
      eyebrow="ACCESS & PERMISSIONS"
      title="Accounts"
      subtitle="Manage administrator access and credentials across every connected organization."
      action={canCreate ? 'Create account' : undefined}
      onAction={canCreate ? onAdd : undefined}
      secondary="Export list"
      onSecondary={onExport}
    />
  );
};

export default AccountsHeading;

