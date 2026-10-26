import Icon from '../ui/Icon.jsx'
import HomeNewsEvents from './HomeNewsEvents.jsx'

export default function HomeNewsSection({ language, t, onNavigateToHub, onSelectItem }) {
  return (
    <section className="news-section section-wrap" id="news">
      <div className="news-header scroll-reveal">
        <div>
          <div className="section-kicker"><span>04</span> {t('FROM YOUR COMMUNITY')}</div>
          <h2>{t('What’s happening')}<br /><em>{t('near you.')}</em></h2>
        </div>
        <div className="update-source"><Icon name="building" size={16} /> {t('Published by sub-city admins')}</div>
      </div>
      <HomeNewsEvents language={language} onNavigateToHub={onNavigateToHub} onSelectItem={onSelectItem} />
    </section>
  )
}
