import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortal } from '../context';
import { usePermissions } from '../hooks/usePermissions';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import { SearchBox } from '../components/shared/SearchBox';
import { StatusPill } from '../components/shared/StatusPill';
import { NewsModal } from '../components/news/NewsModal';
import type { PostItem } from '../types/portal.types';
import {
  useGetNewsListQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
} from '../services/newsApi';
import {
  useGetEventsQuery,
  useCreateEventMutation,
  useDeleteEventMutation,
} from '../services/eventsApi';

export interface NewsPageProps {
  items?: PostItem[];
  onAdd?: () => void;
  onEdit?: (item: PostItem) => void;
  search?: string;
  setSearch?: (s: string) => void;
  onTogglePublish?: (id: number | string) => void;
}

function normalizeType(item: PostItem) {
  return String(item.type).toLowerCase().includes('event') ? 'event' : 'news';
}

function isPublished(item: PostItem) {
  return item.isPublished ?? (String(item.status || '').toLowerCase() !== 'draft');
}

function formatDate(value?: string) {
  if (!value) return 'Date not set';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + 'T00:00:00') : new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-ET', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getSubCity(item: PostItem) {
  return normalizeType(item) === 'event' ? item.location?.subCity || item.subCity : item.subCity;
}

export const NewsPage: React.FC<NewsPageProps> = ({
  items: propItems,
  onAdd: propOnAdd,
  onEdit: propOnEdit,
  search: propSearch,
  setSearch: propSetSearch,
  onTogglePublish: propOnTogglePublish,
}) => {
  const portal = usePortal();
  const [typeFilter, setTypeFilter] = useState('all');
  const [publicationFilter, setPublicationFilter] = useState('all');

  // Backend API queries
  const { data: newsApiResponse, isLoading: isNewsLoading } = useGetNewsListQuery();
  const { data: eventsApiResponse, isLoading: isEventsLoading } = useGetEventsQuery();
  const [createNews] = useCreateNewsMutation();
  const [updateNews] = useUpdateNewsMutation();
  const [deleteNews] = useDeleteNewsMutation();
  const [createEvent] = useCreateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const items: PostItem[] = useMemo(() => {
    if (propItems && propItems.length > 0) return propItems;

    const list: PostItem[] = [];

    // Map news items
    if (newsApiResponse?.data && newsApiResponse.data.length > 0) {
      newsApiResponse.data.forEach((art) => {
        const imageBlocks =
          art.contents?.filter(
            (c) => c.content_type === 'image_url' || c.content_type === 'image'
          ) || [];
        const textBlocks =
          art.contents?.filter(
            (c) => c.content_type !== 'image_url' && c.content_type !== 'image'
          ) || [];

        const summaryText =
          textBlocks.length > 1
            ? textBlocks[0].content
            : textBlocks[0]?.content
            ? (textBlocks[0].content.length > 160
                ? textBlocks[0].content.slice(0, 160) + '...'
                : textBlocks[0].content)
            : 'Official Municipal Announcement';

        const fullContent = textBlocks.map((c) => c.content).join('\n\n');

        list.push({
          id: art.id,
          title: art.news_title,
          titleAm: '',
          type: 'news' as const,
          date: art.created_at ? art.created_at.split('T')[0] : 'Recent',
          status: 'Published' as const,
          isPublished: true,
          subCity: art.organization?.name || 'Addis Ababa City Administration',
          category: 'Public notice',
          coverImage: imageBlocks[0]?.content,
          images: imageBlocks.map((b) => b.content),
          summary: summaryText,
          excerpt: summaryText,
          content: fullContent,
          views: 0,
          organization_id: art.organization_id,
          organization: art.organization,
          contents: art.contents,
        });
      });
    }

    // Map public events
    if (eventsApiResponse?.data && eventsApiResponse.data.length > 0) {
      eventsApiResponse.data.forEach((evt) => {
        list.push({
          id: evt.id,
          title: evt.title,
          titleAm: '',
          type: 'event' as const,
          date: evt.event_date ? evt.event_date.split('T')[0] : 'Upcoming',
          eventDate: evt.event_date ? evt.event_date.split('T')[0] : undefined,
          endDate: evt.end_date ? evt.end_date.split('T')[0] : undefined,
          status: evt.status === 'published' ? ('Published' as const) : ('Draft' as const),
          isPublished: evt.status === 'published',
          subCity: evt.organization?.name || 'Addis Ababa City Administration',
          category: 'Public event',
          coverImage: evt.images?.[0]?.image_url,
          images: evt.images?.map((img) => img.image_url) || [],
          summary:
            evt.description && evt.description.length > 160
              ? evt.description.slice(0, 160) + '...'
              : evt.description || 'Public Municipal Event',
          excerpt:
            evt.description && evt.description.length > 160
              ? evt.description.slice(0, 160) + '...'
              : evt.description || 'Public Municipal Event',
          content: evt.description,
          views: 0,
          organization_id: evt.organization_id,
          organization: evt.organization,
          location: {
            venue: evt.location_name,
            subCity: evt.organization?.name,
          },
          audience: evt.audience,
        });
      });
    }

    return list;
  }, [propItems, newsApiResponse, eventsApiResponse]);

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

  const filtered = items.filter((item) => {
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
      .join(' ')
      .toLowerCase();
    return matchesType && matchesPublication && searchable.includes(search.toLowerCase());
  });

  const { hasPermission } = usePermissions();
  const canCreate = hasPermission(['news.create', 'events.create']);
  const canUpdate = hasPermission(['news.update', 'events.update']);
  const canPublish = hasPermission(['news.publish', 'events.publish']);
  const canDelete = hasPermission(['news.delete', 'events.delete']);

  return (
    <>
      <PageHeading
        eyebrow="PUBLIC INFORMATION"
        title="News & events"
        subtitle="Manage the bilingual updates and public events shown to residents in the client app."
        action={canCreate ? 'Create an update' : undefined}
        onAction={canCreate ? handleOpenAdd : undefined}
      />

      <section className="feed-overview" aria-label="Public client feed status">
        <div className="feed-overview-intro">
          <div className="feed-overview-heading">
            <span className="feed-overview-icon">
              <Icon name="news" size={20} />
            </span>
            <div>
              <span className={'feed-live-status' + (publishedCount ? '' : ' is-empty')}>
                <i /> Public client feed
              </span>
              <h2>Updates residents can use</h2>
            </div>
          </div>
          <p>
            Published notices appear in the client app. Preview each update in English and Amharic before it goes live.
          </p>
        </div>
        <dl className="feed-overview-stats">
          <div>
            <dt>Total updates</dt>
            <dd>{isNewsLoading || isEventsLoading ? '...' : items.length}</dd>
          </div>
          <div>
            <dt>Published</dt>
            <dd>{publishedCount}</dd>
          </div>
          <div>
            <dt>Published events</dt>
            <dd>{eventCount}</dd>
          </div>
        </dl>
      </section>

      <section className="panel table-panel news-list-panel">
        <div className="table-toolbar">
          <div>
            <h2>Client feed content</h2>
            <p>Browse public cards, open the full detail, and manage publication.</p>
          </div>
          <div className="toolbar-tools">
            <SearchBox value={search} onChange={setSearch} placeholder="Search updates, bureau, location" />
            <select
              className="filter-select"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              aria-label="Filter by content type"
            >
              <option value="all">All types</option>
              <option value="news">News</option>
              <option value="event">Events</option>
            </select>
            <select
              className="filter-select"
              value={publicationFilter}
              onChange={(event) => setPublicationFilter(event.target.value)}
              aria-label="Filter by publication status"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        </div>

        <div className="news-grid">
          {filtered.map((item) => {
            const isEvent = normalizeType(item) === 'event';
            const date = isEvent ? item.eventDate || item.date : item.publishedAt || item.date;
            const subCity = getSubCity(item);
            const status = isPublished(item) ? 'Published' : 'Draft';
            const summary = item.summary || item.excerpt || 'No summary has been added yet.';

            return (
              <article className="news-admin-card" key={item.id}>
                <Link className="news-card-link" to={'/news/' + encodeURIComponent(String(item.id))}>
                  <div className="news-card-media">
                    {item.coverImage ? (
                      <img src={item.coverImage} alt="" loading="lazy" />
                    ) : (
                      <span className="news-card-image-placeholder" aria-hidden="true">
                        <Icon name={isEvent ? 'calendar' : 'news'} size={28} />
                      </span>
                    )}
                    <span className="news-card-category">{item.category || (isEvent ? 'Community event' : 'Public notice')}</span>
                    {isEvent && date && (
                      <span className="news-card-date-badge">{formatDate(date)}</span>
                    )}
                  </div>
                  <div className="news-card-copy">
                    <div className="news-card-meta">
                      <span>{isEvent ? 'Event' : 'News'}</span>
                      {!isEvent && <span>{formatDate(date)}</span>}
                    </div>
                    <h3>{item.title}</h3>
                    <p>{summary}</p>
                    <div className="news-card-byline">
                      <span>{item.bureau || item.organizer || 'CivicLink Ethiopia'}</span>
                      {subCity && <span>{subCity}</span>}
                      {!isEvent && item.readTimeMinutes && (
                        <span>{item.readTimeMinutes} min read</span>
                      )}
                    </div>
                    <span className="news-card-read-link">
                      View public detail <Icon name="arrow" size={15} />
                    </span>
                  </div>
                </Link>
                <div className="news-card-admin-actions">
                  <StatusPill>{status}</StatusPill>
                  {canUpdate && (
                    <button
                      type="button"
                      className="button secondary small-button"
                      onClick={() => handleOpenEdit(item)}
                    >
                      Edit
                    </button>
                  )}
                  {canPublish && (
                    <button
                      type="button"
                      className="button secondary small-button"
                      onClick={() => onTogglePublish(item.id)}
                    >
                      {status === 'Published' ? 'Unpublish' : 'Publish'}
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      className="button secondary small-button"
                      style={{ color: '#c0392b' }}
                      onClick={() => handleDelete(item)}
                      title="Delete update"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </article>
            );
          })}
          {!filtered.length && (
            <div className="empty-state news-empty-state">
              <b>No updates found</b>
              <p>Try another search or change the filters.</p>
            </div>
          )}
        </div>
        <div className="table-footer">
          <span>
            Showing <b>{filtered.length}</b> of <b>{items.length}</b> updates
          </span>
        </div>
      </section>

      <NewsModal
        isOpen={isNewsModalOpen}
        item={selectedNewsForEdit}
        onClose={() => {
          setIsNewsModalOpen(false);
          setSelectedNewsForEdit(null);
        }}
        onSave={handleSaveNews}
      />
    </>
  );
};

export default NewsPage;
