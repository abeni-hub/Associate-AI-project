import React, { useMemo } from 'react';
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

  const { data: apiServices, isLoading, refetch } = useGetServicesQuery(undefined, { refetchOnMountOrArgChange: true });
  const [syncStepsTrigger] = useSyncServiceStepsMutation();

  const items: RouteItem[] = useMemo(() => {
    if (propItems && propItems.length > 0) return propItems;

    if (apiServices?.data && apiServices.data.length > 0) {
      return apiServices.data.map((s) => {
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

        return {
          id: s.id,
          service: s.name,
          category: s.is_master ? 'Master Catalog' : 'Sub-service',
          bureau: s.organization?.name || 'Addis Ababa City Administration',
          status: s.is_active ? (liveSteps.length > 0 ? 'Active' : 'Draft') : 'Disabled',
          updated: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Live from API',
          steps: liveSteps,
        };
      });
    }

    return [];
  }, [propItems, apiServices]);

  const onEdit =
    propOnEdit ||
    ((route: RouteItem) => {
      portal.setModal({
        kind: 'route',
        route,
        onSave: async (steps: RouteStep[]) => {
          portal.saveRouteSteps(route.id, steps);
          try {
            await syncStepsTrigger({
              serviceId: route.id,
              steps: steps.map((s, idx) => ({
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
      <div className="route-toolbar">
        <div>
          <h2>Your service routes</h2>
          <p>Room locations can be updated whenever your office layout changes.</p>
        </div>
        <SearchBox value={search} onChange={setSearch} placeholder="Search routes" />
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
