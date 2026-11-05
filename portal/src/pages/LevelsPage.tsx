import React, { useMemo, useState } from 'react';
import { PageHeading } from '../components/shared/PageHeading';
import { MetricCard } from '../components/shared/MetricCard';
import { SearchBox } from '../components/shared/SearchBox';
import { StatusPill } from '../components/shared/StatusPill';
import { Icon } from '../components/shared/Icon';
import { LevelModal } from '../components/levels/LevelModal';
import {
  useGetOrganizationTypesQuery,
  useCreateOrganizationTypeMutation,
  useUpdateOrganizationTypeMutation,
  useDeleteOrganizationTypeMutation,
  type OrganizationTypeItem,
} from '../services/organizationsApi';

export const LevelsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [rootFilter, setRootFilter] = useState<'all' | 'root' | 'child'>('all');

  const { data: response, isLoading } = useGetOrganizationTypesQuery();
  const [createType, { isLoading: isCreating }] = useCreateOrganizationTypeMutation();
  const [updateType, { isLoading: isUpdating }] = useUpdateOrganizationTypeMutation();
  const [deleteType, { isLoading: isDeleting }] = useDeleteOrganizationTypeMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<OrganizationTypeItem | null>(null);

  const levels: OrganizationTypeItem[] = useMemo(() => {
    return response?.data || [];
  }, [response]);

  const filteredLevels = useMemo(() => {
    return levels.filter((lvl) => {
      const matchSearch =
        search.trim() === '' ||
        lvl.name.toLowerCase().includes(search.toLowerCase()) ||
        lvl.code.toLowerCase().includes(search.toLowerCase()) ||
        (lvl.description && lvl.description.toLowerCase().includes(search.toLowerCase()));

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? lvl.is_active : !lvl.is_active);

      const matchRoot =
        rootFilter === 'all' ||
        (rootFilter === 'root' ? lvl.can_be_root : !lvl.can_be_root);

      return matchSearch && matchStatus && matchRoot;
    });
  }, [levels, search, statusFilter, rootFilter]);

  const rootCount = levels.filter((l) => l.can_be_root).length;
  const activeCount = levels.filter((l) => l.is_active).length;

  const handleOpenAdd = () => {
    setSelectedLevel(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lvl: OrganizationTypeItem) => {
    setSelectedLevel(lvl);
    setIsModalOpen(true);
  };

  const handleSave = async (payload: {
    id?: number;
    name: string;
    code: string;
    description?: string;
    level: number;
    can_be_root: boolean;
    is_active: boolean;
  }) => {
    if (payload.id) {
      await updateType(payload as any).unwrap();
    } else {
      await createType(payload).unwrap();
    }
    setIsModalOpen(false);
    setSelectedLevel(null);
  };

  const handleDelete = async (lvl: OrganizationTypeItem) => {
    if (
      window.confirm(
        `Are you sure you want to delete the "${lvl.name}" tier level? Organizations using this level will be affected.`
      )
    ) {
      try {
        await deleteType(lvl.id).unwrap();
      } catch (err: any) {
        window.alert(err?.data?.message || 'Failed to delete organization level.');
      }
    }
  };

  const getRankBadgeTone = (levelRank: number) => {
    if (levelRank === 1) return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };
    if (levelRank === 2) return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
    if (levelRank === 3) return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
    return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
  };

  return (
    <>
      <PageHeading
        eyebrow="SUPER ADMIN · HIERARCHY STRUCTURE"
        title="Organization levels"
        subtitle="Manage the hierarchy ranks and classification tiers (Sub-City, Woreda, Bureau, etc.) used when registering offices."
        action="Add tier level"
        onAction={handleOpenAdd}
      />

      <div className="metric-grid compact-metrics">
        <MetricCard
          icon="layers"
          label="Total tiers configured"
          value={isLoading ? '...' : levels.length}
          note="Statutory hierarchy ranks"
          tone="teal"
        />
        <MetricCard
          icon="building"
          label="Root tiers"
          value={isLoading ? '...' : rootCount}
          note="Independent regional authorities"
          tone="sage"
        />
        <MetricCard
          icon="check"
          label="Active tiers"
          value={isLoading ? '...' : activeCount}
          note="Available in office forms"
          tone="gold"
        />
      </div>

      <section className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h2>Hierarchy tier levels</h2>
            <p>Offices choose from these tiers during registration to establish parent/child relationships.</p>
          </div>
          <div className="toolbar-tools">
            <SearchBox value={search} onChange={setSearch} placeholder="Search levels by name or slug..." />
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              className="filter-select"
              value={rootFilter}
              onChange={(e) => setRootFilter(e.target.value as any)}
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
                        <b style={{ fontSize: '13.5px', color: '#0f172a' }}>{lvl.name}</b>
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
                        {lvl.description || '—'}
                      </span>
                    </td>
                    <td>
                      <StatusPill>{lvl.is_active ? 'Active' : 'Inactive'}</StatusPill>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="button secondary small-button"
                          onClick={() => handleOpenEdit(lvl)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="button secondary small-button"
                          style={{ color: '#dc2626' }}
                          onClick={() => handleDelete(lvl)}
                          title="Delete level"
                        >
                          Delete
                        </button>
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

      <LevelModal
        isOpen={isModalOpen}
        level={selectedLevel}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLevel(null);
        }}
        onSave={handleSave}
        isLoading={isCreating || isUpdating}
      />
    </>
  );
};

export default LevelsPage;

