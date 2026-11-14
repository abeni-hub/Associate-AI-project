import React from 'react';
import { Link } from 'react-router-dom';
import { Icon, StatusPill } from '../../shared';
import type { PostItem } from '../../../types/portal.types';
import { normalizeType, isPublished, formatDate, getSubCity } from '../hooks/useNewsList';

interface NewsCardGridProps {
  items: PostItem[];
  filtered: PostItem[];
  isLoading: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canPublish: boolean;
  canDelete: boolean;
  onOpenAdd: () => void;
  onOpenEdit: (item: PostItem) => void;
  onTogglePublish: (id: number | string) => void;
  onDelete: (item: PostItem) => void;
  onResetFilters: () => void;
}

export const NewsCardGrid: React.FC<NewsCardGridProps> = ({
  items,
  filtered,
  isLoading,
  canCreate,
  canUpdate,
  canPublish,
  canDelete,
  onOpenAdd,
  onOpenEdit,
  onTogglePublish,
  onDelete,
  onResetFilters,
}) => {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', gap: '12px' }}>
        <div className="loading-spinner" />
        <p style={{ margin: 0, color: '#00485a', fontWeight: 600, fontSize: '14px' }}>Loading public updates and events...</p>
        <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Fetching official notices and civic announcements</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        style={{
          padding: '64px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          background: '#ffffff',
          borderRadius: '8px',
          margin: '1.25rem 0',
          border: '1px dashed #cbd5e1',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#f1f5f9',
            color: '#64748b',
          }}
        >
          <Icon name="news" size={28} />
        </span>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: '#0f172a', fontWeight: 700 }}>
            No news is recorded
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', maxWidth: '420px' }}>
            There are currently no official municipal notices or civic announcements recorded in the system.
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            className="button primary"
            style={{ marginTop: '6px' }}
            onClick={onOpenAdd}
          >
            + Create news article
          </button>
        )}
      </div>
    );
  }

  return (
    <>
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
                    onClick={() => onOpenEdit(item)}
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
                    onClick={() => onDelete(item)}
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
            <b>No matching updates found</b>
            <p>Try another search or change the filters.</p>
            <button
              type="button"
              className="button secondary small-button"
              style={{ marginTop: '8px' }}
              onClick={onResetFilters}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <div className="table-footer">
        <span>
          Showing <b>{filtered.length}</b> of <b>{items.length}</b> updates
        </span>
      </div>
    </>
  );
};

