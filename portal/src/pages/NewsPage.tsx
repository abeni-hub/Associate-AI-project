import React, { useState } from 'react';
import { usePortal } from '../context';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import { SearchBox } from '../components/shared/SearchBox';
import { StatusPill } from '../components/shared/StatusPill';
import type { PostItem } from '../types/portal.types';

export interface NewsPageProps {
  items?: PostItem[];
  onAdd?: () => void;
  onEdit?: (item: PostItem) => void;
  search?: string;
  setSearch?: (s: string) => void;
  onTogglePublish?: (id: number | string) => void;
}

function formatDate(value?: string) {
  if (!value) return 'Date not set';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-ET', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getSubCity(item: any) {
  return item.type === 'event' ? item.location?.subCity : item.subCity;
}

function getPublishedStatus(item: any) {
  return item.isPublished === false ? 'Draft' : 'Published';
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

  const items = propItems || portal.posts || [];
  const search = propSearch !== undefined ? propSearch : portal.search;
  const setSearch = propSetSearch || portal.setSearch;
  const onAdd = propOnAdd || (() => portal.createForPage('news'));
  const onEdit =
    propOnEdit ||
    ((item: any) => {
      portal.openForm({
        eyebrow: 'PUBLIC INFORMATION',
        title: 'Edit update',
        description: 'Update news or event details.',
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
        ],
        onSubmit: () => {},
      });
    });

  const onTogglePublish =
    propOnTogglePublish ||
    ((id: any) => {
      portal.onTogglePostPublish(Number(id));
    });

  const publishedCount = items.filter((item) => item.isPublished !== false).length;
  const eventCount = items.filter((item) => item.type === 'event').length;

  const filtered = items.filter((item) => {
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesPublication =
      publicationFilter === 'all' ||
      (publicationFilter === 'published' ? item.isPublished !== false : item.isPublished === false);
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
      <div className="news-feature">
        <div className="news-feature-content">
          <span className="news-feature-kicker">
            <Icon name="news" size={15} /> PUBLIC CLIENT FEED
          </span>
          <h2>
            Good information
            <br />
            <em>brings us closer.</em>
          </h2>
          <p>
            Published updates appear in the public news and events feed. Keep titles, summaries, and full content clear in English and Amharic.
          </p>
          <div className="news-feature-stats">
            <span>
              <b>{items.length}</b>
              <small>total updates</small>
            </span>
            <span>
              <b>{publishedCount}</b>
              <small>published</small>
            </span>
            <span>
              <b>{eventCount}</b>
              <small>events</small>
            </span>
          </div>
        </div>
        <div className="news-feature-art" aria-hidden="true">
          <span className="art-sun" />
          <span className="art-hill hill-back" />
          <span className="art-hill hill-front" />
          <span className="art-building">
            <i />
            <i />
            <i />
            <i />
            <b />
          </span>
          <span className="art-caption">CIVICLINK · COMMUNITY</span>
        </div>
      </div>
      <section className="panel table-panel news-list-panel">
        <div className="table-toolbar">
          <div>
            <h2>News and event content</h2>
            <p>Search, edit, and control publication for client feed items.</p>
          </div>
          <div className="toolbar-tools">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search content, bureau, sub-city"
            />
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
        <div className="news-list">
          {filtered.map((item) => {
            const isEvent = item.type === 'event';
            const subCity = getSubCity(item);
            const publishedStatus = getPublishedStatus(item);
            const date = isEvent ? item.eventDate : item.publishedAt;
            return (
              <article className="news-row" key={item.id}>
                <span className={`news-type-icon${isEvent ? ' event' : ''}`}>
                  <Icon name={isEvent ? 'calendar' : 'news'} size={18} />
                </span>
                <div className="news-row-copy">
                  <div>
                    <span className="service-category">{isEvent ? 'Event' : 'News'}</span>
                    <span className="news-row-date">{formatDate(date)}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <small>{[item.bureau, subCity, item.category].filter(Boolean).join(' · ')}</small>
                </div>
                <div className="news-row-actions">
                  <StatusPill>{publishedStatus}</StatusPill>
                  <button
                    type="button"
                    className="button secondary small-button"
                    onClick={() => onEdit?.(item)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="button secondary small-button"
                    onClick={() => onTogglePublish(item.id)}
                  >
                    {publishedStatus === 'Published' ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              </article>
            );
          })}
          {!filtered.length && (
            <div className="empty-state">
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
