import React from 'react';
import { Icon, SearchBox, useLanguage, getLocalizedText } from '../../shared';

export interface ServicesToolbarProps {
  search: string;
  setSearch: (val: string) => void;
  serviceFilter: 'All services' | 'Published' | 'Drafts';
  setServiceFilter: (filter: 'All services' | 'Published' | 'Drafts') => void;
  viewMode: 'tree' | 'table';
  setViewMode: (mode: 'tree' | 'table') => void;
  isSuperAdmin: boolean;
  authUser: any;
  selectedOrgFilter: string;
  setSelectedOrgFilter: (orgId: string) => void;
  subcitiesList: any[];
  bureausList: any[];
  expandedMasterIds: Set<number>;
  handleToggleExpandAll: () => void;
  totalCount: number;
}

export const ServicesToolbar: React.FC<ServicesToolbarProps> = ({
  search,
  setSearch,
  serviceFilter,
  setServiceFilter,
  viewMode,
  setViewMode,
  isSuperAdmin,
  authUser,
  selectedOrgFilter,
  setSelectedOrgFilter,
  subcitiesList,
  bureausList,
  expandedMasterIds,
  handleToggleExpandAll,
  totalCount,
}) => {
  const { language } = useLanguage();
  return (
    <>
      {/* Organization Scope Indicator & Selector */}
      <div className="scope-indicator-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <Icon name="building" size={16} />
          {isSuperAdmin ? (
            <span>
              <strong>Platform-wide Catalog Scope:</strong> Super Admin unrestricted view across all bureaus and sub-cities.
            </span>
          ) : (
            <span>
              <strong>Scoped to:</strong> {getLocalizedText(authUser?.organization?.name, language) || (typeof authUser?.organization?.name === 'string' ? authUser?.organization?.name : 'Your Assigned Government Office')} (and local branch offices).
            </span>
          )}
        </div>

        {isSuperAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#526960' }}>
              Filter by Organization:
            </span>
            <select
              className="scope-dropdown"
              value={selectedOrgFilter}
              onChange={(e) => setSelectedOrgFilter(e.target.value)}
            >
              <option value="all">🏢 All Organizations (Platform-wide)</option>
              {subcitiesList.length > 0 && (
                <optgroup label="── Sub-city Administrations ──">
                  {subcitiesList.map((org) => (
                    <option key={org.id} value={org.id}>
                      🏛 {getLocalizedText(org.name, language) || (typeof org.name === 'string' ? org.name : '')}
                    </option>
                  ))}
                </optgroup>
              )}
              {bureausList.length > 0 && (
                <optgroup label="── Bureaus & Agencies ──">
                  {bureausList.map((org) => (
                    <option key={org.id} value={org.id}>
                      🏢 {getLocalizedText(org.name, language) || (typeof org.name === 'string' ? org.name : '')}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        )}
      </div>

      {/* Toolbar with Search, Status Chips, View Switcher & Expand All */}
      <div className="service-toolbar">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search master categories, subservices, codes, or required documents..."
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {(['All services', 'Published', 'Drafts'] as const).map((filter) => (
            <button
              key={filter}
              className={`chip-button${serviceFilter === filter ? ' active' : ''}`}
              onClick={() => setServiceFilter(filter)}
            >
              {filter}
              {filter === 'All services' && <span>{totalCount}</span>}
            </button>
          ))}

          <div className="service-view-switch">
            <button
              className={viewMode === 'tree' ? 'active' : ''}
              onClick={() => setViewMode('tree')}
              title="Hierarchical Tree View"
            >
              <Icon name="sitemap" size={14} />
              Tree View
            </button>
            <button
              className={viewMode === 'table' ? 'active' : ''}
              onClick={() => setViewMode('table')}
              title="Classic Card / Table View"
            >
              <Icon name="overview" size={14} />
              List View
            </button>
          </div>

          {viewMode === 'tree' && (
            <button
              className="button secondary small-button"
              onClick={handleToggleExpandAll}
              style={{ fontSize: '12px' }}
            >
              <Icon name="chevron" size={13} />
              {expandedMasterIds.size > 0 ? 'Collapse All' : 'Expand All'}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ServicesToolbar;

