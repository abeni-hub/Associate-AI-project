import React from 'react';
import { Icon, SearchBox, StatusPill, useLanguage, getLocalizedText } from '../../shared';
import { OfficeHierarchyTree } from './OfficeHierarchyTree';
import { getOfficeParentSummary } from './officeHierarchy';
import type { OfficeItem, OfficeType } from '../../../types/portal.types';

interface OfficeTableProps {
  offices: OfficeItem[];
  officeTypes: OfficeType[];
  scopedOffices: OfficeItem[];
  filtered: OfficeItem[];
  isLoading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  selectedTypeId: string;
  onSelectedTypeIdChange: (val: string) => void;
  selectedView: 'list' | 'tree';
  onSelectedViewChange: (view: 'list' | 'tree') => void;
  canUpdate: boolean;
  canDelete: boolean;
  isSuperAdmin: boolean;
  canAccessOrganization: (id?: number | null) => boolean;
  onOpenEdit: (office: OfficeItem) => void;
  onDeleteOffice: (office: OfficeItem) => void;
}

export const OfficeTable: React.FC<OfficeTableProps> = ({
  offices,
  officeTypes,
  scopedOffices,
  filtered,
  isLoading,
  search,
  onSearchChange,
  selectedTypeId,
  onSelectedTypeIdChange,
  selectedView,
  onSelectedViewChange,
  canUpdate,
  canDelete,
  isSuperAdmin,
  canAccessOrganization,
  onOpenEdit,
  onDeleteOffice,
}) => {
  const { language } = useLanguage();
  return (
    <section className="panel table-panel offices-panel">
      <div className="table-toolbar">
        <div>
          <h2>Registered offices</h2>
          <p>Every office maintains its own room guide, public notices, and citizen feedback queue.</p>
        </div>
        <div className="toolbar-tools">
          <SearchBox value={search} onChange={onSearchChange} placeholder="Search offices, admins, parents..." />
          <select
            className="filter-select"
            value={selectedTypeId}
            onChange={(e) => onSelectedTypeIdChange(e.target.value)}
            aria-label="Filter by office classification"
          >
            <option value="all">All classifications</option>
            {officeTypes.map((type: OfficeType) => (
              <option key={type.id} value={String(type.id)}>
                {getLocalizedText(type.name, language) || (typeof type.name === 'string' ? type.name : '')}
              </option>
            ))}
          </select>
          <div className="segmented-control" role="tablist" aria-label="Directory view mode">
            <button
              type="button"
              role="tab"
              aria-selected={selectedView === 'list'}
              className={`segmented-button ${selectedView === 'list' ? 'active' : ''}`}
              onClick={() => onSelectedViewChange('list')}
            >
              <Icon name="layers" size={14} /> List
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selectedView === 'tree'}
              className={`segmented-button ${selectedView === 'tree' ? 'active' : ''}`}
              onClick={() => onSelectedViewChange('tree')}
            >
              <Icon name="sitemap" size={14} /> Tree
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '12px' }}>
          <div className="loading-spinner" />
          <p style={{ margin: 0, color: '#00485a', fontWeight: 600, fontSize: '14px' }}>Loading administrative hierarchy...</p>
          <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Connecting to public directory</p>
        </div>
      ) : selectedView === 'tree' ? (
        <OfficeHierarchyTree
          offices={scopedOffices}
          officeTypes={officeTypes}
          matchingOfficeIds={new Set(filtered.map((office: OfficeItem) => office.id))}
          onEdit={onOpenEdit}
        />
      ) : (
        <div className="table-scroll" id="office-directory-panel" role="region" aria-labelledby="office-directory-tab" tabIndex={0}>
          <table className="data-table">
            <thead>
              <tr>
                <th>OFFICE / JURISDICTION</th>
                <th>CLASSIFICATION</th>
                <th>CONTACT</th>
                <th>SERVICES</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item: OfficeItem) => {
                const type = officeTypes.find((t: OfficeType) => t.id === item.typeId);
                const parentSummary = getOfficeParentSummary(item, offices, officeTypes);

                return (
                  <tr key={item.id}>
                    <td>
                      <div className="entity-cell">
                        <img
                          className="entity-icon"
                          src={item.logo || '/favicon.svg'}
                          alt={`${getLocalizedText(item.name, language) || (typeof item.name === 'string' ? item.name : '')} logo`}
                          style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
                        />
                        <div>
                          <b>{getLocalizedText(item.name, language) || (typeof item.name === 'string' ? item.name : '')}</b>
                          {item.code && (
                            <small style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>
                              Code: {item.code}
                            </small>
                          )}
                          {parentSummary && (
                            <span className="lineage-badge">↳ Parent: {parentSummary}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`role-tag office-classification-tag ${
                          item.typeId === 1 ? 'is-subcity' : item.typeId === 2 ? 'is-woreda' : 'is-bureau'
                        }`}
                        style={{
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          background: item.typeId === 1 ? '#e0f2fe' : item.typeId === 2 ? '#ecfdf5' : '#fef3c7',
                          color: item.typeId === 1 ? '#0369a1' : item.typeId === 2 ? '#047857' : '#b45309',
                          border: `1px solid ${item.typeId === 1 ? '#bae6fd' : item.typeId === 2 ? '#a7f3d0' : '#fde68a'}`,
                          display: 'inline-block',
                        }}
                      >
                        {getLocalizedText(item.typeName || type?.name, language) || (typeof (item.typeName || type?.name) === 'string' ? (item.typeName || type?.name) : (item.typeId === 1 ? 'Sub-City' : item.typeId === 2 ? 'Woreda' : 'Bureau'))}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: '#334155' }}>
                        {item.email && <div>{item.email}</div>}
                        {item.phone && <div style={{ color: '#64748b', fontSize: '11px' }}>{item.phone}</div>}
                        {!item.email && !item.phone && <span style={{ color: '#94a3b8' }}>—</span>}
                      </div>
                    </td>
                    <td>
                      <b>{item.services}</b> guides
                    </td>
                    <td>
                      <StatusPill>{item.status}</StatusPill>
                    </td>
                    <td style={{ display: 'flex', gap: '6px' }}>
                      {(() => {
                        const canManageThisOffice = isSuperAdmin || canAccessOrganization(Number(item.id));
                        return (
                          <>
                            {canUpdate && canManageThisOffice && (
                              <button
                                type="button"
                                className="button secondary small-button"
                                onClick={() => onOpenEdit(item)}
                              >
                                Edit
                              </button>
                            )}
                            {canDelete && canManageThisOffice && (
                              <button
                                type="button"
                                className="button secondary small-button"
                                style={{ color: '#e53e3e', borderColor: '#feb2b2' }}
                                onClick={() => onDeleteOffice(item)}
                                title="Delete office"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!filtered.length && !isLoading && (
            <div className="empty-state">
              <span className="empty-icon">
                <Icon name="layers" size={22} />
              </span>
              <b>No offices found</b>
              <p>Try selecting another office type or adjusting your search terms.</p>
            </div>
          )}
        </div>
      )}

      <div className="table-footer">
        {selectedView === 'tree' ? (
          <span><b>{filtered.length}</b> matching offices; parent offices remain visible for context</span>
        ) : (
          <span>
            Showing <b>{filtered.length}</b> of <b>{scopedOffices.length}</b> registered offices
          </span>
        )}
        {selectedView === 'list' && (
          <div>
            <button disabled>Previous</button>
            <button>
              Next <Icon name="arrow" size={13} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

