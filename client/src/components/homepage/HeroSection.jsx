import Icon from '../ui/Icon.jsx'
import HeroBureauCarousel from './HeroBureauCarousel.jsx'

function getHeroTitleParts(title) {
  const lines = title.split('\n').map((line) => line.trim()).filter(Boolean)
  if (lines.length > 1) return [lines[0], lines.slice(1).join(' ')]

  const sentenceBreak = title.match(/^(.+?[.!?])\s+(.+)$/)
  return sentenceBreak ? [sentenceBreak[1], sentenceBreak[2]] : [title, '']
}

export default function HeroSection({ activeHeroSlide, activeIndex, onSlideChange, isPlaying, onPlayingChange, onGoToFeedback, t, heroContent, language, slides }) {
  const customTitle = heroContent && (language === 'am' ? heroContent.titleAm : heroContent.titleEn)
  const title = customTitle?.trim() || 'Know where to go. Arrive ready.'
  const [titleLead, titleEmphasis] = getHeroTitleParts(title)
  const subtitle = heroContent && (language === 'am' ? heroContent.subtitleAm : heroContent.subtitleEn)
  const eyebrow = heroContent?.badge?.trim() || activeHeroSlide.bureau

  return (
    <section className="hero-section">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-line" /> {t(eyebrow)}</div>
        <h1>{t(titleLead)}{titleEmphasis && <><br /><em>{t(titleEmphasis)}</em></>}</h1>
        <p className="hero-lede">{t(subtitle?.trim() || 'The right information makes every visit easier. Find your service, prepare your documents, and know exactly where to go before you leave home.')}</p>
        <div className="hero-actions">
          <a className="button button-primary" href={heroContent?.primaryCtaUrl || "#find-service"}>
            {t(heroContent?.primaryCtaText || 'Find a service')} <Icon name="arrow" size={18} />
          </a>
          <button className="button button-secondary" type="button" onClick={onGoToFeedback}>
            <span className="feedback-play">↗</span> {t(heroContent?.secondaryCtaText || 'I’ve already visited')}
          </button>
        </div>
      </div>
      <HeroBureauCarousel
        activeIndex={activeIndex}
        onSlideChange={onSlideChange}
        isPlaying={isPlaying}
        onPlayingChange={onPlayingChange}
        t={t}
        slides={slides}
      />
    </section>
  )
}
