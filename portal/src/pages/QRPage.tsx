import React, { useMemo, useState } from 'react';
import { usePortal } from '../context';
import { usePermissions } from '../hooks/usePermissions';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import { StatusPill } from '../components/shared/StatusPill';
import { QRPattern } from '../components/shared/QRPattern';
import {
  useGetQrCodesQuery,
  useDeleteQrCodeMutation,
  type QrCodeItem,
} from '../services/qrCodesApi';

export interface QRPageProps {
  onGenerate?: () => void;
  onCopy?: () => void;
}

export const QRPage: React.FC<QRPageProps> = ({
  onGenerate: propOnGenerate,
  onCopy: propOnCopy,
}) => {
  const portal = usePortal();
  const { hasPermission } = usePermissions();
  const canManageQrCodes = hasPermission('qr_codes.manage');

  const [copied, setCopied] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: apiQrResponse, isLoading } = useGetQrCodesQuery();
  const [deleteQrTrigger] = useDeleteQrCodeMutation();

  const qrList: QrCodeItem[] = useMemo(() => {
    if (!apiQrResponse?.data) return [];
    if (Array.isArray(apiQrResponse.data)) return apiQrResponse.data;
    if (Array.isArray((apiQrResponse.data as any).data)) return (apiQrResponse.data as any).data;
    return [];
  }, [apiQrResponse]);

  const activeQr = useMemo(() => {
    if (selectedId) {
      const match = qrList.find((q) => q.id === selectedId);
      if (match) return match;
    }
    return qrList[0] || null;
  }, [qrList, selectedId]);

  const activeCodeId = activeQr?.code || '—';
  const targetUrl = activeQr?.target_url || `${window.location.origin}/#feedback`;
  const scanCount = activeQr?.scan_count ?? 0;
  const officeName =
    activeQr?.organization?.name ||
    portal.session?.user?.organization?.name ||
    'PUBLIC SERVICE BUREAU';

  const onGenerate =
    propOnGenerate ||
    (() => {
      portal.setModal({
        kind: 'qr',
        onCreated: (createdQr: QrCodeItem) => {
          if (createdQr?.id) {
            setSelectedId(createdQr.id);
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

  const handleDelete = async (e: React.MouseEvent, id: number, code: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete QR poster ${code}?`)) {
      try {
        await deleteQrTrigger(id).unwrap();
        if (selectedId === id) setSelectedId(null);
      } catch (err) {
        console.warn('Failed to delete QR poster:', err);
      }
    }
  };

  return (
    <>
      <PageHeading
        eyebrow="CITIZEN ACCESS"
        title="Feedback QR codes"
        subtitle="Help citizens open the right feedback form from a poster or service desk."
        action={canManageQrCodes ? 'Generate QR code' : undefined}
        onAction={onGenerate}
      />

      {isLoading && !apiQrResponse ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '56px 24px',
            gap: '12px',
          }}
        >
          <div className="loading-spinner" />
          <p style={{ margin: 0, color: '#00485a', fontWeight: 600, fontSize: '14px' }}>
            Loading feedback QR posters...
          </p>
          <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>
            Connecting to bureau access points
          </p>
        </div>
      ) : (
        <>
          <div className="qr-hero panel">
            <div className="qr-hero-copy">
              <span className="panel-eyebrow">YOUR OFFICE · {officeName.toUpperCase()}</span>
              <h2>
                Make your voice
                <br />
                <em>easy to reach.</em>
              </h2>
              <p>
                {activeQr
                  ? `Active poster: ${activeQr.label}. Place this code at your service desk so citizens can scan to submit feedback.`
                  : 'No QR code generated yet for this office. Click Generate QR code above to create a scannable citizen poster.'}
              </p>
              <div className="qr-hero-actions">
                <button
                  className="button primary"
                  onClick={() => {
                    if (activeQr) {
                      portal.setModal({ kind: 'qr', qr: activeQr });
                    } else {
                      onGenerate();
                    }
                  }}
                >
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
              <QRPattern data={targetUrl} />
              <div className="qr-preview-caption">
                <b>{activeQr?.label || 'Share your experience'}</b>
                <small>{activeQr?.code || 'Scan to leave feedback'}</small>
              </div>
              <span className="qr-live">
                <i /> {activeQr ? 'ACTIVE' : 'READY'}
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
                <small>{activeQr ? activeQr.label : 'No active QR code'}</small>
              </span>
              <StatusPill>{activeQr ? activeQr.status : 'Not generated'}</StatusPill>
            </div>
            <div className="panel qr-stat">
              <span className="metric-icon gold">
                <Icon name="message" />
              </span>
              <span>
                <b>{scanCount} scans</b>
                <small>Total citizen visits recorded</small>
              </span>
              {activeQr && <em>↗ Live</em>}
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

          {/* Configured Posters List Panel */}
          {qrList.length > 0 && (
            <section className="panel table-panel" style={{ marginTop: '24px' }}>
              <div className="table-toolbar">
                <div>
                  <h2>Configured QR posters ({qrList.length})</h2>
                  <p>Click any poster to preview and print its physical display token.</p>
                </div>
                {canManageQrCodes && (
                  <button className="button secondary small-button" onClick={onGenerate}>
                    <Icon name="plus" size={14} /> Add poster
                  </button>
                )}
              </div>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '220px' }}>CODE & LOCATION</th>
                      <th>OFFICE / BUREAU</th>
                      <th>TARGET URL</th>
                      <th style={{ width: '90px' }}>SCANS</th>
                      <th style={{ width: '100px' }}>STATUS</th>
                      <th style={{ width: '140px', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qrList.map((qr) => {
                      const isSelected = activeQr?.id === qr.id;
                      return (
                        <tr
                          key={qr.id}
                          className={`clickable-row ${isSelected ? 'active-row' : ''}`}
                          onClick={() => setSelectedId(qr.id)}
                          style={{
                            background: isSelected ? 'rgba(0, 72, 90, 0.05)' : undefined,
                          }}
                        >
                          <td>
                            <b style={{ color: '#00485a' }}>{qr.code}</b>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                              {qr.label}
                            </p>
                          </td>
                          <td>
                            <b>{qr.organization?.name || 'Bureau'}</b>
                            <small style={{ display: 'block', color: '#94a3b8' }}>
                              {qr.organization?.code || 'bureau'}
                            </small>
                          </td>
                          <td style={{ fontSize: '12px', color: '#475569', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {qr.target_url}
                          </td>
                          <td>
                            <b>{qr.scan_count ?? 0}</b>
                          </td>
                          <td>
                            <StatusPill>{qr.status}</StatusPill>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="button secondary small-button"
                                title="Preview and Print"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedId(qr.id);
                                  portal.setModal({ kind: 'qr', qr });
                                }}
                              >
                                <Icon name="download" size={13} />
                              </button>
                              {canManageQrCodes && (
                                <button
                                  type="button"
                                  className="button secondary small-button"
                                  title="Delete poster"
                                  style={{ color: '#dc2626' }}
                                  onClick={(e) => handleDelete(e, qr.id, qr.code)}
                                >
                                  <Icon name="close" size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <div className="panel qr-instructions" style={{ marginTop: '24px' }}>
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
        </>
      )}

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
