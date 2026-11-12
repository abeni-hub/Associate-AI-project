import React from 'react';
import { Icon } from '../../shared';

export interface ActivityFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  actionTypeFilter: string;
  setActionTypeFilter: (type: string) => void;
  totalFiltered: number;
}

export const CATEGORIES = [
  'all',
  'Services',
  'Offices',
  'Security & access',
  'Roles & access',
  'Citizen voice',
  'CMS & Landing',
];

export const ACTION_TYPES = [
  { id: 'all', label: 'All Operations' },
  { id: 'UPDATE', label: 'Updates & Edits' },
  { id: 'CREATE', label: 'Creates' },
  { id: 'DELETE', label: 'Deletions' },
  { id: 'PUBLISH', label: 'Publishing' },
  { id: 'SECURITY', label: 'Security & Auth' },
  { id: 'STATUS', label: 'Status Changes' },
];

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  actionTypeFilter,
  setActionTypeFilter,
  totalFiltered,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        margin: '1.25rem 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: 1 }}>
        <div className="search-box" style={{ minWidth: 260, flex: 1, maxWidth: 400 }}>
          <Icon name="search" size={16} />
          <input
            type="search"
            placeholder="Search by actor, action, IP, field, or target entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`button secondary small-button${categoryFilter === cat ? ' active' : ''}`}
              style={{
                textTransform: cat === 'all' ? 'capitalize' : 'none',
                background: categoryFilter === cat ? '#00485a' : undefined,
                color: categoryFilter === cat ? '#ffffff' : undefined,
                borderColor: categoryFilter === cat ? '#00485a' : undefined,
              }}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === 'all' ? 'All categories' : cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <select
          value={actionTypeFilter}
          onChange={(e) => setActionTypeFilter(e.target.value)}
          style={{
            padding: '7px 12px',
            borderRadius: 6,
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            fontSize: '13px',
            color: '#1e293b',
          }}
        >
          {ACTION_TYPES.map((act) => (
            <option key={act.id} value={act.id}>
              {act.label}
            </option>
          ))}
        </select>
        <span style={{ fontSize: '13px', color: '#64748b' }}>
          <b>{totalFiltered}</b> events
        </span>
      </div>
    </div>
  );
};

export default ActivityFilters;

