import {
  ArrowRight,
  CalendarDays,
  Newspaper,
} from 'lucide-react'

export default function HomeNewsControls({ language, activeTab, onTabChange, data, onNavigateToHub }) {
  const isAm = language === 'am'

  return (
    <div className="home-tabs-bar">
      <div className="home-tab-controls" role="tablist" aria-label={isAm ? 'ዜና እና ዝግጅቶች' : 'News and Events Tabs'}>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'news'}
          className={`home-tab-btn ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => onTabChange('news')}
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
          onClick={() => onTabChange('events')}
        >
          <CalendarDays size={16} />
          <span>{isAm ? 'መጪ ዝግጅቶች' : 'Upcoming Events'}</span>
          <span className="tab-badge">{data.totalEvents || 3}</span>
        </button>
      </div>

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
  )
}
