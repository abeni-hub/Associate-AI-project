import React from 'react';
import { PageLoadingState } from '../../shared';

export const AccountsLoadingState: React.FC = () => {
  return (
    <PageLoadingState
      title="Loading staff accounts..."
      subtitle="Fetching roles, offices, and credentials."
      compact
    />
  );
};

export default AccountsLoadingState;

