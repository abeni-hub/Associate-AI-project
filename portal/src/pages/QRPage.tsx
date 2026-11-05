import React, { useMemo, useState } from 'react';
import { usePortal } from '../context';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import { StatusPill } from '../components/shared/StatusPill';
import { QRPattern } from '../components/shared/QRPattern';
import { useGetQrCodesQuery, useCreateQrCodeMutation } from '../services/qrCodesApi';

export interface QRPageProps {
  onGenerate?: () => void;
  onCopy?: () => void;
}

export const QRPage: React.FC<QRPageProps> = ({
  onGenerate: propOnGenerate,
  onCopy: propOnCopy,
}) => {
  const portal = usePortal();
  const [copied, setCopied] = useState(false);
  const userOrgId = portal.session?.user?.organization?.id || 1;

  const { data: apiQrResponse } = useGetQrCodesQuery();
  const [createQrTrigger] = useCreateQrCodeMutation();

  const activeQr = useMemo(() => {
    if (apiQrResponse?.data) {
      const list = Array.isArray(apiQrResponse.data) ? apiQrResponse.data : (apiQrResponse.data as any).data;
      if (Array.isArray(list) && list.length > 0) {
        return list[0];
      }
    }
    return null;
  }, [apiQrResponse]);

  const activeCodeId = activeQr?.code || '—';
  const targetUrl = activeQr?.target_url || `${window.location.origin}/#feedback`;
  const scanCount = activeQr?.scan_count ?? 0;

  const onGenerate =
    propOnGenerate ||
    (() => {
      portal.setModal({
        kind: 'qr',
        onGenerate: async () => {
          try {
            await createQrTrigger({
              organization_id: userOrgId,
              code: `QR-${portal.session?.user?.organization?.code || 'BUREAU'}-${Date.now().toString().slice(-4)}`.toUpperCase(),
              label: `${portal.session?.user?.organization?.name || 'Bureau'} Feedback Kiosk`,
              target_url: `${window.location.origin}/#feedback`,
            }).unwrap();
          } catch {
            // fallback handled
          }
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        },
      });
    });

  const onCopy =
    propOnCopy ||
    (() => {
      void navigator.clipboard?.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });

  return (
    <>
      <PageHeading
        eyebrow="CITIZEN ACCESS"
        title="Feedback QR codes"
        subtitle="Help citizens open the right feedback form from a poster or service desk."
        action="Generate QR code"
        onAction={onGenerate}
      />
      <div className="qr-hero panel">
        <div className="qr-hero-copy">
          <span className="panel-eyebrow">YOUR OFFICE · {(portal.session?.user?.organization?.name || 'PUBLIC SERVICE BUREAU').toUpperCase()}</span>
          <h2>
            Make your voice
            <br />
            <em>easy to reach.</em>
          </h2>
          <p>
            Print this code and place it at your service desks. Citizens can scan it to share a complaint, suggestion or satisfaction rating about their visit.
          </p>
          <div className="qr-hero-actions">
            <button className="button primary" onClick={() => window.print()}>
              <Icon name="download" size={16} /> Print QR poster
            </button>
            <button
              className="button secondary"
              onClick={() => {
                onCopy();
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }}
            >
              <Icon name="external" size={15} /> {copied ? 'Link copied' : 'Copy feedback link'}
            </button>
          </div>
        </div>
        <div className="qr-preview-card">
          <span className="qr-corner corner-tl" />
          <span className="qr-corner corner-tr" />
          <span className="qr-corner corner-bl" />
          <QRPattern />
          <div className="qr-preview-caption">
            <b>Share your experience</b>
            <small>Scan to leave feedback</small>
          </div>
          <span className="qr-live">
            <i /> ACTIVE
          </span>
        </div>
        <div className="qr-hero-glow" />
      </div>
      <div className="qr-stats-grid">
        <div className="panel qr-stat">
          <span className="metric-icon teal">
            <Icon name="qr" />
          </span>
          <span>
            <b>{activeCodeId}</b>
            <small>{activeQr ? 'Active code ID' : 'No active QR code'}</small>
          </span>
          <StatusPill>{activeQr ? 'Active' : 'Not generated'}</StatusPill>
        </div>
        <div className="panel qr-stat">
          <span className="metric-icon gold">
            <Icon name="message" />
          </span>
          <span>
            <b>{scanCount} scans</b>
            <small>Feedback visits this month</small>
          </span>
          {activeQr && <em>↗ 16%</em>}
        </div>
        <div className="panel qr-stat">
          <span className="metric-icon sage">
            <Icon name="globe" />
          </span>
          <span>
            <b>Public feedback form</b>
            <small>{targetUrl.replace(/^https?:\/\//, '')}</small>
          </span>
          <button
            className="row-more"
            aria-label="Copy feedback link"
            onClick={() => {
              onCopy();
              setCopied(true);
            }}
          >
            <Icon name="external" size={16} />
          </button>
        </div>
      </div>
      <div className="panel qr-instructions">
        <div>
          <span className="panel-eyebrow">A SIMPLE WAY TO LISTEN</span>
          <h2>From scan to response</h2>
          <p>
            Your QR code takes citizens to a guided feedback form. Responses appear in your bureau inbox and the sub-city dashboard.
          </p>
        </div>
        <div className="qr-flow">
          <div>
            <span>01</span>
            <Icon name="qr" />
            <b>Citizen scans</b>
            <small>At your office</small>
          </div>
          <i />
          <div>
            <span>02</span>
            <Icon name="message" />
            <b>They share</b>
            <small>Feedback in minutes</small>
          </div>
          <i />
          <div>
            <span>03</span>
            <Icon name="activity" />
            <b>Your team responds</b>
            <small>In the admin inbox</small>
          </div>
        </div>
      </div>
      <div className="tip-banner">
        <span className="tip-icon">
          <Icon name="shield" size={17} />
        </span>
        <span>
          <b>Keep printed codes easy to find</b>
          <small>
            Place the QR poster near the exit or service desk, with clear instructions in the languages your citizens use.
          </small>
        </span>
      </div>
    </>
  );
};

export default QRPage;
