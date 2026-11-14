import React from 'react';
import {
  QrCode,
  Printer,
  Building2,
  Link2,
  Trash2,
  BarChart2,
} from 'lucide-react';
import { StatusPill } from '../../shared';
import { QREmptyState } from './QREmptyState';
import type { QRTableProps } from '../types/qrCodes.types';
import styles from '../styles/qrCodes.module.css';

export const QRTable: React.FC<QRTableProps> = ({
  items,
  selectedId,
  canManage,
  onSelect,
  onPreview,
  onDelete,
}) => {
  if (items.length === 0) {
    return <QREmptyState hasPosters={false} />;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: '280px' }}>QR Poster & Label</th>
            <th style={{ width: '230px' }}>Office / Bureau</th>
            <th>Destination Target URL</th>
            <th style={{ width: '110px' }}>Scans</th>
            <th style={{ width: '110px' }}>Status</th>
            <th style={{ width: '130px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((qr) => {
            const isSelected = selectedId === qr.id;
            return (
              <tr
                key={qr.id}
                className={`${styles.row} ${isSelected ? styles.activeRow : ''}`.trim()}
                onClick={() => onSelect(qr)}
              >
                {/* QR Poster & Label */}
                <td>
                  <div className={styles.posterCell}>
                    <div className={styles.posterIconWrapper}>
                      <QrCode size={19} strokeWidth={2} />
                    </div>
                    <div className={styles.posterInfo}>
                      <span className={styles.posterLabel}>{qr.label}</span>
                      <span className={styles.codeBadge}>#{qr.code}</span>
                    </div>
                  </div>
                </td>

                {/* Office & Bureau */}
                <td>
                  <div className={styles.officeCell}>
                    <Building2 size={15} className="text-slate-400 shrink-0" />
                    <div className={styles.officeInfo}>
                      <span className={styles.officeName}>
                        {qr.organization?.name || 'Public Bureau'}
                      </span>
                      <span className={styles.officeCode}>
                        {qr.organization?.code || 'public-office'}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Destination Target URL */}
                <td>
                  <div className={styles.urlCell} title={qr.target_url}>
                    <Link2 size={13} className="text-teal-600/70 shrink-0" />
                    <span className={styles.targetUrl}>{qr.target_url}</span>
                  </div>
                </td>

                {/* Scans */}
                <td>
                  <div className={styles.scansCell}>
                    <BarChart2 size={14} className="text-slate-400 shrink-0" />
                    <span className={styles.scanCount}>
                      {(qr.scan_count ?? 0).toLocaleString()}
                    </span>
                    <span className={styles.scanUnit}>scans</span>
                  </div>
                </td>

                {/* Status */}
                <td>
                  <StatusPill status={qr.status}>
                    {qr.status === 'active' ? 'Active' : 'Inactive'}
                  </StatusPill>
                </td>

                {/* Actions */}
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
                      <span>Poster</span>
                    </button>
                    {canManage && (
                      <button
                        type="button"
                        className={styles.deleteButton}
                        title="Delete poster"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(qr.id, qr.code);
                        }}
                      >
                        <Trash2 size={14} />
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
