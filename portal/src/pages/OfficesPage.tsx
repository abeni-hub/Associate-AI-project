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
import { usePermissions } from '../hooks/usePermissions';
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
  const [createOrgTrigger, { isLoading: isCreatingOrg }] = useCreateOrganizationMutation();
  const [updateOrgTrigger, { isLoading: isUpdatingOrg }] = useUpdateOrganizationMutation();
  const [deleteOrgTrigger] = useDeleteOrganizationMutation();
  const isSavingOrg = isCreatingOrg || isUpdatingOrg;

  const officeTypes: OfficeType[] = useMemo(() => {
    if (propOfficeTypes && propOfficeTypes.length > 0) return propOfficeTypes;
    if (apiOrgTypes?.data) {
      return apiOrgTypes.data.map((t) => ({
        id: t.id,
        name: t.name,
        level: t.level,
        can_be_root: t.can_be_root,
        description: t.description || '',
      }));
    }
    return [];
  }, [propOfficeTypes, apiOrgTypes]);

  const offices: OfficeItem[] = useMemo(() => {
    if (propOffices && propOffices.length > 0) return propOffices;
    const typesList = apiOrgTypes?.data || [];
    const typesById = new Map<number, any>();
    typesList.forEach((t) => typesById.set(Number(t.id), t));

    if (apiOrgs?.data) {
      return apiOrgs.data.map((o: any) => {
        const typeFromRef = o.type || typesById.get(Number(o.organization_type_id || 0));
        const resolvedTypeId = Number(typeFromRef?.id || o.organization_type_id || (typesList[0]?.id ?? 1));
        const resolvedTypeName = typeFromRef?.name || (resolvedTypeId === 1 ? 'Root Tier' : 'Office');

        return {
          id: o.id,
          name: o.name,
          code: o.code,
          typeId: resolvedTypeId,
          typeName: resolvedTypeName,
          typeCode: typeFromRef?.code || o.code,
          parentId: o.parent?.id ?? o.parent_organization_id ?? null,
          parentName: o.parent?.name,
          admin: o.email || o.phone || 'Administrative Desk',
          email: o.email || '',
          phone: o.phone || '',
          address: o.address || '',
          status: o.status === 'active' ? 'Active' : 'Inactive',
          services: o.services_count ?? 0,
          completion: 100,
          updated: 'Recently',
        };
      });
    }
    return [];
  }, [propOffices, apiOrgs, apiOrgTypes]);

  const role = propRole || portal.role || 'super';
  const search = propSearch !== undefined ? propSearch : (portal.search !== undefined ? portal.search : internalSearch);
  const setSearch = propSetSearch || portal.setSearch || setInternalSearch;

  const { hasPermission, canAccessOrganization, isSuperAdmin } = usePermissions();
  const canCreate = hasPermission('organizations.create');
  const canUpdate = hasPermission('organizations.update');
  const canDelete = hasPermission('organizations.delete');

  // Scope filter: Super Admin views all; hierarchy users view permitted hierarchy
  const scopedOffices = useMemo(() => {
    if (isSuperAdmin) return offices;
    return offices.filter((office: OfficeItem) => {
      const orgId = Number(office.id);
      return canAccessOrganization(orgId) || canAccessOrganization(office.parentId);
    });
  }, [offices, isSuperAdmin, canAccessOrganization]);

  const filtered = scopedOffices.filter((item: OfficeItem) => {
    const type = officeTypes.find((t: OfficeType) => t.id === item.typeId);
    const parentSummary = getOfficeParentSummary(item, offices, officeTypes);
    const matchesType = selectedTypeId === 'all' || item.typeId === Number(selectedTypeId);
    const classification = item.typeName || type?.name || '';
    const query = `${item.name} ${item.code || ''} ${item.email || ''} ${item.phone || ''} ${item.status} ${classification} ${parentSummary}`.toLowerCase();
    return matchesType && query.includes(search.toLowerCase());
  });

  const subcityCount = scopedOffices.filter((o: OfficeItem) => o.typeId === 1 || o.typeName === 'Sub-City').length;
  const woredaCount = scopedOffices.filter((o: OfficeItem) => o.typeId === 2 || o.typeName === 'Woreda').length;
  const bureauCount = scopedOffices.filter((o: OfficeItem) => o.typeId === 3 || o.typeName === 'Bureau').length;

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
    if (payload.id) {
      await updateOrgTrigger(payload).unwrap();
    } else {
      await createOrgTrigger(payload).unwrap();
    }
    setIsOfficeModalOpen(false);
    setSelectedOfficeForEdit(null);
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
        action={canCreate ? 'Add office' : undefined}
        onAction={canCreate ? handleOpenAdd : undefined}
        secondary="Export directory"
        onSecondary={() => window.alert('Office directory report generated.')}
      />

      <div className="metric-grid compact-metrics">
        <MetricCard
          icon="sitemap"
          label="Total offices"
          value={orgsLoading && !apiOrgs ? '...' : scopedOffices.length}
          note="All administrative levels"
          tone="teal"
        />
        <MetricCard
          icon="map"
          label="Sub-cities"
          value={orgsLoading && !apiOrgs ? '...' : subcityCount}
          note="Level 1 chartered anchors"
          tone="sage"
        />
        <MetricCard
          icon="layers"
          label="Woredas"
          value={orgsLoading && !apiOrgs ? '...' : woredaCount}
          note="Level 2 local districts"
          tone="blue"
        />
        <MetricCard
          icon="building"
          label="Sector bureaus"
          value={orgsLoading && !apiOrgs ? '...' : bureauCount}
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

        {orgsLoading && !apiOrgs ? (
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
                          {item.typeName || type?.name || (item.typeId === 1 ? 'Sub-City' : item.typeId === 2 ? 'Woreda' : 'Bureau')}
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
                                  onClick={() => handleOpenEdit(item)}
                                >
                                  Edit
                                </button>
                              )}
                              {canDelete && canManageThisOffice && (
                                <button
                                  type="button"
                                  className="button secondary small-button"
                                  style={{ color: '#e53e3e', borderColor: '#feb2b2' }}
                                  onClick={() => handleDeleteOffice(item)}
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
        isLoading={isSavingOrg}
      />
    </>
  );
};

export default OfficesPage;
