import type { RefObject } from 'react'
import NewsEventCard from './NewsEventCard'
import {
  NewsEventsEmptyState,
  NewsEventsEndState,
  NewsEventsLoadingCards,
  NewsEventsSentinel,
} from './NewsEventsFeedStates'

export interface NewsEventsFeedProps {
  language?: string
  items: any[]
  totalCount?: number
  loading: boolean
  hasMore: boolean
  sentinelRef?: RefObject<HTMLDivElement | null>
  activeType?: string
  onNavigateToDetail?: (item: any) => void
  onResetFilters?: () => void
}

export default function NewsEventsFeed({
  language,
  items,
  totalCount = items.length,
  loading,
  hasMore,
  sentinelRef,
  onNavigateToDetail,
  onResetFilters,
}: NewsEventsFeedProps) {
  const isAm = language === 'am'
  const displayTotal = typeof totalCount === 'number' ? totalCount : (items?.length || 0)

  return (
    <main className="nep-feed-container">
      <div className="nep-feed-meta">
        <span>
          {isAm
            ? `የሚታዩት፡ ${items.length} ከ ${displayTotal} ወቅታዊ መረጃዎች`
            : `Showing ${items.length} of ${displayTotal} civic updates`
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

      {hasMore && sentinelRef && <NewsEventsSentinel language={language} sentinelRef={sentinelRef} />}
      {!hasMore && items.length > 0 && (
        <NewsEventsEndState language={language} itemCount={items.length} />
      )}
    </main>
  )
}
