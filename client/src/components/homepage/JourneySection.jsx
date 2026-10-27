import Icon from '../ui/Icon.jsx'
import JourneyCard from './JourneyCard.jsx'

const journeyCards = [
  {
    className: 'journey-before',
    index: '01',
    phase: 'BEFORE',
    icon: 'file',
    titleLines: ['Prepare', 'with confidence.'],
    description: 'Choose your service and see the requirements, expectations, and room numbers before you leave home.',
    action: 'Find a service',
    href: '#find-service',
    artwork: 'checklist',
  },
  {
    className: 'journey-during',
    index: '02',
    phase: 'DURING',
    icon: 'route',
    titleLines: ['Go straight', 'to the right room.'],
    description: 'Follow your step-by-step guide inside the bureau. Spend less time finding your way around.',
    action: 'See a sample route',
    href: '#service-guide',
    artwork: 'route',
  },
  {
    className: 'journey-after',
    index: '03',
    phase: 'AFTER',
    icon: 'heart',
    titleLines: ['Share what', 'you experienced.'],
    description: 'Leave a complaint, suggestion, or satisfaction rating on the page or with an office QR code.',
    action: 'Share feedback',
    artwork: 'stars',
  },
]

function splitConfiguredTitle(title, fallbackLines) {
  if (!title) return fallbackLines
  if (title.trim() === fallbackLines.join(' ')) return fallbackLines

  const words = title.trim().split(/\s+/)
  if (words.length < 2) return [title.trim(), '']
  const midpoint = Math.ceil(words.length / 2)
  return [words.slice(0, midpoint).join(' '), words.slice(midpoint).join(' ')]
}

export default function JourneySection({ t, onGoToFeedback, journey }) {
  const cards = journey?.steps?.length
    ? journey.steps.map((step, index) => {
        const fallback = journeyCards[index] || journeyCards[0]
        return {
          ...fallback,
          index: step.step || fallback.index,
          titleLines: splitConfiguredTitle(step.title, fallback.titleLines),
          description: step.detail || fallback.description,
        }
      })
    : journeyCards

  return (
    <section className="journey-section" id="how-it-works">
      <div className="section-wrap">
        <div className="section-intro journey-intro scroll-reveal">
          <div>
            <div className="section-kicker"><span>03</span> {t('SIMPLE FROM START TO FINISH')}</div>
            <h2>{t('Three moments.')}<br /><em>{t('One smoother journey.')}</em></h2>
          </div>
          <p>{t(journey?.title || 'From the moment you start planning to the moment you share your experience, everything you need is easy to find.')}</p>
        </div>
        <div className="journey-cards scroll-reveal-group">
          {cards.map((card) => <JourneyCard key={card.index} card={card} t={t} onGoToFeedback={onGoToFeedback} />)}
        </div>
        <div className="qr-note scroll-reveal">
          <span className="qr-note-icon"><Icon name="qr" size={24} /></span>
          <p><b>{t('Already at the bureau?')}</b> {t('Scan the office QR code to open the right feedback form in seconds.')}</p>
          <button type="button" onClick={onGoToFeedback}>{t('Go to feedback')} <Icon name="arrow" size={15} /></button>
        </div>
      </div>
    </section>
  )
}
