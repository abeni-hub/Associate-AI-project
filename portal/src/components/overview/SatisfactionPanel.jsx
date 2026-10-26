import Icon from '../ui/Icon.jsx'

function SatisfactionPanel({ onNavigate }) {
  return <article className="panel satisfaction-panel"><div className="panel-heading"><div><span className="panel-eyebrow">CITIZEN SENTIMENT</span><h2>Service satisfaction</h2></div><span className="subtle-icon"><Icon name="spark" size={17} /></span></div><div className="satisfaction-score"><strong>4.6</strong><span className="score-out-of">/ 5</span><span className="score-stars">★★★★★</span></div><p className="satisfaction-copy">Average citizen rating from the last 30 days</p><div className="rating-bars">{[['5', 68], ['4', 19], ['3', 8], ['2', 3], ['1', 2]].map(([n, width]) => <div className="rating-row" key={n}><span>{n} <i>★</i></span><div className="rating-track"><i style={{ width: `${width}%` }} /></div><small>{width}%</small></div>)}</div><button className="panel-link" onClick={() => onNavigate('feedback')}>Explore citizen feedback <Icon name="arrow" size={15} /></button></article>
}

export default SatisfactionPanel
