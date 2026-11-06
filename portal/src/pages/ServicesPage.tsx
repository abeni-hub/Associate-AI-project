import React, { useMemo, useState } from 'react';
import { usePortal } from '../context';
import { usePermissions } from '../hooks/usePermissions';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import { SearchBox } from '../components/shared/SearchBox';
import { StatusPill } from '../components/shared/StatusPill';
import type { ServiceItem } from '../types/portal.types';
import {
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} from '../services/servicesApi';

export interface ServicesPageProps {
  items?: ServiceItem[];
  onAdd?: () => void;
  onEdit?: (item: ServiceItem) => void;
  search?: string;
  setSearch?: (s: string) => void;
  onTogglePublish?: (id: number) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  items: propItems,
  onAdd: propOnAdd,
  onEdit: propOnEdit,
  search: propSearch,
  setSearch: propSetSearch,
  onTogglePublish: propOnTogglePublish,
}) => {
  const portal = usePortal();
  const [serviceFilter, setServiceFilter] = useState('All services');

  const search = propSearch !== undefined ? propSearch : portal.search;
  const setSearch = propSetSearch || portal.setSearch;

  const { data: apiServices, isLoading } = useGetServicesQuery();
  const [createServiceTrigger] = useCreateServiceMutation();
  const [updateServiceTrigger] = useUpdateServiceMutation();
  const [deleteServiceTrigger] = useDeleteServiceMutation();

  // Map backend services or merge with prop items
  const items: ServiceItem[] = useMemo(() => {
    if (propItems && propItems.length > 0) return propItems;

    if (apiServices?.data) {
      return apiServices.data.map((s) => ({
        id: s.id,
        name: s.name,
        serviceType: s.is_master ? 'Main service' : 'Sub-service',
        parentService: '',
        category: s.is_master ? 'Master Catalog' : 'Sub-service',
        description: s.description || 'Public government service delivery specification.',
        documents: s.required_documents_count
          ? Array.from({ length: s.required_documents_count }, (_, i) => `Required Document #${i + 1}`)
          : [],
        bureaus: s.offering_organizations_count ?? 0,
        published: Boolean(s.is_active),
        customerExpectations: s.fee_amount
          ? `Standard fee: ${s.fee_amount} ${s.fee_currency}`
          : 'Free public citizen service.',
        bureauExpectations: s.estimated_duration_minutes
          ? `Target processing time: ${s.estimated_duration_minutes} minutes.`
          : 'Standard queue processing.',
      }));
    }

    return [];
  }, [propItems, apiServices]);

  const onAdd =
    propOnAdd ||
    (() => {
      portal.openForm({
        eyebrow: 'SERVICE INFORMATION',
        title: 'Create a service standard',
        description: 'Define the service, required documents and expectations on both sides.',
        submit: 'Save service',
        fields: [
          { name: 'name', label: 'Service name', required: true },
          { name: 'code', label: 'Service Code (slug)', placeholder: 'e.g. business-renewal', required: true },
          {
            name: 'serviceType',
            label: 'Service level',
            type: 'select',
            required: true,
            options: ['Main service', 'Sub-service'],
          },
          { name: 'description', label: 'What this service does', type: 'textarea', full: true, required: true },
          {
            name: 'fee_amount',
            label: 'Fee amount (ETB)',
            placeholder: '0.00',
          },
          {
            name: 'estimated_duration_minutes',
            label: 'Estimated duration (minutes)',
            placeholder: '30',
          },
        ],
        onSubmit: async (v) => {
          try {
            await createServiceTrigger({
              name: v.name,
              code: (v.code || v.name.toLowerCase().replace(/\s+/g, '-')).toLowerCase(),
              description: v.description,
              is_active: true,
              fee_amount: v.fee_amount ? Number(v.fee_amount) : 0,
              fee_currency: 'ETB',
              estimated_duration_minutes: v.estimated_duration_minutes ? Number(v.estimated_duration_minutes) : 30,
            }).unwrap();
          } catch {
            // Local fallback
            portal.createForPage('services');
          }
        },
      });
    });

  const onEdit =
    propOnEdit ||
    ((item: ServiceItem) => {
      portal.openForm({
        eyebrow: 'SERVICE UPDATE',
        title: `Edit ${item.name}`,
        description: 'Update requirements and official service definitions.',
        submit: 'Save changes',
        fields: [
          { name: 'name', label: 'Service name', required: true, value: item.name },
          { name: 'description', label: 'Description', type: 'textarea', full: true, required: true, value: item.description },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            value: item.published ? 'Published' : 'Draft',
            options: ['Published', 'Draft'],
          },
        ],
        onSubmit: async (v) => {
          try {
            await updateServiceTrigger({
              id: item.id,
              name: v.name,
              description: v.description,
              is_active: v.status === 'Published',
            }).unwrap();
          } catch {
            portal.onUpdateService?.({
              ...item,
              name: v.name,
              description: v.description,
              published: v.status === 'Published',
            });
          }
        },
      });
    });

  const [togglingId, setTogglingId] = useState<number | null>(null);

  const onTogglePublish =
    propOnTogglePublish ||
    (async (id: number) => {
      const target = items.find((i) => i.id === id);
      if (target) {
        setTogglingId(id);
        const nextState = !target.published;
        try {
          await updateServiceTrigger({
            id,
            is_active: nextState,
          }).unwrap();
        } catch (err: any) {
          window.alert(err?.data?.message || 'Failed to update service active status.');
        } finally {
          setTogglingId(null);
        }
      }
    });

  const handleDeleteService = async (service: ServiceItem) => {
    if (window.confirm(`Are you sure you want to delete service "${service.name}"?`)) {
      try {
        await deleteServiceTrigger(service.id).unwrap();
      } catch (err: any) {
        window.alert(err?.data?.message || 'Failed to delete service.');
      }
    }
  };

  const filtered = items.filter(
    (item) =>
      (serviceFilter === 'All services' ||
        (serviceFilter === 'Published' ? item.published : !item.published)) &&
      `${item.name} ${item.category} ${item.description}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('services.create');
  const canUpdate = hasPermission('services.update');
  const canDelete = hasPermission('services.delete');

  return (
    <>
      <PageHeading
        eyebrow="SERVICE INFORMATION"
        title="Service standards"
        subtitle="Set clear, consistent requirements and expectations for every bureau in your jurisdiction."
        action={canCreate ? 'Create a service' : undefined}
        onAction={canCreate ? onAdd : undefined}
      />
      <div className="service-intro">
        <div className="service-intro-mark">
          <Icon name="layers" size={23} />
        </div>
        <div>
          <b>One shared standard, every local office</b>
          <p>
            These service definitions are synchronized with backend API catalog services and shared across local bureaus.
          </p>
        </div>
        <span className="service-intro-count">
          <b>{items.length}</b>
          <small>standards</small>
        </span>
      </div>
      <div className="service-toolbar">
        <SearchBox value={search} onChange={setSearch} placeholder="Search service standards" />
        <div>
          {['All services', 'Published', 'Drafts'].map((filter) => (
            <button
              key={filter}
              className={`chip-button${serviceFilter === filter ? ' active' : ''}`}
              onClick={() => setServiceFilter(filter)}
            >
              {filter} {filter === 'All services' && <span>{items.length}</span>}
            </button>
          ))}
        </div>
      </div>
      <section className="service-list">
        {isLoading && !apiServices ? (
          <div
            style={{
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
              Loading service standards...
            </p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>
              Connecting to public service catalog
            </p>
          </div>
        ) : null}
        {filtered.map((item) => (
          <article className="panel service-card" key={item.id}>
            <div className="service-card-main">
              <span className="service-card-icon">
                <Icon name="layers" size={20} />
              </span>
              <div className="service-card-content">
                <div className="service-title-row">
                  <span className="service-category">{item.category}</span>
                  <span className="service-level-tag">
                    {item.serviceType || 'Main service'}
                    {item.parentService ? ` · ${item.parentService}` : ''}
                  </span>
                  <StatusPill>{item.published ? 'Active' : 'Inactive'}</StatusPill>
                </div>
                <h2>{item.name}</h2>
                <p>{item.description}</p>
                <div className="service-meta">
                  <span>
                    <Icon name="check" size={14} /> {item.documents.length} required documents
                  </span>
                  <span>
                    <Icon name="building" size={14} /> Shared with {item.bureaus} offices
                  </span>
                </div>
                <div className="document-chips">
                  {item.documents.slice(0, 3).map((document) => (
                    <span key={document}>
                      <Icon name="check" size={11} />
                      {document}
                    </span>
                  ))}
                  {item.documents.length > 3 && <small>+{item.documents.length - 3} more</small>}
                </div>
              </div>
            </div>
            <div className="service-card-side">
              {canUpdate && (
                <button
                  className="button secondary small-button"
                  onClick={() => onEdit(item)}
                >
                  Edit standard
                </button>
              )}
              {canDelete && (
                <button
                  className="button secondary small-button"
                  style={{ color: '#e53e3e', borderColor: '#feb2b2' }}
                  onClick={() => handleDeleteService(item)}
                  title="Delete service standard"
                >
                  Delete
                </button>
              )}
              {canUpdate && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <button
                    className={`publish-toggle${item.published ? ' is-on' : ''}`}
                    title={item.published ? 'Deactivate service (toggle off)' : 'Activate service (toggle on)'}
                    aria-label={item.published ? 'Deactivate service' : 'Activate service'}
                    disabled={togglingId === item.id}
                    onClick={() => onTogglePublish(item.id)}
                    style={{
                      opacity: togglingId === item.id ? 0.6 : 1,
                      cursor: togglingId === item.id ? 'wait' : 'pointer',
                    }}
                  >
                    <i />
                  </button>
                  <small
                    style={{
                      fontSize: '9.5px',
                      color: item.published ? '#15803d' : '#94a3b8',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {item.published ? 'ACTIVE' : 'INACTIVE'}
                  </small>
                </div>
              )}
            </div>
            <div className="service-expectation">
              <span>EXPECTATIONS</span>
              <div>
                <p>
                  <b>Citizen:</b> {item.customerExpectations}
                </p>
                <p>
                  <b>Bureau:</b> {item.bureauExpectations}
                </p>
              </div>
            </div>
          </article>
        ))}
        {!filtered.length && !isLoading && (
          <div className="panel empty-state">
            <b>No services found</b>
            <p>Try another search or add a new standard.</p>
          </div>
        )}
      </section>
      <div className="tip-banner">
        <span className="tip-icon">
          <Icon name="route" size={17} />
        </span>
        <span>
          <b>Room numbers and physical steps are linked</b>
          <small>
            Physical navigation and floor routes are managed in Room Routes and synced with the citizen app.
          </small>
        </span>
      </div>
    </>
  );
};

export default ServicesPage;
