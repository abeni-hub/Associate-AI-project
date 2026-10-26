import HomeNewsArticleCard from './HomeNewsArticleCard.jsx'
import HomeNewsEventCard from './HomeNewsEventCard.jsx'

function HomeNewsSkeletonGrid() {
  return (
    <div className="home-cards-grid">
      {[1, 2, 3].map((number) => (
        <div key={number} className="ne-skeleton-card">
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
  )
}

export default function HomeNewsGrid({ items, loading, language, onSelectItem }) {
  if (loading) return <HomeNewsSkeletonGrid />

  return (
    <div className="home-cards-grid">
      {items.map((item) => item.type === 'event' ? (
        <HomeNewsEventCard key={item.id} item={item} language={language} onSelectItem={onSelectItem} />
      ) : (
        <HomeNewsArticleCard key={item.id} item={item} language={language} onSelectItem={onSelectItem} />
      ))}
    </div>
  )
}
