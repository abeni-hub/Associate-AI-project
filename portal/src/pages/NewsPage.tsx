import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortal } from '../context';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import { SearchBox } from '../components/shared/SearchBox';
import { StatusPill } from '../components/shared/StatusPill';
import type { PostItem } from '../types/portal.types';
import {
  useGetNewsListQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
} from '../services/newsApi';

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

  // Backend API query
  const { data: newsApiResponse, isLoading } = useGetNewsListQuery();
  const [createNews] = useCreateNewsMutation();
  const [updateNews] = useUpdateNewsMutation();
  const [deleteNews] = useDeleteNewsMutation();

  const items: PostItem[] = useMemo(() => {
    if (propItems && propItems.length > 0) return propItems;

    if (newsApiResponse?.data && newsApiResponse.data.length > 0) {
      return newsApiResponse.data.map((art) => ({
        id: art.id,
        title: art.news_title,
        titleAm: '',
        type: 'news' as const,
        date: art.created_at ? art.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        status: 'Published' as const,
        isPublished: true,
        subCity: art.organization?.name || 'Addis Ababa City Administration',
        category: 'Public notice',
        summary: art.contents?.[0]?.content || 'Official Municipal Announcement',
        excerpt: art.contents?.[0]?.content || '',
        content: art.contents?.map((c) => c.content).join('\n\n') || '',
        views: 0,
      }));
    }

    return [];
  }, [propItems, newsApiResponse]);

  const search = propSearch !== undefined ? propSearch : portal.search;
  const setSearch = propSetSearch || portal.setSearch;

  const onAdd =
    propOnAdd ||
    (() => {
      portal.openForm({
        eyebrow: 'PUBLIC INFORMATION',
        title: 'Create an update',
        description: 'Publish an official municipal notice or announcement.',
        submit: 'Publish update',
        fields: [
          { name: 'title', label: 'Title', required: true },
          { name: 'summary', label: 'Summary', type: 'textarea', required: true },
          { name: 'content', label: 'Full Announcement Details', type: 'textarea', rows: 5, full: true },
        ],
        onSubmit: async (values) => {
          try {
            await createNews({
              news_title: values.title,
              organization_id: portal.session?.user?.organization?.id || 1,
              contents: [
                { content: values.summary, content_type: 'text', order: 1 },
                ...(values.content ? [{ content: values.content, content_type: 'text', order: 2 }] : []),
              ],
            }).unwrap();
            portal.setModal(null);
          } catch {
            portal.createForPage('news');
          }
        },
      });
    });

  const onEdit =
    propOnEdit ||
    ((item: PostItem) => {
      portal.openForm({
        eyebrow: 'PUBLIC INFORMATION',
        title: 'Edit update',
        description: 'Update article title and content blocks.',
        submit: 'Save changes',
        fields: [
          { name: 'title', label: 'Title', required: true, value: item.title },
          {
            name: 'summary',
            label: 'Summary',
            type: 'textarea',
            required: true,
            value: item.summary || item.excerpt,
          },
          {
            name: 'content',
            label: 'Full Details',
            type: 'textarea',
            rows: 5,
            full: true,
            value: item.content,
          },
        ],
        onSubmit: async (values) => {
          try {
            await updateNews({
              id: item.id,
              body: {
                news_title: values.title,
                contents: [
                  { content: values.summary, content_type: 'text', order: 1 },
                  ...(values.content ? [{ content: values.content, content_type: 'text', order: 2 }] : []),
                ],
              },
            }).unwrap();
            portal.setModal(null);
          } catch {
            portal.onUpdatePost(item.id, values);
          }
        },
      });
    });

  const handleDelete = async (id: number | string) => {
    if (window.confirm('Are you sure you want to delete this news article?')) {
      try {
        await deleteNews(id).unwrap();
      } catch (err) {
        console.error('Failed to delete news article:', err);
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

  return (
    <>
      <PageHeading
        eyebrow="PUBLIC INFORMATION"
        title="News & events"
        subtitle="Manage the bilingual updates and public events shown to residents in the client app."
        action="Create an update"
        onAction={onAdd}
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
            <dd>{isLoading ? '...' : items.length}</dd>
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
                  <button
                    type="button"
                    className="button secondary small-button"
                    onClick={() => onEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="button secondary small-button"
                    onClick={() => onTogglePublish(item.id)}
                  >
                    {status === 'Published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    className="button secondary small-button"
                    style={{ color: '#c0392b' }}
                    onClick={() => handleDelete(item.id)}
                    title="Delete update"
                  >
                    Delete
                  </button>
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
    </>
  );
};

export default NewsPage;
