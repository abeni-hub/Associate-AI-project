import React from 'react';

export interface BrandProps {
  compact?: boolean;
}

export const Brand: React.FC<BrandProps> = ({ compact = false }) => {
  return (
    <div className={`brand-lockup${compact ? ' compact' : ''}`}>
      <span className="brand-mark">
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <path d="M20 3.5 35 12v16L20 36.5 5 28V12L20 3.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 25V15h3.4l4.6 6 4.6-6H28v10h-3v-5.4l-5 6.2-5-6.2V25h-3Z" fill="currentColor" />
          <circle cx="32" cy="8" r="2.3" fill="var(--gold)" />
        </svg>
      </span>
      {!compact && (
        <span className="brand-wordmark">
          <strong>Civic<span>Link</span></strong>
          <small>ETHIOPIA · SERVICE PORTAL</small>
        </span>
      )}
    </div>
  );
};
