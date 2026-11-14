import React from 'react';
import { Icon } from '../../shared';
import type { PostItem } from '../../../types/portal.types';
import { formatDetailDate } from '../hooks/useNewsDetail';

interface NewsDetailEventFactsProps {
  item: PostItem;
  language: 'en' | 'am';
  bureau?: string;
}

export const NewsDetailEventFacts: React.FC<NewsDetailEventFactsProps> = ({
  item,
  language,
  bureau,
}) => {
  return (
    <section className="news-event-facts-grid" aria-label="Event details">
      <div className="news-event-fact-item">
        <div className="news-event-fact-icon">
          <Icon name="calendar" size={18} />
        </div>
        <div>
          <small>{language === 'am' ? 'ቀን እና ሰዓት' : 'Date and Time'}</small>
          <b>{formatDetailDate(item.eventDate || item.date, language)}</b>
          <span>{language === 'am' ? item.timeAm || item.time : item.time}</span>
        </div>
      </div>
      <div className="news-event-fact-item">
        <div className="news-event-fact-icon">
          <Icon name="map" size={18} />
        </div>
        <div>
          <small>{language === 'am' ? 'ቦታ / አድራሻ' : 'Venue & Address'}</small>
          <b>{language === 'am' ? item.location?.venueAm || item.location?.venue : item.location?.venue || 'Addis Ababa'}</b>
          <span>{language === 'am' ? item.location?.addressAm || item.location?.address : item.location?.address}</span>
        </div>
      </div>
      {(item.organizer || item.organizerAm || item.capacity) && (
        <div className="news-event-fact-item">
          <div className="news-event-fact-icon">
            <Icon name="building" size={18} />
          </div>
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
  );
};

