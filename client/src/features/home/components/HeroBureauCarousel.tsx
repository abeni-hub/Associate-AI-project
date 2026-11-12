import { Icon } from '../../shared'
import { heroSlides, type HeroSlide } from '../constants'

export interface HeroBureauCarouselProps {
  activeIndex: number
  onSlideChange: (index: number) => void
  isPlaying: boolean
  onPlayingChange: () => void
  t: (key: string) => string
  slides?: HeroSlide[]
  language?: string
}

export default function HeroBureauCarousel({
  activeIndex,
  onSlideChange,
  isPlaying,
  onPlayingChange,
  t,
  slides = heroSlides,
  language,
}: HeroBureauCarouselProps) {
  const slide = slides[activeIndex] || slides[0]
  const isAm = language === 'am'
  const bureauText = (isAm && (slide as any).bureauAm) || slide.bureau
  const titleText = (isAm && (slide as any).titleAm) || slide.title
  const descText = (isAm && (slide as any).descriptionAm) || slide.description || (slide as any).category

  return (
    <section className="hero-carousel" aria-label={t('Featured government bureaus')} aria-roledescription="carousel" style={{ '--slide-tint': slide.tint } as React.CSSProperties}>
      <div className="hero-photo-stack">
        {slides.map((item: any, index: number) => (
          <img
            key={item.id ?? `${item.bureau}-${index}`}
            className={`hero-photo ${index === activeIndex ? 'is-active' : ''}`}
            src={item.image}
            alt={index === activeIndex ? t((isAm && item.altAm) || item.alt) : ''}
            aria-hidden={index !== activeIndex}
            loading={index === 0 ? 'eager' : 'lazy'}
            onError={(event) => { event.currentTarget.style.display = 'none' }}
          />
        ))}
      </div>
      <div className="hero-photo-scrim" />
      <div key={slide.bureau} className="hero-carousel-caption" aria-live={isPlaying ? 'off' : 'polite'} aria-atomic="true">
        <span className="hero-slide-count">0{activeIndex + 1} <i>/ 0{slides.length}</i></span>
        <span className="hero-bureau-tag">{t(bureauText)}</span>
        <h2>{t(titleText)}</h2>
        <p>{t(descText)}</p>
      </div>
      <div className="hero-carousel-bottom">
        <div className="hero-carousel-dots" role="group" aria-label={t('Choose a bureau spotlight')}>
          {slides.map((item: any, index: number) => (
            <button
              key={item.id ?? `${item.bureau}-${index}`}
              type="button"
              className={`hero-carousel-dot ${index === activeIndex ? 'is-active' : ''}`}
              aria-label={`${t('Show')} ${t(item.bureau).toLowerCase()} ${t('slide')}`}
              aria-pressed={index === activeIndex}
              onClick={() => onSlideChange(index)}
            />
          ))}
        </div>
        <div className="hero-carousel-controls">
          <button type="button" aria-label={t('Previous bureau')} onClick={() => onSlideChange((activeIndex - 1 + slides.length) % slides.length)}>
            <Icon name="arrow" size={17} className="flip-horizontal" />
          </button>
          <button type="button" aria-label={t('Next bureau')} onClick={() => onSlideChange((activeIndex + 1) % slides.length)}>
            <Icon name="arrow" size={17} />
          </button>
          <button type="button" aria-label={t(isPlaying ? 'Pause slideshow' : 'Play slideshow')} aria-pressed={!isPlaying} onClick={onPlayingChange}>
            <Icon name={isPlaying ? 'pause' : 'play'} size={15} />
          </button>
        </div>
      </div>
    </section>
  )
}

