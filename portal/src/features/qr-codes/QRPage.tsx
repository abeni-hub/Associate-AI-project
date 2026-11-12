import React from 'react';
import { PageHeading } from '../shared';
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
        eyebrow="CITIZEN ACCESS"
        title="Feedback QR codes"
        subtitle="Help citizens open the right feedback form from a physical poster or service desk."
        action={canManageQrCodes ? 'Generate QR code' : undefined}
        onAction={handleGenerate}
        secondary="Export list"
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

