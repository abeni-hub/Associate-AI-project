import React from 'react';
import { Icon, StatusPill } from '../../shared';
import type { DocumentItem } from '../api/documentsApi';

interface DocumentTableProps {
  documents: DocumentItem[];
  filteredDocuments: DocumentItem[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'all' | 'active' | 'inactive';
  onStatusFilterChange: (value: 'all' | 'active' | 'inactive') => void;
  usageFilter: 'all' | 'linked' | 'unlinked';
  onUsageFilterChange: (value: 'all' | 'linked' | 'unlinked') => void;
  canManage: boolean;
  onOpenAdd: () => void;
  onOpenEdit: (doc: DocumentItem) => void;
  onInspect: (doc: DocumentItem) => void;
  onToggleStatus: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  filteredDocuments,
  isLoading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  usageFilter,
  onUsageFilterChange,
  canManage,
  onOpenAdd,
  onOpenEdit,
  onInspect,
  onToggleStatus,
  onDelete,
}) => {
  return (
    <div className="panel activity-table-panel">
      <div className="table-toolbar">
        <div>
          <h2>Document specifications</h2>
          <p>
            Showing {isLoading ? '...' : filteredDocuments.length} document standards defined for public service delivery.
          </p>
        </div>

        <div className="toolbar-tools">
          <div className="search-box">
            <Icon name="search" size={15} />
            <input
              type="search"
              placeholder="Search document name, code slug, or criteria..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
              >
                <Icon name="close" size={13} />
              </button>
            )}
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as any)}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>

          <select
            className="filter-select"
            value={usageFilter}
            onChange={(e) => onUsageFilterChange(e.target.value as any)}
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
            {isLoading ? (
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
                        onClick={onOpenAdd}
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
                  <tr key={doc.id} className="clickable-row" onClick={() => onInspect(doc)}>
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
                      <StatusPill status={doc.is_active ? 'Active' : 'Draft'}>
                        {doc.is_active ? 'Active' : 'Draft'}
                      </StatusPill>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          className="button secondary small-button"
                          onClick={() => onInspect(doc)}
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
                              onClick={() => onOpenEdit(doc)}
                              title="Edit document standard"
                              style={{ padding: '4px 7px' }}
                            >
                              <Icon name="edit" size={13} />
                            </button>
                            <button
                              type="button"
                              className="button secondary small-button"
                              onClick={() => onToggleStatus(doc)}
                              title={doc.is_active ? 'Deactivate document' : 'Activate document'}
                              style={{ padding: '4px 7px' }}
                            >
                              <Icon name={doc.is_active ? 'close' : 'check'} size={13} />
                            </button>
                            <button
                              type="button"
                              className="button secondary small-button"
                              onClick={() => onDelete(doc)}
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
  );
};

