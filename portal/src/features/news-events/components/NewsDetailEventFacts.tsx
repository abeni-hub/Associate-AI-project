import React from 'react';
import { Icon } from '../../shared';
import { getLocalizedText } from '../../shared/i18n';
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
  const rawVenue = language === 'am' ? item.location?.venueAm || item.location?.venue : item.location?.venue;
  const displayVenue = getLocalizedText(rawVenue, language) || (typeof rawVenue === 'string' ? rawVenue : '') || 'Addis Ababa';
  const rawAddress = language === 'am' ? item.location?.addressAm || item.location?.address : item.location?.address;
  const displayAddress = getLocalizedText(rawAddress, language) || (typeof rawAddress === 'string' ? rawAddress : '');
  const rawOrganizer = language === 'am' ? item.organizerAm || item.organizer : item.organizer || bureau || 'City Administration';
  const displayOrganizer = getLocalizedText(rawOrganizer, language) || (typeof rawOrganizer === 'string' ? rawOrganizer : '') || 'City Administration';

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
          <b>{displayVenue}</b>
          {displayAddress && <span>{displayAddress}</span>}
        </div>
      </div>
      {(item.organizer || item.organizerAm || item.capacity || bureau) && (
        <div className="news-event-fact-item">
          <div className="news-event-fact-icon">
            <Icon name="building" size={18} />
          </div>
          <div>
            <small>{language === 'am' ? 'አዘጋጅ' : 'Organizer & Capacity'}</small>
            <b>{displayOrganizer}</b>
            {item.capacity && (
              <span>{item.rsvpCount || 0} / {item.capacity} {language === 'am' ? 'ቦታዎች ተይዘዋል' : 'seats booked'}</span>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

