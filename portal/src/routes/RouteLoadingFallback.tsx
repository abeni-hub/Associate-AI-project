import React from 'react';

export const RouteLoadingFallback: React.FC = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        width: '100%',
        gap: '14px',
      }}
    >
      <div className="loading-spinner" />
      <span
        style={{
          color: 'var(--ink)',
          fontSize: '14px',
          fontWeight: 600,
          fontFamily: 'var(--font-family-sans)',
        }}
      >
        Loading page…
      </span>
    </div>
  );
};

export default RouteLoadingFallback;

