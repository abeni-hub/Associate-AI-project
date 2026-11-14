import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { usePortal } from '../../shared';
import { useLanguage, getLocalizedText } from '../../shared/i18n';
import type { PostItem } from '../../../types/portal.types';
import {
  useGetNewsByIdQuery,
  useUpdateNewsMutation,
} from '../api/newsApi';
import {
  useGetEventByIdQuery,
  useCreateEventMutation,
} from '../api/eventsApi';

export function isEvent(item: PostItem): boolean {
  return String(item.type).toLowerCase().includes('event');
}

function isPublished(item: any): boolean {
  return item.isPublished ?? (String(item.status || '').toLowerCase() !== 'draft');
}

export function formatDetailDate(value?: string, language = 'en'): string {
  if (!value) return 'Date not set';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + 'T00:00:00') : new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-ET', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
}

export const useNewsDetail = () => {
  const { id } = useParams();
  const portal = usePortal();
  const { language: currentAppLang } = useLanguage();
  const [language, setLanguage] = useState<'en' | 'am'>(
    currentAppLang === 'am' ? 'am' : 'en'
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: apiArticle, isLoading: isNewsLoading, refetch: refetchNews } = useGetNewsByIdQuery(id!, { skip: !id });
  const { data: apiEvent, isLoading: isEventLoading, refetch: refetchEvent } = useGetEventByIdQuery(id!, {
    skip: !id || !!apiArticle?.data,
  });

  const [updateNews, { isLoading: isUpdatingNews }] = useUpdateNewsMutation();
  const [createEvent, { isLoading: isCreatingEvent }] = useCreateEventMutation();

  const isLoading = isNewsLoading || (isEventLoading && !apiArticle?.data);

  const item: any = useMemo(() => {
    if (apiArticle?.data) {
      const art = apiArticle.data;
      const imageBlocks =
        art.contents?.filter(
          (c: any) => c.content_type === 'image_url' || c.content_type === 'image'
        ) || [];
      const textBlocks =
        art.contents?.filter(
          (c: any) => c.content_type !== 'image_url' && c.content_type !== 'image'
        ) || [];

      const rawTitle = art.news_title;
      const titleStr = typeof rawTitle === 'string' ? rawTitle : getLocalizedText(rawTitle, language) || 'Official Notice';
      const rawOrgName = art.organization?.name;
      const subCityStr = typeof rawOrgName === 'string' ? rawOrgName : getLocalizedText(rawOrgName, language) || 'City Administration';
      const rawFirstText = textBlocks[0]?.content;
      const firstTextStr = typeof rawFirstText === 'string' ? rawFirstText : getLocalizedText(rawFirstText, language) || '';
      const fullContent = textBlocks.map((c: any) => typeof c.content === 'string' ? c.content : getLocalizedText(c.content, language) || '').join('\n\n');

      return {
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
        summary: firstTextStr,
        excerpt: firstTextStr,
        content: fullContent,
        views: 0,
      };
    }

    if (apiEvent?.data) {
      const evt = apiEvent.data;
      const rawTitle = evt.title;
      const titleStr = typeof rawTitle === 'string' ? rawTitle : getLocalizedText(rawTitle, language) || 'Public Event';
      const rawOrgName = evt.organization?.name;
      const subCityStr = typeof rawOrgName === 'string' ? rawOrgName : getLocalizedText(rawOrgName, language) || 'City Administration';
      const rawDesc = typeof evt.description === 'string' ? evt.description : getLocalizedText(evt.description, language) || '';
      const summaryStr = rawDesc.length > 160 ? rawDesc.slice(0, 160) + '...' : rawDesc;
      const venueStr = typeof evt.location_name === 'string' ? evt.location_name : getLocalizedText(evt.location_name, language) || '';

      return {
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
        summary: summaryStr,
        excerpt: summaryStr,
        content: rawDesc,
        location: {
          venue: venueStr,
          subCity: subCityStr,
        },
        audience: evt.audience,
        views: 0,
      };
    }

    return undefined;
  }, [apiArticle, apiEvent, id, language]);

  const handleSaveItem = async (payload: any) => {
    try {
      if (payload.type === 'event') {
        if (!payload.id) {
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
        } else {
          window.alert('Updating this event is completed.');
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
        }
      }
      setIsEditModalOpen(false);
      refetchNews();
      refetchEvent();
    } catch (err: any) {
      window.alert(err?.data?.message || err?.message || 'Failed to update item.');
    }
  };

  const togglePublish = (targetId: number | string) => {
    portal.onTogglePostPublish(targetId);
  };

  return {
    item,
    isLoading,
    language,
    setLanguage,
    isEditModalOpen,
    setIsEditModalOpen,
    isSubmitting: isUpdatingNews || isCreatingEvent,
    handleSaveItem,
    togglePublish,
  };
};

