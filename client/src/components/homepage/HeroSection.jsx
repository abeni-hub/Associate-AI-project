import Icon from '../ui/Icon.jsx'
import HeroBureauCarousel from './HeroBureauCarousel.jsx'

function getHeroTitleParts(title, language) {
  const lines = title.split('\n').map((line) => line.trim()).filter(Boolean)
  if (lines.length > 1) return [lines[0], lines.slice(1).join(' ')]

  if (language === 'am') {
    const words = title.trim().split(/\s+/)
    if (words.length > 2) {
      return [words.slice(0, -2).join(' '), words.slice(-2).join(' ')]
    }
    if (words.length === 2) {
      return [words[0], words[1]]
    }
  }

  const sentenceBreak = title.match(/^(.+?[.!?:።])\s+(.+)$/)
  return sentenceBreak ? [sentenceBreak[1], sentenceBreak[2]] : [title, '']
}

export default function HeroSection({ activeHeroSlide, activeIndex, onSlideChange, isPlaying, onPlayingChange, onGoToFeedback, t, heroContent, language, slides }) {
  const customTitle = heroContent && (language === 'am' ? heroContent.titleAm : heroContent.titleEn)
  const title = customTitle?.trim() || (language === 'am' ? 'አገልግሎት የት እንደሚሰጥ ይወቁ። ተዘጋጅተው ይድረሱ።' : 'Know where to go. Arrive ready.')
  const [titleLead, titleEmphasis] = getHeroTitleParts(title, language)
  const subtitle = heroContent && (language === 'am' ? heroContent.subtitleAm : heroContent.subtitleEn)
  const eyebrow = (language === 'am' && heroContent?.badgeAm) || heroContent?.badge?.trim() || activeHeroSlide.bureau
  const primaryCta = (language === 'am' && heroContent?.primaryCtaTextAm) || heroContent?.primaryCtaText || 'Find a service'
  const secondaryCta = (language === 'am' && heroContent?.secondaryCtaTextAm) || heroContent?.secondaryCtaText || 'I’ve already visited'

  return (
    <section className="hero-section">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-line" /> {t(eyebrow)}</div>
        <h1>{t(titleLead)}{titleEmphasis && <><br /><em>{t(titleEmphasis)}</em></>}</h1>
        <p className="hero-lede">{t(subtitle?.trim() || 'The right information makes every visit easier. Find your service, prepare your documents, and know exactly where to go before you leave home.')}</p>
        <div className="hero-actions">
          <a className="button button-primary" href={heroContent?.primaryCtaUrl || "#find-service"}>
            {t(primaryCta)} <Icon name="arrow" size={18} />
          </a>
          <button className="button button-secondary" type="button" onClick={onGoToFeedback}>
            <span className="feedback-play">↗</span> {t(secondaryCta)}
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
        language={language}
      />
    </section>
  )
}
