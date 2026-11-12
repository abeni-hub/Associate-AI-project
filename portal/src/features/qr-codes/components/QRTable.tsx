import React from 'react';
import { Icon } from '../../shared';
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
            <th style={{ width: '220px' }}>Code & Label</th>
            <th>Office / Bureau</th>
            <th>Destination Target URL</th>
            <th style={{ width: '90px' }}>Scans</th>
            <th style={{ width: '100px' }}>Status</th>
            <th style={{ width: '140px', textAlign: 'right' }}>Actions</th>
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
                <td>
                  <span className={styles.codeText}>{qr.code}</span>
                  <p className={styles.labelText}>{qr.label}</p>
                </td>
                <td>
                  <span className={styles.officeName}>
                    {qr.organization?.name || 'Public Bureau'}
                  </span>
                  <span className={styles.officeCode}>
                    {qr.organization?.code || 'bureau'}
                  </span>
                </td>
                <td className={styles.targetUrl} title={qr.target_url}>
                  {qr.target_url}
                </td>
                <td>
                  <strong>{qr.scan_count ?? 0}</strong>
                </td>
                <td>
                  <StatusPill status={qr.status}>
                    {qr.status === 'active' ? 'Active' : 'Inactive'}
                  </StatusPill>
                </td>
                <td className={styles.actionsCell}>
                  <div className={styles.actionButtonGroup}>
                    <button
                      type="button"
                      className={styles.actionButton}
                      title="Preview and Print"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreview(qr);
                      }}
                    >
                      <Icon name="download" size={13} />
                    </button>
                    {canManage && (
                      <button
                        type="button"
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        title="Delete poster"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(qr.id, qr.code);
                        }}
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
  );
};

export default QRTable;

