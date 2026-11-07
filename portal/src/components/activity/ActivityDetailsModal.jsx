import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../ui/Icon.jsx'

function ActivityDetailsModal({ event, onClose }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!event) return null

  const handleCopyJson = () => {
    const raw = JSON.stringify(event, null, 2)
    navigator.clipboard?.writeText(raw)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const actionToneMap = {
    UPDATE: 'amber',
    CREATE: 'green',
    PUBLISH: 'teal',
    SECURITY: 'purple',
    STATUS: 'blue',
    DELETE: 'red',
  }

  const tone = actionToneMap[event.actionType] || 'teal'

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card modal-activity-details activity-detail-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-modal-title"
      >
        {/* Header */}
        <div className="modal-header activity-detail-header">
          <div>
            <div className="activity-modal-eyebrow">
              <span className="activity-event-id">{event.id}</span>
              <span className={`activity-action-badge ${tone}`}>
                {event.actionType}
              </span>
              <span className="activity-audit-seal">
                <Icon name="shield" size={13} /> Tamper-Evident SHA-256
              </span>
            </div>
            <h2 id="audit-modal-title">{event.actionLabel}</h2>
            <p className="modal-timestamp">
              <Icon name="clock" size={14} /> Recorded on {event.fullTimestamp}
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body activity-modal-body">
          {/* Change Comparison Card (What changed from what to what) */}
          {event.change && (
            <div className="audit-change-card">
              <div className="audit-change-card-header">
                <div className="audit-change-kicker">
                  <Icon name="edit" size={14} />
                  <span>AUDIT STATE TRANSITION — FIELD MODIFICATION</span>
                </div>
                <span className="audit-field-badge">{event.change.field}</span>
              </div>

              <div className="audit-diff-grid">
                {/* State Before */}
                <div className="audit-diff-pane pane-before">
                  <div className="pane-title">
                    <span className="pane-tag old">STATE BEFORE CHANGE</span>
                    <small>Previous verified value</small>
                  </div>
                  <div className="pane-content">
                    <code>{event.change.from}</code>
                  </div>
                </div>

                <div className="audit-diff-divider">
                  <div className="diff-arrow-circle">
                    <Icon name="arrow" size={16} />
                  </div>
                </div>

                {/* State After */}
                <div className="audit-diff-pane pane-after">
                  <div className="pane-title">
                    <span className="pane-tag new">STATE AFTER CHANGE</span>
                    <small>Current active value</small>
                  </div>
                  <div className="pane-content">
                    <code>{event.change.to}</code>
                  </div>
                </div>
              </div>

              {event.change.summary && (
                <div className="audit-change-rationale">
                  <Icon name="info" size={15} />
                  <p><b>Change summary:</b> {event.change.summary}</p>
                </div>
              )}
            </div>
          )}

          {/* Context 2-column Metadata Grid */}
          <div className="audit-meta-grid">
            {/* Actor Card */}
            <div className="audit-meta-box">
              <h4>
                <Icon name="users" size={15} /> Authenticated Actor
              </h4>
              <div className="audit-actor-profile">
                <span className={`actor-avatar ${event.actor.tone || 'teal'}`}>
                  {event.actor.initials}
                </span>
                <div>
                  <strong>{event.actor.name}</strong>
                  <span className="actor-meta-handle">
                    {event.actor.username} · <span className="role-pill">{event.actor.role}</span>
                  </span>
                </div>
              </div>
              <div className="audit-detail-row">
                <span>Access Channel:</span>
                <b>{event.network.channel}</b>
              </div>
              <div className="audit-detail-row">
                <span>Network IP:</span>
                <code>{event.network.ip}</code>
              </div>
              <div className="audit-detail-row">
                <span>Physical Workstation:</span>
                <span>{event.network.location}</span>
              </div>
            </div>

            {/* Target Resource Card */}
            <div className="audit-meta-box">
              <h4>
                <Icon name="layers" size={15} /> Affected Resource
              </h4>
              <div className="audit-resource-profile">
                <div>
                  <strong>{event.target.name}</strong>
                  <span className="resource-id-tag">{event.target.id}</span>
                </div>
              </div>
              <div className="audit-detail-row">
                <span>Resource Type:</span>
                <span className="type-pill">{event.target.type}</span>
              </div>
              <div className="audit-detail-row">
                <span>Category:</span>
                <b>{event.category}</b>
              </div>
              <div className="audit-detail-row">
                <span>Jurisdiction:</span>
                <span>{event.target.jurisdiction}</span>
              </div>
            </div>
          </div>

          {/* Raw JSON Audit Payload */}
          <div className="audit-json-box">
            <div className="audit-json-header">
              <span>
                <Icon name="file" size={13} /> Raw JSON Audit Record
              </span>
              <button
                type="button"
                className="audit-copy-button"
                onClick={handleCopyJson}
              >
                <Icon name={copied ? 'check' : 'copy'} size={13} />
                <span>{copied ? 'Copied to clipboard!' : 'Copy raw JSON'}</span>
              </button>
            </div>
            <pre className="audit-json-payload">
              <code>{JSON.stringify(event, null, 2)}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer activity-detail-footer">
          <span className="modal-security-note">
            <Icon name="shield" size={13} /> This audit record is immutable and signed by the CivicLink security authority.
          </span>
          <button type="button" className="button secondary" onClick={onClose}>
            Close details
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ActivityDetailsModal
