import NewsEventCard from './NewsEventCard.jsx'
import {
  NewsEventsEmptyState,
  NewsEventsEndState,
  NewsEventsLoadingCards,
  NewsEventsSentinel,
} from './NewsEventsFeedStates.jsx'

export default function NewsEventsFeed({
  language,
  items,
  totalCount,
  loading,
  hasMore,
  sentinelRef,
  onNavigateToDetail,
  onResetFilters,
}) {
  const isAm = language === 'am'

  return (
    <main className="nep-feed-container">
      <div className="nep-feed-meta">
        <span>
          {isAm
            ? `የሚታዩት፡ ${items.length} ከ ${totalCount} ወቅታዊ መረጃዎች`
            : `Showing ${items.length} of ${totalCount} civic updates`
          }
        </span>
        <span>
          {hasMore ? (isAm ? 'ተጨማሪ መረጃ ከታች ይመልከቱ ↓' : 'More updates as you scroll ↓') : (isAm ? 'ሁሉም ተጠናቋል' : 'All loaded')}
        </span>
      </div>

      {items.length === 0 && !loading && (
        <NewsEventsEmptyState language={language} onResetFilters={onResetFilters} />
      )}

      <div className="nep-feed-grid">
        {items.map((item) => (
          <NewsEventCard
            key={item.id}
            item={item}
            language={language}
            onOpen={onNavigateToDetail}
          />
        ))}
        {loading && <NewsEventsLoadingCards />}
      </div>

      {hasMore && <NewsEventsSentinel language={language} sentinelRef={sentinelRef} />}
      {!hasMore && items.length > 0 && (
        <NewsEventsEndState language={language} itemCount={items.length} />
      )}
    </main>
  )
}
