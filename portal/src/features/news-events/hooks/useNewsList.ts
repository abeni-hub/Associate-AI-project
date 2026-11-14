import { useMemo, useState } from 'react';
import { usePortal, usePermissions } from '../../shared';
import { useLanguage, getLocalizedText } from '../../shared/i18n';
import type { PostItem } from '../../../types/portal.types';
import {
  useGetNewsListQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
} from '../api/newsApi';
import {
  useGetEventsQuery,
  useCreateEventMutation,
  useDeleteEventMutation,
} from '../api/eventsApi';

export function normalizeType(item: PostItem): 'event' | 'news' {
  return String(item.type).toLowerCase().includes('event') ? 'event' : 'news';
}

export function isPublished(item: PostItem): boolean {
  return item.isPublished ?? (String(item.status || '').toLowerCase() !== 'draft');
}

export function formatDate(value?: string): string {
  if (!value) return 'Date not set';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + 'T00:00:00') : new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-ET', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getSubCity(item: PostItem): string | undefined {
  return normalizeType(item) === 'event' ? item.location?.subCity || item.subCity : item.subCity;
}

export interface UseNewsListOptions {
  propItems?: PostItem[];
  propOnAdd?: () => void;
  propOnEdit?: (item: PostItem) => void;
  propSearch?: string;
  propSetSearch?: (s: string) => void;
  propOnTogglePublish?: (id: number | string) => void;
}

export const useNewsList = (options: UseNewsListOptions = {}) => {
  const {
    propItems,
    propOnAdd,
    propOnEdit,
    propSearch,
    propSetSearch,
    propOnTogglePublish,
  } = options;

  const portal = usePortal();
  const { language } = useLanguage();
  const [typeFilter, setTypeFilter] = useState('all');
  const [publicationFilter, setPublicationFilter] = useState('all');

  const { data: newsApiResponse, isLoading: isNewsLoading, refetch: refetchNews } = useGetNewsListQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: eventsApiResponse, isLoading: isEventsLoading, refetch: refetchEvents } = useGetEventsQuery(undefined, { refetchOnMountOrArgChange: true });
  const [createNews, { isLoading: isCreatingNews }] = useCreateNewsMutation();
  const [updateNews, { isLoading: isUpdatingNews }] = useUpdateNewsMutation();
  const [deleteNews] = useDeleteNewsMutation();
  const [createEvent, { isLoading: isCreatingEvent }] = useCreateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();
  const isSavingPost = isCreatingNews || isUpdatingNews || isCreatingEvent;

  const items: PostItem[] = useMemo(() => {
    if (propItems && propItems.length > 0) return propItems;

    const list: PostItem[] = [];

    // Safely extract news articles
    const rawNews = newsApiResponse?.data;
    const newsList: any[] = Array.isArray(rawNews)
      ? rawNews
      : rawNews && typeof rawNews === 'object' && Array.isArray((rawNews as any).data)
      ? (rawNews as any).data
      : [];

    if (newsList.length > 0) {
      newsList.forEach((art) => {
        const imageBlocks =
          art.contents?.filter(
            (c: any) => c.content_type === 'image_url' || c.content_type === 'image'
          ) || [];
        const textBlocks =
          art.contents?.filter(
            (c: any) => c.content_type !== 'image_url' && c.content_type !== 'image'
          ) || [];

        const rawFirstText = textBlocks[0]?.content;
        const firstTextStr = typeof rawFirstText === 'string' ? rawFirstText : getLocalizedText(rawFirstText, language) || '';
        const summaryText =
          textBlocks.length > 1
            ? firstTextStr
            : firstTextStr
            ? (firstTextStr.length > 160
                ? firstTextStr.slice(0, 160) + '...'
                : firstTextStr)
            : 'Official Municipal Announcement';

        const fullContent = textBlocks.map((c: any) => typeof c.content === 'string' ? c.content : getLocalizedText(c.content, language) || '').join('\n\n');
        const titleStr = typeof art.news_title === 'string' ? art.news_title : getLocalizedText(art.news_title, language) || 'Official Notice';
        const subCityStr = typeof art.organization?.name === 'string' ? art.organization.name : getLocalizedText(art.organization?.name, language) || 'Addis Ababa City Administration';

        list.push({
          id: art.id,
          title: titleStr,
          titleAm: '',
          type: 'news' as const,
          date: art.created_at ? art.created_at.split('T')[0] : 'Recent',
          status: 'Published' as const,
          isPublished: true,
          subCity: subCityStr,
          category: 'Public notice',
          coverImage: imageBlocks[0]?.content,
          images: imageBlocks.map((b: any) => b.content),
          summary: summaryText,
          excerpt: summaryText,
          content: fullContent,
          organization_id: art.organization_id,
          organization: art.organization,
          contents: art.contents,
        });
      });
    }

    // Safely extract public events
    const rawEvents = eventsApiResponse?.data;
    const eventsList: any[] = Array.isArray(rawEvents)
      ? rawEvents
      : rawEvents && typeof rawEvents === 'object' && Array.isArray((rawEvents as any).data)
      ? (rawEvents as any).data
      : [];

    if (eventsList.length > 0) {
      eventsList.forEach((evt) => {
        const titleStr = typeof evt.title === 'string' ? evt.title : getLocalizedText(evt.title, language) || 'Public Event';
        const rawDesc = typeof evt.description === 'string' ? evt.description : getLocalizedText(evt.description, language) || '';
        const summaryText = rawDesc.length > 160 ? rawDesc.slice(0, 160) + '...' : rawDesc || 'Public Municipal Event';
        const subCityStr = typeof evt.organization?.name === 'string' ? evt.organization.name : getLocalizedText(evt.organization?.name, language) || 'Addis Ababa City Administration';
        const venueStr = typeof evt.location_name === 'string' ? evt.location_name : getLocalizedText(evt.location_name, language) || '';

        list.push({
          id: evt.id,
          title: titleStr,
          titleAm: '',
          type: 'event' as const,
          date: evt.event_date ? evt.event_date.split('T')[0] : 'Upcoming',
          eventDate: evt.event_date ? evt.event_date.split('T')[0] : undefined,
          endDate: evt.end_date ? evt.end_date.split('T')[0] : undefined,
          status: evt.status === 'published' ? ('Published' as const) : ('Draft' as const),
          isPublished: evt.status === 'published',
          subCity: subCityStr,
          category: 'Public event',
          coverImage: evt.images?.[0]?.image_url,
          images: evt.images?.map((img: any) => img.image_url) || [],
          summary: summaryText,
          excerpt: summaryText,
          content: rawDesc,
          organization_id: evt.organization_id,
          organization: evt.organization,
          location: {
            venue: venueStr,
            subCity: subCityStr,
          },
          audience: evt.audience,
        });
      });
    }

    return list;
  }, [propItems, newsApiResponse, eventsApiResponse, language]);

  const search = propSearch !== undefined ? propSearch : portal.search;
  const setSearch = propSetSearch || portal.setSearch;

  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [selectedNewsForEdit, setSelectedNewsForEdit] = useState<PostItem | null>(null);

  const handleOpenAdd = () => {
    if (propOnAdd) {
      propOnAdd();
    } else {
      setSelectedNewsForEdit(null);
      setIsNewsModalOpen(true);
    }
  };

  const handleOpenEdit = (item: PostItem) => {
    if (propOnEdit) {
      propOnEdit(item);
    } else {
      setSelectedNewsForEdit(item);
      setIsNewsModalOpen(true);
    }
  };

  const handleSaveNews = async (payload: any) => {
    try {
      if (payload.type === 'event') {
        if (payload.id) {
          window.alert(
            'Updating an existing event is not supported by the backend. You can create a new event or delete the previous one.'
          );
          return;
        } else {
          await createEvent({
            organization_id: payload.organization_id,
            title: payload.title,
            description: payload.description,
            location_name: payload.location_name,
            event_date: payload.event_date,
            end_date: payload.end_date || null,
            audience: payload.audience || null,
            status: payload.status || 'published',
            images: payload.images,
          }).unwrap();
        }
      } else {
        if (payload.id) {
          await updateNews({
            id: payload.id,
            body: {
              news_title: payload.news_title,
              organization_id: payload.organization_id,
              contents: payload.contents,
            },
          }).unwrap();
        } else {
          await createNews(payload).unwrap();
        }
      }
      setIsNewsModalOpen(false);
      setSelectedNewsForEdit(null);
      await Promise.all([refetchNews(), refetchEvents()]);
    } catch (err: any) {
      window.alert(err?.data?.message || err?.message || 'Failed to save item.');
    }
  };

  const handleDelete = async (targetItem: PostItem) => {
    const isEvt = normalizeType(targetItem) === 'event';
    if (window.confirm(`Are you sure you want to delete this ${isEvt ? 'event' : 'news article'}?`)) {
      try {
        if (isEvt) {
          await deleteEvent(targetItem.id).unwrap();
        } else {
          await deleteNews(targetItem.id).unwrap();
        }
        await Promise.all([refetchNews(), refetchEvents()]);
      } catch (err: any) {
        window.alert(err?.data?.message || err?.message || `Failed to delete ${isEvt ? 'event' : 'news article'}.`);
      }
    }
  };

  const onTogglePublish =
    propOnTogglePublish ||
    ((id: number | string) => {
      portal.onTogglePostPublish(id);
    });

  const publishedCount = items.filter(isPublished).length;
  const eventCount = items.filter((item) => normalizeType(item) === 'event' && isPublished(item)).length;

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesType = typeFilter === 'all' || normalizeType(item) === typeFilter;
      const matchesPublication =
        publicationFilter === 'all' ||
        (publicationFilter === 'published' ? isPublished(item) : !isPublished(item));
      const searchable = [
        item.title,
        item.titleAm,
        item.type,
        item.summary,
        item.summaryAm,
        item.content,
        item.contentAm,
        item.category,
        item.categoryAm,
        item.bureau,
        item.bureauAm,
        getSubCity(item),
        item.location?.venue,
      ]
        .filter(Boolean)
        .map((val) => typeof val === 'string' ? val : getLocalizedText(val, language) || '')
        .join(' ')
        .toLowerCase();
      return matchesType && matchesPublication && searchable.includes(search.toLowerCase());
    });
  }, [items, typeFilter, publicationFilter, search, language]);

  const { hasPermission } = usePermissions();
  const canCreate = hasPermission(['news.create', 'events.create']);
  const canUpdate = hasPermission(['news.update', 'events.update']);
  const canPublish = hasPermission(['news.publish', 'events.publish']);
  const canDelete = hasPermission(['news.delete', 'events.delete']);

  return {
    items,
    filtered,
    publishedCount,
    eventCount,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    publicationFilter,
    setPublicationFilter,
    isLoading: isNewsLoading && isEventsLoading && items.length === 0,
    isSavingPost,
    isNewsModalOpen,
    setIsNewsModalOpen,
    selectedNewsForEdit,
    setSelectedNewsForEdit,
    canCreate,
    canUpdate,
    canPublish,
    canDelete,
    handleOpenAdd,
    handleOpenEdit,
    handleSaveNews,
    handleDelete,
    onTogglePublish,
  };
};

