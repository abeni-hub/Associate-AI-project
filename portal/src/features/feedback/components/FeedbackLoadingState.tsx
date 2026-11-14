import React from 'react';
import type { FeedbackLoadingStateProps } from '../types/feedback.types';

export const FeedbackLoadingState: React.FC<FeedbackLoadingStateProps> = ({
  message = 'Loading citizen feedback...',
  subMessage = 'Connecting to bureau feedback streams',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        gap: '12px',
      }}
    >
      <div className="loading-spinner" />
      <p style={{ margin: 0, color: 'var(--ink)', fontWeight: 600, fontSize: '14px' }}>
        {message}
      </p>
      <p style={{ margin: 0, color: 'var(--muted)', fontSize: '12px' }}>
        {subMessage}
      </p>
    </div>
  );
};

export default FeedbackLoadingState;

