import React from 'react';
import { QrCode } from 'lucide-react';
import type { QREmptyStateProps } from '../types/qrCodes.types';
import styles from '../styles/qrCodes.module.css';

export const QREmptyState: React.FC<QREmptyStateProps> = ({ hasPosters }) => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIconWrapper}>
        <QrCode size={26} strokeWidth={1.8} />
      </div>
      <h3 className={styles.emptyTitle}>No QR posters found</h3>
      <p className={styles.emptyText}>
        {!hasPosters
          ? 'No posters have been generated yet. Click "Generate QR code" above to create one.'
          : 'No posters match your current search or filters.'}
      </p>
    </div>
  );
};

export default QREmptyState;
