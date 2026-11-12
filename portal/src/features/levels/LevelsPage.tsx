import React, { useMemo, useState } from 'react';
import {
  Layers,
  ShieldCheck,
  CheckCircle2,
  GitBranch,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { useLanguage } from '../../i18n/i18nContext';
import { getLocalizedText } from '../../i18n/utils/getLocalized';
import { LevelModal } from '../../components/levels/LevelModal';
import {
  useGetOrganizationTypesQuery,
  useCreateOrganizationTypeMutation,
  useUpdateOrganizationTypeMutation,
  useDeleteOrganizationTypeMutation,
  type OrganizationTypeItem,
} from '../../services/organizationsApi';

export const LevelsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const canCreate = isSuperAdmin || hasPermission('organizations.create') || hasPermission('organizations.view');
  const canUpdate = isSuperAdmin || hasPermission('organizations.update') || hasPermission('organizations.view');
  const canDelete = isSuperAdmin || hasPermission('organizations.delete');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [rootFilter, setRootFilter] = useState<'all' | 'root' | 'child'>('all');

  const { data: response, isLoading, refetch } = useGetOrganizationTypesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
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
      const q = search.trim().toLowerCase();
      const locName = (getLocalizedText(lvl.name as any, language) || (typeof lvl.name === 'string' ? lvl.name : '')).toLowerCase();
      const locDesc = (getLocalizedText(lvl.description as any, language) || (typeof lvl.description === 'string' ? lvl.description : '')).toLowerCase();
      const code = String(lvl.code || '').toLowerCase();
      const matchSearch =
        q === '' ||
        locName.includes(q) ||
        code.includes(q) ||
        locDesc.includes(q);

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? lvl.is_active : !lvl.is_active);

      const matchRoot =
        rootFilter === 'all' ||
        (rootFilter === 'root' ? lvl.can_be_root : !lvl.can_be_root);

      return matchSearch && matchStatus && matchRoot;
    });
  }, [levels, search, statusFilter, rootFilter, language]);

  const rootCount = levels.filter((l) => l.can_be_root).length;
  const activeCount = levels.filter((l) => l.is_active).length;
  const maxDepth = levels.reduce((max, l) => Math.max(max, l.level), 1);

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
    level: number;
    can_be_root: boolean;
    description?: string;
    is_active: boolean;
  }) => {
    try {
      if (payload.id) {
        await updateType(payload as any).unwrap();
      } else {
        await createType(payload).unwrap();
      }
      await refetch();
      setIsModalOpen(false);
      setSelectedLevel(null);
    } catch (err: any) {
      window.alert(err?.data?.message || 'Failed to save tier level.');
    }
  };

  const handleToggleStatus = async (lvl: OrganizationTypeItem) => {
    try {
      await updateType({
        id: lvl.id,
        is_active: !lvl.is_active,
      } as any).unwrap();
      await refetch();
    } catch (err: any) {
      window.alert(err?.data?.message || 'Failed to update level active status.');
    }
  };

  const handleDelete = async (lvl: OrganizationTypeItem) => {
    const displayName = getLocalizedText(lvl.name as any, language) || (typeof lvl.name === 'string' ? lvl.name : 'tier');
    if (window.confirm(`Are you sure you want to delete tier "${displayName}"?`)) {
      try {
        await deleteType(lvl.id).unwrap();
        await refetch();
      } catch (err: any) {
        window.alert(err?.data?.message || 'Failed to delete tier level.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span />
            {t('levels.eyebrow')}
          </div>
          <h1>{t('levels.title')}</h1>
          <p>{t('levels.subtitle')}</p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="primary-button"
          >
            <Plus size={16} />
            <span>{t('levels.addLevel')}</span>
          </button>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#064552]">
            <Layers size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {levels.length}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('levels.totalTiers')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700">
            <ShieldCheck size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {rootCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('levels.rootTiers')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {activeCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('levels.activeTiers')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
            <GitBranch size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {t('levels.levelWord', 'Level')} {maxDepth}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('levels.maxDepth')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        {/* Card Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {t('levels.governanceTitle', 'Governance Structure')}
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                {filteredLevels.length} {t('levels.tiersCount', 'tiers')}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-medium">{t('levels.positionLabel', 'Position:')}</span>
              {(['all', 'root', 'child'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRootFilter(r)}
                  className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                    rootFilter === r
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r === 'all'
                    ? t('levels.allTypes', 'All tiers')
                    : r === 'root'
                    ? t('levels.rootOnly', 'Root tier only')
                    : t('levels.childOnly', 'Subordinate tiers')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('levels.searchPlaceholder', 'Search levels by name, code slug, description...')}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#064552] transition-all"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/70 text-xs font-semibold self-end sm:self-auto">
              {(['all', 'active', 'inactive'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'all'
                    ? t('levels.allStatuses', 'All statuses')
                    : st === 'active'
                    ? t('common.active', 'Active')
                    : t('common.inactive', 'Inactive')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              {t('common.loading', 'Loading organization tiers...')}
            </div>
          ) : filteredLevels.length === 0 ? (
            <div className="py-16 text-center max-w-sm mx-auto">
              <Layers size={36} className="mx-auto text-slate-300 mb-2" />
              <h3 className="text-sm font-bold text-slate-700">{t('levels.emptyNotice', 'No tier levels found')}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {search ? `No results match "${search}".` : t('levels.emptyNotice', 'No tier levels found')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLevels.map((lvl) => (
                <div
                  key={lvl.id}
                  className="border border-slate-200/80 rounded-xl p-4 bg-white hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#064552] flex-shrink-0 mt-0.5">
                      <span className="font-extrabold text-sm">{lvl.level}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {lvl.code}
                        </span>

                        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          lvl.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {lvl.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                        </span>

                        {lvl.can_be_root && (
                          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200/60">
                            {t('levels.rootTier', 'Root Tier Class')}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug tracking-tight">
                        {getLocalizedText(lvl.name as any, language) || (typeof lvl.name === 'string' ? lvl.name : lvl.code)}
                      </h3>

                      {lvl.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {getLocalizedText(lvl.description as any, language) || (typeof lvl.description === 'string' ? lvl.description : '')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 flex-shrink-0">
                    {canUpdate && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(lvl)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-[#064552] hover:text-white transition-colors"
                        >
                          <Pencil size={13} />
                          <span>{t('common.edit', 'Edit')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(lvl)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            lvl.is_active
                              ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={lvl.is_active ? 'Deactivate level' : 'Activate level'}
                        >
                          {lvl.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </>
                    )}

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(lvl)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete level"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
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
      )}
    </div>
  );
};

export default LevelsPage;

