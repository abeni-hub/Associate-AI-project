import Icon from '../ui/Icon.jsx'

function JourneyArtwork({ type }) {
  if (type === 'checklist') {
    return <div className="journey-card-art art-checklist"><span /><i /><i /><i /><b><Icon name="check" size={16} /></b></div>
  }

  if (type === 'route') {
    return <div className="journey-card-art art-route"><span>12</span><i /><span>14</span><i /><span>15</span></div>
  }

  return <div className="journey-card-art art-stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
}

export default function JourneyCard({ card, t, onGoToFeedback }) {
  const Action = card.href ? 'a' : 'button'
  const actionProps = card.href
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
