import {
  ArrowUp,
  CheckCircle2,
  Search,
} from 'lucide-react'

export function NewsEventsEmptyState({ language, onResetFilters }) {
  const isAm = language === 'am'

  return (
    <div className="nep-empty-state">
      <Search size={40} strokeWidth={1.5} style={{ opacity: 0.5, marginBottom: '8px' }} />
      <h3>{isAm ? 'ምንም መረጃ አልተገኘም' : 'No matching updates found'}</h3>
      <p>
        {isAm
          ? 'እባክዎ የተለየ የፍለጋ ቃል ይጠቀሙ ወይም ማጣሪያዎችን ያጽዱ።'
          : 'Try adjusting your search query, selecting another category, or clearing the sub-city filter.'
        }
      </p>
      <button type="button" className="nep-back-btn" onClick={onResetFilters}>
        {isAm ? 'ሁሉንም መልስ' : 'Clear all filters'}
      </button>
    </div>
  )
}

export function NewsEventsLoadingCards() {
  return [1, 2, 3].map((number) => (
    <div key={`skeleton-${number}`} className="ne-skeleton-card">
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
  ))
}

export function NewsEventsSentinel({ language, sentinelRef }) {
  return (
    <div ref={sentinelRef} className="nep-sentinel-loader">
      <div className="nep-spinner" />
      <span className="nep-sentinel-text">
        {language === 'am' ? 'ተጨማሪ ዜናዎችንና ዝግጅቶችን በማምጣት ላይ...' : 'Loading more public service updates...'}
      </span>
    </div>
  )
}

export function NewsEventsEndState({ language, itemCount }) {
  const isAm = language === 'am'

  return (
    <div className="nep-end-of-feed">
      <div className="nep-end-icon">
        <CheckCircle2 size={26} color="#d6a854" />
      </div>
      <h3>{isAm ? 'ሁሉንም መረጃዎች ተመልክተዋል!' : "You're all caught up!"}</h3>
      <p>
        {isAm
          ? `በአጠቃላይ ${itemCount} ዜናዎችንና ዝግጅቶችን አይተዋል። አዳዲስ ማስታወቂያዎች በየሳምንቱ ይታተማሉ።`
          : `You have viewed all ${itemCount} community announcements and municipal events.`
        }
      </p>
      <button type="button" className="nep-back-to-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          {isAm ? 'ወደ ላይ ተመለስ' : 'Back to Top'}
          <ArrowUp size={14} />
        </span>
      </button>
    </div>
  )
}
