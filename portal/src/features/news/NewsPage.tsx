import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Newspaper,
  Calendar,
  CheckCircle2,
  FileEdit,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  MapPin,
  Clock,
} from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { useLanguage } from '../../i18n/i18nContext';
import { getLocalizedText } from '../../i18n/utils/getLocalized';
import { NewsModal } from '../../components/news/NewsModal';
import type { PostItem } from '../../types/portal.types';
import {
  useGetNewsListQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
} from '../../services/newsApi';
import {
  useGetEventsQuery,
  useCreateEventMutation,
  useDeleteEventMutation,
} from '../../services/eventsApi';

function normalizeType(item: PostItem) {
  return String(item.type).toLowerCase().includes('event') ? 'event' : 'news';
}

function isPublished(item: PostItem) {
  return item.isPublished ?? (String(item.status || '').toLowerCase() !== 'draft');
}

export const NewsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const canCreate = isSuperAdmin || hasPermission('news.create') || hasPermission('news.view');
  const canUpdate = isSuperAdmin || hasPermission('news.update') || hasPermission('news.view');
  const canDelete = isSuperAdmin || hasPermission('news.delete');

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'news' | 'event'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);

  const { data: newsApiResponse, isLoading: isNewsLoading, refetch: refetchNews } = useGetNewsListQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: eventsApiResponse, isLoading: isEventsLoading, refetch: refetchEvents } = useGetEventsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [createNews, { isLoading: isCreatingNews }] = useCreateNewsMutation();
  const [updateNews, { isLoading: isUpdatingNews }] = useUpdateNewsMutation();
  const [deleteNews] = useDeleteNewsMutation();
  const [createEvent, { isLoading: isCreatingEvent }] = useCreateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const items: PostItem[] = useMemo(() => {
    const list: PostItem[] = [];

    const rawNews = newsApiResponse?.data;
    const newsList: any[] = Array.isArray(rawNews)
      ? rawNews
      : rawNews && typeof rawNews === 'object' && Array.isArray((rawNews as any).data)
      ? (rawNews as any).data
      : [];

    if (newsList.length > 0) {
      newsList.forEach((art) => {
        const imageBlocks = art.contents?.filter((c: any) => c.content_type === 'image_url' || c.content_type === 'image') || [];
        const textBlocks = art.contents?.filter((c: any) => c.content_type !== 'image_url' && c.content_type !== 'image') || [];

        const summaryText = textBlocks.length > 1 ? textBlocks[0].content : '';
        const bodyText = textBlocks.length > 1 ? textBlocks.slice(1).map((c: any) => c.content).join('\n\n') : (textBlocks[0]?.content || '');

        list.push({
          id: art.id,
          title: getLocalizedText(art.title as any, language) || (typeof art.title === 'string' ? art.title : 'Public Notice'),
          type: 'News',
          status: art.is_published ? 'Published' : 'Draft',
          isPublished: Boolean(art.is_published),
          date: art.published_at || art.created_at,
          author: art.author_name || 'City Communications',
          category: art.category || 'General',
          summary: getLocalizedText(summaryText as any, language) || (typeof summaryText === 'string' ? summaryText : '') || (bodyText ? bodyText.slice(0, 160) + '...' : ''),
          body: getLocalizedText(bodyText as any, language) || (typeof bodyText === 'string' ? bodyText : ''),
          image: imageBlocks[0]?.content || null,
          views: art.views_count ?? 0,
        });
      });
    }

    const rawEvents = eventsApiResponse?.data;
    const eventList: any[] = Array.isArray(rawEvents)
      ? rawEvents
      : rawEvents && typeof rawEvents === 'object' && Array.isArray((rawEvents as any).data)
      ? (rawEvents as any).data
      : [];

    if (eventList.length > 0) {
      eventList.forEach((ev) => {
        list.push({
          id: ev.id,
          title: getLocalizedText(ev.title as any, language) || (typeof ev.title === 'string' ? ev.title : 'Public Event'),
          type: 'Event',
          status: ev.status === 'published' || ev.is_active ? 'Published' : 'Draft',
          isPublished: Boolean(ev.status === 'published' || ev.is_active),
          date: ev.event_date || ev.created_at,
          author: 'City Hall Operations',
          category: 'Public Event',
          summary: getLocalizedText(ev.description as any, language) || (typeof ev.description === 'string' ? ev.description : ''),
          body: getLocalizedText(ev.description as any, language) || (typeof ev.description === 'string' ? ev.description : ''),
          image: ev.image_url || null,
          views: 0,
        });
      });
    }

    return list;
  }, [newsApiResponse, eventsApiResponse, language]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        (item.summary && item.summary.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q));

      const normType = normalizeType(item);
      const matchType = typeFilter === 'all' || normType === typeFilter;

      const published = isPublished(item);
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' ? published : !published);

      return matchSearch && matchType && matchStatus;
    });
  }, [items, search, typeFilter, statusFilter]);

  const totalNews = items.filter((i) => normalizeType(i) === 'news').length;
  const totalEvents = items.filter((i) => normalizeType(i) === 'event').length;
  const publishedCount = items.filter(isPublished).length;
  const draftCount = items.length - publishedCount;

  const handleOpenAdd = () => {
    setSelectedPost(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (post: PostItem) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleSavePost = async (payload: any) => {
    try {
      if (payload.type === 'event' || payload.type === 'Event') {
        await createEvent({
          title: payload.title,
          description: payload.body || payload.summary || '',
          event_date: payload.date || new Date().toISOString().slice(0, 10),
          is_active: payload.isPublished ?? true,
        }).unwrap();
        await refetchEvents();
      } else {
        if (payload.id) {
          await updateNews({
            id: payload.id,
            title: payload.title,
            is_published: payload.isPublished ?? true,
          } as any).unwrap();
        } else {
          await createNews({
            title: payload.title,
            category: payload.category || 'General',
            is_published: payload.isPublished ?? true,
            contents: [
              ...(payload.summary ? [{ content_type: 'text', content: payload.summary, order: 1 }] : []),
              ...(payload.body ? [{ content_type: 'text', content: payload.body, order: 2 }] : []),
            ],
          } as any).unwrap();
        }
        await refetchNews();
      }
      setIsModalOpen(false);
      setSelectedPost(null);
    } catch (err: any) {
      window.alert(err?.data?.message || 'Failed to save communication post.');
    }
  };

  const handleDelete = async (post: PostItem) => {
    if (window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      try {
        if (normalizeType(post) === 'event') {
          await deleteEvent(post.id).unwrap();
          await refetchEvents();
        } else {
          await deleteNews(post.id).unwrap();
          await refetchNews();
        }
      } catch (err: any) {
        window.alert(err?.data?.message || 'Failed to delete post.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span />
            {t('news.eyebrow')}
          </div>
          <h1>{t('news.title')}</h1>
          <p>{t('news.subtitle')}</p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="primary-button"
          >
            <Plus size={16} />
            <span>{t('news.createPost')}</span>
          </button>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#064552]">
            <Newspaper size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {totalNews}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('news.totalNews')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <Calendar size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {totalEvents}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('news.totalEvents')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {publishedCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('news.published')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
            <FileEdit size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {draftCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('common.drafts', 'Drafts')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        {/* Card Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {t('news.editorialFeed', 'Editorial Feed')}
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                {filtered.length} {t('news.posts', 'posts')}
              </span>
            </div>

            {/* Type Filter Tabs */}
            <div className="flex items-center gap-1 text-xs">
              {(['all', 'news', 'event'] as const).map((tCode) => (
                <button
                  key={tCode}
                  type="button"
                  onClick={() => setTypeFilter(tCode)}
                  className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                    typeFilter === tCode
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tCode === 'all'
                    ? t('news.allTypes', 'All formats')
                    : tCode === 'news'
                    ? t('news.newsOnly', 'News only')
                    : t('news.eventsOnly', 'Events only')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('news.searchPlaceholder', 'Search announcements, events, topics...')}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#064552] transition-all"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/70 text-xs font-semibold self-end sm:self-auto">
              {(['all', 'published', 'draft'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'all'
                    ? t('news.allStatuses', 'All statuses')
                    : st === 'published'
                    ? t('common.published', 'Published')
                    : t('common.draft', 'Draft')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="p-4 sm:p-5">
          {isNewsLoading || isEventsLoading ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              {t('common.loading', 'Loading editorial feed...')}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center max-w-sm mx-auto">
              <Newspaper size={36} className="mx-auto text-slate-300 mb-2" />
              <h3 className="text-sm font-bold text-slate-700">{t('news.emptyNotice', 'No announcements found')}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {search ? `No results match "${search}".` : t('news.emptyNotice', 'No announcements found')}
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filtered.map((post) => {
                const isEv = normalizeType(post) === 'event';
                const published = isPublished(post);

                return (
                  <div
                    key={`${post.type}-${post.id}`}
                    className="border border-slate-200/80 rounded-xl p-4 bg-white hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isEv ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-teal-50 text-[#064552] border border-teal-100'
                      }`}>
                        {isEv ? <Calendar size={20} /> : <Newspaper size={20} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isEv ? 'bg-blue-50 text-blue-700 border border-blue-200/60' : 'bg-teal-50 text-teal-800 border border-teal-200/60'
                          }`}>
                            {isEv ? t('news.event', 'Event') : t('news.newsArticle', 'News')}
                          </span>

                          <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                            published ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          }`}>
                            {published ? t('common.published', 'Published') : t('common.draft', 'Draft')}
                          </span>

                          {post.category && (
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {post.category}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-slate-900 leading-snug tracking-tight">
                          {getLocalizedText(post.title as any, language) || (typeof post.title === 'string' ? post.title : '')}
                        </h3>

                        {post.summary && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {getLocalizedText(post.summary as any, language) || (typeof post.summary === 'string' ? post.summary : '')}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span>{post.date ? new Date(post.date).toLocaleDateString() : 'Recent'}</span>
                          <span>·</span>
                          <span>{post.author}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 flex-shrink-0">
                      <Link
                        to={`/news/${post.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        <ExternalLink size={13} />
                        <span>Read</span>
                      </Link>

                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(post)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-[#064552] hover:text-white transition-colors"
                        >
                          <Pencil size={13} />
                          <span>{t('common.edit', 'Edit')}</span>
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(post)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete notice"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <NewsModal
          isOpen={isModalOpen}
          item={selectedPost}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPost(null);
          }}
          onSave={handleSavePost}
        />
      )}
    </div>
  );
};

export default NewsPage;

