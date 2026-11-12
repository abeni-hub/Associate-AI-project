import React from 'react';
import { PageHeading } from '../shared';
import { useDocuments } from './hooks/useDocuments';
import { DocumentMetrics } from './components/DocumentMetrics';
import { DocumentTable } from './components/DocumentTable';
import { DocumentInspectModal } from './components/DocumentInspectModal';
import { DocumentModal } from './components/DocumentModal';

export const DocumentsPage: React.FC = () => {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    usageFilter,
    setUsageFilter,
    isLoading,
    isSubmitting,
    canManage,
    documents,
    filteredDocuments,
    activeCount,
    linkedDocsCount,
    totalServiceLinks,
    isModalOpen,
    setIsModalOpen,
    selectedDoc,
    setSelectedDoc,
    inspectDoc,
    setInspectDoc,
    handleOpenAdd,
    handleOpenEdit,
    handleSave,
    handleToggleStatus,
    handleDelete,
  } = useDocuments();

  return (
    <>
      <PageHeading
        eyebrow="SERVICE STANDARDS & PREREQUISITES"
        title="Required documents catalog"
        subtitle="Canonical repository of citizen documents and credential templates required by government public services across Addis Ababa."
        action={canManage ? '+ Add document' : undefined}
        onAction={canManage ? handleOpenAdd : undefined}
      />

      <DocumentMetrics
        isLoading={isLoading}
        totalCount={documents.length}
        activeCount={activeCount}
        linkedDocsCount={linkedDocsCount}
        totalServiceLinks={totalServiceLinks}
      />

      <DocumentTable
        documents={documents}
        filteredDocuments={filteredDocuments}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        usageFilter={usageFilter}
        onUsageFilterChange={setUsageFilter}
        canManage={canManage}
        onOpenAdd={handleOpenAdd}
        onOpenEdit={handleOpenEdit}
        onInspect={setInspectDoc}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
      />

      <DocumentInspectModal
        doc={inspectDoc}
        canManage={canManage}
        onClose={() => setInspectDoc(null)}
        onEdit={(doc) => handleOpenEdit(doc)}
      />

      <DocumentModal
        isOpen={isModalOpen}
        document={selectedDoc}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDoc(null);
        }}
        onSave={handleSave}
        isLoading={isSubmitting}
      />
    </>
  );
};

export default DocumentsPage;
