import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Search,
  X,
  Globe,
  Newspaper,
  CalendarDays,
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
} from 'lucide-react'
import {
  fetchNews,
  fetchEvents,
  fetchCombinedFeed,
} from '../services/newsEventsService'

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
  if (!dateStr) return 'OCT'
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

const CATEGORIES = [
  { id: 'all', label: 'All Categories', labelAm: 'ሁሉም ዘርፎች' },
  { id: 'Digital Services', label: 'Digital Services', labelAm: 'ዲጂታል አገልግሎት' },
  { id: 'Civil Registry', label: 'Civil Registry', labelAm: 'የሲቪል ምዝገባ' },
  { id: 'Urban Planning', label: 'Urban Planning', labelAm: 'የከተማ ፕላን' },
  { id: 'Commerce & Trade', label: 'Commerce & Trade', labelAm: 'ንግድና ገበያ' },
  { id: 'Town Hall', label: 'Town Hall & Forums', labelAm: 'የህዝብ መድረክ' },
  { id: 'Community Service', label: 'Community Service', labelAm: 'የማህበረሰብ አገልግሎት' },
  { id: 'Citizen Services', label: 'Citizen Care & Standards', labelAm: 'የዜጎች አገልግሎት' },
]

const SUB_CITIES = [
  'All Addis Ababa',
  'Bole',
  'Kirkos',
  'Yeka',
  'Arada',
  'Lideta',
  'Addis Ketema',
  'Lemi Kura',
  'Gulele',
  'Kolfe Keranio',
  'Nifas Silk-Lafto',
  'Akaki Kality',
]

export default function NewsEventsPage({
  language = 'en',
  initialTab = 'all', // 'all' | 'news' | 'events'
  onBackToHome,
  onNavigateToDetail,
  onLanguageToggle,
}) {
  const isAm = language === 'am'

  // Filter state
  const [activeType, setActiveType] = useState(initialTab) // 'all' | 'news' | 'events'
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSubCity, setSelectedSubCity] = useState('All Addis Ababa')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Infinite Scroll State (YouTube-like continuous loading)
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  // Floating Back-to-Top State
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Observer Sentinel for Infinite Scrolling
  const sentinelRef = useRef(null)

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Track scroll position for "Back to top"
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Reset & fetch page 1 whenever filters change
  useEffect(() => {
    let ignore = false

    async function resetAndFetch() {
      setLoading(true)
      setPage(1)
      try {
        let res
        const filterParams = {
          page: 1,
          limit: 6,
          category: selectedCategory === 'all' ? '' : selectedCategory,
          subCity: selectedSubCity === 'All Addis Ababa' ? '' : selectedSubCity,
          search: debouncedSearch,
        }

        if (activeType === 'news') {
          res = await fetchNews(filterParams)
        } else if (activeType === 'events') {
          res = await fetchEvents(filterParams)
        } else {
          res = await fetchCombinedFeed(filterParams)
        }

        if (!ignore) {
          setItems(res.items)
          setHasMore(res.hasMore)
          setTotalCount(res.total)
        }
      } catch (err) {
        console.error('Failed to load feed:', err)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    resetAndFetch()
    return () => { ignore = true }
  }, [activeType, selectedCategory, selectedSubCity, debouncedSearch])

  // Load next page (YouTube-like infinite scroll)
  const loadNextPage = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    const nextPage = page + 1
    try {
      let res
      const filterParams = {
        page: nextPage,
        limit: 6,
        category: selectedCategory === 'all' ? '' : selectedCategory,
        subCity: selectedSubCity === 'All Addis Ababa' ? '' : selectedSubCity,
        search: debouncedSearch,
      }

      if (activeType === 'news') {
        res = await fetchNews(filterParams)
      } else if (activeType === 'events') {
        res = await fetchEvents(filterParams)
      } else {
        res = await fetchCombinedFeed(filterParams)
      }

      setItems((prev) => [...prev, ...res.items])
      setPage(nextPage)
      setHasMore(res.hasMore)
      setTotalCount(res.total)
    } catch (err) {
      console.error('Error loading next page:', err)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page, activeType, selectedCategory, selectedSubCity, debouncedSearch])

  // IntersectionObserver for YouTube-like infinite scrolling
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadNextPage()
        }
      },
      {
        root: null,
        rootMargin: '200px', // Preload before user hits absolute bottom
        threshold: 0.1,
      }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, loadNextPage])


  return (
    <div className="news-events-page" lang={language}>
      {/* Hero Header */}
      <header className="nep-hero">
        <div className="nep-hero-content">
         

          <h1>
            {isAm
              ? <>የከተማችን ይፋዊ ዜናዎች፣ <em>የህዝብ መድረኮችና ዝግጅቶች</em></>
              : <>Civic News, Official Notices & <em>Community Events</em></>
            }
          </h1>

          <p>
            {isAm
              ? 'የአገልግሎት ማሻሻያዎችን፣ የህዝብ የምክክር መድረኮችን፣ የግብርና የሲቪል ምዝገባ መርሃ-ግብሮችን በአንድ ቦታ ይከታተሉ።'
              : 'Explore public service enhancements, town hall meetings, digital service launches, and community drives across Addis Ababa.'
            }
          </p>

          {/* 
          <div className="nep-stats-bar">
            <div className="nep-stat-item">
              <strong>12+</strong>
              <span>{isAm ? 'ይፋዊ ዜናዎች' : 'Published Notices'}</span>
            </div>
            <div className="nep-stat-item">
              <strong>10+</strong>
              <span>{isAm ? 'መጪ ዝግጅቶች' : 'Active Events'}</span>
            </div>
            <div className="nep-stat-item">
              <strong>11</strong>
              <span>{isAm ? 'ክፍለ ከተሞች' : 'Sub-Cities Covered'}</span>
            </div>
            <div className="nep-stat-item">
              <strong>3,200+</strong>
              <span>{isAm ? 'ተሳታፊ ዜጎች' : 'Citizen RSVPs'}</span>
            </div>
          </div>
          */}
        </div>
      </header>

      {/* Floating Filter Deck */}
      <div className="nep-toolbar-wrap">
        <div className="nep-toolbar">
          {/* Primary Row: Type Tabs & Search */}
          <div className="nep-toolbar-primary">
            <div className="nep-type-tabs" role="tablist">
              <button
                type="button"
                className={`nep-type-btn ${activeType === 'all' ? 'active' : ''}`}
                onClick={() => setActiveType('all')}
              >
                <Globe size={16} />
                <span>{isAm ? 'ሁሉም' : 'All Feeds'}</span>
              </button>

              <button
                type="button"
                className={`nep-type-btn ${activeType === 'news' ? 'active' : ''}`}
                onClick={() => setActiveType('news')}
              >
                <Newspaper size={16} />
                <span>{isAm ? 'ዜና እና ማስታወቂያ' : 'News & Notices'}</span>
              </button>

              <button
                type="button"
                className={`nep-type-btn ${activeType === 'events' ? 'active' : ''}`}
                onClick={() => setActiveType('events')}
              >
                <CalendarDays size={16} />
                <span>{isAm ? 'ዝግጅቶችና መድረኮች' : 'Events & Town Halls'}</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="nep-search-wrap">
              <Search size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAm ? 'በዜና፣ በርዕስ ወይም በቢሮ ይፈልጉ…' : 'Search notices, town halls, bureaus, tags…'}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="nep-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Secondary Row: Sub-City & Category Chips */}
          <div className="nep-toolbar-secondary">
            <span className="nep-filter-label">{isAm ? 'ክፍለ ከተማ፡' : 'Sub-City:'}</span>
            <select
              className="nep-subcity-select"
              value={selectedSubCity}
              onChange={(e) => setSelectedSubCity(e.target.value)}
            >
              {SUB_CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <span className="nep-filter-label" style={{ marginLeft: '8px' }}>
              {isAm ? 'ዘርፍ፡' : 'Category:'}
            </span>
            <div className="nep-category-chips">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`nep-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {isAm ? cat.labelAm : cat.label}
                </button>
              ))}
            </div>

            {(selectedCategory !== 'all' || selectedSubCity !== 'All Addis Ababa' || searchQuery) && (
              <button
                type="button"
                className="nep-reset-btn"
                onClick={() => {
                  setSelectedCategory('all')
                  setSelectedSubCity('All Addis Ababa')
                  setSearchQuery('')
                }}
              >
                {isAm ? 'ማጣሪያዎቹን አጽዳ' : 'Reset filters'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Feed Container (YouTube-like Infinite Scrolling) */}
      <main className="nep-feed-container">
        <div className="nep-feed-meta">
          <span>
            {isAm
              ? `የሚታዩት፡ ${items.length} ከ ${totalCount} ወቅታዊ መረጃዎች`
              : `Showing ${items.length} of ${totalCount} civic updates`
            }
          </span>
          <span>
            {hasMore ? (isAm ? 'ወደ ታች በማሸብለል ተጨማሪ ይመልከቱ ↓' : 'Scroll down for YouTube-style continuous loading ↓') : (isAm ? 'ሁሉም ተጠናቋል' : 'All loaded')}
          </span>
        </div>

        {/* Empty State */}
        {items.length === 0 && !loading && (
          <div className="nep-empty-state">
            <Search size={40} strokeWidth={1.5} style={{ opacity: 0.5, marginBottom: '8px' }} />
            <h3>{isAm ? 'ምንም መረጃ አልተገኘም' : 'No matching updates found'}</h3>
            <p>
              {isAm
                ? 'እባክዎ የተለየ የፍለጋ ቃል ይጠቀሙ ወይም ማጣሪያዎችን ያጽዱ።'
                : 'Try adjusting your search query, selecting another category, or clearing the sub-city filter.'
              }
            </p>
            <button
              type="button"
              className="nep-back-btn"
              onClick={() => {
                setSelectedCategory('all')
                setSelectedSubCity('All Addis Ababa')
                setSearchQuery('')
              }}
            >
              {isAm ? 'ሁሉንም መልስ' : 'Clear all filters'}
            </button>
          </div>
        )}

        {/* Items Grid */}
        <div className="nep-feed-grid">
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
                  onClick={() => onNavigateToDetail ? onNavigateToDetail(item) : (window.location.hash = `#/event/${item.id}`)}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') onNavigateToDetail ? onNavigateToDetail(item) : (window.location.hash = `#/event/${item.id}`) }}
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
                          {isAm ? 'በኦንላይን' : 'Virtual'}
                        </span>
                      ) : (
                        <span className="ne-pill ne-pill-event-status">
                          {isAm ? 'መጪ ዝግጅት' : 'Upcoming'}
                        </span>
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
                        {isAm ? 'ይመዝገቡ / ዝርዝር' : 'RSVP & Details'}
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
                onClick={() => onNavigateToDetail ? onNavigateToDetail(item) : (window.location.hash = `#/news/${item.id}`)}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') onNavigateToDetail ? onNavigateToDetail(item) : (window.location.hash = `#/news/${item.id}`) }}
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
                      {isAm ? 'አንብብ' : 'Read notice'}
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </article>
            )
          })}

          {/* YouTube-style Shimmer Skeletons while loading next batch */}
          {loading && (
            <>
              {[1, 2, 3].map((n) => (
                <div key={`skeleton-${n}`} className="ne-skeleton-card">
                  <div className="ne-skeleton-media ne-shimmer" />
                  <div className="ne-skeleton-body">
                    <div className="ne-skeleton-pill ne-shimmer" />
                    <div className="ne-skeleton-title ne-shimmer" />
                    <div className="ne-skeleton-title short ne-shimmer" />
                    <div className="ne-skeleton-line ne-shimmer" />
                    <div className="ne-skeleton-line half ne-shimmer" />
                    <div className="ne-skeleton-footer">
                      <div className="ne-skeleton-avatar ne-shimmer" />
                      <div className="ne-skeleton-pill ne-shimmer" style={{ width: '60px' }} />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Intersection Sentinel Element (YouTube-like Infinite Scrolling Trigger) */}
        {hasMore && (
          <div ref={sentinelRef} className="nep-sentinel-loader">
            <div className="nep-spinner" />
            <span className="nep-sentinel-text">
              {isAm ? 'ተጨማሪ ዜናዎችንና ዝግጅቶችን በማምጣት ላይ...' : 'Loading more public service updates...'}
            </span>
          </div>
        )}

        {/* End of Feed Banner */}
        {!hasMore && items.length > 0 && (
          <div className="nep-end-of-feed">
            <div className="nep-end-icon">
              <CheckCircle2 size={26} color="#d6a854" />
            </div>
            <h3>{isAm ? 'ሁሉንም መረጃዎች ተመልክተዋል!' : "You're all caught up!"}</h3>
            <p>
              {isAm
                ? `በአጠቃላይ ${items.length} ዜናዎችንና ዝግጅቶችን አይተዋል። አዳዲስ ማስታወቂያዎች በየሳምንቱ ይታተማሉ።`
                : `You have viewed all ${items.length} community announcements and municipal events.`
              }
            </p>
            <button
              type="button"
              className="nep-back-to-top-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {isAm ? 'ወደ ላይ ተመለስ' : 'Back to Top'}
                <ArrowUp size={14} />
              </span>
            </button>
          </div>
        )}
      </main>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          className="floating-top-pill"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll back to top"
        >
          <ArrowUp size={15} />
          <span>{isAm ? 'ወደ ላይ' : 'Top'}</span>
        </button>
      )}
    </div>
  )
}
