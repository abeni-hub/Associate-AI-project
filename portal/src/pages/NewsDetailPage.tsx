import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../components/shared/Icon';
import { StatusPill } from '../components/shared/StatusPill';
import { usePortal } from '../context';
import type { PostItem } from '../types/portal.types';

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
  const item = portal.posts.find((post) => String(post.id) === id);

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
  const openEdit = () => {
    portal.openForm({
      eyebrow: 'PUBLIC INFORMATION',
      title: 'Edit update',
      description: 'Keep the English and Amharic versions clear and consistent.',
      submit: 'Save changes',
      fields: [
        { name: 'title', label: 'Title in English', required: true, value: item.title },
        { name: 'titleAm', label: 'Title in Amharic', value: item.titleAm },
        {
          name: 'summary',
          label: 'Summary in English',
          type: 'textarea',
          required: true,
          value: item.summary || item.excerpt,
        },
        { name: 'summaryAm', label: 'Summary in Amharic', type: 'textarea', value: item.summaryAm },
        {
          name: 'content',
          label: 'Full content in English',
          type: 'textarea',
          rows: 5,
          full: true,
          value: item.content,
        },
        {
          name: 'contentAm',
          label: 'Full content in Amharic',
          type: 'textarea',
          rows: 5,
          full: true,
          value: item.contentAm,
        },
      ],
      onSubmit: (values) => portal.onUpdatePost(item.id, values),
    });
  };

  return (
    <div className="news-detail-page" lang={language}>
      <div className="news-detail-toolbar">
        <Link className="news-back-link" to="/news">
          <Icon name="arrow" size={16} /> Back to news & events
        </Link>
        <div className="news-detail-admin-actions">
          <StatusPill>{published ? 'Published' : 'Draft'}</StatusPill>
          <button type="button" className="button secondary small-button" onClick={openEdit}>
            Edit update
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

      <article className="news-detail-article">
        <header className="news-detail-header">
          <div className="news-detail-badges">
            <span className="news-detail-category">{category || (event ? 'Community event' : 'Public notice')}</span>
            <span className="news-detail-kind">{event ? 'Event' : 'News'}</span>
            {bureau && <span className="news-detail-meta"><Icon name="building" size={14} />{bureau}</span>}
            {subCity && <span className="news-detail-meta"><Icon name="map" size={14} />{subCity}</span>}
          </div>
          <h1>{title}</h1>
          {summary && <p className="news-detail-lead">{summary}</p>}
          <div className="news-detail-meta-row">
            <span><Icon name="calendar" size={15} /> {formatDate(date, language)}</span>
            {!event && item.author?.name && (
              <span>{language === 'am' ? item.author.nameAm || item.author.name : item.author.name}</span>
            )}
            {!event && item.readTimeMinutes && (
              <span>{item.readTimeMinutes} {language === 'am' ? 'ደቂቃ ንባብ' : 'min read'}</span>
            )}
            {event && item.time && (
              <span><Icon name="clock" size={15} /> {language === 'am' ? item.timeAm || item.time : item.time}</span>
            )}
          </div>
        </header>

        {item.coverImage && (
          <figure className="news-detail-cover">
            <img src={item.coverImage} alt="" />
          </figure>
        )}

        {event && (
          <section className="news-event-facts" aria-label="Event details">
            <div>
              <span className="news-event-fact-icon"><Icon name="calendar" size={18} /></span>
              <span>
                <small>{language === 'am' ? 'ቀን እና ሰዓት' : 'Date and time'}</small>
                <b>{formatDate(item.eventDate || item.date, language)}</b>
                <span>{language === 'am' ? item.timeAm || item.time : item.time}</span>
              </span>
            </div>
            <div>
              <span className="news-event-fact-icon"><Icon name="map" size={18} /></span>
              <span>
                <small>{language === 'am' ? 'ቦታ' : 'Venue'}</small>
                <b>{language === 'am' ? item.location?.venueAm || item.location?.venue : item.location?.venue}</b>
                <span>{language === 'am' ? item.location?.addressAm || item.location?.address : item.location?.address}</span>
              </span>
            </div>
            {(item.organizer || item.organizerAm) && (
              <div>
                <span className="news-event-fact-icon"><Icon name="building" size={18} /></span>
                <span>
                  <small>{language === 'am' ? 'አዘጋጅ' : 'Organized by'}</small>
                  <b>{language === 'am' ? item.organizerAm || item.organizer : item.organizer}</b>
                  {item.capacity && <span>{item.rsvpCount || 0} / {item.capacity} {language === 'am' ? 'ቦታዎች ተይዘዋል' : 'seats booked'}</span>}
                </span>
              </div>
            )}
          </section>
        )}

        <section className="news-detail-content">
          <div className="news-detail-content-heading">
            <div>
              <span className="panel-eyebrow">{event ? 'EVENT DETAILS' : 'PUBLIC NOTICE'}</span>
              <h2>{language === 'am' ? 'ሙሉ መረጃ' : 'Full update'}</h2>
            </div>
            <div className="news-language-switch" role="group" aria-label="Preview language">
              <button
                type="button"
                className={language === 'en' ? 'active' : ''}
                aria-pressed={language === 'en'}
                onClick={() => setLanguage('en')}
              >
                English
              </button>
              <button
                type="button"
                className={language === 'am' ? 'active' : ''}
                aria-pressed={language === 'am'}
                onClick={() => setLanguage('am')}
              >
                አማርኛ
              </button>
            </div>
          </div>
          {language === 'am' && !item.contentAm ? (
            <p className="news-detail-missing-copy">Amharic full content has not been added to this update yet.</p>
          ) : (
            <div className="news-detail-body">{body || 'Full content has not been added yet.'}</div>
          )}
          {item.tags?.length ? (
            <div className="news-detail-tags">
              <span>{language === 'am' ? 'ተዛማጅ ርዕሶች' : 'Related topics'}</span>
              {item.tags.map((tag) => <small key={tag}>{tag}</small>)}
            </div>
          ) : null}
          <div className="news-detail-verification">
            <Icon name="shield" size={19} />
            <p>
              {language === 'am'
                ? 'ይህ ዝርዝር የሚታየው በዜጎች መተግበሪያ ውስጥ እንደሚታተመው ነው።'
                : 'This preview shows the update as residents will read it in the client app.'}
            </p>
          </div>
        </section>
      </article>
    </div>
  );
};

export default NewsDetailPage;
