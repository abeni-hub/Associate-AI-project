import React, { useState } from 'react';
import {
  Printer,
  Building2,
  Link2,
  Trash2,
  BarChart2,
  Copy,
  Check,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { StatusPill } from '../../shared';
import { QRPattern } from '../../shared/components/QRPattern';
import { QREmptyState } from './QREmptyState';
import type { QRTableProps, QrCodeItem } from '../types/qrCodes.types';
import styles from '../styles/qrCodes.module.css';

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return 'Never scanned';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Never scanned';
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDisplayPath(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    const path = `${url.pathname}${url.hash || ''}${url.search || ''}`;
    return path || urlStr;
  } catch {
    return urlStr;
  }
}

export const QRTable: React.FC<QRTableProps> = ({
  items,
  selectedId,
  canManage,
  onSelect,
  onPreview,
  onDelete,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  if (items.length === 0) {
    return <QREmptyState hasPosters={false} />;
  }

  const handleCopyUrl = async (e: React.MouseEvent, qr: QrCodeItem) => {
    e.stopPropagation();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(qr.target_url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = qr.target_url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedId(qr.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.warn('Copy URL error:', err);
    }
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thPoster}>QR Poster & Token</th>
            <th className={styles.thOffice}>Office / Jurisdiction</th>
            <th className={styles.thUrl}>Destination Target URL</th>
            <th className={styles.thScans}>Scans & Activity</th>
            <th className={styles.thStatus}>Status</th>
            <th className={styles.thActions}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((qr) => {
            const isSelected = selectedId === qr.id;
            const isCopied = copiedId === qr.id;
            const displayPath = getDisplayPath(qr.target_url);

            return (
              <tr
                key={qr.id}
                className={`${styles.row} ${isSelected ? styles.activeRow : ''}`.trim()}
                onClick={() => onSelect(qr)}
              >
                {/* 1. QR Poster & Token */}
                <td>
                  <div className={styles.posterCell}>
                    <div
                      className={styles.qrThumbnailWrapper}
                      title="Click row to inspect or print full size"
                    >
                      <QRPattern data={qr.target_url} color="#003946" />
                      <div className={styles.thumbnailScrim} />
                    </div>

                    <div className={styles.posterInfo}>
                      <span className={styles.posterLabel}>{qr.label}</span>
                      <div className={styles.metaRow}>
                        <span className={styles.codeBadge}>#{qr.code}</span>
                        {qr.created_at && (
                          <span className={styles.dateSubtext}>
                            {new Date(qr.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* 2. Office & Jurisdiction */}
                <td>
                  <div className={styles.officeCell}>
                    <div className={styles.officeIconWrap}>
                      <Building2 size={16} strokeWidth={2} />
                    </div>
                    <div className={styles.officeInfo}>
                      <span className={styles.officeName}>
                        {qr.organization?.name || 'Public Bureau'}
                      </span>
                      <span className={styles.officeCode}>
                        {qr.organization?.code || 'municipal-branch'}
                      </span>
                    </div>
                  </div>
                </td>

                {/* 3. Destination Target URL */}
                <td>
                  <div className={styles.urlCell}>
                    <div className={styles.urlCard} title={qr.target_url}>
                      <Link2 size={13} className={styles.urlIcon} />
                      <span className={styles.targetUrl}>{displayPath}</span>
                    </div>

                    <div className={styles.urlActions}>
                      <button
                        type="button"
                        className={`${styles.urlActionButton} ${isCopied ? styles.urlCopied : ''}`}
                        title={isCopied ? 'Copied to clipboard' : 'Copy target URL'}
                        onClick={(e) => handleCopyUrl(e, qr)}
                        aria-label="Copy destination URL"
                      >
                        {isCopied ? (
                          <>
                            <Check size={12} strokeWidth={2.5} />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} strokeWidth={2} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <a
                        href={qr.target_url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.urlExternalLink}
                        title="Open destination form in new tab"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Open destination URL"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </td>

                {/* 4. Scans & Activity */}
                <td>
                  <div className={styles.scansCell}>
                    <div className={styles.scanCountWrap}>
                      <BarChart2 size={14} className={styles.scansIcon} />
                      <span className={styles.scanCount}>
                        {(qr.scan_count ?? 0).toLocaleString()}
                      </span>
                      <span className={styles.scanUnit}>scans</span>
                    </div>
                    <div className={styles.lastScanRow}>
                      <Clock size={11} className={styles.clockIcon} />
                      <span className={styles.lastScanText}>
                        {formatRelativeTime(qr.last_scanned_at)}
                      </span>
                    </div>
                  </div>
                </td>

                {/* 5. Status */}
                <td>
                  <div className={styles.statusCell}>
                    <StatusPill status={qr.status}>
                      {qr.status === 'active' ? 'Active' : 'Inactive'}
                    </StatusPill>
                  </div>
                </td>

                {/* 6. Actions */}
                <td className={styles.actionsCell}>
                  <div className={styles.actionButtonGroup}>
                    <button
                      type="button"
                      className={styles.posterButton}
                      title="Preview and Print Poster"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreview(qr);
                      }}
                    >
                      <Printer size={13} strokeWidth={2.2} />
                      <span>Print Poster</span>
                    </button>

                    {canManage && (
                      <button
                        type="button"
                        className={styles.deleteButton}
                        title="Delete poster token"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(qr.id, qr.code);
                        }}
                      >
                        <Trash2 size={14} strokeWidth={1.8} />
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
  );
};

export default QRTable;
