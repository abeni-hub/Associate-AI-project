import { useState, useEffect } from 'react'
import Icon from '../ui/Icon.jsx'
import FeedbackFormCard from './FeedbackFormCard.jsx'
import ComplaintTracker from './ComplaintTracker.jsx'

export default function FeedbackSection({ language, t, feedbackContent }) {
  const [activeMode, setActiveMode] = useState('form') // 'form' | 'track'
  const [targetTrackingNumber, setTargetTrackingNumber] = useState('')

  useEffect(() => {
    const hash = window.location.hash.toLowerCase()
    const path = window.location.pathname.toLowerCase()
    const search = new URLSearchParams(window.location.search)
    const trackNum = search.get('track') || search.get('tracking')

    if (trackNum) {
      setTargetTrackingNumber(trackNum)
      setActiveMode('track')
    } else if (hash.includes('track') || path.includes('track')) {
      setActiveMode('track')
    }
  }, [])

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

  function handleStartTracking(num) {
    setTargetTrackingNumber(num)
    setActiveMode('track')
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

        <div className="feedback-interactive-col">
          <div className="feedback-tabs-nav" role="tablist" aria-label={t('Citizen feedback options')}>
            <button
              type="button"
              role="tab"
              aria-selected={activeMode === 'form'}
              className={`feedback-tab-btn ${activeMode === 'form' ? 'is-active' : ''}`}
              onClick={() => setActiveMode('form')}
            >
              <Icon name="file" size={16} />
              <span>{t('Submit Feedback')}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeMode === 'track'}
              className={`feedback-tab-btn ${activeMode === 'track' ? 'is-active' : ''}`}
              onClick={() => setActiveMode('track')}
            >
              <Icon name="search" size={16} />
              <span>{t('Track Complaint Status')}</span>
            </button>
          </div>

          {activeMode === 'form' ? (
            <FeedbackFormCard
              language={language}
              t={t}
              onTrack={handleStartTracking}
            />
          ) : (
            <ComplaintTracker
              t={t}
              initialTrackingNumber={targetTrackingNumber}
              onSwitchToForm={() => setActiveMode('form')}
            />
          )}
        </div>
      </div>
    </section>
  )
}
