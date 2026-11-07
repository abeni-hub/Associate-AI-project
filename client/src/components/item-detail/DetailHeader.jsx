import { Building2, MapPin, Calendar, Clock, Users, Check, Copy } from 'lucide-react'
import { formatDate } from './detailDateFormatting.js'

export default function DetailHeader({isAm, item, title, summary, category, bureau, subCity, language, copied, onCopyLink}) {
  return (
    <>
        {/* Article/Event Header */}
        <header className="detail-header">
          <div className="detail-header-badges">
            <span className="ne-pill ne-pill-category">{category}</span>
            <span className="detail-badge-bureau" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Building2 size={13} />
              <span>{bureau}</span>
            </span>
            <span className="detail-badge-subcity" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <MapPin size={13} />
              <span>{subCity}</span>
            </span>
            {item.type === 'event' && item.location?.isVirtual && (
              <span className="ne-pill ne-pill-event-virtual">
                {isAm ? 'በኦንላይን' : 'Virtual / Online'}
              </span>
            )}
          </div>

          <h1 className="detail-title">{title}</h1>
          <p className="detail-lead">{summary}</p>

          <div className="detail-meta-row">
            {item.type === 'news' ? (
              <>
                <div className="detail-author-info">
                  {item.author?.avatar && (
                    <img src={item.author.avatar} alt="" className="detail-author-avatar" />
                  )}
                  <div>
                    <strong>{isAm && item.author?.nameAm ? item.author.nameAm : item.author?.name}</strong>
                    <span>{isAm && item.author?.roleAm ? item.author.roleAm : item.author?.role}</span>
                  </div>
                </div>
                <div className="detail-meta-date">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} />
                    <span>{formatDate(item.publishedAt, language)}</span>
                  </span>
                  <span>·</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} />
                    <span>{item.readTimeMinutes} {isAm ? 'ደቂቃ ንባብ' : 'min read'}</span>
                  </span>
                </div>
              </>
            ) : (
              <div className="detail-meta-date">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} />
                  <span>{formatDate(item.eventDate, language)}</span>
                </span>
                <span>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} />
                  <span>{isAm && item.timeAm ? item.timeAm : item.time}</span>
                </span>
                <span>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={13} />
                  <span>{item.rsvpCount} / {item.capacity} {isAm ? 'ተመዝጋቢዎች' : 'Registered Attendees'}</span>
                </span>
              </div>
            )}

            {/* Quick Share Buttons */}
            <div className="detail-share-actions">
              <button type="button" className="detail-share-btn" onClick={onCopyLink}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? (isAm ? 'ተቀድቷል! ✓' : 'Copied! ✓') : (isAm ? 'ማስፈንጠሪያ ቅዳ' : 'Copy Link')}</span>
              </button>
            </div>
          </div>
        </header>
    </>
  )
}
