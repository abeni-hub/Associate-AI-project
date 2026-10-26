import Icon from '../ui/Icon.jsx'
import TypePill from '../ui/TypePill.jsx'

function FeedbackFocusList({ items, onFeedback, onNavigate }) {
  return <article className="panel recent-panel">
    <div className="panel-heading">
      <div>
        <span className="panel-eyebrow">VOICE OF THE COMMUNITY</span>
        <h2>Feedback needing attention</h2>
      </div>
      {onNavigate && <button className="panel-link" onClick={() => onNavigate('feedback')}>View all <Icon name="arrow" size={15} /></button>}
    </div>
    <div className="focus-list">
      {items.map((item) => <button key={item.id} className="focus-item" onClick={() => onFeedback(item)}>
        <span className={`focus-type ${item.type.toLowerCase()}`}>{item.type === 'Complaint' ? '!' : '↗'}</span>
        <span className="focus-copy">
          <span><b>{item.id}</b><TypePill type={item.type} /></span>
          <p>{item.message}</p>
          <small>{item.bureau} · {item.time}</small>
        </span>
        <span className={`priority-tag ${item.priority.toLowerCase()}`}>{item.priority}</span>
      </button>)}
      {items.length === 0 && <div className="quiet-state"><Icon name="check" />You’re all caught up.</div>}
    </div>
  </article>
}

export default FeedbackFocusList
