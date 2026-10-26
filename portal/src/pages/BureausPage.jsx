import Icon from '../components/ui/Icon.jsx'
import PageHeading from '../components/ui/PageHeading.jsx'
import MetricCard from '../components/ui/MetricCard.jsx'
import SearchBox from '../components/ui/SearchBox.jsx'
import StatusPill from '../components/ui/StatusPill.jsx'

function BureausPage({ items, onAdd, search, setSearch }) {
  const filtered = items.filter((item) => `${item.name} ${item.category} ${item.admin} ${item.status}`.toLowerCase().includes(search.toLowerCase()))

  return <>
    <PageHeading
      eyebrow="LEMI KURA · ORGANIZATION"
      title="Bureaus"
      subtitle="Manage bureau teams and track the information citizens can see."
      action="Add a bureau"
      onAction={onAdd}
    />
    <div className="metric-grid compact-metrics">
      <MetricCard icon="building" label="Registered bureaus" value={items.length} note="In this sub-city" tone="teal" />
      <MetricCard icon="check" label="Public guides" value="28" note="Visible to citizens" tone="sage" />
      <MetricCard icon="clock" label="Needs attention" value="2" note="Room guides incomplete" tone="gold" />
      <MetricCard icon="message" label="Feedback this month" value="284" note="Across all bureaus" tone="blue" />
    </div>
    <section className="panel table-panel">
      <div className="table-toolbar">
        <div>
          <h2>Bureau directory</h2>
          <p>Service readiness across the Lemi Kura administration.</p>
        </div>
        <div className="toolbar-tools">
          <SearchBox value={search} onChange={setSearch} placeholder="Find a bureau" />
          <button className="button secondary small-button"><Icon name="filter" size={16} /> Filters</button>
        </div>
      </div>
      <div className="table-scroll">
        <table className="data-table bureau-table">
          <thead>
            <tr>
              <th>BUREAU / OFFICE</th>
              <th>ADMINISTRATOR</th>
              <th>SERVICES</th>
              <th>GUIDE COMPLETION</th>
              <th>STATUS</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => <tr key={item.id}>
              <td>
                <div className="entity-cell">
                  <span className="entity-icon"><Icon name="building" size={17} /></span>
                  <span><b>{item.name}</b><small>{item.category}</small></span>
                </div>
              </td>
              <td>
                <span className="table-person">
                  <span className="mini-avatar">{item.admin.split(' ').map((n) => n[0]).join('')}</span>
                  {item.admin}
                </span>
              </td>
              <td>{item.services} guides</td>
              <td>
                <div className="progress-cell">
                  <span className="progress-track"><i style={{ width: `${item.completion}%` }} /></span>
                  <small>{item.completion}%</small>
                </div>
              </td>
              <td><StatusPill>{item.status}</StatusPill></td>
              <td>
                <button className="row-more" aria-label={`Options for ${item.name}`}><Icon name="dots" /></button>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>Showing <b>{filtered.length}</b> of <b>{items.length}</b> bureaus</span>
        <div>
          <button disabled>Previous</button>
          <button>Next <Icon name="arrow" size={13} /></button>
        </div>
      </div>
    </section>
    <div className="tip-banner">
      <span className="tip-icon"><Icon name="users" size={17} /></span>
      <span>
        <b>New bureau?</b>
        <small>Create a bureau and assign its administrator. The bureau team can then set room-by-room steps for shared services.</small>
      </span>
    </div>
  </>
}

export default BureausPage
