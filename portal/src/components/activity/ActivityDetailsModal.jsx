import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../ui/Icon.jsx'

function ActivityDetailsModal({ event, onClose }) {
  const [activeTab, setActiveTab] = useState('diff')
  const [copiedReq, setCopiedReq] = useState(false)
  const [copiedRes, setCopiedRes] = useState(false)
  const [copiedFull, setCopiedFull] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!event) return null

  const handleCopyRequest = () => {
    if (!event.requestPayload) return
    const raw = JSON.stringify(event.requestPayload, null, 2)
    navigator.clipboard?.writeText(raw)
    setCopiedReq(true)
    setTimeout(() => setCopiedReq(false), 2000)
  }

  const handleCopyResponse = () => {
    if (!event.responsePayload) return
    const raw = JSON.stringify(event.responsePayload, null, 2)
    navigator.clipboard?.writeText(raw)
    setCopiedRes(true)
    setTimeout(() => setCopiedRes(false), 2000)
  }

  const handleCopyFull = () => {
    const raw = JSON.stringify(event, null, 2)
    navigator.clipboard?.writeText(raw)
    setCopiedFull(true)
    setTimeout(() => setCopiedFull(false), 2000)
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
  const isSuccess = event.isSuccess ?? (event.statusCode ? event.statusCode >= 200 && event.statusCode < 300 : true)
  const statusCode = event.statusCode || 200
  const statusTone = isSuccess ? 'success' : statusCode >= 400 && statusCode < 500 ? 'warning' : 'error'

  const diffCount = event.diffs && event.diffs.length > 0 ? event.diffs.length : (event.change?.isChange ? 1 : 0)

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
              <span className={`http-status-pill ${statusTone}`}>
                HTTP {statusCode}
              </span>
              <span className="activity-audit-seal">
                <Icon name="shield" size={13} /> Tamper-Evident SHA-256
              </span>
            </div>
            <h2 id="audit-modal-title">
              {event.communicativeTitle || event.actionLabel}
            </h2>
            <p className="modal-timestamp">
              <Icon name="clock" size={14} /> Recorded on {event.fullTimestamp} · Actor: <b>{event.actor?.name}</b> ({event.actor?.username})
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="activity-modal-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'diff'}
            className={`activity-modal-tab${activeTab === 'diff' ? ' active' : ''}`}
            onClick={() => setActiveTab('diff')}
          >
            <Icon name="edit" size={14} />
            <span>Changes & State Transition</span>
            {diffCount > 0 && <span className="activity-modal-tab-badge">{diffCount}</span>}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'telemetry'}
            className={`activity-modal-tab${activeTab === 'telemetry' ? ' active' : ''}`}
            onClick={() => setActiveTab('telemetry')}
          >
            <Icon name="file" size={14} />
            <span>HTTP Telemetry (Req & Res)</span>
            <span className={`activity-modal-tab-badge ${statusTone}`}>{statusCode}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'context'}
            className={`activity-modal-tab${activeTab === 'context' ? ' active' : ''}`}
            onClick={() => setActiveTab('context')}
          >
            <Icon name="users" size={14} />
            <span>Actor & Network Origin</span>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body activity-modal-body">
          {/* TAB 1: CHANGES & STATE TRANSITION */}
          {activeTab === 'diff' && (
            <>
              {event.errorMessage && (
                <div className="audit-error-banner">
                  <Icon name="alertTriangle" size={18} />
                  <div>
                    <b>Operation Exception / Validation Error</b>
                    <p>{event.errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Multiple or single diffs */}
              {event.diffs && event.diffs.length > 0 ? (
                <div className="audit-diff-list">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <small style={{ color: '#5b746c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', fontSize: '11px' }}>
                      Audit Transition Log — {event.diffs.length} {event.diffs.length === 1 ? 'Field Modified' : 'Fields Modified'}
                    </small>
                    <span className="diff-more-badge">Target: {event.target?.type} #{event.target?.id}</span>
                  </div>

                  {event.diffs.map((d, idx) => (
                    <div key={`${d.field}-${idx}`} className="audit-diff-row-card">
                      <div className="audit-diff-row-header">
                        <span className="audit-field-badge">{d.field}</span>
                        <small style={{ color: '#88988e', fontSize: '11px' }}>Field #{idx + 1}</small>
                      </div>

                      <div className="audit-diff-grid">
                        <div className="audit-diff-pane pane-before">
                          <div className="pane-title">
                            <span className="pane-tag old">STATE BEFORE</span>
                            <small>Previous value</small>
                          </div>
                          <div className="pane-content">
                            <code>{d.from}</code>
                          </div>
                        </div>

                        <div className="audit-diff-divider">
                          <div className="diff-arrow-circle">
                            <Icon name="arrow" size={15} />
                          </div>
                        </div>

                        <div className="audit-diff-pane pane-after">
                          <div className="pane-title">
                            <span className="pane-tag new">STATE AFTER</span>
                            <small>Updated value</small>
                          </div>
                          <div className="pane-content">
                            <code>{d.to}</code>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {event.change?.summary && (
                    <div className="audit-change-rationale">
                      <Icon name="info" size={15} />
                      <p><b>Summary:</b> {event.change.summary}</p>
                    </div>
                  )}
                </div>
              ) : event.actionType === 'CREATE' ? (
                <div className="audit-change-card">
                  <div className="audit-change-card-header">
                    <div className="audit-change-kicker">
                      <Icon name="plus" size={14} />
                      <span>INITIAL RECORD CREATION</span>
                    </div>
                    <span className="diff-created-pill">New Entity</span>
                  </div>
                  <p style={{ margin: '0 0 12px', color: '#45665d', fontSize: '13px' }}>
                    A new <b>{event.target?.type}</b> record was instantiated in the administrative database with initialized properties.
                  </p>
                  {event.newValues && (
                    <div className="audit-json-box">
                      <div className="audit-json-header">
                        <span><Icon name="file" size={12} /> Initialized Attributes</span>
                      </div>
                      <pre className="audit-json-payload">
                        <code>{JSON.stringify(event.newValues, null, 2)}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ) : event.actionType === 'DELETE' ? (
                <div className="audit-change-card" style={{ borderLeftColor: '#c24128' }}>
                  <div className="audit-change-card-header">
                    <div className="audit-change-kicker" style={{ color: '#9e2d18' }}>
                      <Icon name="close" size={14} />
                      <span>RECORD PURGED FROM DATABASE</span>
                    </div>
                    <span className="diff-deleted-pill">Deleted Record</span>
                  </div>
                  <p style={{ margin: '0 0 12px', color: '#68453f', fontSize: '13px' }}>
                    <b>{event.target?.type} #{event.target?.id}</b> was permanently purged by an authorized administrator.
                  </p>
                  {event.oldValues && (
                    <div className="audit-json-box">
                      <div className="audit-json-header">
                        <span><Icon name="file" size={12} /> Last Verified State Before Deletion</span>
                      </div>
                      <pre className="audit-json-payload">
                        <code>{JSON.stringify(event.oldValues, null, 2)}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ) : event.actionType === 'SECURITY' ? (
                <div className="audit-change-card" style={{ borderLeftColor: '#6d4599' }}>
                  <div className="audit-change-card-header">
                    <div className="audit-change-kicker" style={{ color: '#5b3787' }}>
                      <Icon name="shield" size={14} />
                      <span>SECURITY & SESSION EVENT</span>
                    </div>
                    <span className="diff-auth-pill">Authenticated</span>
                  </div>
                  <p style={{ margin: '0 0 12px', color: '#4c425c', fontSize: '13px' }}>
                    User <b>{event.actor?.name}</b> ({event.actor?.username}) successfully authenticated from IP <code>{event.network?.ip}</code>.
                  </p>
                </div>
              ) : (
                <div className="audit-change-card">
                  <div className="audit-change-card-header">
                    <div className="audit-change-kicker">
                      <Icon name="edit" size={14} />
                      <span>STATE MODIFICATION</span>
                    </div>
                    <span className="audit-field-badge">{event.change?.field || 'State'}</span>
                  </div>
                  <div className="audit-diff-grid">
                    <div className="audit-diff-pane pane-before">
                      <div className="pane-title">
                        <span className="pane-tag old">STATE BEFORE</span>
                      </div>
                      <div className="pane-content">
                        <code>{event.change?.from || '—'}</code>
                      </div>
                    </div>
                    <div className="audit-diff-divider">
                      <div className="diff-arrow-circle">
                        <Icon name="arrow" size={15} />
                      </div>
                    </div>
                    <div className="audit-diff-pane pane-after">
                      <div className="pane-title">
                        <span className="pane-tag new">STATE AFTER</span>
                      </div>
                      <div className="pane-content">
                        <code>{event.change?.to || '—'}</code>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: HTTP TELEMETRY (REQUEST & RESPONSE) */}
          {activeTab === 'telemetry' && (
            <div className="audit-telemetry-view">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <small style={{ color: '#5b746c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', fontSize: '11px' }}>
                    HTTP Transmission Telemetry
                  </small>
                  <p style={{ margin: '2px 0 0', color: '#667d74', fontSize: '12px' }}>
                    Wire payloads captured at gateway boundary for compliance and replay inspection.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className={`http-status-pill ${statusTone}`}>HTTP {statusCode}</span>
                  <span className="channel-tag">{event.network?.channel}</span>
                </div>
              </div>

              {event.errorMessage && (
                <div className="audit-error-banner" style={{ marginBottom: 14 }}>
                  <Icon name="alertTriangle" size={18} />
                  <div>
                    <b>HTTP {statusCode} Error Response</b>
                    <p>{event.errorMessage}</p>
                  </div>
                </div>
              )}

              <div className="telemetry-grid">
                {/* Incoming Request Payload */}
                <div className="telemetry-card">
                  <div className="telemetry-card-header">
                    <span>
                      <Icon name="file" size={13} /> Incoming Request Payload
                    </span>
                    {event.requestPayload && Object.keys(event.requestPayload).length > 0 && (
                      <button
                        type="button"
                        className="audit-copy-button"
                        onClick={handleCopyRequest}
                      >
                        <Icon name={copiedReq ? 'check' : 'copy'} size={12} />
                        <span>{copiedReq ? 'Copied!' : 'Copy JSON'}</span>
                      </button>
                    )}
                  </div>
                  {event.requestPayload && Object.keys(event.requestPayload).length > 0 ? (
                    <pre className="telemetry-code">
                      <code>{JSON.stringify(event.requestPayload, null, 2)}</code>
                    </pre>
                  ) : (
                    <div className="telemetry-empty-box">
                      <Icon name="file" size={24} />
                      <p style={{ margin: 0 }}>No incoming request body payload was recorded for this transaction.</p>
                      <small style={{ color: '#90a097' }}>GET, session ping, or empty body request</small>
                    </div>
                  )}
                </div>

                {/* Outgoing Response Payload */}
                <div className="telemetry-card">
                  <div className="telemetry-card-header">
                    <span>
                      <Icon name="checkCircle" size={13} /> Outgoing Response Payload
                    </span>
                    {event.responsePayload && Object.keys(event.responsePayload).length > 0 && (
                      <button
                        type="button"
                        className="audit-copy-button"
                        onClick={handleCopyResponse}
                      >
                        <Icon name={copiedRes ? 'check' : 'copy'} size={12} />
                        <span>{copiedRes ? 'Copied!' : 'Copy JSON'}</span>
                      </button>
                    )}
                  </div>
                  {event.responsePayload && Object.keys(event.responsePayload).length > 0 ? (
                    <pre className="telemetry-code">
                      <code>{JSON.stringify(event.responsePayload, null, 2)}</code>
                    </pre>
                  ) : (
                    <div className="telemetry-empty-box">
                      <Icon name="checkCircle" size={24} />
                      <p style={{ margin: 0 }}>No response body recorded.</p>
                      <small style={{ color: '#90a097' }}>Standard HTTP {statusCode} acknowledgement returned</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACTOR & NETWORK CONTEXT */}
          {activeTab === 'context' && (
            <>
              {/* Context 2-column Metadata Grid */}
              <div className="audit-meta-grid">
                {/* Actor Card */}
                <div className="audit-meta-box">
                  <h4>
                    <Icon name="users" size={15} /> Authenticated Actor
                  </h4>
                  <div className="audit-actor-profile">
                    <span className={`actor-avatar ${event.actor?.tone || 'teal'}`}>
                      {event.actor?.initials}
                    </span>
                    <div>
                      <strong>{event.actor?.name}</strong>
                      <span className="actor-meta-handle">
                        {event.actor?.username} · <span className="role-pill">{event.actor?.role}</span>
                      </span>
                    </div>
                  </div>
                  <div className="audit-detail-row">
                    <span>Access Channel:</span>
                    <b>{event.network?.channel}</b>
                  </div>
                  <div className="audit-detail-row">
                    <span>Client IP:</span>
                    <code>{event.network?.ip}</code>
                  </div>
                  <div className="audit-detail-row">
                    <span>Workstation Origin:</span>
                    <span>{event.network?.location}</span>
                  </div>
                  <div className="audit-detail-row">
                    <span>User Agent:</span>
                    <span style={{ fontSize: '11px', color: '#688075', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={event.network?.userAgent}>
                      {event.network?.userAgent}
                    </span>
                  </div>
                </div>

                {/* Target Resource Card */}
                <div className="audit-meta-box">
                  <h4>
                    <Icon name="layers" size={15} /> Affected Resource
                  </h4>
                  <div className="audit-resource-profile">
                    <div>
                      <strong>{event.target?.name}</strong>
                      <span className="resource-id-tag">{event.target?.id}</span>
                    </div>
                  </div>
                  <div className="audit-detail-row">
                    <span>Resource Type:</span>
                    <span className="type-pill">{event.target?.type}</span>
                  </div>
                  <div className="audit-detail-row">
                    <span>Category:</span>
                    <b>{event.category}</b>
                  </div>
                  <div className="audit-detail-row">
                    <span>Jurisdiction:</span>
                    <span>{event.target?.jurisdiction}</span>
                  </div>
                  <div className="audit-detail-row">
                    <span>Event Reference:</span>
                    <code>{event.id}</code>
                  </div>
                </div>
              </div>

              {/* Full Raw JSON Audit Record */}
              <div className="audit-json-box">
                <div className="audit-json-header">
                  <span>
                    <Icon name="file" size={13} /> Complete Audit Record (Internal JSON)
                  </span>
                  <button
                    type="button"
                    className="audit-copy-button"
                    onClick={handleCopyFull}
                  >
                    <Icon name={copiedFull ? 'check' : 'copy'} size={13} />
                    <span>{copiedFull ? 'Copied to clipboard!' : 'Copy complete JSON'}</span>
                  </button>
                </div>
                <pre className="audit-json-payload">
                  <code>{JSON.stringify(event, null, 2)}</code>
                </pre>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer activity-detail-footer">
          <span className="modal-security-note">
            <Icon name="shield" size={13} /> This audit record is immutable and cryptographically bound to the CivicLink municipal ledger.
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
