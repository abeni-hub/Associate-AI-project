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
  MapPin,
  Send,
  Check,
  RefreshCw,
  Trash2,
  ChevronRight,
  ShieldCheck,
  ThumbsUp,
  HelpCircle,
  Download,
  Globe,
} from 'lucide-react';
import { useLanguage, getLocalizedText, type SupportedLanguage } from '../shared/i18n';
import { FeedbackMetricsGrid } from './components/FeedbackMetricsGrid';
import {
  useGetFeedbackListQuery,
  useUpdateFeedbackStatusMutation,
  useRespondToFeedbackMutation,
  useDeleteFeedbackMutation,
  type CitizenFeedback,
} from './api/feedbackApi';

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

export interface ParsedFeedbackContent {
  actualMessage: string;
  context: {
    subCity?: string;
    office?: string;
    service?: string;
    rating?: string;
    aspects?: string;
    attached?: string;
    otherTags: string[];
  };
}

export function parseFeedbackContent(rawContent?: string | null): ParsedFeedbackContent {
  const content = String(rawContent || '').trim();
  const match = content.match(/^\[(.*?)\]\s*([\s\S]*)$/);

  if (!match) {
    return {
      actualMessage: content,
      context: { otherTags: [] },
    };
  }

  const tagString = match[1];
  const actualMessage = match[2].trim();

  const context: ParsedFeedbackContent['context'] = { otherTags: [] };
  const parts = tagString.split(/·|,/).map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    const colonIdx = part.indexOf(':');
    if (colonIdx !== -1) {
      const key = part.slice(0, colonIdx).trim().toLowerCase();
      const val = part.slice(colonIdx + 1).trim();

      if (
        key === 'sub-city' ||
        key === 'subcity' ||
        key === 'ክፍለ ከተማ' ||
        key === 'kutaa magaalaa'
      ) {
        context.subCity = val;
      } else if (
        key === 'office' ||
        key === 'department' ||
        key === 'bureau' ||
        key === 'ቢሮ' ||
        key === 'biiroo'
      ) {
        context.office = val;
      } else if (
        key === 'service' ||
        key === 'አገልግሎት' ||
        key === 'tajaajila'
      ) {
        context.service = val;
      } else if (
        key === 'rating' ||
        key === 'ደረጃ' ||
        key === 'sadarkaa'
      ) {
        context.rating = val;
      } else if (
        key === 'aspects' ||
        key === 'ምክንያቶች' ||
        key === 'dhimmoota'
      ) {
        context.aspects = val;
      } else if (
        key === 'attached' ||
        key === 'አባሪ' ||
        key === 'dabalee'
      ) {
        context.attached = val;
      } else {
        context.otherTags.push(part);
      }
    } else {
      context.otherTags.push(part);
    }
  }

  return {
    actualMessage: actualMessage || content,
    context,
  };
}

export const FeedbackPage: React.FC = () => {
  const { language, t } = useLanguage();

  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'In review' | 'Resolved'>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'complaint' | 'feedback' | 'satisfaction'>('All');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [responseLang, setResponseLang] = useState<SupportedLanguage>('en');
  const [responseTextEn, setResponseTextEn] = useState('');
  const [responseTextAm, setResponseTextAm] = useState('');
  const [responseTextOm, setResponseTextOm] = useState('');
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
      const content = (getLocalizedText(item.feedback_content_localized || item.feedback_content as any, language) || (typeof item.message === 'string' ? item.message : '')).toLowerCase();
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
  }, [items, search, statusFilter, typeFilter, language]);

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

  const activeParsed = useMemo(() => {
    if (!activeItem) return { actualMessage: '', context: { otherTags: [] } };
    const raw =
      getLocalizedText(activeItem.feedback_content_localized || activeItem.feedback_content as any, language) ||
      (typeof activeItem.feedback_content === 'string' ? activeItem.feedback_content : '') ||
      (typeof activeItem.message === 'string' ? activeItem.message : '');
    return parseFeedbackContent(raw);
  }, [activeItem, language]);

  // Keep response texts pre-filled with existing localized response if available
  useEffect(() => {
    if (activeItem) {
      const respObj = activeItem.response_localized;
      const initialEn = (typeof activeItem.response === 'string' ? activeItem.response : '') || respObj?.eng || '';
      const initialAm = activeItem.response_amh || respObj?.amh || '';
      const initialOm = activeItem.response_oro || respObj?.oro || '';

      setResponseTextEn(initialEn);
      setResponseTextAm(initialAm);
      setResponseTextOm(initialOm);
      setResponseLang(language);
    } else {
      setResponseTextEn('');
      setResponseTextAm('');
      setResponseTextOm('');
    }
  }, [activeItem, language]);

  const showFeedbackNotice = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleSetStatus = async (newStatus: 'in_review' | 'resolved' | 'closed') => {
    if (!activeItem) return;
    const primaryResponse = responseTextEn.trim() || responseTextAm.trim() || responseTextOm.trim();
    try {
      await updateStatusTrigger({
        id: activeItem.id,
        status: newStatus,
        response: primaryResponse || undefined,
        response_amh: responseTextAm.trim() || undefined,
        response_oro: responseTextOm.trim() || undefined,
      }).unwrap();
      showFeedbackNotice(t('feedback.statusUpdated', 'Status updated successfully.'));
      await refetch();
    } catch (err: any) {
      window.alert(err?.data?.message || 'Failed to update status.');
    }
  };

  const handleSendResponse = async () => {
    if (!activeItem) return;
    const primaryResponse = responseTextEn.trim() || responseTextAm.trim() || responseTextOm.trim();
    if (!primaryResponse) {
      window.alert(t('feedback.requireResponse', 'Please enter an official response before submitting.'));
      return;
    }
    try {
      await updateStatusTrigger({
        id: activeItem.id,
        status: 'resolved',
        response: primaryResponse,
        response_amh: responseTextAm.trim() || undefined,
        response_oro: responseTextOm.trim() || undefined,
      }).unwrap();
      showFeedbackNotice(t('feedback.responseSent', 'Official response submitted and ticket marked as resolved.'));
      await refetch();
    } catch (err: any) {
      window.alert(err?.data?.message || 'Failed to send response.');
    }
  };

  const handleDelete = async () => {
    if (!activeItem) return;
    if (window.confirm(t('feedback.confirmDelete', 'Are you sure you want to permanently delete this feedback submission?'))) {
      try {
        await deleteTrigger(activeItem.id).unwrap();
        showFeedbackNotice(t('feedback.itemDeleted', 'Feedback item removed.'));
        setSelectedId(null);
        await refetch();
      } catch (err: any) {
        window.alert(err?.data?.message || 'Failed to delete feedback.');
      }
    }
  };

  const handleExportFeedback = () => {
    const headers = ['TrackingNumber', 'Type', 'Status', 'FullName', 'Phone', 'SubCity', 'Office', 'Service', 'Message', 'Date'];
    const rows = items.map((f) => {
      const raw = typeof f.message === 'string' ? f.message : getLocalizedText(f.feedback_content as any, language) || '';
      const parsed = parseFeedbackContent(raw);
      const bureau = parsed.context.office || (typeof f.bureau === 'string' ? f.bureau : getLocalizedText(f.organization?.name as any, language) || '');
      return [
        `"${f.tracking_number || ''}"`,
        `"${f.feedback_type || f.type || ''}"`,
        `"${normalizeFeedbackStatus(f.status, Boolean(f.response))}"`,
        `"${f.full_name || ''}"`,
        `"${f.phone_number || ''}"`,
        `"${parsed.context.subCity || ''}"`,
        `"${bureau.replace(/"/g, '""')}"`,
        `"${(parsed.context.service || '').replace(/"/g, '""')}"`,
        `"${parsed.actualMessage.replace(/"/g, '""')}"`,
        `"${f.created_at || ''}"`,
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `feedback_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="page-heading !mb-8 sm:!mb-9">
        <div>
          <div className="eyebrow">
            <span />
            {t('feedback.eyebrow')}
          </div>
          <h1>{t('feedback.title')}</h1>
          <p>{t('feedback.subtitle')}</p>
        </div>

        <div className="heading-actions">
          <button
            type="button"
            onClick={handleExportFeedback}
            className="button secondary"
            title="Export feedback submissions to CSV"
          >
            <Download size={15} />
            <span>{t('common.export', 'Export CSV')}</span>
          </button>

          <button
            type="button"
            onClick={() => refetch()}
            className="button secondary"
            title="Refresh feedback submissions"
          >
            <RefreshCw size={14} />
            <span>{t('feedback.refreshInbox', 'Refresh inbox')}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <FeedbackMetricsGrid
        metrics={{
          total: stats.total,
          open: stats.openCount,
          inReview: stats.inReviewCount,
          resolved: stats.resolvedCount,
          resolutionRate: stats.resolutionRate,
        }}
        isLoading={isLoading}
      />

      {/* Split-Pane Master-Detail Inbox */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Master List (5 cols) */}
        <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-200/80 flex flex-col bg-slate-50/30">
          {/* Inbox Search & Filter Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-100 space-y-2.5 bg-white">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('feedback.searchPlaceholder', 'Search by citizen, tracking #, or bureau...')}
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#064552] transition-all"
              />
            </div>

            {/* Streamlined Filter Row: Status Segmented Control + Type Select */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 font-medium">
                {(['All', 'Open', 'In review', 'Resolved'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                      statusFilter === status
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
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

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                aria-label="Filter feedback by type"
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-600 font-medium focus:outline-none focus:border-[#064552] transition-colors"
              >
                <option value="All">{t('feedback.allTypes', 'All types')}</option>
                <option value="complaint">{t('feedback.complaint', 'Complaints')}</option>
                <option value="satisfaction">{t('feedback.satisfaction', 'Satisfaction')}</option>
                <option value="feedback">{t('feedback.feedbackType', 'Suggestions')}</option>
              </select>
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
                  {t('feedback.adjustFilter', 'No feedback matches the current filters.')}
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const normStatus = normalizeFeedbackStatus(item.status, Boolean(item.response));
                const isSelected = item.id === selectedId;
                const isComplaint = (item.feedback_type || item.type || '').toLowerCase() === 'complaint';
                const isSatisfaction = (item.feedback_type || item.type || '').toLowerCase() === 'satisfaction';
                const trackingNumber = item.tracking_number ? `#${item.tracking_number}` : `FB-${item.id}`;
                const itemRaw =
                  getLocalizedText(item.feedback_content as any, language) ||
                  (typeof item.feedback_content === 'string' ? item.feedback_content : '') ||
                  (typeof item.message === 'string' ? item.message : '');
                const itemParsed = parseFeedbackContent(itemRaw);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`p-3 sm:p-3.5 cursor-pointer transition-all border-l-[3px] ${
                      isSelected
                        ? 'bg-teal-50/50 border-l-[#064552]'
                        : 'bg-white hover:bg-slate-50/80 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {trackingNumber}
                        </span>

                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
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
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          normStatus === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : normStatus === 'In review'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
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
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                        {getLocalizedText(item.full_name as any, language) || (typeof item.full_name === 'string' ? item.full_name : '') || t('feedback.anonymousCitizen', 'Anonymous Citizen')}
                      </h4>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString(language === 'am' ? 'am-ET' : language === 'om' ? 'om-ET' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : t('feedback.recent', 'Recent')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {itemParsed.actualMessage || t('feedback.noDescription', 'No description provided.')}
                    </p>

                    <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-slate-400">
                      <span className="truncate flex items-center gap-1">
                        <Building2 size={11} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">
                          {itemParsed.context.office || getLocalizedText(item.organization?.name as any, language) || (typeof item.bureau === 'string' ? item.bureau : '') || t('feedback.adminOffice', 'City Administration')}
                        </span>
                        {itemParsed.context.service && (
                          <span className="text-slate-400 truncate">
                            · {itemParsed.context.service}
                          </span>
                        )}
                      </span>

                      {item.rating != null && (
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={10}
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
              <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/20 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {activeItem.tracking_number ? `#${activeItem.tracking_number}` : `FB-${activeItem.id}`}
                    </span>

                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        (activeItem.feedback_type || activeItem.type || '').toLowerCase() === 'complaint'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                      }`}
                    >
                      {(activeItem.feedback_type || activeItem.type || '').toLowerCase() === 'complaint'
                        ? t('feedback.complaint', 'Complaint')
                        : t('feedback.satisfaction', 'Satisfaction')}
                    </span>

                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        normalizeFeedbackStatus(activeItem.status, Boolean(activeItem.response)) === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : normalizeFeedbackStatus(activeItem.status, Boolean(activeItem.response)) === 'In review'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
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
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete ticket"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {getLocalizedText(activeItem.full_name as any, language) || (typeof activeItem.full_name === 'string' ? activeItem.full_name : '') || t('feedback.anonymousCitizen', 'Anonymous Citizen')}
                  </h3>

                  {activeItem.rating != null && (
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={i < (activeItem.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                        />
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1">
                        {activeItem.rating}/5
                      </span>
                    </div>
                  )}
                </div>

                {/* Citizen Metadata Chips */}
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <Building2 size={13} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">
                      {activeParsed.context.office || getLocalizedText(activeItem.organization?.name as any, language) || (typeof activeItem.bureau === 'string' ? activeItem.bureau : '') || t('feedback.adminOffice', 'City Administration')}
                    </span>
                  </div>

                  {activeItem.phone_number && (
                    <div className="flex items-center gap-1.5">
                      <Phone size={13} className="text-slate-400 flex-shrink-0" />
                      <a
                        href={`tel:${activeItem.phone_number}`}
                        className="text-[#064552] font-medium hover:underline"
                      >
                        {activeItem.phone_number}
                      </a>
                    </div>
                  )}

                  {activeItem.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail size={13} className="text-slate-400 flex-shrink-0" />
                      <a
                        href={`mailto:${activeItem.email}`}
                        className="text-[#064552] font-medium hover:underline truncate"
                      >
                        {activeItem.email}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={13} className="text-slate-400 flex-shrink-0" />
                    <span>
                      {activeItem.created_at
                        ? new Date(activeItem.created_at).toLocaleDateString(language === 'am' ? 'am-ET' : language === 'om' ? 'om-ET' : 'en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : t('feedback.recent', 'Recent')}
                    </span>
                  </div>
                </div>

                {/* Structured Context Badges: Sub-city, Service, Aspects, Attached */}
                {(activeParsed.context.subCity || activeParsed.context.service || activeParsed.context.aspects || activeParsed.context.attached) && (
                  <div className="flex items-center flex-wrap gap-1.5 pt-1.5 border-t border-slate-100">
                    {activeParsed.context.subCity && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200/70 text-xs font-semibold text-[#064552]">
                        <MapPin size={12} className="text-[#064552] flex-shrink-0" />
                        <span>{activeParsed.context.subCity} {activeParsed.context.subCity.toLowerCase().includes('sub-city') ? '' : t('feedback.subCitySuffix', 'Sub-city')}</span>
                      </span>
                    )}

                    {activeParsed.context.service && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200/60 text-xs font-medium text-blue-800">
                        <FileText size={12} className="text-blue-500 flex-shrink-0" />
                        <span>{activeParsed.context.service}</span>
                      </span>
                    )}

                    {activeParsed.context.aspects && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200/60 text-xs font-medium text-purple-700">
                        <span className="text-[11px]">🏷️</span>
                        <span>{activeParsed.context.aspects}</span>
                      </span>
                    )}

                    {activeParsed.context.attached && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/60 text-xs font-medium text-amber-800">
                        <span className="text-[11px]">📎</span>
                        <span>{activeParsed.context.attached}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Message Content Body */}
              <div className="p-5 sm:p-6 space-y-5 flex-1">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {t('feedback.citizenMessage', 'Citizen Statement')}
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                    {activeParsed.actualMessage || t('feedback.noDescription', 'No description was provided.')}
                  </div>
                </div>

                {/* Existing Official Response if Any */}
                {(activeItem.response || activeItem.response_amh || activeItem.response_oro || activeItem.response_localized) && (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        {t('feedback.recordedResponse', 'Official Response')}
                      </h4>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                        {(activeItem.response || activeItem.response_localized?.eng) && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono">EN</span>
                        )}
                        {(activeItem.response_amh || activeItem.response_localized?.amh) && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono">AM</span>
                        )}
                        {(activeItem.response_oro || activeItem.response_localized?.oro) && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono">OM</span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {getLocalizedText(activeItem.response_localized || (activeItem.response as any), language) ||
                        (typeof activeItem.response === 'string' ? activeItem.response : '') ||
                        activeItem.response_amh ||
                        activeItem.response_oro}
                    </div>
                  </div>
                )}

                {/* Inline Official Action Form */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <label className="block text-xs font-bold text-slate-700">
                      {t('feedback.composeResponse', 'Official Response')}
                    </label>

                    {/* Multilingual Response Input Switcher */}
                    <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200/70">
                      <Globe size={13} className="text-[#064552] ml-1.5 mr-0.5" />
                      {(['en', 'am', 'om'] as const).map((l) => {
                        const hasContent =
                          l === 'en'
                            ? Boolean(responseTextEn.trim())
                            : l === 'am'
                            ? Boolean(responseTextAm.trim())
                            : Boolean(responseTextOm.trim());
                        return (
                          <button
                            key={l}
                            type="button"
                            onClick={() => setResponseLang(l)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                              responseLang === l
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span>{l === 'en' ? 'English' : l === 'am' ? 'አማርኛ' : 'Oromoo'}</span>
                            {hasContent && (
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-600" title="Has response text" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    value={
                      responseLang === 'en'
                        ? responseTextEn
                        : responseLang === 'am'
                        ? responseTextAm
                        : responseTextOm
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (responseLang === 'en') setResponseTextEn(val);
                      else if (responseLang === 'am') setResponseTextAm(val);
                      else setResponseTextOm(val);
                    }}
                    placeholder={
                      responseLang === 'am'
                        ? 'ይፋዊ የምርመራ ውጤት፣ የውሳኔ እርምጃዎችን ወይም ለዜጋው የሚሰጡ መመሪያዎችን እዚህ ይፃፉ...'
                        : responseLang === 'om'
                        ? "Bu'aa qorannoo, tarkaanfiiwwan furmaataa, yookiin qajeelfama lammiidhaaf ta'u asitti barreessaa..."
                        : t('feedback.responsePlaceholder', 'Write an official response or resolution notes for the citizen...')
                    }
                    className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#064552] focus:ring-1 focus:ring-[#064552]/20 transition-all"
                  />

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetStatus('in_review')}
                        disabled={isUpdatingStatus}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50"
                      >
                        {t('feedback.markUnderReview', 'Mark in review')}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetStatus('closed')}
                        disabled={isUpdatingStatus}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
                      >
                        {t('feedback.closeTicket', 'Close ticket')}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendResponse}
                      disabled={isUpdatingStatus || (!responseTextEn.trim() && !responseTextAm.trim() && !responseTextOm.trim())}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[#064552] text-white hover:bg-[#085a6a] transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                    >
                      <Send size={14} />
                      <span>{t('feedback.respondAndResolve', 'Send response')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare size={44} className="text-slate-200 mb-3" />
              <h3 className="text-sm font-bold text-slate-700">{t('feedback.noSelected', 'Select a submission')}</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                {t('feedback.noSelectedDesc', 'Choose a citizen inquiry or grievance from the list to review and respond.')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
