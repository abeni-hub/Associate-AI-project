import Icon from '../ui/Icon.jsx'

export default function FeedbackFormActions({ step, feedbackType, message, satisfaction, onBack, onContinue, submitting, t }) {
  return (
    <div className="feedback-form-actions">
      {step > 1
        ? <button className="back-step-button" type="button" onClick={onBack} disabled={submitting}>{t('Back')}</button>
        : <span className="form-required-note">{t('Your feedback is anonymous')}</span>}
      {step < 5
        ? <button className="button button-primary form-next-button" type="button" onClick={onContinue} disabled={step === 1 && !feedbackType}>{t('Continue')} <Icon name="arrow" size={17} /></button>
        : <button className="button button-primary form-next-button" type="submit" disabled={submitting || !message.trim() || (feedbackType === 'Satisfaction' && !satisfaction)}>{submitting ? t('Submitting…') : t('Submit feedback')} <Icon name="arrow" size={17} /></button>}
    </div>
  )
}
