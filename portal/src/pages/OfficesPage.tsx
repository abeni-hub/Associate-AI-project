import React, { useMemo, useState } from 'react';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import { SearchBox } from '../components/shared/SearchBox';
import { StatusPill } from '../components/shared/StatusPill';
import { MetricCard } from '../components/shared/MetricCard';
import { getOfficeParentSummary, getOfficeSubcityId } from '../components/offices/officeHierarchy';
import { OfficeHierarchyTree } from '../components/offices/OfficeHierarchyTree';
import { OfficeModal } from '../components/offices/OfficeModal';
import { usePortal } from '../context';
import type { OfficeItem, OfficeType } from '../types/portal.types';
import {
  useGetOrganizationsQuery,
  useGetOrganizationTypesQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
} from '../services/organizationsApi';

export interface OfficesPageProps {
  offices?: OfficeItem[];
  officeTypes?: OfficeType[];
  role?: string;
  onAddOffice?: () => void;
  onEditOffice?: (office: OfficeItem) => void;
  search?: string;
  setSearch?: (search: string) => void;
}

export const OfficesPage: React.FC<OfficesPageProps> = ({
  offices: propOffices,
  officeTypes: propOfficeTypes,
  role: propRole,
  onAddOffice,
  onEditOffice,
  search: propSearch,
  setSearch: propSetSearch,
}) => {
  const portal = usePortal();
  const [internalSearch, setInternalSearch] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('all');
  const [selectedView, setSelectedView] = useState<'list' | 'tree'>('list');
  const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
  const [selectedOfficeForEdit, setSelectedOfficeForEdit] = useState<OfficeItem | null>(null);

  const { data: apiOrgs, isLoading: orgsLoading } = useGetOrganizationsQuery();
  const { data: apiOrgTypes } = useGetOrganizationTypesQuery();
  const [createOrgTrigger] = useCreateOrganizationMutation();
  const [updateOrgTrigger] = useUpdateOrganizationMutation();
  const [deleteOrgTrigger] = useDeleteOrganizationMutation();

  const officeTypes: OfficeType[] = useMemo(() => {
    if (propOfficeTypes && propOfficeTypes.length > 0) return propOfficeTypes;
    if (apiOrgTypes?.data) {
      return apiOrgTypes.data.map((t) => ({
        id: t.id,
        name: t.name,
        level: t.level,
        description: t.description || '',
      }));
    }
    return [];
  }, [propOfficeTypes, apiOrgTypes]);

  const offices: OfficeItem[] = useMemo(() => {
    if (propOffices && propOffices.length > 0) return propOffices;
    if (apiOrgs?.data) {
      return apiOrgs.data.map((o) => ({
        id: o.id,
        name: o.name,
        code: o.code,
        typeId: o.organization_type_id,
        parentId: o.parent_organization_id ?? null,
        admin: o.email || o.phone || 'Administrative Desk',
        email: o.email || '',
        phone: o.phone || '',
        address: o.address || '',
        status: o.status === 'active' ? 'Active' : 'Inactive',
        services: o.services_count ?? 0,
        completion: 100,
        updated: 'Recently',
      }));
    }
    return [];
  }, [propOffices, apiOrgs]);

  const role = propRole || portal.role || 'super';
  const search = propSearch !== undefined ? propSearch : (portal.search !== undefined ? portal.search : internalSearch);
  const setSearch = propSetSearch || portal.setSearch || setInternalSearch;

  // Scope filter: if subcity admin, show only their sub-city and child offices
  const scopedOffices =
    role === 'subcity'
      ? offices.filter((office: OfficeItem) => getOfficeSubcityId(office, offices) === 1)
      : offices;

  const filtered = scopedOffices.filter((item: OfficeItem) => {
    const type = officeTypes.find((t: OfficeType) => t.id === item.typeId);
    const parentSummary = getOfficeParentSummary(item, offices, officeTypes);
    const matchesType = selectedTypeId === 'all' || item.typeId === Number(selectedTypeId);
    const query = `${item.name} ${item.code || ''} ${item.email || ''} ${item.phone || ''} ${item.status} ${type?.name || ''} ${parentSummary}`.toLowerCase();
    return matchesType && query.includes(search.toLowerCase());
  });

  const subcityCount = scopedOffices.filter((o: OfficeItem) => o.typeId === 1).length;
  const woredaCount = scopedOffices.filter((o: OfficeItem) => o.typeId === 2).length;
  const bureauCount = scopedOffices.filter((o: OfficeItem) => o.typeId === 3).length;

  const handleOpenAdd = () => {
    if (onAddOffice) {
      onAddOffice();
    } else {
      setSelectedOfficeForEdit(null);
      setIsOfficeModalOpen(true);
    }
  };

  const handleOpenEdit = (office: OfficeItem) => {
    if (onEditOffice) {
      onEditOffice(office);
    } else {
      setSelectedOfficeForEdit(office);
      setIsOfficeModalOpen(true);
    }
  };

  const handleSaveOffice = async (payload: any) => {
    try {
      if (payload.id) {
        await updateOrgTrigger(payload).unwrap();
      } else {
        await createOrgTrigger(payload).unwrap();
      }
    } catch (err: any) {
      window.alert(err?.data?.message || 'Failed to save office.');
    }
  };

  const handleDeleteOffice = async (office: OfficeItem) => {
    if (window.confirm(`Are you sure you want to delete office "${office.name}"?`)) {
      try {
        await deleteOrgTrigger(office.id).unwrap();
      } catch (err: any) {
        window.alert(err?.data?.message || 'Failed to delete office.');
      }
    }
  };

  return (
    <>
      <PageHeading
        eyebrow="PUBLIC ADMINISTRATION DIRECTORY"
        title={role === 'subcity' ? 'Bureaus & local offices' : 'Offices & administrative tree'}
        subtitle="Manage sub-cities, bureaus, and municipal branches connected to the platform."
        action="Add office"
        onAction={handleOpenAdd}
        secondary="Export directory"
        onSecondary={() => window.alert('Office directory report generated.')}
      />

      <div className="metric-grid compact-metrics">
        <MetricCard
          icon="sitemap"
          label="Total offices"
          value={scopedOffices.length}
          note="All administrative levels"
          tone="teal"
        />
        <MetricCard
          icon="map"
          label="Sub-cities"
          value={subcityCount}
          note="Level 1 chartered anchors"
          tone="sage"
        />
        <MetricCard
          icon="layers"
          label="Woredas"
          value={woredaCount}
          note="Level 2 local districts"
          tone="blue"
        />
        <MetricCard
          icon="building"
          label="Sector bureaus"
          value={bureauCount}
          note="Level 3 public service offices"
          tone="gold"
        />
      </div>

      <section className="panel table-panel offices-panel">
        <div className="table-toolbar">
          <div>
            <h2>Registered offices</h2>
            <p>Every office maintains its own room guide, public notices, and citizen feedback queue.</p>
          </div>
          <div className="toolbar-tools">
            <SearchBox value={search} onChange={setSearch} placeholder="Search offices, admins, parents..." />
            <select
              className="filter-select"
              value={selectedTypeId}
              onChange={(e) => setSelectedTypeId(e.target.value)}
              aria-label="Filter by office classification"
            >
              <option value="all">All classifications</option>
              {officeTypes.map((type: OfficeType) => (
                <option key={type.id} value={String(type.id)}>
                  {type.name}
                </option>
              ))}
            </select>
            <div className="segmented-control" role="tablist" aria-label="Directory view mode">
              <button
                type="button"
                role="tab"
                aria-selected={selectedView === 'list'}
                className={`segmented-button ${selectedView === 'list' ? 'active' : ''}`}
                onClick={() => setSelectedView('list')}
              >
                <Icon name="layers" size={14} /> List
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedView === 'tree'}
                className={`segmented-button ${selectedView === 'tree' ? 'active' : ''}`}
                onClick={() => setSelectedView('tree')}
              >
                <Icon name="sitemap" size={14} /> Tree
              </button>
            </div>
          </div>
        </div>

        {orgsLoading && (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <p>Loading administrative hierarchy...</p>
          </div>
        )}

        {selectedView === 'tree' ? (
          <OfficeHierarchyTree
            offices={scopedOffices}
            officeTypes={officeTypes}
            matchingOfficeIds={new Set(filtered.map((office: OfficeItem) => office.id))}
            onEdit={handleOpenEdit}
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
                          <span className="entity-icon">
                            <Icon
                              name={item.typeId === 1 ? 'map' : item.typeId === 2 ? 'layers' : 'building'}
                              size={17}
                            />
                          </span>
                          <div>
                            <b>{item.name}</b>
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
                        <span className="role-tag office-classification-tag">
                          {type?.name || (item.typeId === 1 ? 'Sub-City' : item.typeId === 2 ? 'Woreda' : 'Bureau')}
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
                        <button
                          type="button"
                          className="button secondary small-button"
                          onClick={() => handleOpenEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="button secondary small-button"
                          style={{ color: '#e53e3e', borderColor: '#feb2b2' }}
                          onClick={() => handleDeleteOffice(item)}
                          title="Delete office"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!filtered.length && !orgsLoading && (
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

      <div className="tip-banner">
        <span className="tip-icon">
          <Icon name="shield" size={17} />
        </span>
        <span>
          <b>Hierarchical authorization applies automatically</b>
          <small>
            Admins assigned to a parent office can oversee and coordinate the service guides of all
            child bureaus.
          </small>
        </span>
      </div>

      <OfficeModal
        isOpen={isOfficeModalOpen}
        office={selectedOfficeForEdit}
        officeTypes={officeTypes}
        offices={offices}
        onClose={() => {
          setIsOfficeModalOpen(false);
          setSelectedOfficeForEdit(null);
        }}
        onSave={handleSaveOffice}
      />
    </>
  );
};

export default OfficesPage;
