import Icon from '../ui/Icon.jsx'
import FeedbackFormCard from './FeedbackFormCard.jsx'

export default function FeedbackSection({ language, t, feedbackContent }) {
  if (feedbackContent?.enabled === false) return null

  const kickerNum = feedbackContent?.kickerNum || '05'
  const kicker = (language === 'am' && feedbackContent?.kickerAm) || feedbackContent?.kicker || 'YOUR VOICE HELPS'
  const rawTitle = (language === 'am' && feedbackContent?.titleAm) || feedbackContent?.title || 'Every experience can make things better.'
  const description = (language === 'am' && feedbackContent?.descriptionAm) || feedbackContent?.description || 'Tell us how your visit went. Your feedback reaches the right bureau and helps improve services for everyone.'
  const pointOne = (language === 'am' && feedbackContent?.pointOneAm) || feedbackContent?.pointOne || 'No account needed'
  const pointTwo = (language === 'am' && feedbackContent?.pointTwoAm) || feedbackContent?.pointTwo || 'Scan a bureau QR code'
  const quote = (language === 'am' && feedbackContent?.quoteAm) || feedbackContent?.quote || 'Clear guidance before your visit. A simple way to be heard afterward.'

  let mainTitle = rawTitle
  let lastWord = ''

  if (language === 'am') {
    if (feedbackContent?.titleAm) {
      const words = feedbackContent.titleAm.trim().split(/\s+/)
      if (words.length > 2) {
        lastWord = words.pop()
        mainTitle = words.join(' ')
      } else {
        mainTitle = feedbackContent.titleAm
        lastWord = ''
      }
    } else {
      mainTitle = 'እያንዳንዱ ልምድ ለውጥ'
      lastWord = 'ያመጣል።'
    }
  } else {
    const words = rawTitle.trim().split(' ')
    lastWord = words.length > 1 ? words.pop() : ''
    mainTitle = words.join(' ')
  }

  return (
    <section className="feedback-section" id="feedback">
      <div className="feedback-backdrop" />
      <div className="feedback-layout section-wrap">
        <div className="feedback-copy scroll-reveal">
          <div className="section-kicker section-kicker-light"><span>{kickerNum}</span> {t(kicker)}</div>
          <h2>{t(mainTitle)} {lastWord && <><br /><em>{t(lastWord)}</em></>}</h2>
          <p>{t(description)}</p>
          <div className="feedback-points">
            <span><Icon name="shield" size={17} /> {t(pointOne)}</span>
            <span><Icon name="qr" size={17} /> {t(pointTwo)}</span>
          </div>
          <div className="feedback-quote"><span className="quote-mark">“</span><p>{t(quote)}</p></div>
        </div>
        <FeedbackFormCard language={language} t={t} />
      </div>
    </section>
  )
}
