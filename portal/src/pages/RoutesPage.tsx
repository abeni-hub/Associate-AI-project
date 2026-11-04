import React, { useMemo } from 'react';
import { usePortal } from '../context';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import { SearchBox } from '../components/shared/SearchBox';
import { StatusPill } from '../components/shared/StatusPill';
import type { RouteItem, RouteStep } from '../types/portal.types';
import {
  useGetServicesQuery,
  useGetServiceStepsQuery,
  useCreateServiceStepMutation,
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

  const search = propSearch !== undefined ? propSearch : portal.search;
  const setSearch = propSetSearch || portal.setSearch;

  const { data: apiServices } = useGetServicesQuery();
  const { data: birthCertSteps } = useGetServiceStepsQuery('birth-certificate');
  const [createStepTrigger] = useCreateServiceStepMutation();

  const items: RouteItem[] = useMemo(() => {
    if (propItems && propItems.length > 0) return propItems;

    if (apiServices?.data && apiServices.data.length > 0) {
      return apiServices.data.map((s) => {
        const isBirth = (s.code && s.code.includes('birth')) || s.name.toLowerCase().includes('birth');
        const liveSteps: RouteStep[] =
          isBirth && birthCertSteps?.data && birthCertSteps.data.length > 0
            ? birthCertSteps.data.map((step) => ({
                room: step.room_number || `Room ${step.step_number}`,
                title: step.title,
                detail: step.instruction,
              }))
            : [];

        return {
          id: s.id,
          service: s.name,
          category: s.is_master ? 'Master Catalog' : 'Sub-service',
          bureau: 'Addis Ababa City Administration',
          status: s.is_active ? 'Active' : 'Draft',
          updated: 'Live from API',
          steps: liveSteps,
        };
      });
    }

    return [];
  }, [propItems, apiServices, birthCertSteps]);

  const onEdit =
    propOnEdit ||
    ((route: RouteItem) => {
      portal.setModal({
        kind: 'route',
        route,
        onSave: async (steps: RouteStep[]) => {
          portal.saveRouteSteps(route.id, steps);
          // Persist step update to backend service
          try {
            const targetServiceId = route.id;
            for (let i = 0; i < steps.length; i++) {
              const s = steps[i];
              await createStepTrigger({
                serviceId: targetServiceId,
                step_number: i + 1,
                title: s.title,
                instruction: s.detail,
                room_number: s.room,
                floor: 'Ground Floor',
                building: 'Main Administration Block',
                department_name: 'Public Desk',
                responsible_title: 'Officer',
                estimated_duration_minutes: 15,
                is_active: true,
              }).unwrap();
            }
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
      <div className="route-summary">
        <div>
          <span className="summary-icon">
            <Icon name="route" />
          </span>
          <span>
            <b>{items.length} service routes</b>
            <small>Configured for municipal administrative offices</small>
          </span>
        </div>
        <span className="summary-divider" />
        <div>
          <span className="route-progress-big">85%</span>
          <span>
            <b>Route readiness</b>
            <small>Synchronized with physical service catalog</small>
          </span>
        </div>
        <span className="summary-note">
          <i /> Citizens can see published routes in mobile app
        </span>
      </div>
      <div className="route-toolbar">
        <div>
          <h2>Your service routes</h2>
          <p>Room locations can be updated whenever your office layout changes.</p>
        </div>
        <SearchBox value={search} onChange={setSearch} placeholder="Search routes" />
      </div>
      <div className="route-grid">
        {filtered.map((item) => (
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
            </div>
            <button className="route-edit-button" onClick={() => onEdit(item)}>
              {item.status === 'Draft' ? 'Finish this route' : 'Edit room sequence'}{' '}
              <Icon name="arrow" size={15} />
            </button>
          </article>
        ))}
        {!filtered.length && (
          <div className="panel empty-state">
            <b>No room routes found</b>
            <p>Try another search.</p>
          </div>
        )}
      </div>
      <div className="tip-banner">
        <span className="tip-icon">
          <Icon name="globe" size={17} />
        </span>
        <span>
          <b>Publishing keeps the citizen guide current</b>
          <small>
            Review room numbers and directions after any change to your office layout.
          </small>
        </span>
      </div>
    </>
  );
};

export default RoutesPage;
