import { useState, useEffect } from 'react'
import {
  Newspaper,
  CalendarDays,
  ArrowRight,
  Clock,
  MapPin,
  Building2,
  
} from 'lucide-react'
import { getHomeHighlights } from '../services/newsEventsService'

function formatDate(dateStr, language) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getMonthShort(dateStr, language) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'OCT'
  return date.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', { month: 'short' }).toUpperCase()
}

function getDayNum(dateStr) {
  if (!dateStr) return '01'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '01'
  return String(date.getDate()).padStart(2, '0')
}

export default function HomeNewsEvents({
  language = 'en',
  onNavigateToHub,
  onSelectItem,
}) {
  const [activeTab, setActiveTab] = useState('news') // 'news' | 'events'
  const [data, setData] = useState({
    news: [],
    events: [],
    totalNews: 0,
    totalEvents: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function loadData() {
      try {
        setLoading(true)
        const res = await getHomeHighlights()
        if (mounted) {
          setData(res)
        }
      } catch (err) {
        console.error('Failed to load home highlights:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadData()
    return () => { mounted = false }
  }, [])

  const isAm = language === 'am'
  const items = activeTab === 'news' ? data.news.slice(0, 3) : data.events.slice(0, 3)
  const totalCount = activeTab === 'news' ? data.totalNews : data.totalEvents

  return (
    <div className="home-news-events">
      {/* Tab Switcher Controls */}
      <div className="home-tabs-bar">
        <div className="home-tab-controls" role="tablist" aria-label={isAm ? 'ዜና እና ዝግጅቶች' : 'News and Events Tabs'}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'news'}
            className={`home-tab-btn ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            <Newspaper size={16} />
            <span>{isAm ? 'የወቅቱ ዜናዎች' : 'Latest News'}</span>
            <span className="tab-badge">{data.totalNews || 3}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'events'}
            className={`home-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <CalendarDays size={16} />
            <span>{isAm ? 'መጪ ዝግጅቶች' : 'Upcoming Events'}</span>
            <span className="tab-badge">{data.totalEvents || 3}</span>
          </button>
        </div>

        {/* Link to Dedicated Hub */}
        <button
          type="button"
          className="home-hub-link"
          onClick={() => onNavigateToHub && onNavigateToHub(activeTab)}
          aria-label={isAm ? 'ሁሉንም በዝርዝር ይመልከቱ' : 'Explore full News & Events page'}
        >
          <span>
            {activeTab === 'news'
              ? (isAm ? `ሁሉንም ዜናዎች ይመልከቱ (${data.totalNews})` : `Explore All News (${data.totalNews})`)
              : (isAm ? `ሁሉንም ዝግጅቶች ይመልከቱ (${data.totalEvents})` : `Explore All Events (${data.totalEvents})`)
            }
          </span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* 3-Item Grid for Active Tab */}
      {loading ? (
        <div className="home-cards-grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="ne-skeleton-card">
              <div className="ne-skeleton-media ne-shimmer" />
              <div className="ne-skeleton-body">
                <div className="ne-skeleton-pill ne-shimmer" />
                <div className="ne-skeleton-title ne-shimmer" />
                <div className="ne-skeleton-line ne-shimmer" />
                <div className="ne-skeleton-line half ne-shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="home-cards-grid">
          {items.map((item) => {
            const title = isAm && item.titleAm ? item.titleAm : item.title
            const summary = isAm && item.summaryAm ? item.summaryAm : item.summary
            const category = isAm && item.categoryAm ? item.categoryAm : item.category
            const bureau = isAm && item.bureauAm ? item.bureauAm : item.bureau
            const subCity = isAm && item.subCityAm ? item.subCityAm : item.subCity

            if (item.type === 'event') {
              const locationStr = isAm && item.location.venueAm ? item.location.venueAm : item.location.venue
              const timeStr = isAm && item.timeAm ? item.timeAm : item.time

              return (
                <article
                  key={item.id}
                  className="ne-card"
                  onClick={() => onSelectItem && onSelectItem(item)}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') onSelectItem && onSelectItem(item) }}
                >
                  <div className="ne-card-media">
                    <img
                      src={item.coverImage}
                      alt={title}
                      className="ne-card-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
                      }}
                    />
                    <div className="ne-card-scrim" />
                    
                    <div className="ne-card-badges">
                      <span className="ne-pill ne-pill-category">{category}</span>
                      {item.location?.isVirtual ? (
                        <span className="ne-pill ne-pill-event-virtual">
                          {isAm ? 'በኦንላይን' : 'Virtual / Online'}
                        </span>
                      ) : (
                        <span className="ne-pill ne-pill-event-status">
                          {isAm ? 'ምዝገባ ክፍት ነው' : 'Upcoming'}
                        </span>
                      )}
                    </div>

                    {/* Date Block */}
                    <div className="ne-date-box">
                      <span className="month">{getMonthShort(item.eventDate, language)}</span>
                      <span className="day">{getDayNum(item.eventDate)}</span>
                    </div>
                  </div>

                  <div className="ne-card-body">
                    <div className="ne-card-subinfo">
                      <Clock size={13} />
                      <span>{timeStr}</span>
                      <span>·</span>
                      <MapPin size={13} />
                      <span>{subCity}</span>
                    </div>

                    <h3 className="ne-card-title">{title}</h3>
                    <p className="ne-card-summary">{summary}</p>

                    <div className="ne-card-footer">
                      <span title={locationStr} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <MapPin size={12} style={{ flexShrink: 0 }} />
                        <span>{locationStr}</span>
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

            // News Card
            return (
              <article
                key={item.id}
                className="ne-card"
                onClick={() => onSelectItem && onSelectItem(item)}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') onSelectItem && onSelectItem(item) }}
              >
                <div className="ne-card-media">
                  <img
                    src={item.coverImage}
                    alt={title}
                    className="ne-card-img"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
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
                      {isAm ? 'ሙሉውን አንብብ' : 'Read story'}
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Prominent "Show All" Link Banner (as requested: "if above the three add link to show all") */}
   
    </div>
  )
}
