import { useMemo, useState } from 'react';
import { usePermissions, useLanguage, getLocalizedText } from '../../shared';
import {
  useGetOrganizationTypesQuery,
  useCreateOrganizationTypeMutation,
  useUpdateOrganizationTypeMutation,
  useDeleteOrganizationTypeMutation,
  type OrganizationTypeItem,
} from '../api/organizationsApi';

export const useLevels = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [rootFilter, setRootFilter] = useState<'all' | 'root' | 'child'>('all');

  const { data: response, isLoading, refetch } = useGetOrganizationTypesQuery(undefined, { refetchOnMountOrArgChange: true });
  const [createType, { isLoading: isCreating }] = useCreateOrganizationTypeMutation();
  const [updateType, { isLoading: isUpdating }] = useUpdateOrganizationTypeMutation();
  const [deleteType, { isLoading: isDeleting }] = useDeleteOrganizationTypeMutation();

  const { hasPermission } = usePermissions();
  const { language } = useLanguage();
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
      const lvlName = (getLocalizedText(lvl.name, language) || (typeof lvl.name === 'string' ? lvl.name : '')).toLowerCase();
      const lvlCode = (lvl.code || '').toLowerCase();
      const lvlDesc = (getLocalizedText(lvl.description, language) || (typeof lvl.description === 'string' ? lvl.description : '')).toLowerCase();
      const searchLower = search.toLowerCase();

      const matchSearch =
        search.trim() === '' ||
        lvlName.includes(searchLower) ||
        lvlCode.includes(searchLower) ||
        lvlDesc.includes(searchLower);

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
    const displayName = getLocalizedText(lvl.name, language) || (typeof lvl.name === 'string' ? lvl.name : lvl.code);
    if (
      window.confirm(
        `Are you sure you want to delete the "${displayName}" tier level? Organizations using this level will be affected.`
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

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    rootFilter,
    setRootFilter,
    isLoading,
    isSubmitting: isCreating || isUpdating || isDeleting,
    isUpdating,
    canCreate,
    canUpdate,
    canDelete,
    levels,
    filteredLevels,
    rootCount,
    activeCount,
    isModalOpen,
    setIsModalOpen,
    selectedLevel,
    setSelectedLevel,
    handleOpenAdd,
    handleOpenEdit,
    handleSave,
    handleDelete,
    handleMoveRank,
  };
};

