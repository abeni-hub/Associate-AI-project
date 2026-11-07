import Icon from '../ui/Icon.jsx'
import TypePill from '../ui/TypePill.jsx'
import StatusPill from '../ui/StatusPill.jsx'

function FeedbackTable({ items, onOpen, compact = false }) {
  return <div className="table-scroll"><table className="data-table feedback-table"><thead><tr><th>Feedback</th><th>Service & office</th><th>Received</th><th>Status</th><th aria-label="Actions" /></tr></thead><tbody>{items.slice(0, compact ? 4 : undefined).map((item) => <tr key={item.id} onClick={() => onOpen(item)} className="clickable-row"><td><div className="feedback-id"><span><b>{item.id}</b><small>{item.trackingNumber}</small></span><TypePill type={item.type} /></div><p>{item.message}</p></td><td><b>{item.service}</b><small>{item.bureau} · {item.subcity}</small></td><td className="time-cell">{item.time}</td><td><StatusPill>{item.status}</StatusPill></td><td><button className="row-more" aria-label={`Open ${item.id}`} onClick={(e) => { e.stopPropagation(); onOpen(item) }}><Icon name="arrow" size={16} /></button></td></tr>)}</tbody></table>{items.length === 0 && <div className="empty-state"><span className="empty-icon"><Icon name="message" size={22} /></span><b>No feedback found</b><p>Try changing your filters or search terms.</p></div>}</div>
}

export default FeedbackTable
