import React from 'react';

export interface PageLoadingStateProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export const PageLoadingState: React.FC<PageLoadingStateProps> = ({
  title = 'Loading page...',
  subtitle = 'Preparing the requested workspace...',
  compact = false,
}) => {
  return (
    <section
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: compact ? '220px' : '420px',
        padding: compact ? '32px 20px' : '48px 24px',
        gap: '18px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          width: '100%',
          maxWidth: compact ? '420px' : '560px',
          padding: compact ? '18px 20px' : '22px 26px',
          borderRadius: '18px',
          background: 'linear-gradient(180deg, rgba(15, 118, 110, 0.04), rgba(15, 118, 110, 0.01))',
          border: '1px solid rgba(148, 163, 184, 0.35)',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div className="loading-spinner" style={{ width: '20px', height: '20px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <span
            style={{
              margin: 0,
              color: 'var(--ink, #0f172a)',
              fontSize: compact ? '14px' : '16px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </span>
          <span
            style={{
              margin: 0,
              color: 'var(--muted, #64748b)',
              fontSize: '12px',
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </span>
        </div>
      </div>

      {!compact && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            width: '100%',
            maxWidth: '820px',
          }}
        >
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              style={{
                height: '110px',
                borderRadius: '16px',
                border: '1px solid rgba(148, 163, 184, 0.28)',
                background: 'linear-gradient(90deg, rgba(148, 163, 184, 0.08), rgba(148, 163, 184, 0.02), rgba(148, 163, 184, 0.08))',
                backgroundSize: '200% 100%',
                animation: 'pulseShimmer 1.4s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default PageLoadingState;
