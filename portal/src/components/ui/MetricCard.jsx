import Icon from './Icon.jsx'

function MetricCard({ icon, label, value, note, trend, tone = 'teal' }) {
  return <article className="metric-card"><div className="metric-top"><span className={`metric-icon ${tone}`}><Icon name={icon} size={18} /></span><span className="metric-menu"><Icon name="dots" size={17} /></span></div><div className="metric-value">{value}</div><div className="metric-label">{label}</div><div className="metric-foot"><span className={trend ? 'trend-up' : 'trend-neutral'}>{trend && <span>↗</span>} {note}</span></div></article>
}

export default MetricCard
