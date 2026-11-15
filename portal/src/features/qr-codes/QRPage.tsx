import React from 'react';
import { PageHeading, useLanguage } from '../shared';
import {
  useQrCodes,
  QRMetricsGrid,
  QRToolbar,
  QRTable,
} from './index';
import type { QRPageProps } from './types/qrCodes.types';
import styles from './styles/qrCodes.module.css';

export const QRPage: React.FC<QRPageProps> = ({
  onGenerate: propOnGenerate,
  onCopy: propOnCopy,
}) => {
  const { t } = useLanguage();
  const {
    items,
    organizations,
    metrics,
    isLoading,
    selectedId,
    searchQuery,
    officeFilter,
    statusFilter,
    canManageQrCodes,
    handleGenerate,
    handleDelete,
    handleSelect,
    handlePreview,
    handleSearchChange,
    handleOfficeFilterChange,
    handleStatusFilterChange,
  } = useQrCodes(propOnGenerate, propOnCopy);

  return (
    <>
      <PageHeading
        eyebrow={t('qr.eyebrow', 'PHYSICAL DESK CITIZEN ENGAGEMENT')}
        title={t('qr.title', 'Feedback QR Codes')}
        subtitle={t('qr.subtitle', 'Deploy physical QR touchpoints across municipal counters, halls, and public waiting rooms.')}
        action={canManageQrCodes ? t('qr.generateQr', 'Generate QR code') : undefined}
        onAction={handleGenerate}
        secondary={t('common.export', 'Export list')}
        onSecondary={() => window.alert('QR poster access directory exported.')}
      />

      <QRMetricsGrid metrics={metrics} isLoading={isLoading} />

      <section className={styles.panel}>
        <QRToolbar
          search={searchQuery}
          officeFilter={officeFilter}
          statusFilter={statusFilter}
          organizations={organizations}
          onSearchChange={handleSearchChange}
          onOfficeFilterChange={handleOfficeFilterChange}
          onStatusFilterChange={handleStatusFilterChange}
          canManage={canManageQrCodes}
          onAddPoster={handleGenerate}
        />

        <QRTable
          items={items}
          selectedId={selectedId}
          canManage={canManageQrCodes}
          onSelect={handleSelect}
          onPreview={handlePreview}
          onDelete={handleDelete}
        />
      </section>
    </>
  );
};

export default QRPage;

