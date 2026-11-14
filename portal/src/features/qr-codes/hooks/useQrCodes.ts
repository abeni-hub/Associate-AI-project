import { useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { usePortal, usePermissions } from '../../shared';
import { useGetQrCodesQuery, useDeleteQrCodeMutation } from '../api/qrCodesApi';
import { useGetOrganizationsQuery, type OrganizationItem } from '../../organizations';
import { getClientBaseUrl } from '../../../app/baseApi';
import {
  selectQrSearch,
  selectQrOfficeFilter,
  selectQrStatusFilter,
  selectQrSelectedId,
  setSearchQuery,
  setOfficeFilter,
  setStatusFilter,
  setSelectedId,
  setIsCopied,
} from '../slice/qrCodesSlice';
import type { QrCodeItem, QRMetrics } from '../types/qrCodes.types';

export function useQrCodes(
  propOnGenerate?: () => void,
  propOnCopy?: () => void
) {
  const portal = usePortal();
  const dispatch = useAppDispatch();
  const { hasPermission } = usePermissions();
  const canManageQrCodes = hasPermission('qr_codes.manage');

  const searchQuery = useAppSelector(selectQrSearch);
  const officeFilter = useAppSelector(selectQrOfficeFilter);
  const statusFilter = useAppSelector(selectQrStatusFilter);
  const selectedId = useAppSelector(selectQrSelectedId);

  const {
    data: apiQrResponse,
    isLoading,
    refetch: refetchQrs,
  } = useGetQrCodesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const { data: orgsResponse } = useGetOrganizationsQuery({ per_page: 100 });
  const [deleteQrTrigger] = useDeleteQrCodeMutation();

  const qrList: QrCodeItem[] = useMemo(() => {
    if (!apiQrResponse?.data) return [];
    if (Array.isArray(apiQrResponse.data)) return apiQrResponse.data;
    if (Array.isArray((apiQrResponse.data as { data?: QrCodeItem[] })?.data)) {
      return (apiQrResponse.data as { data: QrCodeItem[] }).data;
    }
    return [];
  }, [apiQrResponse]);

  const organizations: OrganizationItem[] = useMemo(() => {
    if (!orgsResponse?.data) return [];
    if (Array.isArray(orgsResponse.data)) return orgsResponse.data;
    if (Array.isArray((orgsResponse.data as { data?: OrganizationItem[] })?.data)) {
      return (orgsResponse.data as { data: OrganizationItem[] }).data;
    }
    return [];
  }, [orgsResponse]);

  // Filtered posters list
  const filteredItems = useMemo(() => {
    return qrList.filter((qr) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        `${qr.label} ${qr.code} ${qr.organization?.name || ''} ${qr.target_url}`
          .toLowerCase()
          .includes(query);

      const matchesOffice =
        officeFilter === 'All offices' ||
        (qr.organization?.name && qr.organization.name === officeFilter) ||
        (qr.organization?.code && qr.organization.code === officeFilter);

      const matchesStatus =
        statusFilter === 'All statuses' ||
        (statusFilter === 'Active' ? qr.status === 'active' : qr.status !== 'active');

      return matchesSearch && matchesOffice && matchesStatus;
    });
  }, [qrList, searchQuery, officeFilter, statusFilter]);

  const activeQr = useMemo(() => {
    if (selectedId) {
      const match = qrList.find((q) => q.id === selectedId);
      if (match) return match;
    }
    return filteredItems[0] || qrList[0] || null;
  }, [filteredItems, qrList, selectedId]);

  const targetUrl = activeQr?.target_url || `${getClientBaseUrl()}/#feedback`;

  // Derived KPI metrics
  const metrics: QRMetrics = useMemo(() => {
    const total = qrList.length;
    const active = qrList.filter((q) => q.status === 'active').length;
    const totalScans = qrList.reduce((acc, q) => acc + (q.scan_count || 0), 0);
    const bureauCount = new Set(qrList.map((q) => q.organization_id)).size;

    return { total, active, totalScans, bureauCount };
  }, [qrList]);

  const handleGenerate = useCallback(() => {
    if (propOnGenerate) {
      propOnGenerate();
      return;
    }
    portal.setModal({
      kind: 'qr',
      onCreated: (createdQr: QrCodeItem) => {
        if (createdQr?.id) {
          dispatch(setSelectedId(createdQr.id));
        }
        void refetchQrs();
        dispatch(setIsCopied(true));
        setTimeout(() => dispatch(setIsCopied(false)), 2000);
      },
    });
  }, [propOnGenerate, portal, dispatch, refetchQrs]);

  const handleCopy = useCallback(() => {
    if (propOnCopy) {
      propOnCopy();
      return;
    }
    void navigator.clipboard?.writeText(targetUrl);
    dispatch(setIsCopied(true));
    setTimeout(() => dispatch(setIsCopied(false)), 1800);
  }, [propOnCopy, targetUrl, dispatch]);

  const handleDelete = useCallback(
    async (id: number, code: string) => {
      if (window.confirm(`Are you sure you want to delete QR poster "${code}"?`)) {
        try {
          await deleteQrTrigger(id).unwrap();
          if (selectedId === id) {
            dispatch(setSelectedId(null));
          }
          await refetchQrs();
        } catch (err) {
          console.warn('Failed to delete QR poster:', err);
        }
      }
    },
    [deleteQrTrigger, selectedId, dispatch, refetchQrs]
  );

  const handleSelect = useCallback(
    (qr: QrCodeItem) => dispatch(setSelectedId(qr.id)),
    [dispatch]
  );

  const handlePreview = useCallback(
    (qr: QrCodeItem) => {
      dispatch(setSelectedId(qr.id));
      portal.setModal({ kind: 'qr', qr });
    },
    [dispatch, portal]
  );

  const handleSearchChange = useCallback(
    (val: string) => dispatch(setSearchQuery(val)),
    [dispatch]
  );

  const handleOfficeFilterChange = useCallback(
    (val: string) => dispatch(setOfficeFilter(val)),
    [dispatch]
  );

  const handleStatusFilterChange = useCallback(
    (val: string) => dispatch(setStatusFilter(val)),
    [dispatch]
  );

  return {
    items: filteredItems,
    hasRawPosters: qrList.length > 0,
    organizations,
    metrics,
    isLoading,
    selectedId,
    searchQuery,
    officeFilter,
    statusFilter,
    canManageQrCodes,
    handleGenerate,
    handleCopy,
    handleDelete,
    handleSelect,
    handlePreview,
    handleSearchChange,
    handleOfficeFilterChange,
    handleStatusFilterChange,
    refetchQrs,
  };
}

export default useQrCodes;

