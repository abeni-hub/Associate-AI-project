import React, { useMemo } from 'react';
import { usePortal } from '../context';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import { SearchBox } from '../components/shared/SearchBox';
import { StatusPill } from '../components/shared/StatusPill';
import type { SubcityItem } from '../types/portal.types';
import { useGetOrganizationsQuery, useCreateOrganizationMutation } from '../services/organizationsApi';

export interface SubcitiesPageProps {
  items?: SubcityItem[];
  onAdd?: () => void;
  search?: string;
  setSearch?: (s: string) => void;
}

export const SubcitiesPage: React.FC<SubcitiesPageProps> = ({
  items: propItems,
  onAdd: propOnAdd,
  search: propSearch,
  setSearch: propSetSearch,
}) => {
  const portal = usePortal();

  const { data: apiOrgs, isLoading, refetch } = useGetOrganizationsQuery(undefined, { refetchOnMountOrArgChange: true });
  const [createOrgTrigger] = useCreateOrganizationMutation();

  const items: SubcityItem[] = useMemo(() => {
    if (propItems && propItems.length > 0) return propItems;

    if (apiOrgs?.data) {
      const apiSubcities = apiOrgs.data.filter((o) => o.organization_type_id === 1 || o.type?.code === 'sub_city');
      return apiSubcities.map((s) => ({
        id: s.id,
        name: s.name,
        admin: s.email || 'Sub-City Administrator',
        bureaus: s.children?.length ?? 0,
        services: s.services_count ?? 0,
        status: s.status === 'active' ? 'Live' : 'Setup',
        updated: 'Recently',
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
        eyebrow: 'PLATFORM DIRECTORY',
        title: 'Add a sub-city',
        description: 'Create a local workspace and register its administration.',
        submit: 'Create sub-city',
        fields: [
          { name: 'name', label: 'Sub-city name', required: true },
          { name: 'email', label: 'Work email', type: 'email', required: true },
          { name: 'phone', label: 'Official phone', placeholder: '+251911000000' },
        ],
        onSubmit: async (v) => {
          try {
            await createOrgTrigger({
              name: v.name,
              code: v.name.toLowerCase().replace(/\s+/g, '-'),
              organization_type_id: 1,
              email: v.email,
              phone: v.phone,
              status: 'active',
            }).unwrap();
            await refetch();
          } catch {
            portal.createForPage('subcities');
          }
        },
      });
    });

  const filtered = items.filter((item) =>
    `${item.name} ${item.admin} ${item.status}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeading
        eyebrow="PLATFORM DIRECTORY"
        title="Sub-cities"
        subtitle="Create and oversee the municipal administrations connected to CivicLink."
        action="Add sub-city"
        onAction={onAdd}
      />
      <div className="directory-overview">
        <div className="directory-stat">
          <span className="directory-stat-icon">
            <Icon name="map" />
          </span>
          <span>
            <b>{items.length}</b>
            <small>Connected sub-cities</small>
          </span>
        </div>
        <div className="directory-stat">
          <span className="directory-stat-icon sage">
            <Icon name="building" />
          </span>
          <span>
            <b>86</b>
            <small>Registered bureaus</small>
          </span>
        </div>
        <div className="directory-stat">
          <span className="directory-stat-icon gold">
            <Icon name="layers" />
          </span>
          <span>
            <b>248</b>
            <small>Published service standards</small>
          </span>
        </div>
        <div className="directory-stat">
          <span className="directory-stat-icon teal">
            <Icon name="check" />
          </span>
          <span>
            <b>99.4%</b>
            <small>Uptime across workspaces</small>
          </span>
        </div>
      </div>
      <section className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h2>Active sub-city workspaces</h2>
            <p>Every sub-city operates its own catalog of bureaus and published guides.</p>
          </div>
          <div className="toolbar-tools">
            <SearchBox value={search} onChange={setSearch} placeholder="Search sub-cities" />
          </div>
        </div>
        {isLoading && (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <p>Loading sub-cities from API...</p>
          </div>
        )}
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>SUB-CITY</th>
                <th>ADMINISTRATOR</th>
                <th>BUREAUS</th>
                <th>SERVICES</th>
                <th>STATUS</th>
                <th>UPDATED</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="entity-cell">
                      <span className="entity-icon">
                        <Icon name="map" size={17} />
                      </span>
                      <b>{item.name}</b>
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
                  <td>{item.bureaus} bureaus</td>
                  <td>{item.services} services</td>
                  <td>
                    <StatusPill>{item.status}</StatusPill>
                  </td>
                  <td>{item.updated}</td>
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
              <b>No sub-cities found</b>
              <p>Try searching with another keyword or add a new sub-city.</p>
            </div>
          )}
        </div>
        <div className="table-footer">
          <span>
            Showing <b>{filtered.length}</b> of <b>{items.length}</b> sub-cities
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
          <Icon name="globe" size={17} />
        </span>
        <span>
          <b>Sub-city workspaces are isolated</b>
          <small>
            Administrators manage their own office hierarchy and citizen experience within their jurisdiction.
          </small>
        </span>
      </div>
    </>
  );
};

export default SubcitiesPage;
