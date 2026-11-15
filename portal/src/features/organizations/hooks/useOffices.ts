import { useMemo, useState } from 'react';
import { usePortal, usePermissions, useLanguage, getLocalizedText } from '../../shared';
import { getOfficeParentSummary } from '../components/officeHierarchy';
import type { OfficeItem, OfficeType } from '../../../types/portal.types';
import {
  useGetOrganizationsQuery,
  useGetOrganizationTypesQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
} from '../api/organizationsApi';

export interface UseOfficesOptions {
  propOffices?: OfficeItem[];
  propOfficeTypes?: OfficeType[];
  propRole?: string;
  onAddOffice?: () => void;
  onEditOffice?: (office: OfficeItem) => void;
  propSearch?: string;
  propSetSearch?: (search: string) => void;
}

export const useOffices = (options: UseOfficesOptions = {}) => {
  const {
    propOffices,
    propOfficeTypes,
    propRole,
    onAddOffice,
    onEditOffice,
    propSearch,
    propSetSearch,
  } = options;

  const portal = usePortal();
  const { language } = useLanguage();
  const [internalSearch, setInternalSearch] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('all');
  const [selectedView, setSelectedView] = useState<'list' | 'tree'>('list');
  const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
  const [selectedOfficeForEdit, setSelectedOfficeForEdit] = useState<OfficeItem | null>(null);

  const { data: apiOrgs, isLoading: orgsLoading, refetch: refetchOrgs } = useGetOrganizationsQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: apiOrgTypes } = useGetOrganizationTypesQuery();
  const [createOrgTrigger, { isLoading: isCreatingOrg }] = useCreateOrganizationMutation();
  const [updateOrgTrigger, { isLoading: isUpdatingOrg }] = useUpdateOrganizationMutation();
  const [deleteOrgTrigger] = useDeleteOrganizationMutation();
  const isSavingOrg = isCreatingOrg || isUpdatingOrg;

  const officeTypes: OfficeType[] = useMemo(() => {
    if (propOfficeTypes && propOfficeTypes.length > 0) return propOfficeTypes;
    if (apiOrgTypes?.data) {
      return apiOrgTypes.data.map((t) => ({
        id: t.id,
        name: getLocalizedText(t.name, language) || (typeof t.name === 'string' ? t.name : t.code),
        level: t.level,
        can_be_root: t.can_be_root,
        description: getLocalizedText(t.description, language) || (typeof t.description === 'string' ? t.description : ''),
      }));
    }
    return [];
  }, [propOfficeTypes, apiOrgTypes, language]);

  const offices: OfficeItem[] = useMemo(() => {
    if (propOffices && propOffices.length > 0) return propOffices;
    const typesList = apiOrgTypes?.data || [];
    const typesById = new Map<number, any>();
    typesList.forEach((t) => typesById.set(Number(t.id), t));

    if (apiOrgs?.data) {
      return apiOrgs.data.map((o: any) => {
        const typeFromRef = o.type || typesById.get(Number(o.organization_type_id || 0));
        const resolvedTypeId = Number(typeFromRef?.id || o.organization_type_id || (typesList[0]?.id ?? 1));
        const rawTypeName = typeFromRef?.name ?? (resolvedTypeId === 1 ? 'Root Tier' : 'Office');
        const resolvedTypeName = getLocalizedText(rawTypeName, language) || (typeof rawTypeName === 'string' ? rawTypeName : 'Office');

        return {
          id: o.id,
          name: getLocalizedText(o.name, language) || (typeof o.name === 'string' ? o.name : (o.code || 'Office')),
          code: o.code,
          logo: o.logo || null,
          typeId: resolvedTypeId,
          typeName: resolvedTypeName,
          typeCode: typeFromRef?.code || o.code,
          parentId: o.parent?.id ?? o.parent_organization_id ?? null,
          parentName: o.parent?.name ? (getLocalizedText(o.parent.name, language) || (typeof o.parent.name === 'string' ? o.parent.name : '')) : undefined,
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
  }, [propOffices, apiOrgs, apiOrgTypes, language]);

  const role = propRole || portal.role || 'super';
  const search = propSearch !== undefined ? propSearch : (portal.search !== undefined ? portal.search : internalSearch);
  const setSearch = propSetSearch || portal.setSearch || setInternalSearch;

  const { hasPermission, canAccessOrganization, isSuperAdmin } = usePermissions();
  const canCreate = hasPermission('organizations.create');
  const canUpdate = hasPermission('organizations.update');
  const canDelete = hasPermission('organizations.delete');

  // Scope filter: Super Admin views all; hierarchy users view permitted hierarchy
  const scopedOffices = useMemo(() => {
    if (isSuperAdmin) return offices;
    return offices.filter((office: OfficeItem) => {
      const orgId = Number(office.id);
      return canAccessOrganization(orgId) || canAccessOrganization(office.parentId);
    });
  }, [offices, isSuperAdmin, canAccessOrganization]);

  const filtered = useMemo(() => {
    return scopedOffices.filter((item: OfficeItem) => {
      const type = officeTypes.find((t: OfficeType) => t.id === item.typeId);
      const parentSummary = getOfficeParentSummary(item, offices, officeTypes);
      const matchesType = selectedTypeId === 'all' || item.typeId === Number(selectedTypeId);
      const classification = item.typeName || type?.name || '';
      const query = `${item.name} ${item.code || ''} ${item.email || ''} ${item.phone || ''} ${item.status} ${classification} ${parentSummary}`.toLowerCase();
      return matchesType && query.includes(search.toLowerCase());
    });
  }, [scopedOffices, officeTypes, offices, selectedTypeId, search]);

  const subcityCount = scopedOffices.filter((o: OfficeItem) => o.typeId === 1 || o.typeName === 'Sub-City').length;
  const woredaCount = scopedOffices.filter((o: OfficeItem) => o.typeId === 2 || o.typeName === 'Woreda').length;
  const bureauCount = scopedOffices.filter((o: OfficeItem) => o.typeId === 3 || o.typeName === 'Bureau').length;

  const handleOpenAdd = () => {
    if (onAddOffice) {
      onAddOffice();
    } else {
      setSelectedOfficeForEdit(null);
      setIsOfficeModalOpen(true);
    }
  };

  const handleOpenEdit = (office: OfficeItem) => {
    if (onEditOffice) {
      onEditOffice(office);
    } else {
      setSelectedOfficeForEdit(office);
      setIsOfficeModalOpen(true);
    }
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

  return {
    role,
    search,
    setSearch,
    selectedTypeId,
    setSelectedTypeId,
    selectedView,
    setSelectedView,
    isOfficeModalOpen,
    setIsOfficeModalOpen,
    selectedOfficeForEdit,
    setSelectedOfficeForEdit,
    orgsLoading: orgsLoading && !apiOrgs,
    isSavingOrg,
    officeTypes,
    offices,
    scopedOffices,
    filtered,
    subcityCount,
    woredaCount,
    bureauCount,
    canCreate,
    canUpdate,
    canDelete,
    isSuperAdmin,
    canAccessOrganization,
    handleOpenAdd,
    handleOpenEdit,
    handleSaveOffice,
    handleDeleteOffice,
  };
};

