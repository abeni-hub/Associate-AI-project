import Icon from '../ui/Icon.jsx'
import { useState } from 'react'

export default function FeedbackSuccess({ t, onReset, trackingNumber }) {
  const [copied, setCopied] = useState(false)

  async function copyTrackingNumber() {
    const clipboard = globalThis.navigator?.clipboard
    if (!clipboard?.writeText) return
    try {
      await clipboard.writeText(trackingNumber)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="feedback-success" role="status">
      <span className="success-icon"><Icon name="check" size={27} /></span>
      <span className="form-eyebrow">{t('THANK YOU FOR SPEAKING UP')}</span>
      <h3>{t('Your voice matters.')}</h3>
      <p>{t('This preview creates a tracking reference. Connect the feedback system for live status updates.')}</p>
      {trackingNumber && <div className="feedback-reference-card">
        <div><span>{t('YOUR TRACKING NUMBER')}</span><strong>{trackingNumber}</strong></div>
        <button type="button" onClick={copyTrackingNumber} disabled={!globalThis.navigator?.clipboard?.writeText} aria-label={t('Copy tracking number')}><Icon name={copied ? 'check' : 'copy'} size={15} />{t(copied ? 'Copied' : 'Copy number')}</button>
        <small>{t('Save this number to check on your feedback with the office.')}</small>
      </div>}
      <button className="button button-secondary" type="button" onClick={onReset}>{t('Send another response')} <Icon name="arrow" size={16} /></button>
    </div>
  )
}
