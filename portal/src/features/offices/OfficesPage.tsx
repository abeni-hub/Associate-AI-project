import React, { useMemo, useState } from 'react';
import {
  Building2,
  Landmark,
  MapPin,
  Network,
  Plus,
  Search,
  Filter,
  List,
  GitFork,
  Pencil,
  Trash2,
  Phone,
  Mail,
  FileText,
} from 'lucide-react';
import { usePortal } from '../../context';
import { usePermissions } from '../../hooks/usePermissions';
import { useLanguage } from '../../i18n/i18nContext';
import { getLocalizedText } from '../../i18n/utils/getLocalized';
import { OfficeModal } from '../../components/offices/OfficeModal';
import { OfficeHierarchyTree } from '../../components/offices/OfficeHierarchyTree';
import { getOfficeParentSummary } from '../../components/offices/officeHierarchy';
import type { OfficeItem, OfficeType } from '../../types/portal.types';
import {
  useGetOrganizationsQuery,
  useGetOrganizationTypesQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
} from '../../services/organizationsApi';

export const OfficesPage: React.FC = () => {
  const portal = usePortal();
  const { language, t } = useLanguage();
  const { hasPermission, canAccessOrganization, isSuperAdmin } = usePermissions();

  const [search, setSearch] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('all');
  const [selectedView, setSelectedView] = useState<'list' | 'tree'>('list');
  const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
  const [selectedOfficeForEdit, setSelectedOfficeForEdit] = useState<OfficeItem | null>(null);

  const { data: apiOrgs, isLoading: orgsLoading, refetch: refetchOrgs } = useGetOrganizationsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: apiOrgTypes } = useGetOrganizationTypesQuery();

  const [createOrgTrigger, { isLoading: isCreatingOrg }] = useCreateOrganizationMutation();
  const [updateOrgTrigger, { isLoading: isUpdatingOrg }] = useUpdateOrganizationMutation();
  const [deleteOrgTrigger] = useDeleteOrganizationMutation();

  const officeTypes: OfficeType[] = useMemo(() => {
    if (apiOrgTypes?.data) {
      return apiOrgTypes.data.map((t) => ({
        id: t.id,
        name: getLocalizedText(t.name, language) || t.code,
        level: t.level,
        can_be_root: t.can_be_root,
        description: getLocalizedText(t.description, language) || '',
      }));
    }
    return [];
  }, [apiOrgTypes, language]);

  const offices: OfficeItem[] = useMemo(() => {
    const typesList = apiOrgTypes?.data || [];
    const typesById = new Map<number, any>();
    typesList.forEach((t) => typesById.set(Number(t.id), t));

    if (apiOrgs?.data) {
      return apiOrgs.data.map((o: any) => {
        const typeFromRef = o.type || typesById.get(Number(o.organization_type_id || 0));
        const resolvedTypeId = Number(typeFromRef?.id || o.organization_type_id || (typesList[0]?.id ?? 1));
        const typeRawName = typeFromRef?.name ?? (resolvedTypeId === 1 ? 'Root Tier' : 'Office');
        const resolvedTypeName = getLocalizedText(typeRawName, language) || (resolvedTypeId === 1 ? 'Root Tier' : 'Office');

        return {
          id: o.id,
          name: getLocalizedText(o.name, language) || (typeof o.name === 'string' ? o.name : '') || 'Unnamed Office',
          code: o.code,
          logo: o.logo || null,
          typeId: resolvedTypeId,
          typeName: resolvedTypeName,
          typeCode: typeFromRef?.code || o.code,
          parentId: o.parent?.id ?? o.parent_organization_id ?? null,
          parentName: getLocalizedText(o.parent?.name, language) || (typeof o.parent?.name === 'string' ? o.parent.name : null),
          admin: o.email || o.phone || 'Administrative Desk',
          email: o.email || '',
          phone: o.phone || '',
          address: getLocalizedText(o.address, language) || (typeof o.address === 'string' ? o.address : ''),
          status: o.status === 'active' ? 'Active' : 'Inactive',
          services: o.services_count ?? 0,
          completion: 100,
          updated: 'Recently',
        };
      });
    }
    return [];
  }, [apiOrgs, apiOrgTypes, language]);

  const canCreate = isSuperAdmin || hasPermission('organizations.create') || hasPermission('organizations.view');
  const canUpdate = isSuperAdmin || hasPermission('organizations.update') || hasPermission('organizations.view');
  const canDelete = isSuperAdmin || hasPermission('organizations.delete');

  // Scope filter: Super Admin views all; hierarchy users view permitted hierarchy
  const scopedOffices = useMemo(() => {
    if (isSuperAdmin) return offices;
    return offices.filter((office: OfficeItem) => {
      const orgId = Number(office.id);
      return canAccessOrganization(orgId) || canAccessOrganization(office.parentId);
    });
  }, [offices, isSuperAdmin, canAccessOrganization]);

  const filtered = scopedOffices.filter((item: OfficeItem) => {
    const type = officeTypes.find((t: OfficeType) => t.id === item.typeId);
    const parentSummary = getOfficeParentSummary(item, offices, officeTypes);
    const matchesType = selectedTypeId === 'all' || item.typeId === Number(selectedTypeId);
    const classification = String(item.typeName || type?.name || '');
    const query = `${item.name} ${item.code || ''} ${item.email || ''} ${item.phone || ''} ${item.status} ${classification} ${parentSummary}`.toLowerCase();
    return matchesType && query.includes(search.toLowerCase());
  });

  const subcityCount = scopedOffices.filter(
    (o) => o.typeId === 1 || String(o.typeName || '').toLowerCase().includes('sub-city') || String(o.typeName || '').toLowerCase().includes('subcity')
  ).length;

  const bureauCount = scopedOffices.filter(
    (o) => o.typeId === 3 || String(o.typeName || '').toLowerCase().includes('bureau')
  ).length;

  const woredaCount = scopedOffices.filter(
    (o) => o.typeId === 2 || String(o.typeName || '').toLowerCase().includes('woreda')
  ).length;

  const handleOpenAdd = () => {
    setSelectedOfficeForEdit(null);
    setIsOfficeModalOpen(true);
  };

  const handleOpenEdit = (office: OfficeItem) => {
    setSelectedOfficeForEdit(office);
    setIsOfficeModalOpen(true);
  };

  const handleSaveOffice = async (payload: any) => {
    try {
      if (payload.id) {
        await updateOrgTrigger(payload).unwrap();
      } else {
        await createOrgTrigger(payload).unwrap();
      }
      setIsOfficeModalOpen(false);
      setSelectedOfficeForEdit(null);
      await refetchOrgs();
    } catch (err: any) {
      window.alert(err?.data?.message || 'Failed to save office.');
    }
  };

  const handleDeleteOffice = async (office: OfficeItem) => {
    if (window.confirm(`Are you sure you want to delete office "${office.name}"?`)) {
      try {
        await deleteOrgTrigger(office.id).unwrap();
        await refetchOrgs();
      } catch (err: any) {
        window.alert(err?.data?.message || 'Failed to delete office.');
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
            {t('offices.eyebrow')}
          </div>
          <h1>{t('offices.title')}</h1>
          <p>{t('offices.subtitle')}</p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="primary-button"
          >
            <Plus size={16} />
            <span>{t('offices.addOffice')}</span>
          </button>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#064552]">
            <Network size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {scopedOffices.length}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('offices.totalOffices', 'Total Offices')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <Building2 size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {subcityCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('offices.subcities', 'Sub-Cities')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700">
            <Landmark size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {bureauCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('offices.centralBureaus', 'Central Bureaus')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
            <MapPin size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {woredaCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('offices.woredasBranches', 'Woredas & Branches')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Directory Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('offices.searchPlaceholder', 'Search office name, code, email, location...')}
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#064552] transition-all"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <select
                value={selectedTypeId}
                onChange={(e) => setSelectedTypeId(e.target.value)}
                className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#064552]"
              >
                <option value="all">{t('offices.allOfficeTypes', 'All office types')}</option>
                {officeTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/70 text-xs font-semibold self-end md:self-auto">
            <button
              type="button"
              onClick={() => setSelectedView('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                selectedView === 'list'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List size={14} />
              <span>{t('common.listView', 'List view')}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedView('tree')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                selectedView === 'tree'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitFork size={14} />
              <span>{t('common.treeView', 'Hierarchy tree')}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          {orgsLoading ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              {t('common.loading', 'Loading administration directory...')}
            </div>
          ) : selectedView === 'tree' ? (
            <OfficeHierarchyTree
              offices={scopedOffices}
              officeTypes={officeTypes}
              onEditOffice={handleOpenEdit}
              canEdit={canUpdate}
            />
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center max-w-sm mx-auto">
              <Building2 size={36} className="mx-auto text-slate-300 mb-2" />
              <h3 className="text-sm font-bold text-slate-700">{t('offices.emptyNotice', 'No offices found')}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {search
                  ? `No offices match your search "${search}".`
                  : t('offices.emptyNoticeDesc', 'No public offices have been cataloged yet.')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filtered.map((office) => {
                const typeStr = String(office.typeName || '').toLowerCase();
                const isSubcity = typeStr.includes('sub-city') || typeStr.includes('subcity');
                const isBureau = typeStr.includes('bureau');

                return (
                  <div
                    key={office.id}
                    className="border border-slate-200/80 rounded-xl p-4 bg-white hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {office.code}
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSubcity
                                ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                : isBureau
                                ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {String(office.typeName || '')}
                          </span>

                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              office.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {office.status === 'Active' ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {canUpdate && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(office)}
                              className="p-1.5 text-slate-400 hover:text-[#064552] hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit office"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteOffice(office)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete office"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                        {office.name}
                      </h3>

                      {office.parentName && (
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <span className="text-slate-400">{t('offices.parentLabel', 'Parent:')}</span>
                          <span className="font-medium text-slate-700">{office.parentName}</span>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                        {office.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone size={12} className="text-slate-400 flex-shrink-0" />
                            <span>{office.phone}</span>
                          </div>
                        )}
                        {office.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail size={12} className="text-slate-400 flex-shrink-0" />
                            <span className="truncate">{office.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                        <FileText size={13} className="text-slate-400" />
                        <span>{office.services} {t('offices.delivered', 'services delivered')}</span>
                      </span>

                      <span className="text-[11px] text-slate-400">
                        {t('offices.adminTag', 'Addis Ababa Admin')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Office Modal */}
      {isOfficeModalOpen && (
        <OfficeModal
          isOpen={isOfficeModalOpen}
          office={selectedOfficeForEdit}
          officeTypes={officeTypes}
          offices={offices}
          onClose={() => {
            setIsOfficeModalOpen(false);
            setSelectedOfficeForEdit(null);
          }}
          onSave={handleSaveOffice}
          isLoading={isCreatingOrg || isUpdatingOrg}
        />
      )}
    </div>
  );
};

export default OfficesPage;

