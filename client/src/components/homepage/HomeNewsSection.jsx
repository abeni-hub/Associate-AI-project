import Icon from '../ui/Icon.jsx'
import HomeNewsEvents from './HomeNewsEvents.jsx'

export default function HomeNewsSection({ language, t, onNavigateToHub, onSelectItem, newsEventsContent }) {
  if (newsEventsContent?.enabled === false) return null

  const kickerNum = newsEventsContent?.kickerNum || '04'
  const kicker = (language === 'am' && newsEventsContent?.kickerAm) || newsEventsContent?.kicker || 'FROM YOUR COMMUNITY'
  const rawTitle = (language === 'am' && newsEventsContent?.titleAm) || newsEventsContent?.title || "What’s happening near you."
  const sourceLabel = (language === 'am' && newsEventsContent?.sourceLabelAm) || newsEventsContent?.sourceLabel || 'Published by sub-city admins'

  let mainTitle = rawTitle
  let lastWord = ''

  if (language === 'am') {
    if (newsEventsContent?.titleAm) {
      const words = newsEventsContent.titleAm.trim().split(/\s+/)
      if (words.length > 2) {
        lastWord = words.pop()
        mainTitle = words.join(' ')
      } else {
        mainTitle = newsEventsContent.titleAm
        lastWord = ''
      }
    } else {
      mainTitle = 'በአካባቢዎ ምን እየተካሄደ'
      lastWord = 'ነው?'
    }
  } else {
    const words = rawTitle.trim().split(' ')
    lastWord = words.length > 1 ? words.pop() : ''
    mainTitle = words.join(' ')
  }

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
