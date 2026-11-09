import React, { useMemo, useState, useEffect } from 'react';
import { usePortal } from '../context';
import { usePermissions } from '../hooks/usePermissions';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import { SearchBox } from '../components/shared/SearchBox';
import { StatusPill } from '../components/shared/StatusPill';
import { ServiceModal } from '../components/services/ServiceModal';
import type { RouteStep, ServiceItem } from '../types/portal.types';
import {
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useSyncServiceDocumentsMutation,
  useSyncServiceOrganizationsMutation,
  useSyncServiceStepsMutation,
} from '../services/servicesApi';
import type { ServiceListItem } from '../services/servicesApi';
import { useGetOrganizationsQuery } from '../services/organizationsApi';

export interface ServicesPageProps {
  items?: (ServiceItem & { raw?: any })[];
  onAdd?: () => void;
  onEdit?: (item: ServiceItem & { raw?: any }) => void;
  search?: string;
  setSearch?: (s: string) => void;
  onTogglePublish?: (id: number) => void;
}

interface MasterTreeNode extends ServiceListItem {
  children: ServiceListItem[];
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  items: propItems,
  onAdd: propOnAdd,
  onEdit: propOnEdit,
  search: propSearch,
  setSearch: propSetSearch,
  onTogglePublish: propOnTogglePublish,
}) => {
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

  // Split organizations into sub-cities and bureaus for convenient filtering
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

  // Construct hierarchical Master -> Subservices tree
  const masterTreeNodes: MasterTreeNode[] = useMemo(() => {
    if (!apiServices?.data) return [];

    const rawList = apiServices.data;
    const masters = rawList.filter((s) => s.is_master || !s.parent_id);
    const subservices = rawList.filter((s) => !s.is_master && s.parent_id);

    const result: MasterTreeNode[] = masters.map((master) => {
      // Use eager-loaded subservices if available, otherwise match from list
      const directChildren =
        master.subservices && master.subservices.length > 0
          ? master.subservices
          : subservices.filter((sub) => sub.parent_id === master.id);

      return {
        ...master,
        children: directChildren,
      };
    });

    // Check for orphan subservices whose parent is not in the master list
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

  // Auto-expand matching master nodes when user is searching
  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (q && masterTreeNodes.length > 0) {
      const matchingIds = masterTreeNodes
        .filter((m) => {
          const matchMaster = m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q);
          const matchChild = m.children.some(
            (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
          );
          return matchMaster || matchChild;
        })
        .map((m) => m.id);
      setExpandedMasterIds(new Set(matchingIds));
    }
  }, [search, masterTreeNodes]);

  // Filter tree nodes according to live search text and published status
  const filteredTreeNodes = useMemo(() => {
    const q = search.trim().toLowerCase();

    return masterTreeNodes
      .map((master) => {
        const matchingChildren = master.children.filter((child) => {
          const statusMatch =
            serviceFilter === 'All services' ||
            (serviceFilter === 'Published' ? child.is_active : !child.is_active);

          if (!statusMatch) return false;
          if (!q) return true;

          const matchName = child.name.toLowerCase().includes(q);
          const matchCode = child.code.toLowerCase().includes(q);
          const matchDesc = (child.description || '').toLowerCase().includes(q);
          const matchDocs = (child.required_documents || []).some((d) =>
            d.name.toLowerCase().includes(q)
          );
          return matchName || matchCode || matchDesc || matchDocs;
        });

        const masterStatusMatch =
          serviceFilter === 'All services' ||
          (serviceFilter === 'Published' ? master.is_active : !master.is_active);

        const masterSearchMatch =
          !q ||
          master.name.toLowerCase().includes(q) ||
          master.code.toLowerCase().includes(q) ||
          (master.description || '').toLowerCase().includes(q);

        const shouldIncludeMaster =
          (masterSearchMatch && masterStatusMatch) || matchingChildren.length > 0;

        if (!shouldIncludeMaster) return null;

        return {
          ...master,
          children: matchingChildren,
        };
      })
      .filter((m): m is MasterTreeNode => m !== null);
  }, [masterTreeNodes, search, serviceFilter]);

  // Flat items mapping for fallback/table view
  const tableItems: (ServiceItem & { raw?: any })[] = useMemo(() => {
    if (propItems && propItems.length > 0) return propItems;

    if (apiServices?.data) {
      return apiServices.data.map((s) => ({
        id: s.id,
        name: s.name,
        serviceType: s.is_master ? 'Main service' : 'Sub-service',
        parentService: s.parent?.name || '',
        category: s.is_master ? 'Master Catalog' : (s.parent?.name || 'Sub-service'),
        description: s.description || 'Public government service delivery specification.',
        documents:
          s.required_documents && s.required_documents.length > 0
            ? s.required_documents.map((d: any) => d.name)
            : s.required_documents_count
            ? Array.from({ length: s.required_documents_count }, (_, i) => `Required Document #${i + 1}`)
            : [],
        bureaus: s.offering_organizations_count ?? 0,
        published: Boolean(s.is_active),
        customerExpectations: s.fee_amount
          ? `Standard fee: ${s.fee_amount} ${s.fee_currency}`
          : 'Free public citizen service.',
        bureauExpectations: s.estimated_duration_minutes
          ? `Target processing time: ${s.estimated_duration_minutes} minutes.`
          : 'Standard queue processing.',
        raw: s,
      }));
    }

    return [];
  }, [propItems, apiServices]);

  const filteredTableItems = useMemo(() => {
    return tableItems.filter(
      (item) =>
        (serviceFilter === 'All services' ||
          (serviceFilter === 'Published' ? item.published : !item.published)) &&
        `${item.name} ${item.category} ${item.description}`
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [tableItems, serviceFilter, search]);

  // Statistics calculation for KPI cards
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
      // Expand only the clicked master node (accordion mode)
      if (prev.has(id)) {
        return new Set();
      }
      return new Set([id]);
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

  // Create new Master service
  const onAdd =
    propOnAdd ||
    (() => {
      setSelectedService({
        is_master: true,
        parent_id: null,
      });
      setIsModalOpen(true);
    });

  // Create child subservice directly under a parent Master
  const handleAddSubservice = (master: MasterTreeNode) => {
    setSelectedService({
      name: '',
      is_master: false,
      parent_id: master.id,
      parent: { id: master.id, name: master.name, code: master.code },
      organization_id: master.organization_id || master.organization?.id || null,
      raw: {
        is_master: false,
        parent_id: master.id,
        parent: { id: master.id, name: master.name, code: master.code },
        organization_id: master.organization_id || master.organization?.id || null,
      },
    });
    setIsModalOpen(true);
  };

  // Edit service or subservice
  const onEdit =
    propOnEdit ||
    ((item: any) => {
      const raw = item.raw || item;
      setSelectedService(raw);
      setIsModalOpen(true);
    });

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
        if (payload.offering_organizations && Array.isArray(payload.offering_organizations) && payload.offering_organizations.length > 0) {
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

  const onTogglePublish =
    propOnTogglePublish ||
    (async (id: number) => {
      const allServices = apiServices?.data || [];
      const target = allServices.find((i) => i.id === id);
      if (target) {
        setTogglingId(id);
        const nextState = !target.is_active;
        try {
          await updateServiceTrigger({
            id,
            is_active: nextState,
          }).unwrap();
          await refetch();
        } catch (err: any) {
          window.alert(err?.data?.message || 'Failed to update service active status.');
        } finally {
          setTogglingId(null);
        }
      }
    });

  const handleDeleteService = async (service: ServiceListItem | ServiceItem) => {
    if (window.confirm(`Are you sure you want to delete service "${service.name}"?`)) {
      try {
        await deleteServiceTrigger(service.id).unwrap();
        await refetch();
      } catch (err: any) {
        window.alert(err?.data?.message || 'Failed to delete service.');
      }
    }
  };

  // Open Room Route Editor for physical navigation
  const handleOpenRoute = (service: ServiceListItem) => {
    const liveSteps: RouteStep[] =
      service.steps && service.steps.length > 0
        ? service.steps.map((step) => ({
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
        service: service.name,
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
          const fullMsg = errDetails
            ? `${err?.data?.message || 'Validation failed'}:\n${errDetails}`
            : (err?.data?.message || err?.message || 'Failed to update service room steps.');
          window.alert(fullMsg);
          throw err;
        }
      },
    });
  };

  const canCreate = hasPermission('services.create');
  const canUpdate = hasPermission('services.update');
  const canDelete = hasPermission('services.delete');

  return (
    <>
      <PageHeading
        eyebrow="SERVICE ARCHITECTURE & CATALOG"
        title="Service catalog & delivery standards"
        subtitle="Manage hierarchical government services, delivery branches, and citizen room navigation."
        action={canCreate ? 'Create Master Service' : undefined}
        onAction={canCreate ? onAdd : undefined}
      />

      {/* KPI Overview Stat Cards */}
      <div className="service-stats-grid">
        <div className="service-stat-card">
          <div className="service-stat-icon">
            <Icon name="layers" size={20} />
          </div>
          <div className="service-stat-info">
            <b>{stats.masterCount}</b>
            <small>Master Categories</small>
          </div>
        </div>
        <div className="service-stat-card">
          <div className="service-stat-icon">
            <Icon name="file" size={20} />
          </div>
          <div className="service-stat-info">
            <b>{stats.subserviceCount}</b>
            <small>Citizen Subservices</small>
          </div>
        </div>
        <div className="service-stat-card">
          <div className="service-stat-icon">
            <Icon name="building" size={20} />
          </div>
          <div className="service-stat-info">
            <b>{stats.officesCount}</b>
            <small>Delivery Offices</small>
          </div>
        </div>
        <div className="service-stat-card">
          <div className="service-stat-icon">
            <Icon name="check" size={20} />
          </div>
          <div className="service-stat-info">
            <b>{stats.activeRate}%</b>
            <small>Active & Published</small>
          </div>
        </div>
      </div>

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
              <strong>Scoped to:</strong> {authUser?.organization?.name || 'Your Assigned Government Office'} (and local branch offices).
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
                      🏛 {org.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {bureausList.length > 0 && (
                <optgroup label="── Bureaus & Agencies ──">
                  {bureausList.map((org) => (
                    <option key={org.id} value={org.id}>
                      🏢 {org.name}
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
          {/* Status Filter Chips */}
          {(['All services', 'Published', 'Drafts'] as const).map((filter) => (
            <button
              key={filter}
              className={`chip-button${serviceFilter === filter ? ' active' : ''}`}
              onClick={() => setServiceFilter(filter)}
            >
              {filter}
              {filter === 'All services' && (
                <span>{apiServices?.data?.length ?? 0}</span>
              )}
            </button>
          ))}

          {/* View Mode Switcher */}
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

          {/* Expand All / Collapse All in Tree Mode */}
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

      {/* Loading Spinner */}
      {isLoading && !apiServices ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            gap: '12px',
          }}
        >
          <div className="loading-spinner" />
          <p style={{ margin: 0, color: '#00485a', fontWeight: 600, fontSize: '14px' }}>
            Loading government service catalog...
          </p>
          <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>
            Resolving organizational hierarchy, documents, and room routes
          </p>
        </div>
      ) : null}

      {/* TREE VIEW MODE */}
      {viewMode === 'tree' && (
        <section className="service-tree-container">
          {filteredTreeNodes.map((master) => {
            const isExpanded = expandedMasterIds.has(master.id);
            const hasChildren = master.children.length > 0;

            return (
              <article
                key={master.id}
                className={`service-tree-node${isExpanded ? ' is-expanded' : ''}`}
              >
                {/* Master Node Header Row */}
                <div
                  className="master-node-header"
                  onClick={() => toggleMasterExpand(master.id)}
                >
                  <div className="master-node-left">
                    <span
                      className={`tree-chevron${isExpanded ? ' expanded' : ''}`}
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      <Icon name="chevron" size={16} />
                    </span>
                    <span className="master-node-icon">
                      <Icon name="folder" size={18} />
                    </span>
                    <div className="master-node-title-group">
                      <div className="master-node-topline">
                        <span className="master-category-badge">MASTER DOMAIN</span>
                        <span className="master-code-badge">{master.code}</span>
                        {master.organization && (
                          <span className="master-bureau-badge">
                            🏛 {master.organization.name}
                          </span>
                        )}
                        <StatusPill>{master.is_active ? 'Active' : 'Inactive'}</StatusPill>
                      </div>
                      <h3 className="master-node-title">{master.name}</h3>
                      {master.description && (
                        <p
                          style={{
                            margin: '3px 0 0',
                            fontSize: '12.5px',
                            color: '#657b72',
                            maxWidth: '750px',
                          }}
                        >
                          {master.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className="master-node-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span
                      className={`subservice-counter-chip${hasChildren ? '' : ' empty'}`}
                    >
                      <Icon name="layers" size={13} />
                      {master.children.length}{' '}
                      {master.children.length === 1 ? 'subservice' : 'subservices'}
                    </span>

                    {/* Master Actions */}
                    <div className="master-node-actions">
                      {canCreate && (
                        <button
                          className="button secondary small-button"
                          onClick={() => handleAddSubservice(master)}
                          title="Add a citizen subservice under this master category"
                          style={{
                            borderColor: '#c6ded4',
                            background: '#f4fbf8',
                            color: '#00485a',
                            fontWeight: 700,
                          }}
                        >
                          <Icon name="plus" size={13} />
                          Add Subservice
                        </button>
                      )}
                      {canUpdate && (
                        <button
                          className="button secondary small-button"
                          onClick={() => onEdit(master)}
                          title="Edit master category standard"
                        >
                          <Icon name="edit" size={13} />
                          Edit
                        </button>
                      )}
                      {canDelete && master.children.length === 0 && (
                        <button
                          className="button secondary small-button"
                          style={{ color: '#e53e3e', borderColor: '#feb2b2' }}
                          onClick={() => handleDeleteService(master)}
                          title="Delete master service"
                        >
                          <Icon name="trash" size={13} />
                        </button>
                      )}
                      {canUpdate && (
                        <button
                          className={`publish-toggle${master.is_active ? ' is-on' : ''}`}
                          title={master.is_active ? 'Deactivate' : 'Activate'}
                          aria-label={master.is_active ? 'Deactivate' : 'Activate'}
                          disabled={togglingId === master.id}
                          onClick={() => onTogglePublish(master.id)}
                        >
                          <i />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subservices Collapsible Branch */}
                {isExpanded && (
                  <div className="tree-subservices-branch">
                    {hasChildren ? (
                      master.children.map((subservice) => {
                        const hasRoute =
                          subservice.steps && subservice.steps.length > 0;
                        const docCount =
                          subservice.required_documents?.length ??
                          subservice.required_documents_count ??
                          0;
                        const officeCount =
                          subservice.offering_organizations?.length ??
                          subservice.offering_organizations_count ??
                          0;

                        return (
                          <div
                            key={subservice.id}
                            className="tree-subservice-card"
                          >
                            <div className="tree-subservice-card-main">
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div className="tree-subservice-title-row">
                                  <span
                                    style={{
                                      fontFamily: 'monospace',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      background: '#f0f5f2',
                                      color: '#285660',
                                      border: '1px solid #d4e3dc',
                                    }}
                                  >
                                    {subservice.code}
                                  </span>
                                  <h4 className="tree-subservice-title">
                                    {subservice.name}
                                  </h4>
                                  <StatusPill>
                                    {subservice.is_active ? 'Active' : 'Inactive'}
                                  </StatusPill>
                                </div>
                                <p className="tree-subservice-desc">
                                  {subservice.description ||
                                    'Public municipal citizen service.'}
                                </p>

                                {/* Specification Badges */}
                                <div className="tree-subservice-badges">
                                  <span className="tree-badge">
                                    <Icon name="clock" size={12} />
                                    {subservice.estimated_duration_minutes
                                      ? `${subservice.estimated_duration_minutes} min`
                                      : 'Standard queue'}
                                  </span>
                                  <span className="tree-badge fee">
                                    {subservice.fee_amount && subservice.fee_amount > 0
                                      ? `${subservice.fee_amount} ${subservice.fee_currency}`
                                      : 'Free citizen service'}
                                  </span>
                                  <span
                                    className="tree-badge"
                                    title={
                                      subservice.required_documents
                                        ?.map((d) => d.name)
                                        .join(', ') || 'Required documents'
                                    }
                                  >
                                    <Icon name="file" size={12} />
                                    {docCount}{' '}
                                    {docCount === 1 ? 'document' : 'documents'}
                                  </span>
                                  <span
                                    className="tree-badge"
                                    title={
                                      subservice.offering_organizations
                                        ?.map((o) => o.name)
                                        .join(', ') || 'Delivery offices'
                                    }
                                  >
                                    <Icon name="building" size={12} />
                                    {officeCount}{' '}
                                    {officeCount === 1 ? 'office' : 'offices'}
                                  </span>
                                  <span
                                    className={`tree-badge ${hasRoute ? 'route-ready' : 'route-missing'}`}
                                  >
                                    <Icon name="route" size={12} />
                                    {hasRoute
                                      ? `${subservice.steps?.length} room steps`
                                      : 'No route configured'}
                                  </span>
                                </div>
                              </div>

                              {/* Subservice Actions */}
                              <div className="tree-subservice-actions">
                                <button
                                  className="button secondary small-button"
                                  onClick={() => handleOpenRoute(subservice)}
                                  title="Configure physical room navigation steps"
                                  style={{
                                    borderColor: hasRoute ? '#b5d5de' : '#ebdcc5',
                                    background: hasRoute ? '#edf7fa' : '#fdf9f2',
                                    color: hasRoute ? '#00485a' : '#8c6014',
                                  }}
                                >
                                  <Icon name="route" size={13} />
                                  Room Route
                                </button>
                                {canUpdate && (
                                  <button
                                    className="button secondary small-button"
                                    onClick={() => onEdit(subservice)}
                                    title="Edit subservice standard"
                                  >
                                    <Icon name="edit" size={13} />
                                    Edit
                                  </button>
                                )}
                                {canDelete && (
                                  <button
                                    className="button secondary small-button"
                                    style={{ color: '#e53e3e', borderColor: '#feb2b2' }}
                                    onClick={() => handleDeleteService(subservice)}
                                    title="Delete subservice"
                                  >
                                    <Icon name="trash" size={13} />
                                  </button>
                                )}
                                {canUpdate && (
                                  <button
                                    className={`publish-toggle${subservice.is_active ? ' is-on' : ''}`}
                                    title={subservice.is_active ? 'Deactivate' : 'Activate'}
                                    aria-label={subservice.is_active ? 'Deactivate' : 'Activate'}
                                    disabled={togglingId === subservice.id}
                                    onClick={() => onTogglePublish(subservice.id)}
                                  >
                                    <i />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="tree-empty-subservices">
                        <p>No subservices registered under this category yet.</p>
                        {canCreate && (
                          <button
                            className="button secondary small-button"
                            onClick={() => handleAddSubservice(master)}
                            style={{
                              margin: '0 auto',
                              borderColor: '#c6ded4',
                              background: '#ffffff',
                              color: '#00485a',
                              fontWeight: 700,
                            }}
                          >
                            <Icon name="plus" size={13} />
                            Add the First Subservice
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}

          {!filteredTreeNodes.length && !isLoading && (
            <div className="panel empty-state">
              <b>No services found</b>
              <p>Try adjusting your search or organization filter, or add a new master category.</p>
            </div>
          )}
        </section>
      )}

      {/* CLASSIC TABLE / CARD VIEW MODE */}
      {viewMode === 'table' && (
        <section className="service-list">
          {filteredTableItems.map((item) => (
            <article className="panel service-card" key={item.id}>
              <div className="service-card-main">
                <span className="service-card-icon">
                  <Icon name="layers" size={20} />
                </span>
                <div className="service-card-content">
                  <div className="service-title-row">
                    <span className="service-category">{item.category}</span>
                    <span className="service-level-tag">
                      {item.serviceType || 'Main service'}
                      {item.parentService ? ` · ${item.parentService}` : ''}
                    </span>
                    <StatusPill>{item.published ? 'Active' : 'Inactive'}</StatusPill>
                  </div>
                  <h2>{item.name}</h2>
                  <p>{item.description}</p>
                  <div className="service-meta">
                    <span>
                      <Icon name="check" size={14} /> {item.documents.length} required documents
                    </span>
                    <span>
                      <Icon name="building" size={14} /> Shared with {item.bureaus} offices
                    </span>
                  </div>
                  <div className="document-chips">
                    {item.documents.slice(0, 3).map((document) => (
                      <span key={document}>
                        <Icon name="check" size={11} />
                        {document}
                      </span>
                    ))}
                    {item.documents.length > 3 && (
                      <small>+{item.documents.length - 3} more</small>
                    )}
                  </div>
                </div>
              </div>
              <div className="service-card-side">
                {canUpdate && (
                  <button
                    className="button secondary small-button"
                    onClick={() => onEdit(item)}
                  >
                    Edit standard
                  </button>
                )}
                {canDelete && (
                  <button
                    className="button secondary small-button"
                    style={{ color: '#e53e3e', borderColor: '#feb2b2' }}
                    onClick={() => handleDeleteService(item)}
                    title="Delete service standard"
                  >
                    Delete
                  </button>
                )}
                {canUpdate && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <button
                      className={`publish-toggle${item.published ? ' is-on' : ''}`}
                      title={item.published ? 'Deactivate service' : 'Activate service'}
                      aria-label={item.published ? 'Deactivate service' : 'Activate service'}
                      disabled={togglingId === item.id}
                      onClick={() => onTogglePublish(item.id)}
                      style={{
                        opacity: togglingId === item.id ? 0.6 : 1,
                        cursor: togglingId === item.id ? 'wait' : 'pointer',
                      }}
                    >
                      <i />
                    </button>
                    <small
                      style={{
                        fontSize: '9.5px',
                        color: item.published ? '#15803d' : '#94a3b8',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {item.published ? 'ACTIVE' : 'INACTIVE'}
                    </small>
                  </div>
                )}
              </div>
              <div className="service-expectation">
                <span>EXPECTATIONS</span>
                <div>
                  <p>
                    <b>Citizen:</b> {item.customerExpectations}
                  </p>
                  <p>
                    <b>Bureau:</b> {item.bureauExpectations}
                  </p>
                </div>
              </div>
            </article>
          ))}
          {!filteredTableItems.length && !isLoading && (
            <div className="panel empty-state">
              <b>No services found</b>
              <p>Try another search or add a new standard.</p>
            </div>
          )}
        </section>
      )}

      {/* Helpful Room Route Tip Banner */}
      <div className="tip-banner" style={{ marginTop: '18px' }}>
        <span className="tip-icon">
          <Icon name="route" size={17} />
        </span>
        <span>
          <b>Hierarchical Room Navigation & Citizen Guidance</b>
          <small>
            Subservices map directly to municipal offices, departments, room numbers, and floor routes.
            Click <strong>Room Route</strong> on any subservice to define step-by-step guidance for citizens.
          </small>
        </span>
      </div>

      {/* Modal for Creating/Editing Service */}
      <ServiceModal
        isOpen={isModalOpen}
        service={selectedService}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedService(null);
        }}
        onSave={handleSaveService}
        isLoading={isCreating || isUpdating}
      />
    </>
  );
};

export default ServicesPage;
