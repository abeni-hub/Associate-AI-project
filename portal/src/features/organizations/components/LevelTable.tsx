import React from 'react';
import { Icon, SearchBox, StatusPill, useLanguage, getLocalizedText } from '../../shared';
import type { OrganizationTypeItem } from '../api/organizationsApi';

interface LevelTableProps {
  levels: OrganizationTypeItem[];
  filteredLevels: OrganizationTypeItem[];
  isLoading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: 'all' | 'active' | 'inactive';
  onStatusFilterChange: (val: 'all' | 'active' | 'inactive') => void;
  rootFilter: 'all' | 'root' | 'child';
  onRootFilterChange: (val: 'all' | 'root' | 'child') => void;
  canUpdate: boolean;
  canDelete: boolean;
  isUpdating: boolean;
  onMoveRank: (lvl: OrganizationTypeItem, direction: 'up' | 'down') => void;
  onOpenEdit: (lvl: OrganizationTypeItem) => void;
  onDelete: (lvl: OrganizationTypeItem) => void;
}

const getRankBadgeTone = (levelRank: number) => {
  if (levelRank === 1) return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };
  if (levelRank === 2) return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
  if (levelRank === 3) return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
  return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
};

export const LevelTable: React.FC<LevelTableProps> = ({
  levels,
  filteredLevels,
  isLoading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  rootFilter,
  onRootFilterChange,
  canUpdate,
  canDelete,
  isUpdating,
  onMoveRank,
  onOpenEdit,
  onDelete,
}) => {
  const { language } = useLanguage();
  return (
    <section className="panel table-panel">
      <div className="table-toolbar">
        <div>
          <h2>Hierarchy tier levels</h2>
        </div>
        <div className="toolbar-tools">
          <SearchBox value={search} onChange={onSearchChange} placeholder="Search levels by name or slug..." />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as any)}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            className="filter-select"
            value={rootFilter}
            onChange={(e) => onRootFilterChange(e.target.value as any)}
            aria-label="Filter by root permission"
          >
            <option value="all">All structures</option>
            <option value="root">Root tier eligible</option>
            <option value="child">Requires parent</option>
          </select>
        </div>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '110px' }}>Rank Level</th>
              <th style={{ width: '220px' }}>Tier Name & Code</th>
              <th>Hierarchy Structure</th>
              <th>Mandate Description</th>
              <th style={{ width: '100px' }}>Status</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLevels.map((lvl) => {
              const tone = getRankBadgeTone(lvl.level);
              return (
                <tr key={lvl.id}>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        background: tone.bg,
                        color: tone.text,
                        border: `1px solid ${tone.border}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Level {lvl.level}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <b style={{ fontSize: '13.5px', color: '#0f172a' }}>
                        {getLocalizedText(lvl.name, language) || (typeof lvl.name === 'string' ? lvl.name : lvl.code)}
                      </b>
                      <code style={{ fontSize: '11px', color: '#64748b', background: '#f8fafc', padding: '1px 5px', borderRadius: '3px', width: 'fit-content' }}>
                        {lvl.code}
                      </code>
                    </div>
                  </td>
                  <td>
                    {lvl.can_be_root ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#047857',
                        }}
                      >
                        <Icon name="check" size={14} /> Root Tier (No parent needed)
                      </span>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        Reports to ancestor tier
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '12.5px', color: '#475569' }}>
                      {getLocalizedText(lvl.description, language) || (typeof lvl.description === 'string' ? lvl.description : '—')}
                    </span>
                  </td>
                  <td>
                    <StatusPill>{lvl.is_active ? 'Active' : 'Inactive'}</StatusPill>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      {canUpdate && (
                        <>
                          <button
                            type="button"
                            className="button secondary small-button"
                            disabled={lvl.level <= 1 || isUpdating}
                            onClick={() => onMoveRank(lvl, 'up')}
                            title="Shift rank up (higher authority)"
                            style={{ padding: '3px 7px', fontSize: '12px' }}
                          >
                            &uarr;
                          </button>
                          <button
                            type="button"
                            className="button secondary small-button"
                            disabled={lvl.level >= levels.length || isUpdating}
                            onClick={() => onMoveRank(lvl, 'down')}
                            title="Shift rank down (lower authority)"
                            style={{ padding: '3px 7px', fontSize: '12px' }}
                          >
                            &darr;
                          </button>
                          <button
                            type="button"
                            className="button secondary small-button"
                            onClick={() => onOpenEdit(lvl)}
                          >
                            Edit
                          </button>
                        </>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          className="button secondary small-button"
                          style={{ color: '#dc2626' }}
                          onClick={() => onDelete(lvl)}
                          title="Delete level"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!filteredLevels.length && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
                  {isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div className="loading-spinner" />
                      <span style={{ fontWeight: 600, color: '#00485a', fontSize: '13.5px' }}>Loading hierarchy levels...</span>
                    </div>
                  ) : (
                    'No organization levels found matching criteria.'
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span>
          Showing <b>{filteredLevels.length}</b> of <b>{levels.length}</b> configured tiers
        </span>
      </div>
    </section>
  );
};

