import {
  ArrowRight,
  Clock,
  MapPin,
} from 'lucide-react'
import { getDayNum, getMonthShort } from './homeNewsFormatting.js'

export default function HomeNewsEventCard({ item, language, onSelectItem }) {
  const isAm = language === 'am'
  const title = isAm && item.titleAm ? item.titleAm : item.title
  const summary = isAm && item.summaryAm ? item.summaryAm : item.summary
  const category = isAm && item.categoryAm ? item.categoryAm : item.category
  const englishSubCity = item.subCity || item.location?.subCity
  const amharicSubCity = item.subCityAm || item.location?.subCityAm
  const subCity = isAm && amharicSubCity ? amharicSubCity : englishSubCity
  const location = isAm && item.location.venueAm ? item.location.venueAm : item.location.venue
  const time = isAm && item.timeAm ? item.timeAm : item.time

  function openItem() {
    if (onSelectItem) onSelectItem(item)
  }

  return (
    <article className="ne-card" onClick={openItem} tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter') openItem() }}>
      <div className="ne-card-media">
        <img
          src={item.coverImage}
          alt={title}
          className="ne-card-img"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
          }}
        />
        <div className="ne-card-scrim" />
        <div className="ne-card-badges">
          <span className="ne-pill ne-pill-category">{category}</span>
          {item.location?.isVirtual ? (
            <span className="ne-pill ne-pill-event-virtual">{isAm ? 'በኦንላይን' : 'Virtual / Online'}</span>
          ) : (
            <span className="ne-pill ne-pill-event-status">{isAm ? 'ምዝገባ ክፍት ነው' : 'Upcoming'}</span>
          )}
        </div>
        <div className="ne-date-box">
          <span className="month">{getMonthShort(item.eventDate, language)}</span>
          <span className="day">{getDayNum(item.eventDate)}</span>
        </div>
      </div>

      <div className="ne-card-body">
        <div className="ne-card-subinfo">
          <Clock size={13} />
          <span>{time}</span>
          <span>·</span>
          <MapPin size={13} />
          <span>{subCity}</span>
        </div>
        <h3 className="ne-card-title">{title}</h3>
        <p className="ne-card-summary">{summary}</p>
        <div className="ne-card-footer">
          <span title={location} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <MapPin size={12} style={{ flexShrink: 0 }} />
            <span>{location}</span>
          </span>
          <span className="ne-card-action">
            {isAm ? 'ዝርዝር መረጃ' : 'Event details'}
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </article>
  )
}
