import { useState } from 'react'
import Icon from '../ui/Icon.jsx'
import FeedbackFormActions from './FeedbackFormActions.jsx'
import FeedbackStepContent from './FeedbackStepContent.jsx'
import FeedbackSuccess from './FeedbackSuccess.jsx'
import { serviceCatalog } from '../../data/homePageData.js'
import { createFeedbackTrackingNumber } from '../../utils/feedbackTracking.js'

const stepTitles = [
  'What would you like to share?',
  'Which sub-city did you visit?',
  'Which bureau did you visit?',
  'What service did you receive?',
  'Tell us a little more',
]

export default function FeedbackFormCard({ t }) {
  const [feedbackStep, setFeedbackStep] = useState(1)
  const [feedbackType, setFeedbackType] = useState('')
  const [feedbackCity, setFeedbackCity] = useState('Bole')
  const [feedbackBureau, setFeedbackBureau] = useState('civil')
  const [feedbackService, setFeedbackService] = useState('birth-copy')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [satisfaction, setSatisfaction] = useState(0)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [submittedFeedback, setSubmittedFeedback] = useState(null)

  const feedback = {
    type: feedbackType,
    city: feedbackCity,
    bureau: feedbackBureau,
    service: feedbackService,
    message: feedbackMessage,
    satisfaction,
  }

  const actions = {
    setType: setFeedbackType,
    setCity: setFeedbackCity,
    setService: setFeedbackService,
    setMessage: setFeedbackMessage,
    setSatisfaction,
    changeBureau(nextBureau) {
      setFeedbackBureau(nextBureau)
      setFeedbackService(serviceCatalog[nextBureau]?.[0]?.id ?? '')
    },
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!feedbackMessage.trim() || (feedbackType === 'Satisfaction' && !satisfaction)) return
    setSubmittedFeedback({ ...feedback, trackingNumber: createFeedbackTrackingNumber() })
    setFeedbackSubmitted(true)
  }

  function handleReset() {
    setFeedbackSubmitted(false)
    setFeedbackStep(1)
    setFeedbackType('')
    setFeedbackMessage('')
    setSatisfaction(0)
    setSubmittedFeedback(null)
  }

  return (
    <div className="feedback-form-card scroll-reveal">
      {!feedbackSubmitted ? (
        <>
          <div className="feedback-form-heading">
            <div><span className="form-eyebrow">{t('CITIZEN FEEDBACK')}</span><h3>{t('Tell us about your visit')}</h3></div>
            <span className="form-step-count">0{feedbackStep}<i> / 05</i></span>
          </div>
          <div className="feedback-progress" aria-label={t(`STEP ${feedbackStep} OF 5`)}><span style={{ width: `${feedbackStep * 20}%` }} /></div>
          <div className="feedback-step-title"><span>{t(`STEP ${feedbackStep} OF 5`)}</span><h4>{t(stepTitles[feedbackStep - 1])}</h4></div>
          <form onSubmit={handleSubmit}>
            <FeedbackStepContent step={feedbackStep} feedback={feedback} actions={actions} t={t} />
            <FeedbackFormActions
              step={feedbackStep}
              feedbackType={feedbackType}
              message={feedbackMessage}
              satisfaction={satisfaction}
              onBack={() => setFeedbackStep((step) => step - 1)}
              onContinue={() => setFeedbackStep((step) => Math.min(5, step + 1))}
              t={t}
            />
          </form>
          <div className="demo-note">{t('Interactive preview · Connect to your feedback system to receive submissions')}</div>
        </>
      ) : (
        <FeedbackSuccess t={t} onReset={handleReset} trackingNumber={submittedFeedback?.trackingNumber} />
      )}
      <div className="feedback-form-footer"><span><Icon name="shield" size={14} /> {t('Your privacy is important')}</span><span>{t(`STEP ${feedbackStep} OF 5`)}</span></div>
    </div>
  )
}
