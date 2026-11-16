import React from 'react';
import Icon from './Icon';

export const CITIZENS_RIGHTS = [
  'Right to prompt, polite, and non-discriminatory service from all municipal staff.',
  'Right to clear requirements, processing timelines, and official legal fees before payment.',
  'Right to official government receipts for all transactions and written reasons if service is delayed.',
  'Right to submit complaints, appeal decisions, and receive formal administrative responses.',
];

export const CITIZENS_OBLIGATIONS = [
  'Obligation to provide genuine, truthful, and complete required documentation.',
  'Obligation to respect public servants, facility property, and queuing order.',
  'Obligation to pay only official fees, refuse bribery, and demand an official receipt.',
  'Obligation to report misconduct, delays, or illegal charges through official feedback channels.',
];

export interface CitizensCharterProps {
  t: (key: string) => string;
  variant?: 'guide' | 'qr';
  className?: string;
}

export const CitizensCharter: React.FC<CitizensCharterProps> = ({
  t,
  variant = 'guide',
  className = '',
}) => {
  if (variant === 'qr') {
    return (
      <div className={`qr-charter-section ${className}`.trim()}>
        <div className="qr-charter-header">
          <Icon name="shield" size={16} />
          <h4>{t('Citizens’ Rights & Obligations')}</h4>
        </div>

        <div className="qr-charter-grid">
          {/* Rights Box */}
          <div className="qr-charter-box qr-rights-box">
            <div className="qr-charter-box-title">
              <span className="qr-charter-pill qr-pill-rights">
                <Icon name="check" size={11} />
                <span>{t('Citizens’ Rights')}</span>
              </span>
            </div>
            <ul className="qr-charter-list">
              {CITIZENS_RIGHTS.map((item, idx) => (
                <li key={idx}>{t(item)}</li>
              ))}
            </ul>
          </div>

          {/* Obligations Box */}
          <div className="qr-charter-box qr-obligations-box">
            <div className="qr-charter-box-title">
              <span className="qr-charter-pill qr-pill-obligations">
                <Icon name="shield" size={11} />
                <span>{t('Citizens’ Obligations')}</span>
              </span>
            </div>
            <ul className="qr-charter-list">
              {CITIZENS_OBLIGATIONS.map((item, idx) => (
                <li key={idx}>{t(item)}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Default: 'guide' variant for ServiceGuideSection on Landing Page
  return (
    <div className={`charter-cards-stack ${className}`.trim()}>
      {/* Rights Card */}
      <div className="charter-card rights-card">
        <div className="charter-card-header">
          <span className="charter-badge rights-badge">
            <Icon name="check" size={12} />
            <span>{t('Citizens’ Rights')}</span>
          </span>
        </div>
        <ul className="charter-list">
          {CITIZENS_RIGHTS.map((item, idx) => (
            <li key={idx}>
              <span className="charter-num">0{idx + 1}</span>
              <span>{t(item)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Obligations Card */}
      <div className="charter-card obligations-card">
        <div className="charter-card-header">
          <span className="charter-badge obligations-badge">
            <Icon name="shield" size={12} />
            <span>{t('Citizens’ Obligations')}</span>
          </span>
        </div>
        <ul className="charter-list">
          {CITIZENS_OBLIGATIONS.map((item, idx) => (
            <li key={idx}>
              <span className="charter-num">0{idx + 1}</span>
              <span>{t(item)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CitizensCharter;

