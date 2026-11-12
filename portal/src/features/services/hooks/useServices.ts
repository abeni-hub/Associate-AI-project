import { useMemo, useState } from 'react';
import { usePortal, usePermissions } from '../../shared';
import type { RouteStep, ServiceItem } from '../../../types/portal.types';
import {
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useSyncServiceDocumentsMutation,
  useSyncServiceOrganizationsMutation,
  useSyncServiceStepsMutation,
  type ServiceListItem,
} from '../api/servicesApi';
import { useGetOrganizationsQuery } from '../../organizations';

export interface UseServicesProps {
  items?: (ServiceItem & { raw?: any })[];
  onAdd?: () => void;
  onEdit?: (item: ServiceItem & { raw?: any }) => void;
  search?: string;
  setSearch?: (s: string) => void;
  onTogglePublish?: (id: number) => void;
}

export interface MasterTreeNode extends ServiceListItem {
  children: ServiceListItem[];
}

export const useServices = ({
  items: propItems,
  onAdd: propOnAdd,
  onEdit: propOnEdit,
  search: propSearch,
  setSearch: propSetSearch,
  onTogglePublish: propOnTogglePublish,
}: UseServicesProps = {}) => {
  const portal = usePortal();
  const { hasPermission, isSuperAdmin, authUser } = usePermissions();

  const [serviceFilter, setServiceFilter] = useState<'All services' | 'Published' | 'Drafts'>('All services');
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('all');
  const [expandedMasterIds, setExpandedMasterIds] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const search = propSearch !== undefined ? propSearch : portal.search;
  const setSearch = propSetSearch || portal.setSearch;

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

  const { subcitiesList, bureausList } = useMemo(() => {
    const subcities: typeof organizations = [];
    const bureaus: typeof organizations = [];
    organizations.forEach((org) => {
      const isSubcity =
        org.type?.code === 'sub_city' ||
        org.name.toLowerCase().includes('sub-city');
      if (isSubcity) {
        subcities.push(org);
      } else {
        bureaus.push(org);
      }
    });
    return { subcitiesList: subcities, bureausList: bureaus };
  }, [organizations]);

  const masterTreeNodes: MasterTreeNode[] = useMemo(() => {
    const services = apiServices?.data || [];
    const masters = services.filter((s) => s.is_master || !s.parent_id);
    const subservices = services.filter((s) => !s.is_master && s.parent_id);

    return masters.map((master) => {
      const children = subservices.filter((sub) => sub.parent_id === master.id);
      return {
        ...master,
        children,
      };
    });
  }, [apiServices]);

  const canCreate = hasPermission('services.create') || isSuperAdmin;
  const canUpdate = hasPermission('services.update') || isSuperAdmin;
  const canDelete = hasPermission('services.delete') || isSuperAdmin;

  const toggleExpand = (masterId: number) => {
    setExpandedMasterIds((prev) => {
      const next = new Set(prev);
      if (next.has(masterId)) {
        next.delete(masterId);
      } else {
        next.add(masterId);
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

  const onAdd =
    propOnAdd ||
    (() => {
      setSelectedService(null);
      setIsModalOpen(true);
    });

  const onAddSubservice = (masterItem: ServiceListItem) => {
    setSelectedService({
      parent_id: masterItem.id,
      is_master: false,
      title: '',
      title_am: '',
      category: masterItem.title || 'General Public Service',
      requirements: [],
      steps: [],
      organizations: masterItem.organizations || [],
    });
    setIsModalOpen(true);
  };

  const onEdit =
    propOnEdit ||
    ((item: any) => {
      setSelectedService(item.raw || item);
      setIsModalOpen(true);
    });

  const handleDelete = async (id: number, title?: string) => {
    if (!canDelete) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${title || 'this service'}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      await deleteServiceTrigger(id).unwrap();
      await refetch();
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to delete service.');
    }
  };

  const onTogglePublish =
    propOnTogglePublish ||
    (async (id: number) => {
      if (!canUpdate) return;
      const target = (apiServices?.data || []).find((s) => s.id === id);
      if (!target) return;

      setTogglingId(id);
      try {
        await updateServiceTrigger({
          id,
          body: { is_active: !target.is_active },
        }).unwrap();
        await refetch();
      } catch (err: any) {
        alert(err?.data?.message || err?.message || 'Failed to update publication status.');
      } finally {
        setTogglingId(null);
      }
    });

  const handleOpenRoute = (service: any) => {
    const liveSteps: RouteStep[] =
      service.steps && service.steps.length > 0
        ? service.steps.map((step: any) => ({
            id: step.id,
            room: step.room_number || `Room ${step.step_number}`,
            title: step.title,
            detail: step.instruction,
            floor: step.floor,
            building: step.building,
            department: step.department_name,
          }))
        : [];

    portal.setModal({
      kind: 'route',
      route: {
        id: service.id,
        service: service.name || service.title,
        category: service.parent?.name || (service.is_master ? 'Master Catalog' : 'Sub-service'),
        bureau: service.organization?.name || 'Addis Ababa City Administration',
        organizationId:
          selectedOrgFilter !== 'all'
            ? Number(selectedOrgFilter)
            : service.organization_id || null,
        status: service.is_active ? (liveSteps.length > 0 ? 'Active' : 'Draft') : 'Disabled',
        updated: service.created_at ? new Date(service.created_at).toLocaleDateString() : 'Live',
        steps: liveSteps,
      },
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
            serviceId: service.id,
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
          const errDetails = err?.data?.errors
            ? Object.entries(err.data.errors)
                .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
                .join('\n')
            : '';
          alert(
            `Failed to save room route to server:\n${err?.data?.message || err?.message || 'Server error'}${errDetails ? '\n\n' + errDetails : ''}`
          );
        }
      },
    } as any);
  };

  const stats = useMemo(() => {
    const list = apiServices?.data || [];
    const masterCount = list.filter((s) => s.is_master || !s.parent_id).length;
    const subserviceCount = list.filter((s) => !s.is_master && s.parent_id).length;
    const activeCount = list.filter((s) => s.is_active).length;
    const officesCount = organizations.length;
    return {
      total: list.length,
      masterCount,
      subserviceCount,
      activeRate: list.length > 0 ? Math.round((activeCount / list.length) * 100) : 0,
      officesCount,
    };
  }, [apiServices, organizations]);

  const filteredTreeNodes = useMemo(() => {
    const q = (search || '').toLowerCase().trim();

    return masterTreeNodes
      .map((master) => {
        const matchesMasterText =
          !q ||
          master.title.toLowerCase().includes(q) ||
          (master.title_am && master.title_am.toLowerCase().includes(q)) ||
          (master.code && master.code.toLowerCase().includes(q)) ||
          (master.description && master.description.toLowerCase().includes(q));

        const filteredChildren = master.children.filter((sub) => {
          if (serviceFilter === 'Published' && !sub.is_active) return false;
          if (serviceFilter === 'Drafts' && sub.is_active) return false;

          if (!q) return true;
          return (
            sub.title.toLowerCase().includes(q) ||
            (sub.title_am && sub.title_am.toLowerCase().includes(q)) ||
            (sub.code && sub.code.toLowerCase().includes(q)) ||
            (sub.description && sub.description.toLowerCase().includes(q))
          );
        });

        const masterMatchesStatus =
          serviceFilter === 'All services' ||
          (serviceFilter === 'Published' && master.is_active) ||
          (serviceFilter === 'Drafts' && !master.is_active);

        if (matchesMasterText && masterMatchesStatus) {
          return {
            ...master,
            children: filteredChildren,
          };
        }

        if (filteredChildren.length > 0) {
          return {
            ...master,
            children: filteredChildren,
          };
        }

        return null;
      })
      .filter((node): node is MasterTreeNode => node !== null);
  }, [masterTreeNodes, search, serviceFilter]);

  const items = useMemo(() => {
    if (propItems) return propItems;
    if (!apiServices?.data) return [];

    let list = apiServices.data;
    if (serviceFilter === 'Published') {
      list = list.filter((s) => s.is_active);
    } else if (serviceFilter === 'Drafts') {
      list = list.filter((s) => !s.is_active);
    }

    return list.map((raw) => ({
      id: raw.id,
      name: raw.title,
      nameAm: raw.title_am,
      bureau: raw.organizations?.[0]?.name || (raw.is_master ? 'Master Category' : 'General Public Service'),
      category: raw.is_master ? 'Master Service' : 'Citizen Subservice',
      completion: raw.is_active ? 100 : 45,
      status: raw.is_active ? 'Published' : 'Draft',
      updated: raw.updated_at ? new Date(raw.updated_at).toLocaleDateString() : 'Recently',
      raw,
    }));
  }, [propItems, apiServices, serviceFilter]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.nameAm && item.nameAm.toLowerCase().includes(q)) ||
        item.bureau.toLowerCase().includes(q)
    );
  }, [items, search]);

  const handleSaveModal = async (formData: any) => {
    const isEditing = Boolean(selectedService?.id);

    try {
      let savedService: ServiceListItem;

      if (isEditing) {
        const res = await updateServiceTrigger({
          id: selectedService.id,
          body: {
            title: formData.title,
            title_am: formData.title_am,
            code: formData.code,
            description: formData.description,
            is_master: formData.is_master,
            parent_id: formData.parent_id,
            is_active: formData.is_active,
          },
        }).unwrap();
        savedService = res.data;
      } else {
        const res = await createServiceTrigger({
          title: formData.title,
          title_am: formData.title_am,
          code: formData.code,
          description: formData.description,
          is_master: formData.is_master,
          parent_id: formData.parent_id,
          is_active: formData.is_active ?? true,
        }).unwrap();
        savedService = res.data;
      }

      const targetId = savedService.id;

      if (Array.isArray(formData.documents)) {
        await syncDocsTrigger({
          serviceId: targetId,
          documents: formData.documents.map((d: any) => ({
            document_id: d.document_id || d.id,
            is_mandatory: d.is_mandatory !== false,
          })),
        }).unwrap();
      }

      if (Array.isArray(formData.organization_ids)) {
        await syncOrgsTrigger({
          serviceId: targetId,
          organization_ids: formData.organization_ids,
        }).unwrap();
      }

      if (Array.isArray(formData.steps) && formData.steps.length > 0) {
        await syncStepsTrigger({
          serviceId: targetId,
          steps: formData.steps.map((st: any, idx: number) => ({
            step_number: idx + 1,
            title: st.title || `Step ${idx + 1}`,
            instruction: st.instruction || st.detail || '',
            room_number: st.room_number || st.room || null,
            floor: st.floor || 'Ground Floor',
            building: st.building || 'Main Block',
            department_name: st.department_name || st.department || 'Public Desk',
            is_active: true,
          })),
        }).unwrap();
      }

      await refetch();
      setIsModalOpen(false);
      setSelectedService(null);
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to save service.');
    }
  };

  return {
    portal,
    authUser,
    isSuperAdmin,
    canCreate,
    canUpdate,
    canDelete,
    stats,
    search,
    setSearch,
    serviceFilter,
    setServiceFilter,
    viewMode,
    setViewMode,
    selectedOrgFilter,
    setSelectedOrgFilter,
    subcitiesList,
    bureausList,
    expandedMasterIds,
    toggleExpand,
    handleToggleExpandAll,
    filteredTreeNodes,
    filteredItems,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    selectedService,
    setSelectedService,
    isCreating,
    isUpdating,
    togglingId,
    onAdd,
    onAddSubservice,
    onEdit,
    handleDelete,
    onTogglePublish,
    handleOpenRoute,
    handleSaveModal,
    apiServices,
    refetch,
  };
};

export default useServices;
