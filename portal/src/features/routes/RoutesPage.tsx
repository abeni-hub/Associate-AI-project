import React, { useMemo, useState } from 'react';
import {
  MapPin,
  Navigation,
  Building2,
  CheckCircle2,
  Search,
  Pencil,
  Clock,
  Filter,
  AlertCircle,
  Folder,
} from 'lucide-react';
import { usePortal } from '../../context';
import { usePermissions } from '../../hooks/usePermissions';
import { useLanguage } from '../../i18n/i18nContext';
import { getLocalizedText } from '../../i18n/utils/getLocalized';
import type { RouteItem, RouteStep } from '../../types/portal.types';
import {
  useGetServicesQuery,
  useSyncServiceStepsMutation,
} from '../../services/servicesApi';
import { useGetOrganizationsQuery } from '../../services/organizationsApi';

export const RoutesPage: React.FC = () => {
  const portal = usePortal();
  const { language, t } = useLanguage();
  const { hasPermission } = usePermissions();
  const canManageSteps = hasPermission('service_steps.manage');

  const [search, setSearch] = useState('');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('all');
  const [routeFilter, setRouteFilter] = useState<'all' | 'configured' | 'pending'>('all');

  const queryParams = useMemo(() => {
    const params: { scope: string; per_page: number; organization_id?: number } = {
      scope: 'subservices',
      per_page: 100,
    };
    if (selectedOrgFilter !== 'all') {
      params.organization_id = Number(selectedOrgFilter);
    }
    return params;
  }, [selectedOrgFilter]);

  const { data: apiServices, isLoading, refetch } = useGetServicesQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const { data: orgsData } = useGetOrganizationsQuery({ per_page: 100 });
  const organizations = useMemo(() => orgsData?.data || [], [orgsData]);

  const { subcitiesList, bureausList } = useMemo(() => {
    const subcities: typeof organizations = [];
    const bureaus: typeof organizations = [];
    organizations.forEach((org) => {
      const isSubcity =
        org.type?.code === 'sub_city' ||
        org.name.toLowerCase().includes('sub-city') ||
        org.name.toLowerCase().includes('subcity');
      if (isSubcity) {
        subcities.push(org);
      } else {
        bureaus.push(org);
      }
    });
    return { subcitiesList: subcities, bureausList: bureaus };
  }, [organizations]);

  const [syncStepsTrigger] = useSyncServiceStepsMutation();

  const items: RouteItem[] = useMemo(() => {
    if (apiServices?.data && apiServices.data.length > 0) {
      const subServicesOnly = apiServices.data.filter((s) => !s.is_master && s.parent_id !== null);

      return subServicesOnly.map((s) => {
        const liveSteps: RouteStep[] =
          s.steps && s.steps.length > 0
            ? s.steps.map((step) => ({
                id: step.id,
                room: step.room_number || `Room ${step.step_number}`,
                title: step.title,
                detail: step.instruction,
                floor: step.floor,
                building: step.building,
                department: step.department_name,
              }))
            : [];

        const parentCategoryName = s.parent?.name
          ? getLocalizedText(s.parent.name, language)
          : 'Sub-service';

        const serviceTitle = getLocalizedText(s.name, language) || s.code;

        return {
          id: s.id,
          service: serviceTitle,
          category: parentCategoryName,
          bureau: getLocalizedText(s.organization?.name as any, language) || (typeof s.organization?.name === 'string' ? s.organization.name : 'Addis Ababa City Administration'),
          organizationId: selectedOrgFilter !== 'all' ? Number(selectedOrgFilter) : (s.organization_id || null),
          status: s.is_active ? (liveSteps.length > 0 ? 'Active' : 'Draft') : 'Disabled',
          updated: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Live',
          steps: liveSteps,
        };
      });
    }
    return [];
  }, [apiServices, selectedOrgFilter, language]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        q === '' ||
        item.service.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.bureau.toLowerCase().includes(q) ||
        item.steps.some((st) => (st.room || '').toLowerCase().includes(q) || (st.title || '').toLowerCase().includes(q));

      const hasSteps = item.steps.length > 0;
      const matchFilter =
        routeFilter === 'all' ||
        (routeFilter === 'configured' ? hasSteps : !hasSteps);

      return matchSearch && matchFilter;
    });
  }, [items, search, routeFilter]);

  const totalStepsCount = items.reduce((sum, item) => sum + item.steps.length, 0);
  const configuredCount = items.filter((i) => i.steps.length > 0).length;
  const coverageRate = items.length > 0 ? Math.round((configuredCount / items.length) * 100) : 0;

  const handleEditRoute = (route: RouteItem) => {
    portal.setModal({
      kind: 'route',
      route,
      onSave: async (steps: RouteStep[], organizationId?: number | null) => {
        try {
          const cleanOrgId =
            organizationId && organizationId !== 0 && String(organizationId) !== 'all'
              ? Number(organizationId)
              : null;

          const nonBlankSteps = steps.filter(
            (s) =>
              (s.room && s.room.trim()) ||
              (s.title && s.title.trim()) ||
              (s.detail && s.detail.trim())
          );

          await syncStepsTrigger({
            serviceId: route.id,
            organization_id: cleanOrgId,
            steps: nonBlankSteps.map((s, idx) => ({
              step_number: idx + 1,
              title: s.title?.trim() || s.room?.trim() || `Step ${idx + 1}`,
              instruction: s.detail?.trim() || '',
              room_number: s.room?.trim() || `Room ${idx + 1}`,
              floor: s.floor?.trim() || 'Ground Floor',
              building: s.building?.trim() || '',
              department_name: s.department?.trim() || '',
              responsible_title: '',
              estimated_duration_minutes: 10,
              is_active: true,
            })),
          }).unwrap();
          portal.setModal(null);
          await refetch();
        } catch (err: any) {
          window.alert(err?.data?.message || 'Failed to update service room steps.');
          throw err;
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1.5 w-6 rounded-full bg-[#efbd58]" />
            <span className="text-[11px] font-bold tracking-widest text-[#064552] uppercase">
              {t('routes.eyebrow')}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t('routes.title')}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t('routes.subtitle')}
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#064552]">
            <MapPin size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {items.length}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('routes.totalRoutes')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <Navigation size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {totalStepsCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('routes.configuredRoutes')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {coverageRate}%
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('routes.coverage')} ({configuredCount})
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
            <Building2 size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {organizations.length}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('routes.branchOffices', 'Branch Offices')}
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
                {t('routes.directoryTitle', 'Service Navigation Directory')}
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                {filtered.length} {t('common.of', 'of')} {items.length}
              </span>
            </div>

            {/* Branch Scope Dropdown */}
            {organizations.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <Filter size={14} className="text-slate-400" />
                <span className="text-slate-500 font-medium">{t('common.branchScope', 'Branch scope:')}</span>
                <select
                  value={selectedOrgFilter}
                  onChange={(e) => setSelectedOrgFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#064552]"
                >
                  <option value="all">{t('routes.allBranches', 'All participating branches')}</option>
                  <optgroup label="Sub-cities">
                    {subcitiesList.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Central Bureaus">
                    {bureausList.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('routes.searchPlaceholder', 'Search service, room number, floor, bureau...')}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#064552] transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/70 text-xs font-semibold self-end sm:self-auto">
              {(['all', 'configured', 'pending'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRouteFilter(mode)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    routeFilter === mode
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode === 'all'
                    ? t('routes.allStatuses', 'All services')
                    : mode === 'configured'
                    ? t('routes.configuredOnly', 'Configured steps')
                    : t('routes.unconfiguredOnly', 'Unconfigured')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              {t('common.loading', 'Loading navigation routes...')}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center max-w-sm mx-auto">
              <MapPin size={36} className="mx-auto text-slate-300 mb-2" />
              <h3 className="text-sm font-bold text-slate-700">{t('routes.emptyNotice', 'No routes found')}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {search
                  ? `No routes match your search "${search}".`
                  : 'All citizen services will appear here for room-by-room step configuration.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((route) => {
                const hasSteps = route.steps.length > 0;

                return (
                  <div
                    key={route.id}
                    className="border border-slate-200/80 rounded-xl p-4 bg-white hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#064552] flex-shrink-0 mt-0.5">
                        <MapPin size={20} className="stroke-[2.2]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-[10px] font-semibold tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            SVC-{route.id}
                          </span>

                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {route.category}
                          </span>

                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                              hasSteps
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            }`}
                          >
                            {hasSteps ? `${route.steps.length} Steps Defined` : 'Needs Setup'}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 leading-snug tracking-tight">
                          {route.service}
                        </h3>

                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <Building2 size={13} className="text-slate-400" />
                            <span>{route.bureau}</span>
                          </span>

                          {hasSteps && (
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                              {route.steps.map((s) => s.room).join(' → ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditRoute(route)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-[#064552] hover:text-white transition-colors"
                      >
                        <Pencil size={13} />
                        <span>{hasSteps ? 'Edit route' : 'Configure steps'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutesPage;

