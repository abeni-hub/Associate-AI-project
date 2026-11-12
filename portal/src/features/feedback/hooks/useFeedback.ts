import { useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { usePortal } from '../../shared';
import {
  useGetFeedbackListQuery,
  useUpdateFeedbackStatusMutation,
  normalizeFeedbackStatus,
} from '../api/feedbackApi';
import {
  selectTypeFilter,
  selectStatusFilter,
  selectSearchQuery,
  selectStatusOverrides,
  selectNoticeMessage,
  setTypeFilter,
  setStatusFilter,
  setSearchQuery,
  setStatusOverride,
  setNoticeMessage,
} from '../slice/feedbackSlice';
import type {
  FeedbackMetrics,
  NormalizedFeedbackItem,
  BackendFeedbackStatus,
} from '../types/feedback.types';

function toBackendStatus(status: string): BackendFeedbackStatus {
  const s = status.toLowerCase().trim();
  if (
    s === 'in review' ||
    s === 'in_review' ||
    s === 'under review' ||
    s === 'under_review'
  ) {
    return 'under_review';
  }
  if (s === 'resolved') return 'resolved';
  if (s === 'closed' || s === 'rejected') return 'closed';
  return 'submitted';
}

export function useFeedback(overrideItems?: NormalizedFeedbackItem[]) {
  const dispatch = useAppDispatch();
  const portal = usePortal();

  const typeFilter = useAppSelector(selectTypeFilter);
  const statusFilter = useAppSelector(selectStatusFilter);
  const searchQuery = useAppSelector(selectSearchQuery);
  const statusOverrides = useAppSelector(selectStatusOverrides);
  const noticeMessage = useAppSelector(selectNoticeMessage);

  const {
    data: apiFeedback = [],
    isLoading,
    refetch,
  } = useGetFeedbackListQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [updateStatusTrigger] = useUpdateFeedbackStatusMutation();

  // Apply optimistic status overrides
  const items: NormalizedFeedbackItem[] = useMemo(() => {
    const sourceList = (overrideItems ?? (apiFeedback as any)?.data ?? []) as any[];
    return sourceList.map((item: any) => {
      const overriddenStatus = statusOverrides[item.id];
      if (overriddenStatus) {
        return { ...item, status: overriddenStatus };
      }
      return item;
    });
  }, [overrideItems, apiFeedback, statusOverrides]);

  // Memoized client-side filtering
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesType =
        typeFilter === 'All types' || item.type === typeFilter;
      const matchesStatus =
        statusFilter === 'All statuses' || item.status === statusFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        `${item.id} ${item.message} ${item.service} ${item.bureau} ${item.subcity || ''}`
          .toLowerCase()
          .includes(query);

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [items, typeFilter, statusFilter, searchQuery]);

  // Derived KPI metrics
  const metrics: FeedbackMetrics = useMemo(() => {
    const total = items.length;
    const open = items.filter((x) => x.status === 'Open').length;
    const inReview = items.filter((x) => x.status === 'In review').length;
    const resolved = items.filter((x) => x.status === 'Resolved').length;
    const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;

    return { total, open, inReview, resolved, resolutionRate };
  }, [items]);

  // Open item detail modal and handle resolution flow
  const handleOpen = useCallback(
    (item: NormalizedFeedbackItem) => {
      portal.setModal({
        kind: 'feedback',
        item,
        onUpdate: async (newStatus: string, responseText?: string) => {
          const normalizedNewStatus = normalizeFeedbackStatus(newStatus);

          // Optimistic local update
          dispatch(
            setStatusOverride({ id: item.id, status: normalizedNewStatus })
          );
          dispatch(
            setNoticeMessage(
              `Status updated to "${normalizedNewStatus}" for ${item.id}.`
            )
          );
          setTimeout(() => dispatch(setNoticeMessage(null)), 3500);

          const targetId =
            item.numericId ||
            item.trackingNumber ||
            item.id.replace(/^FB-/, '').replace(/^#/, '');

          const backendStatus = toBackendStatus(newStatus);
          const cleanResponse =
            responseText !== undefined && responseText.trim() !== ''
              ? responseText.trim()
              : undefined;

          try {
            await updateStatusTrigger({
              id: targetId,
              status: backendStatus,
              ...(cleanResponse !== undefined ? { response: cleanResponse } : {}),
            }).unwrap();
            await refetch();
          } catch (err) {
            console.error('Feedback status update mutation failed:', err);
          }
        },
      });
    },
    [dispatch, portal, updateStatusTrigger, refetch]
  );

  const handleSearchChange = useCallback(
    (query: string) => dispatch(setSearchQuery(query)),
    [dispatch]
  );

  const handleTypeFilterChange = useCallback(
    (type: string) => dispatch(setTypeFilter(type)),
    [dispatch]
  );

  const handleStatusFilterChange = useCallback(
    (status: string) => dispatch(setStatusFilter(status)),
    [dispatch]
  );

  return {
    items: filteredItems,
    metrics,
    isLoading,
    searchQuery,
    typeFilter,
    statusFilter,
    noticeMessage,
    handleOpen,
    handleSearchChange,
    handleTypeFilterChange,
    handleStatusFilterChange,
    refetch,
  };
}

