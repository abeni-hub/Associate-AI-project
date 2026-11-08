import React, { useMemo } from 'react';
import { usePortal } from '../context';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import { MetricCard } from '../components/shared/MetricCard';
import { SearchBox } from '../components/shared/SearchBox';
import { StatusPill } from '../components/shared/StatusPill';
import type { BureauItem } from '../types/portal.types';
import { useGetOrganizationsQuery, useCreateOrganizationMutation } from '../services/organizationsApi';

export interface BureausPageProps {
  items?: BureauItem[];
  onAdd?: () => void;
  search?: string;
  setSearch?: (s: string) => void;
}

export const BureausPage: React.FC<BureausPageProps> = ({
  items: propItems,
  onAdd: propOnAdd,
  search: propSearch,
  setSearch: propSetSearch,
}) => {
  const portal = usePortal();

  const { data: apiOrgs, isLoading, refetch } = useGetOrganizationsQuery(undefined, { refetchOnMountOrArgChange: true });
  const [createOrgTrigger] = useCreateOrganizationMutation();

  const items: BureauItem[] = useMemo(() => {
    if (propItems && propItems.length > 0) return propItems;

    if (apiOrgs?.data) {
      const apiBureaus = apiOrgs.data.filter((o) => o.organization_type_id === 3 || o.type?.code === 'bureau');
      return apiBureaus.map((b) => ({
        id: b.id,
        name: b.name,
        category: b.code || 'Sector Bureau',
        admin: b.email || 'Bureau Administrator',
        services: b.services_count ?? 0,
        completion: 100,
        status: b.status === 'active' ? 'Active' : 'In progress',
      }));
    }

    return [];
  }, [propItems, apiOrgs]);

  const search = propSearch !== undefined ? propSearch : portal.search;
  const setSearch = propSetSearch || portal.setSearch;
  
  const onAdd =
    propOnAdd ||
    (() => {
      portal.openForm({
        eyebrow: 'ORGANIZATION DIRECTORY',
        title: 'Add a sector bureau',
        description: 'Register an office and link it within the administrative hierarchy.',
        submit: 'Create bureau',
        fields: [
          { name: 'name', label: 'Bureau name', required: true },
          { name: 'code', label: 'Bureau code (slug)', placeholder: 'e.g. vital-events-bureau', required: true },
          { name: 'parent_id', label: 'Parent Sub-City / Woreda ID', placeholder: 'e.g. 1', required: true },
          { name: 'email', label: 'Work email', type: 'email' },
          { name: 'phone', label: 'Official phone', placeholder: '+251911000000' },
        ],
        onSubmit: async (v) => {
          try {
            await createOrgTrigger({
              name: v.name,
              code: v.code.toLowerCase().replace(/\s+/g, '-'),
              organization_type_id: 3,
              parent_organization_id: v.parent_id ? parseInt(v.parent_id, 10) : 1,
              email: v.email,
              phone: v.phone,
              status: 'active',
            }).unwrap();
            await refetch();
          } catch {
            portal.createForPage('bureaus');
          }
        },
      });
    });

  const filtered = items.filter((item) =>
    `${item.name} ${item.category} ${item.admin} ${item.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeading
        eyebrow="PUBLIC SERVICE OFFICES"
        title="Bureaus"
        subtitle="Manage specialized bureau teams, service guides, and citizen navigation."
        action="Add a bureau"
        onAction={onAdd}
      />
      <div className="metric-grid compact-metrics">
        <MetricCard
          icon="building"
          label="Registered bureaus"
          value={items.length}
          note="Connected service desks"
          tone="teal"
        />
        <MetricCard
          icon="check"
          label="Active status"
          value={items.filter((b) => b.status === 'Active' || b.status === 'Live').length}
          note="Serving citizens"
          tone="sage"
        />
        <MetricCard
          icon="clock"
          label="Needs attention"
          value="2"
          note="Room guides incomplete"
          tone="gold"
        />
        <MetricCard
          icon="message"
          label="Feedback this month"
          value="284"
          note="Across all bureaus"
          tone="blue"
        />
      </div>
      <section className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h2>Bureau directory</h2>
            <p>Service readiness across municipal sector administrations.</p>
          </div>
          <div className="toolbar-tools">
            <SearchBox value={search} onChange={setSearch} placeholder="Find a bureau" />
          </div>
        </div>
        {isLoading && (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <p>Loading bureaus from API...</p>
          </div>
        )}
        <div className="table-scroll">
          <table className="data-table bureau-table">
            <thead>
              <tr>
                <th>BUREAU / OFFICE</th>
                <th>ADMINISTRATOR</th>
                <th>SERVICES</th>
                <th>STATUS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="entity-cell">
                      <span className="entity-icon">
                        <Icon name="building" size={17} />
                      </span>
                      <span>
                        <b>{item.name}</b>
                        <small>{item.category}</small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="table-person">
                      <span className="mini-avatar">
                        {item.admin
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                      {item.admin}
                    </span>
                  </td>
                  <td>{item.services} guides</td>
                  <td>
                    <StatusPill>{item.status}</StatusPill>
                  </td>
                  <td>
                    <button className="row-more" aria-label={`Options for ${item.name}`}>
                      <Icon name="dots" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && !isLoading && (
            <div className="panel empty-state">
              <b>No bureaus found</b>
              <p>Try searching with another keyword or add a new bureau.</p>
            </div>
          )}
        </div>
        <div className="table-footer">
          <span>
            Showing <b>{filtered.length}</b> of <b>{items.length}</b> bureaus
          </span>
          <div>
            <button disabled>Previous</button>
            <button>
              Next <Icon name="arrow" size={13} />
            </button>
          </div>
        </div>
      </section>
      <div className="tip-banner">
        <span className="tip-icon">
          <Icon name="users" size={17} />
        </span>
        <span>
          <b>New bureau?</b>
          <small>
            Create a bureau and assign its administrator. The bureau team can then set room-by-room steps for shared services.
          </small>
        </span>
      </div>
    </>
  );
};

export default BureausPage;
