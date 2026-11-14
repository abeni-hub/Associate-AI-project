import React, { useMemo, useState } from 'react';
import { useLanguage } from '../i18n/i18nContext';
import { getLocalizedText } from '../i18n/utils/getLocalized';
import { PageHeading } from '../components/shared/PageHeading';
import { MetricCard } from '../components/shared/MetricCard';
import { SearchBox } from '../components/shared/SearchBox';
import { StatusPill } from '../components/shared/StatusPill';
import { Icon } from '../components/shared/Icon';
import { LevelModal } from '../components/levels/LevelModal';
import { usePermissions } from '../hooks/usePermissions';
import {
  useGetOrganizationTypesQuery,
  useCreateOrganizationTypeMutation,
  useUpdateOrganizationTypeMutation,
  useDeleteOrganizationTypeMutation,
  type OrganizationTypeItem,
} from '../services/organizationsApi';

export const LevelsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [rootFilter, setRootFilter] = useState<'all' | 'root' | 'child'>('all');

  const { data: response, isLoading, refetch } = useGetOrganizationTypesQuery(undefined, { refetchOnMountOrArgChange: true });
  const [createType, { isLoading: isCreating }] = useCreateOrganizationTypeMutation();
  const [updateType, { isLoading: isUpdating }] = useUpdateOrganizationTypeMutation();
  const [deleteType, { isLoading: isDeleting }] = useDeleteOrganizationTypeMutation();

  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('organizations.create');
  const canUpdate = hasPermission('organizations.update');
  const canDelete = hasPermission('organizations.delete');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<OrganizationTypeItem | null>(null);

  const levels: OrganizationTypeItem[] = useMemo(() => {
    return response?.data || [];
  }, [response]);

  const filteredLevels = useMemo(() => {
    return levels.filter((lvl) => {
      const q = search.trim().toLowerCase();
      const lvlNameStr = (getLocalizedText(lvl.name, language) || (typeof lvl.name === 'string' ? lvl.name : '')).toLowerCase();
      const lvlDescStr = (getLocalizedText(lvl.description, language) || (typeof lvl.description === 'string' ? lvl.description : '')).toLowerCase();
      const matchSearch =
        q === '' ||
        lvlNameStr.includes(q) ||
        String(lvl.code || '').toLowerCase().includes(q) ||
        lvlDescStr.includes(q);

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
    try {
      if (payload.id) {
        await updateType(payload as any).unwrap();
      } else {
        await createType(payload).unwrap();
      }
      setIsModalOpen(false);
      setSelectedLevel(null);
      await refetch();
    } catch (err: any) {
      window.alert(err?.data?.message || 'Failed to save organization level.');
    }
  };

  const handleDelete = async (lvl: OrganizationTypeItem) => {
    if (
      window.confirm(
        `Are you sure you want to delete the "${lvl.name}" tier level? Organizations using this level will be affected.`
      )
    ) {
      try {
        await deleteType(lvl.id).unwrap();
        await refetch();
      } catch (err: any) {
        window.alert(err?.data?.message || 'Failed to delete organization level.');
      }
    }
  };

  const handleMoveRank = async (lvl: OrganizationTypeItem, direction: 'up' | 'down') => {
    const targetRank = direction === 'up' ? lvl.level - 1 : lvl.level + 1;
    if (targetRank < 1 || targetRank > levels.length) return;
    try {
      await updateType({ id: lvl.id, level: targetRank }).unwrap();
    } catch (err: any) {
      window.alert(err?.data?.message || 'Failed to shift level rank.');
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
        eyebrow={t('levels.eyebrow', 'GOVERNANCE HIERARCHY')}
        title={t('levels.title', 'Hierarchy levels')}
        subtitle={t('levels.subtitle', 'Configure administrative depth, rank orders, and parent-child constraints across the municipal structure.')}
        action={canCreate ? t('levels.addLevel', '+ Add hierarchy level') : undefined}
        onAction={canCreate ? handleOpenAdd : undefined}
      />

      <div className="metric-grid compact-metrics">
        <MetricCard
          icon="layers"
          label={t('levels.totalTiers', 'Total tiers configured')}
          value={isLoading ? '...' : levels.length}
          note={t('levels.statutoryRanks', 'Statutory hierarchy ranks')}
          tone="teal"
        />
        <MetricCard
          icon="building"
          label={t('levels.rootTiers', 'Root tiers')}
          value={isLoading ? '...' : rootCount}
          note={t('levels.independentAuth', 'Independent regional authorities')}
          tone="sage"
        />
        <MetricCard
          icon="check"
          label={t('levels.activeTiers', 'Active tiers')}
          value={isLoading ? '...' : activeCount}
          note={t('levels.availableInForms', 'Available in office forms')}
          tone="gold"
        />
      </div>

      <section className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h2>{t('levels.tierLevels', 'Hierarchy tier levels')}</h2>
            <p>{t('levels.tierLevelsDesc', 'Offices choose from these tiers during registration to establish parent/child relationships.')}</p>
          </div>
          <div className="toolbar-tools">
            <SearchBox value={search} onChange={setSearch} placeholder={t('levels.searchPlaceholder', 'Search levels by name or slug...')} />
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              aria-label="Filter by status"
            >
              <option value="all">{t('levels.allStatuses', 'All statuses')}</option>
              <option value="active">{t('common.active', 'Active')}</option>
              <option value="inactive">{t('common.inactive', 'Inactive')}</option>
            </select>
            <select
              className="filter-select"
              value={rootFilter}
              onChange={(e) => setRootFilter(e.target.value as any)}
              aria-label="Filter by root permission"
            >
              <option value="all">{t('levels.allStructures', 'All structures')}</option>
              <option value="root">{t('levels.rootEligible', 'Root tier eligible')}</option>
              <option value="child">{t('levels.requiresParent', 'Requires parent')}</option>
            </select>
          </div>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '110px' }}>{t('levels.tableRankLevel', 'Rank Level')}</th>
                <th style={{ width: '220px' }}>{t('levels.tableTierName', 'Tier Name & Code')}</th>
                <th>{t('levels.tableStructure', 'Hierarchy Structure')}</th>
                <th>{t('levels.tableMandate', 'Mandate Description')}</th>
                <th style={{ width: '100px' }}>{t('common.status', 'Status')}</th>
                <th style={{ width: '120px', textAlign: 'right' }}>{t('common.actions', 'Actions')}</th>
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
                        {t('levels.levelWord', 'Level')} {lvl.level}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <b style={{ fontSize: '13.5px', color: '#0f172a' }}>{getLocalizedText(lvl.name, language) || lvl.name}</b>
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
                          <Icon name="check" size={14} /> {t('levels.rootTier', 'Root Tier (No parent needed)')}
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {t('levels.subordinateTier', 'Reports to ancestor tier')}
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '12.5px', color: '#475569' }}>
                        {getLocalizedText(lvl.description, language) || lvl.description || '—'}
                      </span>
                    </td>
                    <td>
                      <StatusPill>{lvl.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}</StatusPill>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        {canUpdate && (
                          <>
                            <button
                              type="button"
                              className="button secondary small-button"
                              disabled={lvl.level <= 1 || isUpdating}
                              onClick={() => handleMoveRank(lvl, 'up')}
                              title="Shift rank up"
                              style={{ padding: '3px 7px', fontSize: '12px' }}
                            >
                              &uarr;
                            </button>
                            <button
                              type="button"
                              className="button secondary small-button"
                              disabled={lvl.level >= levels.length || isUpdating}
                              onClick={() => handleMoveRank(lvl, 'down')}
                              title="Shift rank down"
                              style={{ padding: '3px 7px', fontSize: '12px' }}
                            >
                              &darr;
                            </button>
                            <button
                              type="button"
                              className="button secondary small-button"
                              onClick={() => handleOpenEdit(lvl)}
                            >
                              {t('common.edit', 'Edit')}
                            </button>
                          </>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            className="button secondary small-button"
                            style={{ color: '#dc2626' }}
                            onClick={() => handleDelete(lvl)}
                          >
                            {t('common.delete', 'Delete')}
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
                        <span style={{ fontWeight: 600, color: '#00485a', fontSize: '13.5px' }}>{t('common.loading', 'Loading hierarchy levels...')}</span>
                      </div>
                    ) : (
                      t('levels.noLevelsFound', 'No organization levels found matching criteria.')
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
        existingLevels={levels}
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

