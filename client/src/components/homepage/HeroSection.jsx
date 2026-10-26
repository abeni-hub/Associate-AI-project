import Icon from '../ui/Icon.jsx'
import HeroBureauCarousel from './HeroBureauCarousel.jsx'

export default function HeroSection({ activeHeroSlide, activeIndex, onSlideChange, isPlaying, onPlayingChange, onGoToFeedback, t }) {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-line" /> {t(activeHeroSlide.bureau)}</div>
        <h1>{t('Know where to go.')}<br /><em>{t('Arrive ready.')}</em></h1>
        <p className="hero-lede">{t('The right information makes every visit easier. Find your service, prepare your documents, and know exactly where to go before you leave home.')}</p>
        <div className="hero-actions">
          <a className="button button-primary" href="#find-service">{t('Find a service')} <Icon name="arrow" size={18} /></a>
          <button className="button button-secondary" type="button" onClick={onGoToFeedback}><span className="feedback-play">↗</span> {t('I’ve already visited')}</button>
        </div>
      </div>
      <HeroBureauCarousel
        activeIndex={activeIndex}
        onSlideChange={onSlideChange}
        isPlaying={isPlaying}
        onPlayingChange={onPlayingChange}
        t={t}
      />
    </section>
  )
}
