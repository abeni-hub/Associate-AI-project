import React, { useMemo, useState } from 'react';
import { PageHeading } from '../components/shared/PageHeading';
import { MetricCard } from '../components/shared/MetricCard';
import { StatusPill } from '../components/shared/StatusPill';
import { Icon } from '../components/shared/Icon';
import { DocumentModal } from '../components/documents/DocumentModal';
import { usePermissions } from '../hooks/usePermissions';
import {
  useGetDocumentsQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  type DocumentItem,
} from '../services/documentsApi';

export const DocumentsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [usageFilter, setUsageFilter] = useState<'all' | 'linked' | 'unlinked'>('all');

  const { data: response, isLoading, refetch } = useGetDocumentsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [createDoc, { isLoading: isCreating }] = useCreateDocumentMutation();
  const [updateDoc, { isLoading: isUpdating }] = useUpdateDocumentMutation();
  const [deleteDoc, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  const { hasPermission } = usePermissions();
  const canManage = hasPermission('documents.manage');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [inspectDoc, setInspectDoc] = useState<DocumentItem | null>(null);

  const documents: DocumentItem[] = useMemo(() => {
    return response?.data || [];
  }, [response]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        q === '' ||
        doc.name.toLowerCase().includes(q) ||
        doc.code.toLowerCase().includes(q) ||
        (doc.description && doc.description.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? doc.is_active : !doc.is_active);

      const count = doc.services_count ?? 0;
      const matchUsage =
        usageFilter === 'all' ||
        (usageFilter === 'linked' ? count > 0 : count === 0);

      return matchSearch && matchStatus && matchUsage;
    });
  }, [documents, search, statusFilter, usageFilter]);

  const activeCount = documents.filter((d) => d.is_active).length;
  const linkedDocsCount = documents.filter((d) => (d.services_count ?? 0) > 0).length;
  const totalServiceLinks = documents.reduce((sum, d) => sum + (d.services_count ?? 0), 0);

  const handleOpenAdd = () => {
    setSelectedDoc(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setIsModalOpen(true);
  };

  const handleSave = async (payload: {
    id?: number;
    name: string;
    code: string;
    description?: string;
    sample_file_url?: string;
    is_active: boolean;
  }) => {
    if (payload.id) {
      await updateDoc(payload as any).unwrap();
    } else {
      await createDoc(payload).unwrap();
    }
    await refetch();
    setIsModalOpen(false);
    setSelectedDoc(null);
  };

  const handleToggleStatus = async (doc: DocumentItem) => {
    try {
      await updateDoc({
        id: doc.id,
        is_active: !doc.is_active,
      }).unwrap();
      await refetch();
    } catch (err: any) {
      window.alert(err?.data?.message || 'Failed to update document status.');
    }
  };

  const handleDelete = async (doc: DocumentItem) => {
    const servicesNote = (doc.services_count ?? 0) > 0
      ? ` Warning: This document is currently linked to ${doc.services_count} active service(s).`
      : '';

    if (
      window.confirm(
        `Are you sure you want to remove "${doc.name}" (${doc.code}) from the document catalog?${servicesNote}`
      )
    ) {
      try {
        await deleteDoc(doc.id).unwrap();
        await refetch();
        if (inspectDoc?.id === doc.id) {
          setInspectDoc(null);
        }
      } catch (err: any) {
        window.alert(err?.data?.message || 'Failed to delete document.');
      }
    }
  };

  return (
    <>
      <PageHeading
        eyebrow="SERVICE STANDARDS & PREREQUISITES"
        title="Required documents catalog"
        subtitle="Canonical repository of citizen documents and credential templates required by government public services across Addis Ababa."
        action={canManage ? '+ Add document' : undefined}
        onAction={canManage ? handleOpenAdd : undefined}
      />

      {/* Metrics Row */}
      <section className="metric-grid" aria-label="Documents statistics">
        <MetricCard
          icon="file"
          label="Catalogued documents"
          value={isLoading && !response ? '...' : documents.length}
          note="Standard citizen requirements"
          tone="teal"
        />
        <MetricCard
          icon="check"
          label="Active requirements"
          value={isLoading && !response ? '...' : activeCount}
          note="Ready for service checklists"
          tone="gold"
        />
        <MetricCard
          icon="layers"
          label="Attached to services"
          value={isLoading && !response ? '...' : `${linkedDocsCount} docs`}
          note={`${totalServiceLinks} total service associations`}
          tone="sage"
        />
        <MetricCard
          icon="shield"
          label="Standard compliance"
          value="100%"
          note="City-wide verification standard"
          tone="blue"
        />
      </section>

      {/* Main Table Panel */}
      <div className="panel activity-table-panel">
        <div className="table-toolbar">
          <div>
            <h2>Document specifications</h2>
            <p>
              Showing {isLoading && !response ? '...' : filteredDocuments.length} document standards defined for public service delivery.
            </p>
          </div>

          <div className="toolbar-tools">
            <div className="search-box">
              <Icon name="search" size={15} />
              <input
                type="search"
                placeholder="Search document name, code slug, or criteria..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <Icon name="close" size={13} />
                </button>
              )}
            </div>

            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>

            <select
              className="filter-select"
              value={usageFilter}
              onChange={(e) => setUsageFilter(e.target.value as any)}
              aria-label="Filter by service linkage"
            >
              <option value="all">All linkage states</option>
              <option value="linked">Used in services</option>
              <option value="unlinked">Unused / Catalog draft</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 280 }}>DOCUMENT STANDARD & CODE</th>
                <th>DESCRIPTION & ACCEPTABLE CRITERIA</th>
                <th style={{ width: 170 }}>SAMPLE TEMPLATE</th>
                <th style={{ width: 150 }}>LINKED SERVICES</th>
                <th style={{ width: 110 }}>STATUS</th>
                <th style={{ width: 130, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !response ? (
                <tr>
                  <td colSpan={6}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '12px' }}>
                      <div className="loading-spinner" />
                      <p style={{ margin: 0, color: '#00485a', fontWeight: 600, fontSize: '14px' }}>Loading document catalog...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <Icon name="file" size={32} />
                      <b>No documents found</b>
                      <p>
                        {search || statusFilter !== 'all' || usageFilter !== 'all'
                          ? 'Try adjusting your search query or reset your filters.'
                          : 'Get started by creating the first required document standard.'}
                      </p>
                      {canManage && (
                        <button
                          type="button"
                          className="button primary small-button"
                          onClick={handleOpenAdd}
                          style={{ marginTop: '8px' }}
                        >
                          + Create first document
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => {
                  const servicesCount = doc.services_count ?? 0;
                  return (
                    <tr key={doc.id} className="clickable-row" onClick={() => setInspectDoc(doc)}>
                      {/* Name & Code */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <b style={{ color: '#264b4c', fontSize: '13.5px' }}>{doc.name}</b>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                background: '#edf3ef',
                                color: '#385e54',
                                fontFamily: 'ui-monospace, monospace',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              {doc.code}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td style={{ maxWidth: '380px', whiteSpace: 'normal' }}>
                        <p style={{ margin: 0, color: '#5b7167', fontSize: '12.5px', lineHeight: 1.45 }}>
                          {doc.description || <span style={{ color: '#9bb0a4', fontStyle: 'italic' }}>No criteria description specified.</span>}
                        </p>
                      </td>

                      {/* Sample File */}
                      <td>
                        {doc.sample_file_url ? (
                          <a
                            href={doc.sample_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              background: '#f2f8f5',
                              border: '1px solid #d4e5dc',
                              color: '#1d6355',
                              fontSize: '12px',
                              fontWeight: 600,
                              textDecoration: 'none',
                            }}
                          >
                            <Icon name="download" size={13} /> Sample file
                          </a>
                        ) : (
                          <span style={{ color: '#97a89f', fontSize: '12px' }}>—</span>
                        )}
                      </td>

                      {/* Linked Services */}
                      <td>
                        {servicesCount > 0 ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: '#eaf4f2',
                              color: '#15606a',
                              border: '1px solid rgba(21,96,106,.2)',
                              fontSize: '11.5px',
                              fontWeight: 700,
                            }}
                          >
                            <Icon name="layers" size={12} /> {servicesCount} {servicesCount === 1 ? 'service' : 'services'}
                          </span>
                        ) : (
                          <span style={{ color: '#95a59d', fontSize: '12px' }}>Not linked</span>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <StatusPill status={doc.is_active ? 'Active' : 'Draft'} />
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            className="button secondary small-button"
                            onClick={() => setInspectDoc(doc)}
                            title="Inspect details"
                            style={{ padding: '4px 7px' }}
                          >
                            <Icon name="eye" size={13} />
                          </button>
                          {canManage && (
                            <>
                              <button
                                type="button"
                                className="button secondary small-button"
                                onClick={() => handleOpenEdit(doc)}
                                title="Edit document standard"
                                style={{ padding: '4px 7px' }}
                              >
                                <Icon name="edit" size={13} />
                              </button>
                              <button
                                type="button"
                                className="button secondary small-button"
                                onClick={() => handleToggleStatus(doc)}
                                title={doc.is_active ? 'Deactivate document' : 'Activate document'}
                                style={{ padding: '4px 7px' }}
                              >
                                <Icon name={doc.is_active ? 'close' : 'check'} size={13} />
                              </button>
                              <button
                                type="button"
                                className="button secondary small-button"
                                onClick={() => handleDelete(doc)}
                                title="Delete document"
                                style={{ padding: '4px 7px', color: '#a13420' }}
                              >
                                <Icon name="trash" size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="table-footer">
          <span>
            Showing <b>{filteredDocuments.length}</b> of <b>{documents.length}</b> catalogued document specifications
          </span>
          <div className="table-pagination">
            <button type="button" className="button secondary small-button" disabled>
              Previous
            </button>
            <button type="button" className="button secondary small-button" disabled>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Quick Inspector Modal / Drawer */}
      {inspectDoc && (
        <div className="modal-overlay" onClick={() => setInspectDoc(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: '580px', width: '92%', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <div>
                <span className="panel-eyebrow">DOCUMENT SPECIFICATION</span>
                <h2>{inspectDoc.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <code style={{ background: '#edf3ef', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', color: '#315a51', fontWeight: 700 }}>
                    {inspectDoc.code}
                  </code>
                  <StatusPill status={inspectDoc.is_active ? 'Active' : 'Draft'} />
                </div>
              </div>
              <button type="button" className="modal-close" onClick={() => setInspectDoc(null)} aria-label="Close">
                <Icon name="close" />
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ margin: '0 0 6px', color: '#274f4b', fontSize: '13px', fontWeight: 700 }}>
                  Prerequisite Description & Citizen Guidelines
                </h4>
                <p style={{ margin: 0, color: '#566e64', fontSize: '13px', lineHeight: 1.5, background: '#f8faf7', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e5ede7' }}>
                  {inspectDoc.description || 'No detailed citizen guidelines have been recorded for this prerequisite.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', borderRadius: '6px', background: '#f8faf7', border: '1px solid #e5ede7' }}>
                  <small style={{ color: '#82938a', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                    Required in Public Services
                  </small>
                  <b style={{ color: '#165760', fontSize: '17px', display: 'block', marginTop: '4px' }}>
                    {inspectDoc.services_count ?? 0} {inspectDoc.services_count === 1 ? 'service' : 'services'}
                  </b>
                  <span style={{ color: '#688075', fontSize: '11.5px' }}>Attached as mandatory/optional checklist</span>
                </div>

                <div style={{ padding: '12px', borderRadius: '6px', background: '#f8faf7', border: '1px solid #e5ede7' }}>
                  <small style={{ color: '#82938a', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                    Sample Download Form
                  </small>
                  {inspectDoc.sample_file_url ? (
                    <a
                      href={inspectDoc.sample_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#00485a', fontWeight: 700, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}
                    >
                      <Icon name="download" size={13} /> Download template
                    </a>
                  ) : (
                    <span style={{ color: '#97a89f', fontSize: '13px', display: 'block', marginTop: '4px' }}>
                      No sample template provided
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '14px 24px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#819389' }}>
                ID #{inspectDoc.id} · Created: {inspectDoc.created_at ? new Date(inspectDoc.created_at).toLocaleDateString() : 'Active'}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {canManage && (
                  <button
                    type="button"
                    className="button primary"
                    onClick={() => {
                      const doc = inspectDoc;
                      setInspectDoc(null);
                      handleOpenEdit(doc);
                    }}
                  >
                    <Icon name="edit" size={13} /> Edit document
                  </button>
                )}
                <button type="button" className="button secondary" onClick={() => setInspectDoc(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Document Modal */}
      <DocumentModal
        isOpen={isModalOpen}
        document={selectedDoc}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDoc(null);
        }}
        onSave={handleSave}
        isLoading={isCreating || isUpdating}
      />
    </>
  );
};

export default DocumentsPage;

