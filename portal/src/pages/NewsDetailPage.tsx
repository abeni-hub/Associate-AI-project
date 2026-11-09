import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../components/shared/Icon';
import { StatusPill } from '../components/shared/StatusPill';
import { NewsModal } from '../components/news/NewsModal';
import { usePortal } from '../context';
import type { PostItem } from '../types/portal.types';

import {
  useGetNewsByIdQuery,
  useUpdateNewsMutation,
} from '../services/newsApi';
import {
  useGetEventByIdQuery,
  useCreateEventMutation,
} from '../services/eventsApi';

function isEvent(item: PostItem) {
  return String(item.type).toLowerCase().includes('event');
}

function isPublished(item: PostItem) {
  return item.isPublished ?? (String(item.status || '').toLowerCase() !== 'draft');
}

function formatDate(value?: string, language = 'en') {
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

export const NewsDetailPage: React.FC = () => {
  const { id } = useParams();
  const portal = usePortal();
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: apiArticle, isLoading: isNewsLoading, refetch: refetchNews } = useGetNewsByIdQuery(id!, { skip: !id });
  const { data: apiEvent, isLoading: isEventLoading, refetch: refetchEvent } = useGetEventByIdQuery(id!, {
    skip: !id || !!apiArticle?.data,
  });

  const [updateNews, { isLoading: isUpdatingNews }] = useUpdateNewsMutation();
  const [createEvent, { isLoading: isCreatingEvent }] = useCreateEventMutation();

  const isLoading = isNewsLoading || (isEventLoading && !apiArticle?.data);

  const item: PostItem | undefined = React.useMemo(() => {
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

      return {
        id: art.id,
        title: art.news_title,
        titleAm: '',
        type: 'news' as const,
        date: art.created_at ? art.created_at.split('T')[0] : 'Recent',
        status: 'Published' as const,
        isPublished: true,
        subCity: art.organization?.name || 'City Administration',
        category: 'Public notice',
        coverImage: imageBlocks[0]?.content,
        images: imageBlocks.map((b: any) => b.content),
        summary: textBlocks[0]?.content || '',
        excerpt: textBlocks[0]?.content || '',
        content: textBlocks.map((c: any) => c.content).join('\n\n') || '',
        views: 0,
      };
    }

    if (apiEvent?.data) {
      const evt = apiEvent.data;
      return {
        id: evt.id,
        title: evt.title,
        titleAm: '',
        type: 'event' as const,
        date: evt.event_date ? evt.event_date.split('T')[0] : 'Upcoming',
        eventDate: evt.event_date ? evt.event_date.split('T')[0] : undefined,
        endDate: evt.end_date ? evt.end_date.split('T')[0] : undefined,
        status: evt.status === 'published' ? ('Published' as const) : ('Draft' as const),
        isPublished: evt.status === 'published',
        subCity: evt.organization?.name || 'City Administration',
        category: 'Public event',
        coverImage: evt.images?.[0]?.image_url,
        images: evt.images?.map((img: any) => img.image_url) || [],
        summary: evt.description?.slice(0, 160) || '',
        excerpt: evt.description?.slice(0, 160) || '',
        content: evt.description || '',
        location: {
          venue: evt.location_name,
          subCity: evt.organization?.name,
        },
        audience: evt.audience,
        views: 0,
      };
    }

    if (portal.posts && portal.posts.length > 0) {
      const fallback = portal.posts.find((p) => String(p.id) === String(id));
      if (fallback) return fallback;
    }

    return undefined;
  }, [apiArticle, apiEvent, portal.posts, id]);

  if (isLoading) {
    return (
      <section className="news-detail-not-found panel">
        <div className="loading-spinner" />
        <p>Loading news details...</p>
      </section>
    );
  }

  if (!item) {
    return (
      <section className="news-detail-not-found panel">
        <span className="feed-overview-icon"><Icon name="news" size={20} /></span>
        <h1>Update not found</h1>
        <p>This update may have been removed from the client feed.</p>
        <Link className="button secondary" to="/news">
          <Icon name="arrow" size={15} /> Back to news & events
        </Link>
      </section>
    );
  }

  const event = isEvent(item);
  const published = isPublished(item);
  const title = language === 'am' ? item.titleAm || item.title : item.title;
  const summary =
    language === 'am'
      ? item.summaryAm || item.summary || item.excerpt
      : item.summary || item.excerpt;
  const category =
    language === 'am' ? item.categoryAm || item.category : item.category;
  const body = language === 'am' ? item.contentAm : item.content || item.excerpt || item.summary;
  const date = event ? item.eventDate || item.date : item.publishedAt || item.date;
  const subCity =
    language === 'am'
      ? item.location?.subCityAm || item.subCityAm || item.location?.subCity || item.subCity
      : item.location?.subCity || item.subCity;
  const bureau = language === 'am' ? item.bureauAm || item.bureau : item.bureau;
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

  return (
    <div className="news-detail-page" lang={language}>
      <div className="news-detail-toolbar">
        <Link className="news-back-link" to="/news">
          <Icon name="arrow" size={15} /> Back to news & events
        </Link>
        <div className="news-detail-admin-actions">
          <StatusPill>{published ? 'Published' : 'Draft'}</StatusPill>
          <button type="button" className="button secondary small-button" onClick={() => setIsEditModalOpen(true)}>
            <Icon name="pencil" size={13} /> Edit update
          </button>
          <button
            type="button"
            className="button secondary small-button"
            onClick={() => portal.onTogglePostPublish(item.id)}
          >
            {published ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      <article className="news-detail-card">
        {/* Top Hero Cover Media */}
        {item.coverImage && (
          <figure className="news-detail-hero-frame">
            <img src={item.coverImage} alt={title} />
            {event && (
              <div className="news-detail-event-float-badge">
                <span className="float-badge-month">
                  {new Date(item.eventDate || item.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                </span>
                <span className="float-badge-day">
                  {new Date(item.eventDate || item.date).getDate() || '1'}
                </span>
              </div>
            )}
          </figure>
        )}

        {/* Additional photos right after the main image */}
        {item.images && item.images.length > 1 && (
          <div className="news-detail-media-strip">
            <div className="news-detail-gallery-grid">
              {item.images.slice(1).map((imgUrl, i) => (
                <div key={i} className="news-detail-gallery-item">
                  <img src={imgUrl} alt={`Additional media ${i + 2}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="news-detail-inner-body">
          {/* Header & Badges */}
          <header className="news-detail-header">
            <div className="news-detail-badges">
              <span className="news-detail-category">{category || (event ? 'Community event' : 'Public notice')}</span>
              <span className="news-detail-kind">{event ? 'Event' : 'Official Notice'}</span>
              {bureau && (
                <span className="news-detail-meta">
                  <Icon name="building" size={13} /> {bureau}
                </span>
              )}
              {subCity && (
                <span className="news-detail-meta">
                  <Icon name="map" size={13} /> {subCity}
                </span>
              )}
            </div>

            <h1 className="news-detail-title">{title}</h1>
            {summary && <p className="news-detail-lead">{summary}</p>}

            <div className="news-detail-meta-bar">
              <div className="news-detail-author-slot">
                <div className="news-detail-author-avatar">
                  <Icon name="user" size={15} />
                </div>
                <div>
                  <strong>
                    {language === 'am' ? item.author?.nameAm || item.author?.name || 'የአዲስ አበባ ከተማ አስተዳደር' : item.author?.name || 'Addis Ababa City Administration'}
                  </strong>
                  <small>{bureau || (language === 'am' ? 'የህዝብ መረጃ ክፍል' : 'Public Information Desk')}</small>
                </div>
              </div>

              <div className="news-detail-meta-chips">
                <span><Icon name="calendar" size={14} /> {formatDate(date, language)}</span>
                {!event && item.readTimeMinutes && (
                  <span><Icon name="clock" size={14} /> {item.readTimeMinutes} {language === 'am' ? 'ደቂቃ ንባብ' : 'min read'}</span>
                )}
                {event && item.time && (
                  <span><Icon name="clock" size={14} /> {language === 'am' ? item.timeAm || item.time : item.time}</span>
                )}
              </div>
            </div>
          </header>

          {/* Event Facts Box (if event) */}
          {event && (
            <section className="news-event-facts-grid" aria-label="Event details">
              <div className="news-event-fact-item">
                <div className="news-event-fact-icon"><Icon name="calendar" size={18} /></div>
                <div>
                  <small>{language === 'am' ? 'ቀን እና ሰዓት' : 'Date and Time'}</small>
                  <b>{formatDate(item.eventDate || item.date, language)}</b>
                  <span>{language === 'am' ? item.timeAm || item.time : item.time}</span>
                </div>
              </div>
              <div className="news-event-fact-item">
                <div className="news-event-fact-icon"><Icon name="map" size={18} /></div>
                <div>
                  <small>{language === 'am' ? 'ቦታ / አድራሻ' : 'Venue & Address'}</small>
                  <b>{language === 'am' ? item.location?.venueAm || item.location?.venue : item.location?.venue || 'Addis Ababa'}</b>
                  <span>{language === 'am' ? item.location?.addressAm || item.location?.address : item.location?.address}</span>
                </div>
              </div>
              {(item.organizer || item.organizerAm || item.capacity) && (
                <div className="news-event-fact-item">
                  <div className="news-event-fact-icon"><Icon name="building" size={18} /></div>
                  <div>
                    <small>{language === 'am' ? 'አዘጋጅ' : 'Organizer & Capacity'}</small>
                    <b>{language === 'am' ? item.organizerAm || item.organizer : item.organizer || bureau || 'City Administration'}</b>
                    {item.capacity && (
                      <span>{item.rsvpCount || 0} / {item.capacity} {language === 'am' ? 'ቦታዎች ተይዘዋል' : 'seats booked'}</span>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Main Content Body with Language Switcher */}
          <section className="news-detail-content-area">
            <div className="news-detail-section-header">
              <div>
                <span className="panel-eyebrow">{event ? 'EVENT BRIEFING' : 'OFFICIAL STATEMENT'}</span>
                <h2>{language === 'am' ? 'ዝርዝር መግለጫ' : 'Full Briefing'}</h2>
              </div>
              <div className="news-language-switch" role="group" aria-label="Preview language">
                <button
                  type="button"
                  className={language === 'en' ? 'active' : ''}
                  onClick={() => setLanguage('en')}
                >
                  English
                </button>
                <button
                  type="button"
                  className={language === 'am' ? 'active' : ''}
                  onClick={() => setLanguage('am')}
                >
                  አማርኛ
                </button>
              </div>
            </div>

            <div className="news-detail-prose">
              {body || (language === 'am' ? 'ሙሉ መረጃ አልተጨመረም።' : 'Full content has not been added yet.')}
            </div>

            {/* Tags */}
            {item.tags?.length ? (
              <div className="news-detail-tags-row">
                <span>{language === 'am' ? 'ተዛማጅ ርዕሶች፦' : 'Related Topics:'}</span>
                {item.tags.map((tag) => <small key={tag}>#{tag}</small>)}
              </div>
            ) : null}

            {/* Verification Banner */}
            <div className="news-detail-verified-banner">
              <Icon name="checkCircle" size={20} />
              <div>
                <b>{language === 'am' ? 'የተረጋገጠ ይፋዊ መረጃ' : 'Verified Public Information'}</b>
                <p>
                  {language === 'am'
                    ? 'ይህ መረጃ በአዲስ አበባ ከተማ አስተዳደር ይፋዊ ስርዓት የተረጋገጠና ለዜጎች መተግበሪያ የተለቀቀ ነው።'
                    : 'Published and verified through the Addis Ababa City Administration official civic communication portal.'}
                </p>
              </div>
            </div>
          </section>
        </div>
      </article>

      <NewsModal
        isOpen={isEditModalOpen}
        item={item}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveItem}
        isLoading={isUpdatingNews || isCreatingEvent}
      />
    </div>
  );
};

export default NewsDetailPage;
