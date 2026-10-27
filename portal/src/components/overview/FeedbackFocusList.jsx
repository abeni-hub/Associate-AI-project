import Icon from '../ui/Icon.jsx'
import TypePill from '../ui/TypePill.jsx'

function FeedbackFocusList({ items, onFeedback, onNavigate }) {
  return <article className="panel recent-panel feedback-focus-panel">
    <div className="panel-heading">
      <div>
        <span className="panel-eyebrow">TEAM INBOX</span>
        <h2>Feedback needing attention</h2>
        <p className="feedback-focus-intro">Open items prioritized for your team.</p>
      </div>
      {onNavigate && <button className="panel-link" onClick={() => onNavigate('feedback')}>View feedback inbox <Icon name="arrow" size={15} /></button>}
    </div>
    <div className="focus-list">
      {items.map((item) => <button key={item.id} className="focus-item" onClick={() => onFeedback(item)} aria-label={`Open ${item.id}, ${item.type}, ${item.priority} priority`}>
        <span className={`focus-type ${item.type.toLowerCase()}`}><Icon name={item.type === 'Complaint' ? 'alertTriangle' : item.type === 'Satisfaction' ? 'spark' : 'message'} size={15} /></span>
        <span className="focus-copy">
          <span className="focus-topline"><b>{item.id}</b><TypePill type={item.type} /></span>
          <p>{item.message}</p>
          <span className="focus-meta"><span><Icon name="building" size={13} />{item.bureau}</span><span><Icon name="clock" size={13} />{item.time}</span></span>
        </span>
        <span className={`priority-tag ${item.priority.toLowerCase()}`}>{item.priority}</span>
      </button>)}
      {items.length === 0 && <div className="quiet-state"><Icon name="check" />You’re all caught up.</div>}
    </div>
  </article>
}

export default FeedbackFocusList
