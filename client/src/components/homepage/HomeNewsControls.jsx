import {
  ArrowRight,
  CalendarDays,
  Newspaper,
} from 'lucide-react'

export default function HomeNewsControls({ language, activeTab, onTabChange, data, onNavigateToHub, newsEventsContent }) {
  const isAm = language === 'am'
  const isOm = language === 'om'
  const showNews = newsEventsContent?.showNews !== false
  const showEvents = newsEventsContent?.showEvents !== false
  const customViewAllText = newsEventsContent?.viewAllText

  return (
    <div className="home-tabs-bar">
      <div className="home-tab-controls" role="tablist" aria-label={isAm ? 'ዜና እና ዝግጅቶች' : isOm ? 'Oduu fi Sagantaalee' : 'News and Events Tabs'}>
        {showNews && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'news'}
            className={`home-tab-btn ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => onTabChange('news')}
          >
            <Newspaper size={16} />
            <span>{isAm ? 'የወቅቱ ዜናዎች' : isOm ? 'Oduuwwan Haaraa' : 'Latest News'}</span>
            <span className="tab-badge">{data.totalNews || 3}</span>
          </button>
        )}

        {showEvents && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'events'}
            className={`home-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => onTabChange('events')}
          >
            <CalendarDays size={16} />
            <span>{isAm ? 'መጪ ዝግጅቶች' : isOm ? 'Sagantaalee Itti Aanan' : 'Upcoming Events'}</span>
            <span className="tab-badge">{data.totalEvents || 3}</span>
          </button>
        )}
      </div>

      <button
        type="button"
        className="home-hub-link"
        onClick={() => onNavigateToHub && onNavigateToHub(activeTab)}
        aria-label={isAm ? 'ሁሉንም በዝርዝር ይመልከቱ' : isOm ? 'Hunda bal’inaan qoradhaa' : 'Explore full News & Events page'}
      >
        <span>
          {customViewAllText || (activeTab === 'news'
            ? (isAm ? `ሁሉንም ዜናዎች ይመልከቱ (${data.totalNews})` : isOm ? `Oduuwwan Hunda Qoradhaa (${data.totalNews})` : `Explore All News (${data.totalNews})`)
            : (isAm ? `ሁሉንም ዝግጅቶች ይመልከቱ (${data.totalEvents})` : isOm ? `Sagantaalee Hunda Qoradhaa (${data.totalEvents})` : `Explore All Events (${data.totalEvents})`)
          )}
        </span>
        <ArrowRight size={15} />
      </button>
    </div>
  )
}
