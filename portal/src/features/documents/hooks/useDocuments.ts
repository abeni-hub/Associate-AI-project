import { useMemo, useState } from 'react';
import { usePermissions, useLanguage, getLocalizedText } from '../../shared';
import {
  useGetDocumentsQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  type DocumentItem,
} from '../api/documentsApi';

export const useDocuments = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [usageFilter, setUsageFilter] = useState<'all' | 'linked' | 'unlinked'>('all');

  const { language } = useLanguage();
  const { data: response, isLoading, refetch } = useGetDocumentsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [createDoc, { isLoading: isCreating }] = useCreateDocumentMutation();
  const [updateDoc, { isLoading: isUpdating }] = useUpdateDocumentMutation();
  const [deleteDoc, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  const { hasPermission } = usePermissions();
  const canManage = hasPermission('documents.manage');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [inspectDoc, setInspectDoc] = useState<DocumentItem | null>(null);

  const documents: DocumentItem[] = useMemo(() => {
    return response?.data || [];
  }, [response]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const q = search.trim().toLowerCase();
      const docName = (getLocalizedText(doc.name, language) || (typeof doc.name === 'string' ? doc.name : '')).toLowerCase();
      const docCode = (doc.code || '').toLowerCase();
      const docDesc = (getLocalizedText(doc.description, language) || (typeof doc.description === 'string' ? doc.description : '')).toLowerCase();

      const matchSearch =
        q === '' ||
        docName.includes(q) ||
        docCode.includes(q) ||
        docDesc.includes(q);

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? doc.is_active : !doc.is_active);

      const count = doc.services_count ?? 0;
      const matchUsage =
        usageFilter === 'all' ||
        (usageFilter === 'linked' ? count > 0 : count === 0);

      return matchSearch && matchStatus && matchUsage;
    });
  }, [documents, search, statusFilter, usageFilter, language]);

  const activeCount = documents.filter((d) => d.is_active).length;
  const linkedDocsCount = documents.filter((d) => (d.services_count ?? 0) > 0).length;
  const totalServiceLinks = documents.reduce((sum, d) => sum + (d.services_count ?? 0), 0);

  const handleOpenAdd = () => {
    setSelectedDoc(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setIsModalOpen(true);
  };

  const handleSave = async (payload: {
    id?: number;
    name: string;
    code: string;
    description?: string;
    sample_file_url?: string;
    is_active: boolean;
  }) => {
    if (payload.id) {
      await updateDoc(payload as any).unwrap();
    } else {
      await createDoc(payload).unwrap();
    }
    await refetch();
    setIsModalOpen(false);
    setSelectedDoc(null);
  };

  const handleToggleStatus = async (doc: DocumentItem) => {
    try {
      await updateDoc({
        id: doc.id,
        is_active: !doc.is_active,
      }).unwrap();
      await refetch();
    } catch (err: any) {
      window.alert(err?.data?.message || 'Failed to update document status.');
    }
  };

  const handleDelete = async (doc: DocumentItem) => {
    const servicesNote = (doc.services_count ?? 0) > 0
      ? ` Warning: This document is currently linked to ${doc.services_count} active service(s).`
      : '';
    const docDisplayName = getLocalizedText(doc.name, language) || (typeof doc.name === 'string' ? doc.name : doc.code);

    if (
      window.confirm(
        `Are you sure you want to remove "${docDisplayName}" (${doc.code}) from the document catalog?${servicesNote}`
      )
    ) {
      try {
        await deleteDoc(doc.id).unwrap();
        await refetch();
        if (inspectDoc?.id === doc.id) {
          setInspectDoc(null);
        }
      } catch (err: any) {
        window.alert(err?.data?.message || 'Failed to delete document.');
      }
    }
  };

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    usageFilter,
    setUsageFilter,
    isLoading: isLoading && !response,
    isSubmitting: isCreating || isUpdating || isDeleting,
    canManage,
    documents,
    filteredDocuments,
    activeCount,
    linkedDocsCount,
    totalServiceLinks,
    isModalOpen,
    setIsModalOpen,
    selectedDoc,
    setSelectedDoc,
    inspectDoc,
    setInspectDoc,
    handleOpenAdd,
    handleOpenEdit,
    handleSave,
    handleToggleStatus,
    handleDelete,
  };
};

