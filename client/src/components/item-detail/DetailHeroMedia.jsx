import { getDayNum, getMonthShort } from './detailDateFormatting.js'

export default function DetailHeroMedia({ item, title, language }) {
  return (
    <>
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
    </>
  )
}
