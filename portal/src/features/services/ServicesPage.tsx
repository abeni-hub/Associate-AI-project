import React, { useMemo, useState, useEffect } from 'react';
import {
  Folder,
  FileText,
  Building2,
  CheckCircle2,
  Search,
  Plus,
  ChevronsUpDown,
  Filter,
} from 'lucide-react';
import { usePortal } from '../../context';
import { usePermissions } from '../../hooks/usePermissions';
import { useLanguage } from '../../i18n/i18nContext';
import { getLocalizedText } from '../../i18n/utils/getLocalized';
import { ServiceEditorModal } from './components/ServiceEditorModal';
import { ServiceRow } from './components/ServiceRow';
import type { RouteStep } from '../../types/portal.types';
import {
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useSyncServiceDocumentsMutation,
  useSyncServiceOrganizationsMutation,
  useSyncServiceStepsMutation,
} from '../../services/servicesApi';
import type { ServiceListItem } from '../../services/servicesApi';
import { useGetOrganizationsQuery } from '../../services/organizationsApi';

interface MasterTreeNode extends ServiceListItem {
  children: ServiceListItem[];
}

export const ServicesPage: React.FC = () => {
  const portal = usePortal();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const { language, t } = useLanguage();

  const [serviceFilter, setServiceFilter] = useState<'All' | 'Published' | 'Drafts'>('All');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('all');
  const [expandedMasterIds, setExpandedMasterIds] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [localSearch, setLocalSearch] = useState('');

  // Build query params based on selected organization filter
  const queryParams = useMemo(() => {
    const params: { organization_id?: number; per_page: number } = {
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

  const [createServiceTrigger, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateServiceTrigger, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const [deleteServiceTrigger] = useDeleteServiceMutation();
  const [syncDocsTrigger] = useSyncServiceDocumentsMutation();
  const [syncOrgsTrigger] = useSyncServiceOrganizationsMutation();
  const [syncStepsTrigger] = useSyncServiceStepsMutation();

  // Split organizations into sub-cities and bureaus
  const { subcitiesList, bureausList } = useMemo(() => {
    const subcities: typeof organizations = [];
    const bureaus: typeof organizations = [];
    organizations.forEach((org) => {
      const orgNameStr = (getLocalizedText(org.name, 'en') || (typeof org.name === 'string' ? org.name : '')).toLowerCase();
      const typeCode = String(org.type?.code || '').toLowerCase();
      const typeNameStr = (getLocalizedText(org.type?.name, 'en') || (typeof org.type?.name === 'string' ? org.type?.name : '')).toLowerCase();
      const isSubcity =
        typeCode === 'sub_city' ||
        typeCode === 'subcity' ||
        orgNameStr.includes('sub-city') ||
        orgNameStr.includes('subcity') ||
        typeNameStr.includes('sub-city') ||
        typeNameStr.includes('subcity');
      if (isSubcity) {
        subcities.push(org);
      } else {
        bureaus.push(org);
      }
    });
    return { subcitiesList: subcities, bureausList: bureaus };
  }, [organizations]);

  // Construct hierarchical Master -> Subservices tree
  const masterTreeNodes: MasterTreeNode[] = useMemo(() => {
    if (!apiServices?.data) return [];

    const rawList = apiServices.data;
    const masters = rawList.filter((s) => s.is_master || !s.parent_id);
    const subservices = rawList.filter((s) => !s.is_master && s.parent_id);

    const result: MasterTreeNode[] = masters.map((master) => {
      const directChildren =
        master.subservices && master.subservices.length > 0
          ? master.subservices
          : subservices.filter((sub) => sub.parent_id === master.id);

      return {
        ...master,
        children: directChildren,
      };
    });

    // Check for orphan subservices
    const masterIds = new Set(masters.map((m) => m.id));
    const orphanSubservices = subservices.filter(
      (sub) => sub.parent_id && !masterIds.has(sub.parent_id)
    );

    if (orphanSubservices.length > 0) {
      result.push({
        id: -999,
        name: 'General & Standalone Citizen Services',
        code: 'GEN-SERVICES',
        description: 'Citizen services without an assigned master category.',
        fee_amount: 0,
        fee_currency: 'ETB',
        estimated_duration_minutes: 30,
        is_active: true,
        is_master: true,
        children: orphanSubservices,
      });
    }

    return result;
  }, [apiServices?.data]);

  // Auto-expand matching master nodes when searching
  useEffect(() => {
    const q = localSearch.trim().toLowerCase();
    if (q && masterTreeNodes.length > 0) {
      const matchingIds = masterTreeNodes
        .filter((m) => {
          const mTitle = (getLocalizedText(m.name, language) || '').toLowerCase();
          const matchMaster = mTitle.includes(q) || m.code.toLowerCase().includes(q);
          const matchChild = m.children.some((c) => {
            const cTitle = (getLocalizedText(c.name, language) || '').toLowerCase();
            return cTitle.includes(q) || c.code.toLowerCase().includes(q);
          });
          return matchMaster || matchChild;
        })
        .map((m) => m.id);
      setExpandedMasterIds(new Set(matchingIds));
    }
  }, [localSearch, masterTreeNodes, language]);

  // Filter tree nodes
  const filteredTreeNodes = useMemo(() => {
    const q = localSearch.trim().toLowerCase();

    return masterTreeNodes
      .map((master) => {
        const matchingChildren = master.children.filter((child) => {
          const statusMatch =
            serviceFilter === 'All' ||
            (serviceFilter === 'Published' ? child.is_active : !child.is_active);

          if (!statusMatch) return false;
          if (!q) return true;

          const title = (getLocalizedText(child.name, language) || '').toLowerCase();
          const desc = (getLocalizedText(child.description, language) || '').toLowerCase();
          const code = child.code.toLowerCase();

          return title.includes(q) || code.includes(q) || desc.includes(q);
        });

        const masterStatusMatch =
          serviceFilter === 'All' ||
          (serviceFilter === 'Published' ? master.is_active : !master.is_active);

        const mTitle = (getLocalizedText(master.name, language) || '').toLowerCase();
        const mDesc = (getLocalizedText(master.description, language) || '').toLowerCase();
        const masterSearchMatch =
          !q ||
          mTitle.includes(q) ||
          master.code.toLowerCase().includes(q) ||
          mDesc.includes(q);

        const shouldIncludeMaster =
          (masterSearchMatch && masterStatusMatch) || matchingChildren.length > 0;

        if (!shouldIncludeMaster) return null;

        return {
          ...master,
          children: matchingChildren,
        };
      })
      .filter((m): m is MasterTreeNode => m !== null);
  }, [masterTreeNodes, localSearch, serviceFilter, language]);

  // Statistics
  const stats = useMemo(() => {
    const allServices = apiServices?.data || [];
    const masters = allServices.filter((s) => s.is_master || !s.parent_id);
    const subservices = allServices.filter((s) => !s.is_master && s.parent_id);

    const uniqueOrgIds = new Set<number>();
    allServices.forEach((s) => {
      if (s.organization_id) uniqueOrgIds.add(s.organization_id);
      if (s.offering_organizations) {
        s.offering_organizations.forEach((o) => uniqueOrgIds.add(o.id));
      }
    });

    const activeCount = allServices.filter((s) => s.is_active).length;
    const activeRate =
      allServices.length > 0
        ? Math.round((activeCount / allServices.length) * 100)
        : 100;

    return {
      masterCount: masters.length,
      subserviceCount: subservices.length,
      officesCount: Math.max(uniqueOrgIds.size, organizations.length),
      activeRate,
    };
  }, [apiServices?.data, organizations]);

  const toggleMasterExpand = (id: number) => {
    setExpandedMasterIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleExpandAll = () => {
    if (expandedMasterIds.size > 0) {
      setExpandedMasterIds(new Set());
    } else {
      const allMasterIds = masterTreeNodes.map((m) => m.id);
      setExpandedMasterIds(new Set(allMasterIds));
    }
  };

  const handleAddMaster = () => {
    setSelectedService({
      is_master: true,
      parent_id: null,
    });
    setIsModalOpen(true);
  };

  const handleAddSubservice = (master: MasterTreeNode) => {
    setSelectedService({
      is_master: false,
      parent_id: master.id,
      parent: { id: master.id, name: master.name, code: master.code },
      organization_id: master.organization_id || master.organization?.id || null,
    });
    setIsModalOpen(true);
  };

  const handleEditService = (service: ServiceListItem) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleSaveService = async (payload: any) => {
    try {
      let targetId = payload.id;
      if (targetId) {
        await updateServiceTrigger(payload).unwrap();
      } else {
        const res = await createServiceTrigger(payload).unwrap();
        targetId = res?.data?.id;
      }

      if (targetId) {
        if (!payload.is_master && payload.documents && Array.isArray(payload.documents)) {
          await syncDocsTrigger({
            serviceId: targetId,
            documents: payload.documents,
          }).unwrap();
        }
        if (
          payload.offering_organizations &&
          Array.isArray(payload.offering_organizations) &&
          payload.offering_organizations.length > 0
        ) {
          await syncOrgsTrigger({
            serviceId: targetId,
            organizations: payload.offering_organizations.map((orgId: number) => ({
              organization_id: orgId,
              is_available: true,
            })),
          }).unwrap();
        }
      }

      setIsModalOpen(false);
      setSelectedService(null);
      await refetch();
    } catch (err: any) {
      const errDetails = err?.data?.errors
        ? Object.entries(err.data.errors)
            .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
            .join('\n')
        : '';
      const fullMsg = errDetails
        ? `${err?.data?.message || 'Validation failed'}:\n${errDetails}`
        : (err?.data?.message || err?.message || 'Failed to save service standard.');
      window.alert(fullMsg);
    }
  };

  const handleTogglePublish = async (id: number) => {
    const allServices = apiServices?.data || [];
    const target = allServices.find((i) => i.id === id);
    if (target) {
      const nextState = !target.is_active;
      try {
        await updateServiceTrigger({
          id,
          is_active: nextState,
        }).unwrap();
        await refetch();
      } catch (err: any) {
        window.alert(err?.data?.message || 'Failed to update service active status.');
      }
    }
  };

  const handleDeleteService = async (service: ServiceListItem) => {
    const title = getLocalizedText(service.name, language) || service.code;
    if (window.confirm(`Are you sure you want to delete service "${title}"?`)) {
      try {
        await deleteServiceTrigger(service.id).unwrap();
        await refetch();
      } catch (err: any) {
        window.alert(err?.data?.message || 'Failed to delete service.');
      }
    }
  };

  /* Room route handler commented out
  const handleOpenRoute = (service: ServiceListItem) => {
    ...
  };
  */

  const canCreate = isSuperAdmin || hasPermission('services.create') || hasPermission('services.manage');
  const canUpdate = isSuperAdmin || hasPermission('services.update') || hasPermission('services.manage');
  const canDelete = isSuperAdmin || hasPermission('services.delete') || hasPermission('services.manage');

  const totalCatalogCount = masterTreeNodes.reduce(
    (sum, m) => sum + 1 + (m.children?.length || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span />
            SERVICE ARCHITECTURE & CATALOG
          </div>
          <h1>{t('services.title')}</h1>
          <p>{t('services.subtitle')}</p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={handleAddMaster}
            className="primary-button"
          >
            <Plus size={16} />
            <span>{t('services.createButton', 'Create service')}</span>
          </button>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#064552]">
            <Folder size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {stats.masterCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('services.masterCategories', 'Master Categories')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <FileText size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {stats.subserviceCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('services.citizenServices', 'Citizen Services')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
            <Building2 size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {stats.officesCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('services.deliveryOffices', 'Delivery Offices')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {stats.activeRate}%
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('services.publishedActive', 'Published & Active')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        {/* Card Header Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {t('services.catalogDirectory', 'Service Catalog Directory')}
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                {totalCatalogCount} {t('common.total', 'total')}
              </span>
            </div>

            {/* Scope Filter for SuperAdmins */}
            {isSuperAdmin && organizations.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <Filter size={14} className="text-slate-400" />
                <span className="text-slate-500 font-medium">{t('services.branchScope', 'Branch scope:')}</span>
                <select
                  value={selectedOrgFilter}
                  onChange={(e) => setSelectedOrgFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#064552]"
                >
                  <option value="all">{t('services.allBranches', 'All administrative branches')}</option>
                  <optgroup label={t('services.subcitiesGroup', 'Sub-cities')}>
                    {subcitiesList.map((org) => (
                      <option key={org.id} value={org.id}>
                        {getLocalizedText(org.name, language) || org.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={t('services.centralBureausGroup', 'Central Bureaus')}>
                    {bureausList.map((org) => (
                      <option key={org.id} value={org.id}>
                        {getLocalizedText(org.name, language) || org.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            )}
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder={t('services.searchPlaceholder', 'Search services, codes, descriptions...')}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#064552] focus:ring-2 focus:ring-[#064552]/10 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Filter Tabs */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/70 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setServiceFilter('All')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    serviceFilter === 'All'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('services.filterAll', 'All services')}
                </button>
                <button
                  type="button"
                  onClick={() => setServiceFilter('Published')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    serviceFilter === 'Published'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('services.published', 'Published')}
                </button>
                <button
                  type="button"
                  onClick={() => setServiceFilter('Drafts')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    serviceFilter === 'Drafts'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('services.drafts', 'Drafts')}
                </button>
              </div>

              {/* Expand / Collapse Toggle */}
              <button
                type="button"
                onClick={handleToggleExpandAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 border border-slate-200/70 text-slate-700 hover:bg-slate-200 transition-colors"
                title={expandedMasterIds.size > 0 ? 'Collapse all' : 'Expand all'}
              >
                <ChevronsUpDown size={14} />
                <span>{expandedMasterIds.size > 0 ? t('common.collapse', 'Collapse') : t('common.expandAll', 'Expand all')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tree Content */}
        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              Loading service standards...
            </div>
          ) : filteredTreeNodes.length === 0 ? (
            <div className="py-16 text-center max-w-sm mx-auto">
              <Folder size={36} className="mx-auto text-slate-300 mb-2" />
              <h3 className="text-sm font-bold text-slate-700">No services found</h3>
              <p className="text-xs text-slate-500 mt-1">
                {localSearch
                  ? `No services match your search "${localSearch}". Try different keywords.`
                  : 'Start cataloging public citizen services and administrative standards.'}
              </p>
              {canCreate && !localSearch && (
                <button
                  type="button"
                  onClick={handleAddMaster}
                  className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#064552] text-white hover:bg-[#085a6a]"
                >
                  <Plus size={14} />
                  <span>{t('services.createFirstService', 'Create first service')}</span>
                </button>
              )}
            </div>
          ) : (
            <div>
              {filteredTreeNodes.map((master) => (
                <ServiceRow
                  key={master.id}
                  service={master}
                  isMaster={true}
                  isExpanded={expandedMasterIds.has(master.id)}
                  onToggleExpand={() => toggleMasterExpand(master.id)}
                  onEdit={handleEditService}
                  onDelete={handleDeleteService}
                  onTogglePublish={handleTogglePublish}
                  onAddSubservice={handleAddSubservice}
                  /* onOpenRoute={handleOpenRoute} - Room route navigation commented out */
                  canEdit={canUpdate}
                  canDelete={canDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3-Step Wizard Modal */}
      <ServiceEditorModal
        isOpen={isModalOpen}
        service={selectedService}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedService(null);
        }}
        onSave={handleSaveService}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
};

export default ServicesPage;

