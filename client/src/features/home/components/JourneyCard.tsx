import { Icon } from '../../shared'

function JourneyArtwork({ type }: { type: string }) {
  if (type === 'checklist') {
    return <div className="journey-card-art art-checklist"><span /><i /><i /><i /><b><Icon name="check" size={16} /></b></div>
  }

  if (type === 'route') {
    return <div className="journey-card-art art-route"><span>12</span><i /><span>14</span><i /><span>15</span></div>
  }

  return <div className="journey-card-art art-stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
}

export interface JourneyCardProps {
  card: {
    className: string
    index: string
    phase: string
    icon: string
    titleLines: string[]
    description: string
    action: string
    href?: string
    artwork: string
  }
  t: (key: string) => string
  onGoToFeedback?: () => void
}

export default function JourneyCard({ card, t, onGoToFeedback }: JourneyCardProps) {
  const Action = card.href ? 'a' : 'button'
  const actionProps: any = card.href
    ? { href: card.href }
    : { type: 'button', onClick: onGoToFeedback }

  return (
    <article className={`journey-card ${card.className}`}>
      <div className="journey-card-top">
        <span className="journey-index">{card.index} / {t(card.phase)}</span>
        <span className="journey-icon"><Icon name={card.icon} size={21} /></span>
      </div>
      <h3>{t(card.titleLines[0])}<br />{t(card.titleLines[1])}</h3>
      <p>{t(card.description)}</p>
      <Action {...actionProps}>{t(card.action)} <Icon name="arrow" size={15} /></Action>
      <JourneyArtwork type={card.artwork} />
    </article>
  )
}

