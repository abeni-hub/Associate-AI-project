import React from 'react';
import { Link } from 'react-router-dom';
import { Icon, StatusPill } from '../shared';
import { NewsModal } from './components/NewsModal';
import { useNewsDetail, isEvent, isPublished } from './hooks/useNewsDetail';
import { NewsDetailHeader } from './components/NewsDetailHeader';
import { NewsDetailEventFacts } from './components/NewsDetailEventFacts';
import { NewsDetailContent } from './components/NewsDetailContent';

export const NewsDetailPage: React.FC = () => {
  const {
    item,
    isLoading,
    language,
    setLanguage,
    isEditModalOpen,
    setIsEditModalOpen,
    isSubmitting,
    handleSaveItem,
    togglePublish,
  } = useNewsDetail();

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
  const summary = language === 'am' ? item.summaryAm || item.summary || item.excerpt : item.summary || item.excerpt;
  const category = language === 'am' ? item.categoryAm || item.category : item.category;
  const body = language === 'am' ? item.contentAm : item.content || item.excerpt || item.summary;
  const date = event ? item.eventDate || item.date : item.publishedAt || item.date;
  const subCity = language === 'am'
    ? item.location?.subCityAm || item.subCityAm || item.location?.subCity || item.subCity
    : item.location?.subCity || item.subCity;
  const bureau = language === 'am' ? item.bureauAm || item.bureau : item.bureau;

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
            onClick={() => togglePublish(item.id)}
          >
            {published ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      <article className="news-detail-card">
        <NewsDetailHeader
          item={item}
          event={event}
          language={language}
          title={title}
          summary={summary}
          category={category}
          date={date}
          subCity={subCity}
          bureau={bureau}
        />

        <div className="news-detail-inner-body">
          {event && (
            <NewsDetailEventFacts
              item={item}
              language={language}
              bureau={bureau}
            />
          )}

          <NewsDetailContent
            item={item}
            event={event}
            language={language}
            onLanguageChange={setLanguage}
            body={body}
          />
        </div>
      </article>

      <NewsModal
        isOpen={isEditModalOpen}
        item={item}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveItem}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default NewsDetailPage;
