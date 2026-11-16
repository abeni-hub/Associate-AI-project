import React from 'react';
import { PageLoadingState } from '../../shared';

export const DashboardLoadingState: React.FC = () => {
  return (
    <PageLoadingState
      title="Loading overview..."
      subtitle="Fetching platform metrics, engagement, and citizen feedback."
      compact
    />
  );
};

export default DashboardLoadingState;

