import Icon from '../ui/Icon.jsx'
import HomeNewsEvents from './HomeNewsEvents.jsx'

export default function HomeNewsSection({ language, t, onNavigateToHub, onSelectItem, newsEventsContent }) {
  if (newsEventsContent?.enabled === false) return null

  const kickerNum = newsEventsContent?.kickerNum || '04'
  const kicker = newsEventsContent?.kicker || 'FROM YOUR COMMUNITY'
  const rawTitle = newsEventsContent?.title || "What’s happening near you."
  const sourceLabel = newsEventsContent?.sourceLabel || 'Published by sub-city admins'

  const words = rawTitle.trim().split(' ')
  const lastWord = words.length > 1 ? words.pop() : ''
  const mainTitle = words.join(' ')

  return (
    <section className="news-section section-wrap" id="news">
      <div className="news-header scroll-reveal">
        <div>
          <div className="section-kicker"><span>{kickerNum}</span> {t(kicker)}</div>
          <h2>{t(mainTitle)} {lastWord && <><br /><em>{t(lastWord)}</em></>}</h2>
        </div>
        <div className="update-source"><Icon name="building" size={16} /> {t(sourceLabel)}</div>
      </div>
      <HomeNewsEvents
        language={language}
        onNavigateToHub={onNavigateToHub}
        onSelectItem={onSelectItem}
        newsEventsContent={newsEventsContent}
      />
    </section>
  )
}
