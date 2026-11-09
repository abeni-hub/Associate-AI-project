import { getDayNum, getMonthShort } from './detailDateFormatting.js'

export default function DetailHeroMedia({ item, title, language }) {
  const hasAdditional = item.images && item.images.length > 1

  return (
    <div className="detail-hero-media-wrapper">
      {/* Hero Media Section */}
      <div className="detail-hero-media">
        <img
          src={item.coverImage}
          alt={title}
          className="detail-hero-img"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
          }}
        />
        {item.type === 'event' && (
          <div className="detail-date-badge-overlay">
            <span className="month">{getMonthShort(item.eventDate, language)}</span>
            <span className="day">{getDayNum(item.eventDate)}</span>
          </div>
        )}
      </div>

      {/* Additional Photos Strip immediately after main image */}
      {hasAdditional && (
        <div className="detail-additional-photos-strip" aria-label="Additional photos">
          <div className="detail-additional-photos-grid">
            {item.images.slice(1).map((imgUrl, idx) => (
              <div key={idx} className="detail-additional-photo-card">
                <img
                  src={imgUrl}
                  alt={`${title} - additional photo ${idx + 2}`}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
