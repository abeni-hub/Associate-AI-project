import React, { useMemo, useState } from 'react';
import { usePortal } from '../context';
import { usePermissions } from '../hooks/usePermissions';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import { SearchBox } from '../components/shared/SearchBox';
import { StatusPill } from '../components/shared/StatusPill';
import type { RouteItem, RouteStep } from '../types/portal.types';
import {
  useGetServicesQuery,
  useSyncServiceStepsMutation,
} from '../services/servicesApi';
import { useGetOrganizationsQuery } from '../services/organizationsApi';

export interface RoutesPageProps {
  items?: RouteItem[];
  onEdit?: (item: RouteItem) => void;
  search?: string;
  setSearch?: (s: string) => void;
}

export const RoutesPage: React.FC<RoutesPageProps> = ({
  items: propItems,
  onEdit: propOnEdit,
  search: propSearch,
  setSearch: propSetSearch,
}) => {
  const portal = usePortal();
  const { hasPermission } = usePermissions();
  const canManageSteps = hasPermission('service_steps.manage');

  const search = propSearch !== undefined ? propSearch : portal.search;
  const setSearch = propSetSearch || portal.setSearch;

  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('all');

  // Query ONLY sub-services for room routes from backend API
  const queryParams = useMemo(() => {
    const params: { scope: string; per_page: number; organization_id?: number } = {
      scope: 'subservices',
      per_page: 100,
    };
    if (selectedOrgFilter !== 'all') {
      params.organization_id = Number(selectedOrgFilter);
    }
    return params;
  }, [selectedOrgFilter]);

  const { data: apiServices, isLoading, refetch } = useGetServicesQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const { data: orgsData } = useGetOrganizationsQuery({ per_page: 100 });
  const organizations = useMemo(() => orgsData?.data || [], [orgsData]);

  const { subcitiesList, bureausList } = useMemo(() => {
    const subcities: typeof organizations = [];
    const bureaus: typeof organizations = [];
    organizations.forEach((org) => {
      const isSubcity =
        org.type?.code === 'sub_city' ||
        org.name.toLowerCase().includes('sub-city') ||
        org.name.toLowerCase().includes('subcity');
      if (isSubcity) {
        subcities.push(org);
      } else {
        bureaus.push(org);
      }
    });
    return { subcitiesList: subcities, bureausList: bureaus };
  }, [organizations]);

  const [syncStepsTrigger] = useSyncServiceStepsMutation();

  const items: RouteItem[] = useMemo(() => {
    if (propItems && propItems.length > 0) return propItems;

    if (apiServices?.data && apiServices.data.length > 0) {
      // ONLY sub-services can have room routes (exclude master catalogs)
      const subServicesOnly = apiServices.data.filter((s) => !s.is_master && s.parent_id !== null);

      return subServicesOnly.map((s) => {
        const liveSteps: RouteStep[] =
          s.steps && s.steps.length > 0
            ? s.steps.map((step) => ({
                id: step.id,
                room: step.room_number || `Room ${step.step_number}`,
                title: step.title,
                detail: step.instruction,
                floor: step.floor,
                building: step.building,
                department: step.department_name,
              }))
            : [];

        const parentCategoryName = s.parent?.name || 'Sub-service';

        return {
          id: s.id,
          service: s.name,
          category: parentCategoryName,
          bureau: s.organization?.name || 'Addis Ababa City Administration',
          organizationId:
            selectedOrgFilter !== 'all'
              ? Number(selectedOrgFilter)
              : s.organization_id || null,
          status: s.is_active ? (liveSteps.length > 0 ? 'Active' : 'Draft') : 'Disabled',
          updated: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Live from API',
          steps: liveSteps,
        };
      });
    }

    return [];
  }, [propItems, apiServices, selectedOrgFilter]);

  const onEdit =
    propOnEdit ||
    ((route: RouteItem) => {
      portal.setModal({
        kind: 'route',
        route,
        onSave: async (steps: RouteStep[], orgId?: number | null) => {
          portal.saveRouteSteps(route.id, steps);
          try {
            await syncStepsTrigger({
              serviceId: route.id,
              organization_id: orgId || null,
              steps: steps.map((s, idx) => ({
                organization_id: orgId || null,
                step_number: idx + 1,
                title: s.title || `Step ${idx + 1}`,
                instruction: s.detail || '',
                room_number: s.room || null,
                floor: s.floor || 'Ground Floor',
                building: s.building || 'Main Administration Block',
                department_name: s.department || 'Public Desk',
                is_active: true,
              })),
            }).unwrap();
            await refetch();
          } catch (err) {
            console.warn('API service step sync notice:', err);
          }
        },
      });
    });

  const filtered = items.filter((item) =>
    `${item.service} ${item.category} ${item.status}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeading
        eyebrow="BUREAU OPERATIONS"
        title="Room routes"
        subtitle="Give citizens a clear path through your office, one room at a time."
        secondary="Preview public guide"
        onSecondary={() =>
          window.alert('Public guide preview is active in Citizen App Live Preview.')
        }
      />
      <div className="route-toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2>Your service routes</h2>
          <p>Room locations can be updated whenever your office layout changes.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="scope-dropdown"
            value={selectedOrgFilter}
            onChange={(e) => setSelectedOrgFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#fff',
              fontSize: '13px',
              fontWeight: 500,
              color: '#1e293b',
              cursor: 'pointer',
            }}
          >
            <option value="all">🏢 All Offices & Branches</option>
            {subcitiesList.length > 0 && (
              <optgroup label="── Sub-city Administrations ──">
                {subcitiesList.map((org) => (
                  <option key={org.id} value={org.id}>
                    🏛 {org.name}
                  </option>
                ))}
              </optgroup>
            )}
            {bureausList.length > 0 && (
              <optgroup label="── Bureaus & Agencies ──">
                {bureausList.map((org) => (
                  <option key={org.id} value={org.id}>
                    🏢 {org.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <SearchBox value={search} onChange={setSearch} placeholder="Search sub-services..." />
        </div>
      </div>
      <div className="route-grid">
        {isLoading && !apiServices ? (
          <div
            style={{
              gridColumn: '1 / -1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 24px',
              gap: '12px',
            }}
          >
            <div className="loading-spinner" />
            <p style={{ margin: 0, color: '#00485a', fontWeight: 600, fontSize: '14px' }}>
              Loading service routes...
            </p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>
              Connecting to room navigation catalog
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <article className="panel route-card" key={item.id}>
              <div className="route-card-header">
                <span className="route-card-icon">
                  <Icon name="route" size={18} />
                </span>
                <StatusPill>{item.status}</StatusPill>
                <button className="row-more" aria-label="Route actions">
                  <Icon name="dots" />
                </button>
              </div>
              <span className="service-category">{item.category}</span>
              <h3>{item.service}</h3>
              <p className="route-card-office">
                {item.bureau} <span>·</span> Updated {item.updated}
              </p>
              <div className="mini-route">
                {item.steps.map((step, index) => (
                  <div className="mini-route-step" key={`${item.id}-${step.room}-${index}`}>
                    <span className="mini-route-room">{step.room}</span>
                    <span className="mini-route-copy">
                      <b>{step.title}</b>
                      <small>{step.detail}</small>
                    </span>
                    {index < item.steps.length - 1 && <i className="mini-route-line" />}
                  </div>
                ))}
                {item.steps.length === 0 && (
                  <p style={{ margin: '8px 0', fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                    No room sequence configured yet. Click below to add steps.
                  </p>
                )}
              </div>
              {canManageSteps && (
                <button className="route-edit-button" onClick={() => onEdit(item)}>
                  {item.steps.length === 0 ? 'Configure route' : 'Edit room sequence'}{' '}
                  <Icon name="arrow" size={15} />
                </button>
              )}
            </article>
          ))
        )}
        {!isLoading && !filtered.length && (
          <div className="panel empty-state" style={{ gridColumn: '1 / -1' }}>
            <b>No room routes found</b>
            <p>Try another search.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default RoutesPage;
