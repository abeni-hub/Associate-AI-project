import React from 'react';
import { Icon } from '../../shared';
import { useLanguage, getLocalizedText } from '../../shared/i18n';
import type { PostItem } from '../../../types/portal.types';
import { formatDetailDate } from '../hooks/useNewsDetail';

interface NewsDetailHeaderProps {
  item: PostItem;
  event: boolean;
  language: 'en' | 'am';
  title: string;
  summary?: string;
  category?: string;
  date?: string;
  subCity?: string;
  bureau?: string;
}

export const NewsDetailHeader: React.FC<NewsDetailHeaderProps> = ({
  item,
  event,
  language,
  title,
  summary,
  category,
  date,
  subCity,
  bureau,
}) => {
  const displayTitle = getLocalizedText(title, language) || (typeof title === 'string' ? title : '');
  const displaySummary = getLocalizedText(summary, language) || (typeof summary === 'string' ? summary : '');
  const displayCategory = getLocalizedText(category, language) || (typeof category === 'string' ? category : '');
  const displayBureau = getLocalizedText(bureau, language) || (typeof bureau === 'string' ? bureau : '');
  const displaySubCity = getLocalizedText(subCity, language) || (typeof subCity === 'string' ? subCity : '');
  const rawAuthor = language === 'am' ? item.author?.nameAm || item.author?.name : item.author?.name;
  const displayAuthor = getLocalizedText(rawAuthor, language) || (typeof rawAuthor === 'string' ? rawAuthor : '') || (language === 'am' ? 'የአዲስ አበባ ከተማ አስተዳደር' : 'Addis Ababa City Administration');

  return (
    <>
      {/* Top Hero Cover Media */}
      {item.coverImage && (
        <figure className="news-detail-hero-frame">
          <img src={item.coverImage} alt={displayTitle} />
          {event && (
            <div className="news-detail-event-float-badge">
              <span className="float-badge-month">
                {new Date((item as any).eventDate || item.date || Date.now()).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
              </span>
              <span className="float-badge-day">
                {new Date((item as any).eventDate || item.date || Date.now()).getDate() || '1'}
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

      <header className="news-detail-header">
        <div className="news-detail-badges">
          <span className="news-detail-category">{displayCategory || (event ? 'Community event' : 'Public notice')}</span>
          <span className="news-detail-kind">{event ? 'Event' : 'Official Notice'}</span>
          {displayBureau && (
            <span className="news-detail-meta">
              <Icon name="building" size={13} /> {displayBureau}
            </span>
          )}
          {displaySubCity && (
            <span className="news-detail-meta">
              <Icon name="map" size={13} /> {displaySubCity}
            </span>
          )}
        </div>

        <h1 className="news-detail-title">{displayTitle}</h1>
        {displaySummary && <p className="news-detail-lead">{displaySummary}</p>}

        <div className="news-detail-meta-bar">
          <div className="news-detail-author-slot">
            <div className="news-detail-author-avatar">
              <Icon name="user" size={15} />
            </div>
            <div>
              <strong>{displayAuthor}</strong>
              <small>{displayBureau || (language === 'am' ? 'የህዝብ መረጃ ክፍል' : 'Public Information Desk')}</small>
            </div>
          </div>

          <div className="news-detail-meta-chips">
            <span><Icon name="calendar" size={14} /> {formatDetailDate(date, language)}</span>
            {!event && item.readTimeMinutes && (
              <span><Icon name="clock" size={14} /> {item.readTimeMinutes} {language === 'am' ? 'ደቂቃ ንባብ' : 'min read'}</span>
            )}
            {event && item.time && (
              <span><Icon name="clock" size={14} /> {language === 'am' ? item.timeAm || item.time : item.time}</span>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

