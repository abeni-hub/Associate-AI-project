import Icon from '../components/ui/Icon.jsx'
import PageHeading from '../components/ui/PageHeading.jsx'
import SearchBox from '../components/ui/SearchBox.jsx'
import StatusPill from '../components/ui/StatusPill.jsx'

function SubcitiesPage({ items, onAdd, search, setSearch }) {
  const filtered = items.filter((item) => `${item.name} ${item.admin} ${item.status}`.toLowerCase().includes(search.toLowerCase()))

  return <>
    <PageHeading
      eyebrow="PLATFORM DIRECTORY"
      title="Sub-cities"
      subtitle="Create and oversee the local administrations connected to CivicLink."
      action="Add sub-city"
      onAction={onAdd}
    />
    <div className="directory-overview">
      <div className="directory-stat">
        <span className="directory-stat-icon"><Icon name="map" /></span>
        <span><b>{items.length}</b><small>Connected sub-cities</small></span>
      </div>
      <div className="directory-stat">
        <span className="directory-stat-icon sage"><Icon name="building" /></span>
        <span><b>86</b><small>Registered bureaus</small></span>
      </div>
      <div className="directory-stat">
        <span className="directory-stat-icon gold"><Icon name="users" /></span>
        <span><b>10 / 11</b><small>Admins activated</small></span>
      </div>
      <div className="directory-stat directory-note">
        <span className="online-indicator" />
        <span><b>Platform is running smoothly</b><small>All services operational</small></span>
      </div>
    </div>
    <section className="panel table-panel">
      <div className="table-toolbar">
        <div>
          <h2>Sub-city directory</h2>
          <p>Manage local administrators and monitor setup progress.</p>
        </div>
        <div className="toolbar-tools">
          <SearchBox value={search} onChange={setSearch} placeholder="Search sub-cities" />
          <button className="button secondary small-button"><Icon name="filter" size={16} /> Filters</button>
        </div>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>SUB-CITY</th>
              <th>SUB-CITY ADMIN</th>
              <th>BUREAUS</th>
              <th>SERVICES</th>
              <th>STATUS</th>
              <th>LAST UPDATED</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => <tr key={item.id}>
              <td>
                <div className="entity-cell">
                  <span className="entity-icon"><Icon name="map" size={17} /></span>
                  <b>{item.name}</b>
                </div>
              </td>
              <td>
                <span className="table-person">
                  <span className="mini-avatar">{item.admin.split(' ').map((n) => n[0]).join('')}</span>
                  {item.admin}
                </span>
              </td>
              <td>{item.bureaus}</td>
              <td>{item.services}</td>
              <td><StatusPill>{item.status}</StatusPill></td>
              <td className="time-cell">{item.updated}</td>
              <td>
                <button className="row-more" aria-label={`Manage ${item.name}`}><Icon name="dots" /></button>
              </td>
            </tr>)}
          </tbody>
        </table>
        {!filtered.length && <div className="empty-state"><b>No sub-cities match</b><p>Try another search.</p></div>}
      </div>
      <div className="table-footer">
        <span>Showing <b>{filtered.length}</b> of <b>{items.length}</b> sub-cities</span>
        <div>
          <button disabled>Previous</button>
          <button>Next <Icon name="arrow" size={13} /></button>
        </div>
      </div>
    </section>
    <div className="tip-banner">
      <span className="tip-icon"><Icon name="shield" size={17} /></span>
      <span>
        <b>Access stays in the right hands</b>
        <small>Sub-city admins can manage only the bureaus, services and feedback in their own organization.</small>
      </span>
      <Icon name="arrow" size={15} />
    </div>
  </>
}

export default SubcitiesPage
