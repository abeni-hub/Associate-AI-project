import Icon from '../components/ui/Icon.jsx'
import PageHeading from '../components/ui/PageHeading.jsx'
import SearchBox from '../components/ui/SearchBox.jsx'
import StatusPill from '../components/ui/StatusPill.jsx'

function RoutesPage({ items, onEdit, search, setSearch }) {
  const filtered = items.filter((item) => `${item.service} ${item.category} ${item.status}`.toLowerCase().includes(search.toLowerCase()))

  return <>
    <PageHeading
      eyebrow="BUREAU OPERATIONS"
      title="Room routes"
      subtitle="Give citizens a clear path through your office, one room at a time."
      secondary="Preview public guide"
      onSecondary={() => window.alert('Public guide preview is available when a citizen-facing site is connected.')}
    />
    <div className="route-summary">
      <div>
        <span className="summary-icon"><Icon name="route" /></span>
        <span><b>{items.length} service routes</b><small>Configured for Revenues Bureau</small></span>
      </div>
      <span className="summary-divider" />
      <div>
        <span className="route-progress-big">75%</span>
        <span><b>Route readiness</b><small>6 of 8 service guides are published</small></span>
      </div>
      <span className="summary-note"><i /> Citizens can see published routes</span>
    </div>
    <div className="route-toolbar">
      <div>
        <h2>Your service routes</h2>
        <p>Room locations can be updated whenever your office layout changes.</p>
      </div>
      <SearchBox value={search} onChange={setSearch} placeholder="Search routes" />
    </div>
    <div className="route-grid">
      {filtered.map((item) => <article className="panel route-card" key={item.id}>
        <div className="route-card-header">
          <span className="route-card-icon"><Icon name="route" size={18} /></span>
          <StatusPill>{item.status}</StatusPill>
          <button className="row-more" aria-label="Route actions"><Icon name="dots" /></button>
        </div>
        <span className="service-category">{item.category}</span>
        <h3>{item.service}</h3>
        <p className="route-card-office">{item.bureau} <span>·</span> Updated {item.updated}</p>
        <div className="mini-route">
          {item.steps.map((step, index) => <div className="mini-route-step" key={`${item.id}-${step.room}`}>
            <span className="mini-route-room">{step.room}</span>
            <span className="mini-route-copy"><b>{step.title}</b><small>{step.detail}</small></span>
            {index < item.steps.length - 1 && <i className="mini-route-line" />}
          </div>)}
        </div>
        <button className="route-edit-button" onClick={() => onEdit(item)}>
          {item.status === 'Draft' ? 'Finish this route' : 'Edit room sequence'} <Icon name="arrow" size={15} />
        </button>
      </article>)}
      {!filtered.length && <div className="panel empty-state"><b>No room routes found</b><p>Try another search.</p></div>}
    </div>
    <div className="tip-banner">
      <span className="tip-icon"><Icon name="globe" size={17} /></span>
      <span>
        <b>Publishing keeps the citizen guide current</b>
        <small>Review room numbers and directions after any change to your office layout.</small>
      </span>
    </div>
  </>
}

export default RoutesPage
