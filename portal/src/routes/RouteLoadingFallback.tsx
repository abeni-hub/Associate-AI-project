import React from 'react';
import { PageLoadingState } from '../features/shared';

export const RouteLoadingFallback: React.FC = () => {
  return (
    <PageLoadingState
      title="Loading page..."
      subtitle="Preparing the requested portal section and data views."
    />
  );
};

export default RouteLoadingFallback;

