import {
  ArrowRight,
  Building2,
  Clock,
  MapPin,
} from 'lucide-react'

function formatDate(dateString, language) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  return date.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getMonthShort(dateString, language) {
  if (!dateString) return 'OCT'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'OCT'
  return date.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', { month: 'short' }).toUpperCase()
}

function getDayNum(dateString) {
  if (!dateString) return '01'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '01'
  return String(date.getDate()).padStart(2, '0')
}

export default function NewsEventCard({ item, language, onOpen }) {
  const isAm = language === 'am'
  const title = isAm && item.titleAm ? item.titleAm : item.title
  const summary = isAm && item.summaryAm ? item.summaryAm : item.summary
  const category = isAm && item.categoryAm ? item.categoryAm : item.category
  const bureau = isAm && item.bureauAm ? item.bureauAm : item.bureau
  const isEvent = item.type === 'event'
  const englishSubCity = item.subCity || item.location?.subCity
  const amharicSubCity = item.subCityAm || item.location?.subCityAm
  const subCity = isAm && amharicSubCity ? amharicSubCity : englishSubCity

  function openItem() {
    if (onOpen) {
      onOpen(item)
    } else {
      window.location.hash = `#/${isEvent ? 'event' : 'news'}/${item.id}`
    }
  }

  if (isEvent) {
    const location = isAm && item.location?.venueAm ? item.location.venueAm : item.location?.venue
    const time = isAm && item.timeAm ? item.timeAm : item.time

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
              <span className="ne-pill ne-pill-event-virtual">{isAm ? 'በኦንላይን' : 'Virtual'}</span>
            ) : (
              <span className="ne-pill ne-pill-event-status">{isAm ? 'መጪ ዝግጅት' : 'Upcoming'}</span>
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
              {isAm ? 'ይመዝገቡ / ዝርዝር' : 'RSVP & Details'}
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </article>
    )
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
            event.currentTarget.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
          }}
        />
        <div className="ne-card-scrim" />
        <div className="ne-card-badges">
          <span className="ne-pill ne-pill-category">{category}</span>
          <span className="ne-pill" style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
            {formatDate(item.publishedAt, language)}
          </span>
        </div>
      </div>

      <div className="ne-card-body">
        <div className="ne-card-subinfo">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Building2 size={13} />
            <span>{bureau}</span>
          </span>
          <span>·</span>
          <span>{item.readTimeMinutes} {isAm ? 'ደቂቃ ንባብ' : 'min read'}</span>
        </div>
        <h3 className="ne-card-title">{title}</h3>
        <p className="ne-card-summary">{summary}</p>
        <div className="ne-card-footer">
          <div className="ne-card-author">
            {item.author?.avatar && (
              <img src={item.author.avatar} alt="" className="ne-card-avatar" />
            )}
            <span>{isAm && item.author?.nameAm ? item.author.nameAm : item.author?.name}</span>
          </div>
          <span className="ne-card-action">
            {isAm ? 'አንብብ' : 'Read notice'}
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </article>
  )
}
