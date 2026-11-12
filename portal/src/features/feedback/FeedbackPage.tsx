import React, { useMemo, useState, useEffect } from 'react';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Star,
  User,
  Phone,
  Mail,
  Building2,
  FileText,
  Send,
  Check,
  RefreshCw,
  Trash2,
  ChevronRight,
  ShieldCheck,
  ThumbsUp,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '../../i18n/i18nContext';
import { getLocalizedText } from '../../i18n/utils/getLocalized';
import {
  useGetFeedbackListQuery,
  useUpdateFeedbackStatusMutation,
  useRespondToFeedbackMutation,
  useDeleteFeedbackMutation,
} from '../../services/feedbackApi';
import type { CitizenFeedback } from '../../services/feedbackApi';

function normalizeFeedbackStatus(rawStatus?: string, hasResponse?: boolean): 'Open' | 'In review' | 'Resolved' | 'Closed' {
  const s = String(rawStatus || '').toLowerCase().trim();
  if (s === 'resolved' || (hasResponse && !s)) return 'Resolved';
  if (s === 'closed' || s === 'rejected') return 'Closed';
  if (s === 'under_review' || s === 'in_progress' || s === 'in_review' || s === 'in review') return 'In review';
  return 'Open';
}

function toBackendFeedbackStatus(uiStatus: string): string {
  const s = String(uiStatus || '').toLowerCase().trim();
  if (s === 'in review' || s === 'in_review' || s === 'under review' || s === 'under_review') return 'under_review';
  if (s === 'resolved') return 'resolved';
  if (s === 'closed') return 'closed';
  return 'submitted';
}

export const FeedbackPage: React.FC = () => {
  const { language, t } = useLanguage();

  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'In review' | 'Resolved'>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'complaint' | 'feedback' | 'satisfaction'>('All');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [responseText, setResponseText] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const { data: apiFeedback, isLoading, refetch } = useGetFeedbackListQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [updateStatusTrigger, { isLoading: isUpdatingStatus }] = useUpdateFeedbackStatusMutation();
  const [respondTrigger, { isLoading: isResponding }] = useRespondToFeedbackMutation();
  const [deleteTrigger, { isLoading: isDeleting }] = useDeleteFeedbackMutation();

  const items = useMemo(() => {
    return apiFeedback?.data || [];
  }, [apiFeedback]);

  // Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const openCount = items.filter((f) => normalizeFeedbackStatus(f.status, Boolean(f.response)) === 'Open').length;
    const inReviewCount = items.filter((f) => normalizeFeedbackStatus(f.status, Boolean(f.response)) === 'In review').length;
    const resolvedCount = items.filter((f) => normalizeFeedbackStatus(f.status, Boolean(f.response)) === 'Resolved').length;
    const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 100;

    return { total, openCount, inReviewCount, resolvedCount, resolutionRate };
  }, [items]);

  // Filtered List
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const normStatus = normalizeFeedbackStatus(item.status, Boolean(item.response));
      if (statusFilter !== 'All' && normStatus !== statusFilter) return false;

      const rawType = (item.feedback_type || item.type || 'feedback').toLowerCase();
      if (typeFilter !== 'All' && rawType !== typeFilter) return false;

      if (!q) return true;

      const name = String(item.full_name || '').toLowerCase();
      const content = (getLocalizedText(item.feedback_content as any, language) || (typeof item.message === 'string' ? item.message : '')).toLowerCase();
      const tracking = String(item.tracking_number || '').toLowerCase();
      const bureau = (getLocalizedText(item.organization?.name as any, language) || (typeof item.bureau === 'string' ? item.bureau : '')).toLowerCase();

      return (
        name.includes(q) ||
        content.includes(q) ||
        tracking.includes(q) ||
        bureau.includes(q) ||
        String(item.id).includes(q)
      );
    });
  }, [items, search, statusFilter, typeFilter]);

  // Auto-select first item if none selected or if selected was deleted
  useEffect(() => {
    if (filteredItems.length > 0) {
      if (selectedId === null || !filteredItems.some((i) => i.id === selectedId)) {
        setSelectedId(filteredItems[0].id);
      }
    } else {
      setSelectedId(null);
    }
  }, [filteredItems, selectedId]);

  const activeItem = useMemo(() => {
    return items.find((i) => i.id === selectedId) || null;
  }, [items, selectedId]);

  // Keep response text pre-filled with existing response if available
  useEffect(() => {
    if (activeItem) {
      setResponseText(activeItem.response || '');
    } else {
      setResponseText('');
    }
  }, [activeItem]);

  const showFeedbackNotice = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleSetStatus = async (newStatus: 'in_review' | 'resolved' | 'closed') => {
    if (!activeItem) return;
    try {
      await updateStatusTrigger({
        id: activeItem.id,
        status: newStatus,
        response: responseText.trim() || undefined,
      }).unwrap();
      showFeedbackNotice(`Status updated to ${newStatus.replace('_', ' ')}.`);
      await refetch();
    } catch (err: any) {
      window.alert(err?.data?.message || 'Failed to update status.');
    }
  };

  const handleSendResponse = async () => {
    if (!activeItem) return;
    if (!responseText.trim()) {
      window.alert('Please enter an official response before submitting.');
      return;
    }
    try {
      await updateStatusTrigger({
        id: activeItem.id,
        status: 'resolved',
        response: responseText.trim(),
      }).unwrap();
      showFeedbackNotice('Official response submitted and ticket marked as resolved.');
      await refetch();
    } catch (err: any) {
      window.alert(err?.data?.message || 'Failed to send response.');
    }
  };

  const handleDelete = async () => {
    if (!activeItem) return;
    if (window.confirm('Are you sure you want to permanently delete this feedback submission?')) {
      try {
        await deleteTrigger(activeItem.id).unwrap();
        showFeedbackNotice('Feedback item removed.');
        setSelectedId(null);
        await refetch();
      } catch (err: any) {
        window.alert(err?.data?.message || 'Failed to delete feedback.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1.5 w-6 rounded-full bg-[#efbd58]" />
            <span className="text-[11px] font-bold tracking-widest text-[#064552] uppercase">
              {t('feedback.eyebrow')}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t('feedback.title')}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t('feedback.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={14} />
          <span>{t('feedback.refreshInbox', 'Refresh inbox')}</span>
        </button>
      </div>

      {/* Success Notification */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#064552]">
            <MessageSquare size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {stats.total}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('feedback.totalSubmissions', 'Total Submissions')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
            <Clock size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {stats.openCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('feedback.openCases', 'Open Cases')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <RefreshCw size={20} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {stats.inReviewCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('feedback.underReview', 'Under Review')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {stats.resolutionRate}%
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('feedback.resolvedRate', 'Resolved')} ({stats.resolvedCount})
            </div>
          </div>
        </div>
      </div>

      {/* Split-Pane Master-Detail Inbox */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Master List (5 cols) */}
        <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-200/80 flex flex-col bg-slate-50/30">
          {/* Inbox Search & Filter Header */}
          <div className="p-4 border-b border-slate-100 space-y-3 bg-white">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('feedback.searchPlaceholder', 'Search citizen name, tracking code, keywords...')}
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#064552] transition-all"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              {(['All', 'Open', 'In review', 'Resolved'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    statusFilter === status
                      ? 'bg-[#064552] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {status === 'All'
                    ? t('common.all', 'All')
                    : status === 'Open'
                    ? t('feedback.open', 'Open')
                    : status === 'In review'
                    ? t('feedback.inReview', 'In review')
                    : t('feedback.resolved', 'Resolved')}
                </button>
              ))}
            </div>

            {/* Type Filter Pills */}
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <span className="text-slate-400 mr-1">{t('feedback.typeLabel', 'Type:')}</span>
              {(['All', 'complaint', 'satisfaction', 'feedback'] as const).map((tCode) => (
                <button
                  key={tCode}
                  type="button"
                  onClick={() => setTypeFilter(tCode)}
                  className={`px-2 py-0.5 rounded-md capitalize transition-colors ${
                    typeFilter === tCode
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {tCode === 'All'
                    ? t('feedback.allTypes', 'All types')
                    : tCode === 'complaint'
                    ? t('feedback.complaint', 'Complaint')
                    : tCode === 'satisfaction'
                    ? t('feedback.satisfaction', 'Satisfaction')
                    : t('feedback.feedbackType', 'Feedback')}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Submissions List */}
          <div className="flex-1 overflow-y-auto max-h-[700px] divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                {t('common.loading', 'Loading citizen feedback...')}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">{t('feedback.noSubmissions', 'No submissions found')}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {t('feedback.adjustFilter', 'Try adjusting your filter or search query.')}
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const normStatus = normalizeFeedbackStatus(item.status, Boolean(item.response));
                const isSelected = item.id === selectedId;
                const isComplaint = (item.feedback_type || item.type || '').toLowerCase() === 'complaint';
                const isSatisfaction = (item.feedback_type || item.type || '').toLowerCase() === 'satisfaction';
                const trackingNumber = item.tracking_number ? `#${item.tracking_number}` : `FB-${item.id}`;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`p-3.5 sm:p-4 cursor-pointer transition-all border-l-4 ${
                      isSelected
                        ? 'bg-teal-50/40 border-l-[#064552]'
                        : 'bg-white hover:bg-slate-50/80 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {trackingNumber}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isComplaint
                              ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                              : isSatisfaction
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                          }`}
                        >
                          {isComplaint
                            ? t('feedback.complaint', 'Complaint')
                            : isSatisfaction
                            ? t('feedback.satisfaction', 'Satisfaction')
                            : t('feedback.suggestion', 'Suggestion')}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          normStatus === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : normStatus === 'In review'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {normStatus === 'Resolved'
                          ? t('feedback.resolved', 'Resolved')
                          : normStatus === 'In review'
                          ? t('feedback.inReview', 'In review')
                          : t('feedback.open', 'Open')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {getLocalizedText(item.full_name as any, language) || (typeof item.full_name === 'string' ? item.full_name : '') || t('feedback.anonymousCitizen', 'Anonymous Citizen')}
                      </h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString(language === 'am' ? 'am-ET' : language === 'om' ? 'om-ET' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : t('feedback.recent', 'Recent')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {getLocalizedText(item.feedback_content as any, language) || (typeof item.feedback_content === 'string' ? item.feedback_content : '') || (typeof item.message === 'string' ? item.message : '') || t('feedback.noDescription', 'No description provided.')}
                    </p>

                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <span className="truncate flex items-center gap-1">
                        <Building2 size={12} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">
                          {getLocalizedText(item.organization?.name as any, language) || (typeof item.bureau === 'string' ? item.bureau : '') || t('feedback.publicServiceDesk', 'Public Service Desk')}
                        </span>
                      </span>

                      {item.rating != null && (
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={11}
                              className={
                                i < (item.rating || 0)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200'
                              }
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail Pane (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-white">
          {activeItem ? (
            <div className="flex-1 flex flex-col overflow-y-auto max-h-[700px]">
              {/* Header Info */}
              <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {activeItem.tracking_number ? `#${activeItem.tracking_number}` : `FB-${activeItem.id}`}
                    </span>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        (activeItem.feedback_type || activeItem.type || '').toLowerCase() === 'complaint'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {((activeItem.feedback_type || activeItem.type || '').toLowerCase() === 'complaint'
                        ? t('feedback.complaint', 'Complaint')
                        : t('feedback.satisfaction', 'Satisfaction')).toUpperCase()}
                    </span>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        normalizeFeedbackStatus(activeItem.status, Boolean(activeItem.response)) === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : normalizeFeedbackStatus(activeItem.status, Boolean(activeItem.response)) === 'In review'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {normalizeFeedbackStatus(activeItem.status, Boolean(activeItem.response)) === 'Resolved'
                        ? t('feedback.resolved', 'Resolved')
                        : normalizeFeedbackStatus(activeItem.status, Boolean(activeItem.response)) === 'In review'
                        ? t('feedback.inReview', 'In review')
                        : t('feedback.open', 'Open')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleDelete}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors self-end sm:self-auto"
                    title="Delete ticket"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {getLocalizedText(activeItem.full_name as any, language) || (typeof activeItem.full_name === 'string' ? activeItem.full_name : '') || t('feedback.anonymousSubmission', 'Anonymous Citizen Submission')}
                </h3>

                {/* Citizen Contacts & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                  {activeItem.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      <a
                        href={`tel:${activeItem.phone_number}`}
                        className="text-[#064552] font-semibold hover:underline"
                      >
                        {activeItem.phone_number}
                      </a>
                    </div>
                  )}

                  {activeItem.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      <a
                        href={`mailto:${activeItem.email}`}
                        className="text-[#064552] font-semibold hover:underline truncate"
                      >
                        {activeItem.email}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-slate-400" />
                    <span className="truncate">
                      {getLocalizedText(activeItem.organization?.name as any, language) || (typeof activeItem.bureau === 'string' ? activeItem.bureau : '') || t('feedback.adminOffice', 'Addis Ababa City Administration')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    <span>
                      {t('feedback.submitted', 'Submitted')}:{' '}
                      {activeItem.created_at
                        ? new Date(activeItem.created_at).toLocaleString(language === 'am' ? 'am-ET' : language === 'om' ? 'om-ET' : 'en-US')
                        : t('feedback.recent', 'Recent')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Content Body */}
              <div className="p-5 sm:p-6 space-y-6 flex-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {t('feedback.citizenMessage', 'Citizen Message & Statement')}
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-800 leading-relaxed font-normal">
                    {getLocalizedText(activeItem.feedback_content as any, language) || (typeof activeItem.message === 'string' ? activeItem.message : '') || t('feedback.noDescription', 'No description was provided.')}
                  </div>
                </div>

                {/* Existing Official Response if Any */}
                {activeItem.response && (
                  <div>
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldCheck size={15} className="text-emerald-600" />
                      {t('feedback.recordedResponse', 'Recorded Official Response')}
                    </h4>
                    <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-sm text-slate-800 leading-relaxed">
                      {getLocalizedText(activeItem.response as any, language) || (typeof activeItem.response === 'string' ? activeItem.response : '')}
                    </div>
                  </div>
                )}

                {/* Inline Official Action Form */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      {t('feedback.composeResponse', 'Compose Official Resolution / Response')}
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {t('feedback.sentNotice', 'Sent directly to citizen inquiry record')}
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder={t('feedback.responsePlaceholder', 'Type official investigation findings, resolution steps, or instructions for the citizen...')}
                    className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#064552] focus:ring-2 focus:ring-[#064552]/10 transition-all"
                  />

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetStatus('in_review')}
                        disabled={isUpdatingStatus}
                        className="px-3 py-2 text-xs font-semibold rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50"
                      >
                        {t('feedback.markUnderReview', 'Mark as Under Review')}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetStatus('closed')}
                        disabled={isUpdatingStatus}
                        className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
                      >
                        {t('feedback.closeTicket', 'Close Ticket')}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendResponse}
                      disabled={isUpdatingStatus || !responseText.trim()}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[#064552] text-white hover:bg-[#085a6a] transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                    >
                      <Send size={14} />
                      <span>{t('feedback.respondAndResolve', 'Submit Resolution')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare size={48} className="text-slate-200 mb-3" />
              <h3 className="text-sm font-bold text-slate-700">{t('feedback.noSelected', 'No submission selected')}</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                {t('feedback.noSelectedDesc', 'Select a citizen inquiry or grievance from the inbox list on the left to read and resolve.')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
