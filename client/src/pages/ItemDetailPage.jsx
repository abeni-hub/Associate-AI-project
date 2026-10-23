import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Home,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Users,
  Copy,
  Check,
  ShieldCheck,
  Ticket,
  CheckCircle2,
} from 'lucide-react'
import { getItemById, submitEventRsvp, getRelatedItems } from '../services/newsEventsService'

function formatDate(dateStr, language) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', {
    weekday: 'long',
    month: 'long',
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

export default function ItemDetailPage({
  itemId,
  language = 'en',
  onBackToHub,
  onBackToHome,
  onNavigateToDetail,
  onLanguageToggle,
}) {
  const isAm = language === 'am'
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rsvpName, setRsvpName] = useState('')
  const [rsvpPhone, setRsvpPhone] = useState('')
  const [rsvpStatus, setRsvpStatus] = useState(null) // null | 'submitting' | 'success'
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let mounted = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
    async function loadItem() {
      setLoading(true)
      try {
        const found = await getItemById(itemId)
        if (mounted) {
          setItem(found)
        }
      } catch (err) {
        console.error('Failed to load item:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadItem()
    return () => { mounted = false }
  }, [itemId])

  async function handleRsvpSubmit(e) {
    e.preventDefault()
    if (!item || !rsvpName.trim()) return
    setRsvpStatus('submitting')
    try {
      await submitEventRsvp(item.id, {
        name: rsvpName,
        phone: rsvpPhone,
      })
      setRsvpStatus('success')
    } catch (err) {
      console.error('RSVP failed:', err)
      setRsvpStatus(null)
    }
  }

  function handleCopyLink() {
    navigator.clipboard?.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (loading) {
    return (
      <div className="item-detail-page" lang={language}>
        <div className="detail-loading-skeleton section-wrap" style={{ marginTop: '32px' }}>
          <div className="detail-skeleton-hero ne-shimmer" />
          <div className="detail-skeleton-title ne-shimmer" />
          <div className="detail-skeleton-line ne-shimmer" />
          <div className="detail-skeleton-line ne-shimmer" />
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="item-detail-page" lang={language}>
        <div className="detail-not-found section-wrap" style={{ marginTop: '32px' }}>
          <h2>{isAm ? 'የተጠየቀው መረጃ አልተገኘም' : 'Article or Event Not Found'}</h2>
          <p>{isAm ? 'የተሰረዘ ወይም ያልነበረ መረጃ ሊሆን ይችላል።' : 'The requested item could not be loaded.'}</p>
          <button type="button" className="nep-back-to-top-btn" onClick={onBackToHub}>
            {isAm ? 'ወደ ዋናው ዝርዝር ተመለስ' : 'Return to Hub'}
          </button>
        </div>
      </div>
    )
  }

  const title = isAm && item.titleAm ? item.titleAm : item.title
  const content = isAm && item.contentAm ? item.contentAm : item.content
  const summary = isAm && item.summaryAm ? item.summaryAm : item.summary
  const category = isAm && item.categoryAm ? item.categoryAm : item.category
  const bureau = isAm && item.bureauAm ? item.bureauAm : item.bureau
  const subCity = isAm && item.subCityAm ? item.subCityAm : item.subCity
  const related = getRelatedItems ? getRelatedItems(item, 3) : []

  return (
    <div className="item-detail-page" lang={language}>
      {/* Sub-Header Breadcrumb & Hub Back Bar */}
      <div className="detail-breadcrumb-bar">
        <div className="section-wrap detail-breadcrumb-inner">
          <button type="button" className="nep-back-btn" onClick={onBackToHub}>
            <ArrowLeft size={15} />
            <span>{isAm ? 'ወደ ዜና እና ዝግጅቶች መድረክ' : 'Back to News & Events'}</span>
          </button>

          <div className="nep-breadcrumbs">
            <span onClick={onBackToHome} style={{ cursor: 'pointer' }}>CivicLink</span>
            <span>/</span>
            <span onClick={onBackToHub} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              {isAm ? 'ዜና እና ዝግጅቶች' : 'News & Events'}
            </span>
            <span>/</span>
            <strong className="breadcrumb-title-truncate">{title}</strong>
          </div>
        </div>
      </div>

      {/* Main Editorial Content Container */}
      <main className="detail-page-main section-wrap">
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
              <button type="button" className="detail-share-btn" onClick={handleCopyLink}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? (isAm ? 'ተቀድቷል! ✓' : 'Copied! ✓') : (isAm ? 'ማስፈንጠሪያ ቅዳ' : 'Copy Link')}</span>
              </button>
            </div>
          </div>
        </header>

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

        {/* Event Quick Specs Panel */}
        {item.type === 'event' && (
          <section className="detail-event-specs-card">
            <div className="specs-grid">
              <div className="spec-box">
                <div className="spec-icon">
                  <Calendar size={22} />
                </div>
                <div>
                  <span className="spec-label">{isAm ? 'ቀን እና ሰዓት' : 'Date & Time'}</span>
                  <strong>{formatDate(item.eventDate, language)}</strong>
                  <small>{isAm && item.timeAm ? item.timeAm : item.time}</small>
                </div>
              </div>

              <div className="spec-box">
                <div className="spec-icon">
                  <MapPin size={22} />
                </div>
                <div>
                  <span className="spec-label">{isAm ? 'ቦታ / አዳራሽ' : 'Location Venue'}</span>
                  <strong>{isAm && item.location?.venueAm ? item.location.venueAm : item.location?.venue}</strong>
                  <small>{isAm && item.location?.addressAm ? item.location.addressAm : item.location?.address}</small>
                </div>
              </div>

              <div className="spec-box">
                <div className="spec-icon">
                  <Users size={22} />
                </div>
                <div>
                  <span className="spec-label">{isAm ? 'የተያዙ መቀመጫዎች' : 'Seat Availability'}</span>
                  <strong>{item.rsvpCount} / {item.capacity} {isAm ? 'ተመዝግበዋል' : 'Seats Booked'}</strong>
                  <div className="capacity-bar">
                    <div className="capacity-fill" style={{ width: `${Math.min(100, (item.rsvpCount / item.capacity) * 100)}%` }} />
                  </div>
                </div>
              </div>

              <div className="spec-box">
                <div className="spec-icon">
                  <Building2 size={22} />
                </div>
                <div>
                  <span className="spec-label">{isAm ? 'አዘጋጅ ቢሮ' : 'Organizing Body'}</span>
                  <strong>{isAm && item.organizerAm ? item.organizerAm : item.organizer}</strong>
                  <small>{isAm ? 'ይፋዊ የከተማ መድረክ' : 'Official Public Engagement'}</small>
                </div>
              </div>
            </div>

            {/* Event RSVP Box */}
            <div className="detail-rsvp-banner">
              <div className="rsvp-banner-copy">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Ticket size={20} color="#d6a854" />
                  <span>{isAm ? 'በዚህ ዝግጅት ላይ ለመሳተፍ ይመዝገቡ' : 'Reserve Your Seat for this Event'}</span>
                </h3>
                <p>
                  {isAm
                    ? 'ምዝገባው ነጻ ሲሆን በቦታው ፈጣን የመግቢያ ፍቃድና የመረጃ ሰነዶችን ለማግኘት ይረዳል።'
                    : 'Attendance is free. Registering ensures fast-track entry and session materials.'
                  }
                </p>
              </div>

              {rsvpStatus === 'success' ? (
                <div className="rsvp-success-msg" style={{ width: '100%', maxWidth: '600px' }}>
                  <CheckCircle2 size={24} color="#10b981" />
                  <div>
                    <strong>{isAm ? 'ምዝገባዎ በተሳካ ሁኔታ ተረጋግጧል!' : 'Your RSVP is Confirmed!'}</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
                      {isAm
                        ? 'መቀመጫ ተይዞልዎታል። ወደ ዝግጅቱ ሲመጡ በስልክዎ የደረሰዎትን መልእክት ያሳዩ።'
                        : 'A confirmation has been saved. We look forward to seeing you at the event.'
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className="detail-rsvp-form">
                  <input
                    type="text"
                    className="detail-rsvp-input"
                    placeholder={isAm ? 'ሙሉ ስምዎ…' : 'Your Full Name…'}
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    required
                  />
                  <input
                    type="tel"
                    className="detail-rsvp-input"
                    placeholder={isAm ? 'የስልክ ቁጥር (09...)' : 'Phone number (e.g. 0911...)'}
                    value={rsvpPhone}
                    onChange={(e) => setRsvpPhone(e.target.value)}
                  />
                  <button type="submit" className="detail-rsvp-btn" disabled={rsvpStatus === 'submitting'}>
                    {rsvpStatus === 'submitting'
                      ? (isAm ? 'በማረጋገጥ ላይ...' : 'Confirming...')
                      : (isAm ? 'መቀመጫ ይያዙ' : 'Confirm RSVP')
                    }
                  </button>
                </form>
              )}
            </div>
          </section>
        )}

        {/* Prose Article Body */}
        <article className="detail-article-content">
          <div className="prose-body">
            {content}
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="detail-tags-bar">
              <span className="tags-label">{isAm ? 'ቁልፍ ቃላት፡' : 'Related Topics:'}</span>
              <div className="tags-list">
                {item.tags.map((tag) => (
                  <span key={tag} className="detail-tag-pill">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Official Verification Callout */}
          <div className="detail-verification-box">
            <ShieldCheck size={24} color="#00485a" style={{ flexShrink: 0 }} />
            <div>
              <strong>{isAm ? 'ይፋዊ የመንግሥት አገልግሎት መረጃ' : 'Verified Public Information'}</strong>
              <p>
                {isAm
                  ? `ይህ መረጃ በቀጥታ በ${bureau} እና በሲቪክሊንክ የህዝብ አገልግሎት መድረክ በኩል የተረጋገጠ ነው።`
                  : `Published and verified by ${bureau} in coordination with the CivicLink Citizen Engagement Platform.`
                }
              </p>
            </div>
          </div>
        </article>

        {/* Related Items Section */}
        {related.length > 0 && (
          <section className="detail-related-section">
            <div className="related-section-header">
              <h3>
                {item.type === 'event'
                  ? (isAm ? 'ሌሎች ተዛማጅ የህዝብ ዝግጅቶች' : 'More Upcoming Community Events')
                  : (isAm ? 'ተጨማሪ ይፋዊ ዜናዎችና ማስታወቂያዎች' : 'More Civic News & Announcements')
                }
              </h3>
              <button type="button" className="nep-back-btn" onClick={onBackToHub}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  {isAm ? 'ሁሉንም ይመልከቱ' : 'View All Hub Items'}
                  <ArrowRight size={14} />
                </span>
              </button>
            </div>

            <div className="home-cards-grid">
              {related.map((rel) => {
                const relTitle = isAm && rel.titleAm ? rel.titleAm : rel.title
                const relSummary = isAm && rel.summaryAm ? rel.summaryAm : rel.summary
                const relCategory = isAm && rel.categoryAm ? rel.categoryAm : rel.category
                const relBureau = isAm && rel.bureauAm ? rel.bureauAm : rel.bureau

                return (
                  <article
                    key={rel.id}
                    className="ne-card"
                    onClick={() => onNavigateToDetail && onNavigateToDetail(rel)}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') onNavigateToDetail && onNavigateToDetail(rel) }}
                  >
                    <div className="ne-card-media">
                      <img src={rel.coverImage} alt={relTitle} className="ne-card-img" loading="lazy" />
                      <div className="ne-card-scrim" />
                      <div className="ne-card-badges">
                        <span className="ne-pill ne-pill-category">{relCategory}</span>
                      </div>
                    </div>
                    <div className="ne-card-body">
                      <div className="ne-card-subinfo">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Building2 size={13} />
                          <span>{relBureau}</span>
                        </span>
                      </div>
                      <h4 className="ne-card-title">{relTitle}</h4>
                      <p className="ne-card-summary">{relSummary}</p>
                      <div className="ne-card-footer">
                        <span className="ne-card-action">
                          {isAm ? 'ሙሉውን ገጽ እይ' : 'View full page'}
                          <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}
      </main>

      {/* Detail Page Footer */}
      <footer className="site-footer">
        <div className="footer-main section-wrap">
          <a className="brand footer-brand" href="#/" onClick={(e) => { e.preventDefault(); onBackToHome() }}>
            <span className="brand-copy"><strong>Civic<span>Link</span></strong><small>{isAm ? 'ኢትዮጵያ · የዜጎች አገልግሎት' : 'ETHIOPIA · CITIZEN SERVICES'}</small></span>
          </a>
          <p>{isAm ? 'ግልጽ መረጃ ለእያንዳንዱ ጉብኝት። ፈጣን ምላሽ የሚሰጥ የህዝብ አገልግሎት።' : 'Clearer information for every visit. A more responsive public service.'}</p>
          <div className="footer-nav">
            <a href="#find-service" onClick={onBackToHome}>{isAm ? 'አገልግሎት ይፈልጉ' : 'Find a service'}</a>
            <a href="#how-it-works" onClick={onBackToHome}>{isAm ? 'አጠቃቀሙ እንዴት ነው?' : 'How it works'}</a>
            <a href="#news" onClick={onBackToHub}>{isAm ? 'ዜና እና ዝግጅቶች' : 'News & events'}</a>
          </div>
        </div>
        <div className="footer-bottom section-wrap">
          <span>© 2026 CivicLink Ethiopia · Public service information platform</span>
          <span>Built for citizens, maintained by bureaus.</span>
        </div>
      </footer>
    </div>
  )
}
