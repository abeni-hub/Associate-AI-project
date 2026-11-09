import { useState, useEffect } from 'react'
import Icon from '../ui/Icon.jsx'
import { useLazyTrackFeedbackQuery } from '../../services/feedbackApi.js'

export default function ComplaintTracker({ t, initialTrackingNumber, onSwitchToForm }) {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '')
  const [hasSearched, setHasSearched] = useState(false)
  const [copied, setCopied] = useState(false)

  const [triggerTrack, { data: trackData, error, isFetching }] = useLazyTrackFeedbackQuery()

  useEffect(() => {
    if (initialTrackingNumber && String(initialTrackingNumber).trim()) {
      setTrackingNumber(initialTrackingNumber)
      triggerTrack(String(initialTrackingNumber).trim())
      setHasSearched(true)
    }
  }, [initialTrackingNumber, triggerTrack])

  function handleSearch(e) {
    if (e) e.preventDefault()
    const cleanNum = trackingNumber.trim()
    if (!cleanNum) return
    triggerTrack(cleanNum)
    setHasSearched(true)
  }

  async function copyTrackingNumber(num) {
    if (!globalThis.navigator?.clipboard?.writeText) return
    try {
      await globalThis.navigator.clipboard.writeText(num)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  const feedback = trackData?.data || null
  const notFound = hasSearched && !isFetching && (!trackData?.success || !feedback || error)

  const rawStatus = (feedback?.status || (feedback?.response ? 'resolved' : 'submitted')).toLowerCase()
  const isResolved = rawStatus === 'resolved' || rawStatus === 'closed'
  const isUnderReview = rawStatus === 'under_review' || rawStatus === 'in_progress' || rawStatus === 'in_review'
  const isSubmitted = !isResolved && !isUnderReview

  let statusStep = 1
  if (isUnderReview) statusStep = 2
  if (isResolved) statusStep = 3

  return (
    <div className="complaint-tracker scroll-reveal">
      <div className="tracker-heading">
        <div className="tracker-header-info">
          <span className="form-eyebrow">{t('Official complaint tracker')}</span>
          <h3>{t('Track Complaint Status')}</h3>
          <p>{t('Track the progress of your feedback or complaint in real time.')}</p>
        </div>
        {onSwitchToForm && (
          <button
            type="button"
            className="switch-view-btn"
            onClick={onSwitchToForm}
          >
            <Icon name="arrow" size={14} /> {t('Submit Feedback')}
          </button>
        )}
      </div>

      <form className="tracker-search-bar" onSubmit={handleSearch}>
        <div className="tracker-input-wrap">
          <Icon name="search" size={18} />
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder={t('Enter your 10-digit tracking number…')}
            aria-label={t('Enter tracking number')}
            disabled={isFetching}
          />
          {trackingNumber && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => {
                setTrackingNumber('')
                setHasSearched(false)
              }}
              aria-label={t('Clear search')}
            >
              <Icon name="close" size={14} />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="button button-primary track-btn"
          disabled={!trackingNumber.trim() || isFetching}
        >
          {isFetching ? (
            <span>{t('Searching tracking records...')}</span>
          ) : (
            <>
              <Icon name="search" size={16} />
              <span>{t('Track Status')}</span>
            </>
          )}
        </button>
      </form>

      {notFound && (
        <div className="tracker-empty-state">
          <div className="empty-state-icon">
            <Icon name="shield" size={32} />
          </div>
          <h4>{t('No complaint or feedback found matching this tracking number.')}</h4>
          <p>{t('Please check your tracking number and try again.')}</p>
          {onSwitchToForm && (
            <button
              type="button"
              className="button button-secondary"
              onClick={onSwitchToForm}
            >
              {t('Submit Feedback')}
            </button>
          )}
        </div>
      )}

      {feedback && !isFetching && (
        <div className="tracker-result-card">
          <div className="result-header">
            <div>
              <span className="reference-tag">{t('Tracking Reference')}</span>
              <div className="reference-number-row">
                <h4>#{feedback.tracking_number}</h4>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={() => copyTrackingNumber(feedback.tracking_number)}
                  title={t('Copy tracking number')}
                >
                  <Icon name={copied ? 'check' : 'copy'} size={15} />
                  <span>{t(copied ? 'Copied' : 'Copy number')}</span>
                </button>
              </div>
            </div>
            <div className={`status-pill status-${rawStatus}`}>
              <span className="status-dot" />
              <strong>
                {rawStatus === 'resolved'
                  ? t('Resolved')
                  : rawStatus === 'under_review'
                    ? t('Under Review')
                    : rawStatus === 'closed'
                      ? t('Closed')
                      : t('Submitted')}
              </strong>
            </div>
          </div>

          <div className="tracker-timeline">
            <div className={`timeline-step ${statusStep >= 1 ? 'is-complete' : ''} ${statusStep === 1 ? 'is-active' : ''}`}>
              <div className="timeline-node">
                <Icon name="check" size={14} />
              </div>
              <div className="timeline-text">
                <strong>{t('Step 1: Received')}</strong>
                <small>{t('Submitted')}</small>
              </div>
            </div>
            <div className={`timeline-connector ${statusStep >= 2 ? 'is-complete' : ''}`} />
            <div className={`timeline-step ${statusStep >= 2 ? 'is-complete' : ''} ${statusStep === 2 ? 'is-active' : ''}`}>
              <div className="timeline-node">
                <Icon name="route" size={14} />
              </div>
              <div className="timeline-text">
                <strong>{t('Step 2: Bureau Review')}</strong>
                <small>{statusStep >= 2 ? t('Under Review') : '—'}</small>
              </div>
            </div>
            <div className={`timeline-connector ${statusStep >= 3 ? 'is-complete' : ''}`} />
            <div className={`timeline-step ${statusStep >= 3 ? 'is-complete' : ''} ${statusStep === 3 ? 'is-active' : ''}`}>
              <div className="timeline-node">
                <Icon name="check" size={14} />
              </div>
              <div className="timeline-text">
                <strong>{t('Step 3: Official Resolution')}</strong>
                <small>{statusStep >= 3 ? t('Resolved') : '—'}</small>
              </div>
            </div>
          </div>

          <div className="tracker-meta-grid">
            <div className="meta-item">
              <span className="meta-label">{t('Target Bureau')}</span>
              <strong>{feedback.organization?.name ? t(feedback.organization.name) : t('City Administration')}</strong>
            </div>
            <div className="meta-item">
              <span className="meta-label">{t('Submission Date')}</span>
              <strong>{feedback.created_at ? new Date(feedback.created_at).toLocaleDateString() : '—'}</strong>
            </div>
          </div>

          <div className="tracker-submission-box">
            <span className="box-title">{t('Your Complaint / Note')}</span>
            <p>{feedback.feedback_content}</p>
          </div>

          <div className={`tracker-response-box ${feedback.response ? 'has-response' : 'awaiting-response'}`}>
            <div className="response-header">
              <Icon name={feedback.response ? 'check' : 'clock'} size={18} />
              <strong>{t('Official Bureau Response')}</strong>
            </div>
            {feedback.response ? (
              <div className="response-body">
                <p>{feedback.response}</p>
              </div>
            ) : (
              <p className="response-awaiting-note">
                {t('Your submission is assigned to the relevant department and currently being reviewed by bureau officers. Check back soon for the official response.')}
              </p>
            )}
          </div>

          <div className="tracker-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                setTrackingNumber('')
                setHasSearched(false)
              }}
            >
              {t('Track another')}
            </button>
            {onSwitchToForm && (
              <button
                type="button"
                className="button button-primary"
                onClick={onSwitchToForm}
              >
                {t('Send another response')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

