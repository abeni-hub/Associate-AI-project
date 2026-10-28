import React, { useState } from 'react';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import { SearchBox } from '../components/shared/SearchBox';
import { StatusPill } from '../components/shared/StatusPill';
import { MetricCard } from '../components/shared/MetricCard';
import { getOfficeParentSummary, getOfficeSubcityId } from '../components/offices/officeHierarchy';
import { INITIAL_OFFICES, INITIAL_OFFICE_TYPES } from '../data/portalData';
import { usePortal } from '../context';
import type { OfficeItem, OfficeType } from '../types/portal.types';

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

  const offices = propOffices || INITIAL_OFFICES;
  const officeTypes = propOfficeTypes || INITIAL_OFFICE_TYPES;
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
    const query = `${item.name} ${item.admin} ${item.status} ${type?.name || ''} ${parentSummary}`.toLowerCase();
    return matchesType && query.includes(search.toLowerCase());
  });

  const subcityCount = scopedOffices.filter((o: OfficeItem) => o.typeId === 1).length;
  const bureauCount = scopedOffices.filter((o: OfficeItem) => o.typeId === 2).length;
  const avgCompletion = scopedOffices.length
    ? Math.round(
        scopedOffices.reduce((acc: number, curr: OfficeItem) => acc + (curr.completion || 0), 0) /
          scopedOffices.length
      )
    : 0;

  const handleOpenAdd = () => {
    if (onAddOffice) {
      onAddOffice();
    } else {
      portal.createForPage('offices');
    }
  };

  const handleOpenEdit = (office: OfficeItem) => {
    if (onEditOffice) {
      onEditOffice(office);
    } else {
      portal.openForm({
        eyebrow: 'DIRECTORY UPDATE',
        title: `Edit ${office.name}`,
        description: 'Update administrative assignments and office metadata.',
        submit: 'Save office',
        fields: [
          { name: 'name', label: 'Office title', required: true, value: office.name },
          { name: 'admin', label: 'Lead administrator', required: true, value: office.admin },
          {
            name: 'status',
            label: 'Operational status',
            type: 'select',
            value: office.status,
            options: ['Active', 'Inactive'],
          },
        ],
        onSubmit: () => {},
      });
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
          note="Across all administrative levels"
          tone="teal"
        />
        <MetricCard
          icon="map"
          label="Sub-cities"
          value={subcityCount}
          note="Chartered administrations"
          tone="sage"
        />
        <MetricCard
          icon="building"
          label="Sector bureaus"
          value={bureauCount}
          note="Specialized public offices"
          tone="gold"
        />
        <MetricCard
          icon="check"
          label="Average readiness"
          value={`${avgCompletion}%`}
          note="Service guides completed"
          tone="blue"
        />
      </div>

      <section className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h2>Government offices directory</h2>
            <p>Hierarchical relationships dictate access and citizen service routing.</p>
          </div>
          <div className="toolbar-tools">
            <SearchBox value={search} onChange={setSearch} placeholder="Search offices, bureaus, admins..." />
          </div>
        </div>

        <div className="filter-chips-bar" role="group" aria-label="Filter offices by classification">
          <button
            type="button"
            className={`chip-button${selectedTypeId === 'all' ? ' active' : ''}`}
            aria-pressed={selectedTypeId === 'all'}
            onClick={() => setSelectedTypeId('all')}
          >
            All classifications <span>{scopedOffices.length}</span>
          </button>
          {officeTypes.map((type: OfficeType) => {
            const count = scopedOffices.filter((o: OfficeItem) => o.typeId === type.id).length;
            return (
              <button
                key={type.id}
                type="button"
                className={`chip-button${selectedTypeId === String(type.id) ? ' active' : ''}`}
                aria-pressed={selectedTypeId === String(type.id)}
                onClick={() => setSelectedTypeId(String(type.id))}
              >
                {type.name} <span>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>OFFICE / JURISDICTION</th>
                <th>CLASSIFICATION</th>
                <th>ADMINISTRATOR</th>
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
                            name={item.typeId === 1 ? 'map' : item.typeId === 2 ? 'building' : 'sitemap'}
                            size={17}
                          />
                        </span>
                        <div>
                          <b>{item.name}</b>
                          {parentSummary && (
                            <span className="lineage-badge">↳ Parent office: {parentSummary}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="role-tag office-classification-tag">{type?.name || 'Office'}</span>
                    </td>
                    <td>
                      <span className="table-person">
                        <span className="mini-avatar">
                          {item.admin
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                        </span>
                        <span>{item.admin}</span>
                      </span>
                    </td>
                    <td>
                      <b>{item.services}</b> guides
                    </td>
                    <td>
                      <StatusPill>{item.status}</StatusPill>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="button secondary small-button"
                        onClick={() => handleOpenEdit(item)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!filtered.length && (
            <div className="empty-state">
              <span className="empty-icon">
                <Icon name="sitemap" size={22} />
              </span>
              <b>No offices found</b>
              <p>Try selecting another office type or adjusting your search terms.</p>
            </div>
          )}
        </div>

        <div className="table-footer">
          <span>
            Showing <b>{filtered.length}</b> of <b>{scopedOffices.length}</b> registered offices
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
    </>
  );
};

export default OfficesPage;
