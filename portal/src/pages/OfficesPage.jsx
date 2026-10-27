import { useState } from 'react'
import Icon from '../components/ui/Icon.jsx'
import PageHeading from '../components/ui/PageHeading.jsx'
import SearchBox from '../components/ui/SearchBox.jsx'
import StatusPill from '../components/ui/StatusPill.jsx'
import MetricCard from '../components/ui/MetricCard.jsx'

function OfficesPage({ offices, officeTypes, role, onAddOffice, onEditOffice, search, setSearch }) {
  const [selectedTypeId, setSelectedTypeId] = useState('all')

  // Scope filter: if subcity admin, show only their sub-city and child offices
  const scopedOffices = role === 'subcity'
    ? offices.filter((o) => o.name === 'Lemi Kura' || o.parentId === 1)
    : offices

  const filtered = scopedOffices.filter((item) => {
    const parentOffice = offices.find((p) => p.id === item.parentId)
    const type = officeTypes.find((t) => t.id === item.typeId)
    const matchesType = selectedTypeId === 'all' || item.typeId === Number(selectedTypeId)
    const query = `${item.name} ${item.admin} ${item.status} ${type?.name || ''} ${parentOffice?.name || ''}`.toLowerCase()
    return matchesType && query.includes(search.toLowerCase())
  })

  const subcityCount = scopedOffices.filter((o) => o.typeId === 1).length
  const bureauCount = scopedOffices.filter((o) => o.typeId === 2).length
  const avgCompletion = scopedOffices.length
    ? Math.round(scopedOffices.reduce((acc, curr) => acc + (curr.completion || 0), 0) / scopedOffices.length)
    : 0

  const handleOpenAdd = () => onAddOffice()
  const handleOpenEdit = (office) => onEditOffice(office)

  return <>
    <PageHeading
      eyebrow="PUBLIC ADMINISTRATION DIRECTORY"
      title={role === 'subcity' ? 'Bureaus & local offices' : 'Offices & administrative tree'}
      subtitle="Manage sub-cities, bureaus, and municipal branches connected to the platform."
      action="Add office"
      onAction={handleOpenAdd}
      secondary="Export directory"
      onSecondary={() => window.alert('Office directory report generated.')}
    />

    <div className="metric-grid compact-metrics">
      <MetricCard
        icon="sitemap"
        label="Total offices"
        value={scopedOffices.length}
        note="Across all administrative levels"
        tone="teal"
      />
      <MetricCard
        icon="map"
        label="Sub-cities"
        value={subcityCount}
        note="Chartered administrations"
        tone="sage"
      />
      <MetricCard
        icon="building"
        label="Sector bureaus"
        value={bureauCount}
        note="Specialized public offices"
        tone="gold"
      />
      <MetricCard
        icon="check"
        label="Average readiness"
        value={`${avgCompletion}%`}
        note="Service guides completed"
        tone="blue"
      />
    </div>

    <section className="panel table-panel">
      <div className="table-toolbar">
        <div>
          <h2>Government offices directory</h2>
          <p>Hierarchical relationships dictate access and citizen service routing.</p>
        </div>
        <div className="toolbar-tools">
          <SearchBox value={search} onChange={setSearch} placeholder="Search offices, bureaus, admins..." />
        </div>
      </div>

      <div className="filter-chips-bar" style={{ padding: '0.75rem 1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          type="button"
          className={`chip-button${selectedTypeId === 'all' ? ' active' : ''}`}
          onClick={() => setSelectedTypeId('all')}
        >
          All classifications <span>{scopedOffices.length}</span>
        </button>
        {officeTypes.map((type) => {
          const count = scopedOffices.filter((o) => o.typeId === type.id).length
          return (
            <button
              key={type.id}
              type="button"
              className={`chip-button${selectedTypeId === String(type.id) ? ' active' : ''}`}
              onClick={() => setSelectedTypeId(String(type.id))}
            >
              {type.name} <span>{count}</span>
            </button>
          )
        })}
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>OFFICE / JURISDICTION</th>
              <th>CLASSIFICATION</th>
              <th>ADMINISTRATOR</th>
              <th>SERVICES</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const type = officeTypes.find((t) => t.id === item.typeId)
              const parentOffice = offices.find((p) => p.id === item.parentId)

              return (
                <tr key={item.id}>
                  <td>
                    <div className="entity-cell">
                      <span className="entity-icon">
                        <Icon name={item.typeId === 1 ? 'map' : item.typeId === 2 ? 'building' : 'sitemap'} size={17} />
                      </span>
                      <div>
                        <b>{item.name}</b>
                        {parentOffice && (
                          <span className="lineage-badge" style={{ display: 'block', fontSize: '0.72rem', color: 'var(--teal-soft)', marginTop: '2px' }}>
                            ↳ Belongs to {parentOffice.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="role-tag" style={{ background: 'rgba(54, 123, 125, 0.12)', color: 'var(--teal-soft)' }}>
                      {type?.name || 'Office'}
                    </span>
                  </td>
                  <td>
                    <span className="table-person">
                      <span className="mini-avatar">{item.admin.split(' ').map((n) => n[0]).join('')}</span>
                      <span>{item.admin}</span>
                    </span>
                  </td>
                  <td><b>{item.services}</b> guides</td>
                  <td>
                    <StatusPill>{item.status}</StatusPill>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="button secondary small-button"
                      onClick={() => handleOpenEdit(item)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {!filtered.length && (
          <div className="empty-state">
            <span className="empty-icon"><Icon name="sitemap" size={22} /></span>
            <b>No offices found</b>
            <p>Try selecting another office type or adjusting your search terms.</p>
          </div>
        )}
      </div>

      <div className="table-footer">
        <span>Showing <b>{filtered.length}</b> of <b>{scopedOffices.length}</b> registered offices</span>
        <div>
          <button disabled>Previous</button>
          <button>Next <Icon name="arrow" size={13} /></button>
        </div>
      </div>
    </section>

    <div className="tip-banner">
      <span className="tip-icon"><Icon name="shield" size={17} /></span>
      <span>
        <b>Hierarchical authorization applies automatically</b>
        <small>Admins assigned to a parent office can oversee and coordinate the service guides of all child bureaus.</small>
      </span>
    </div>
  </>
}

export default OfficesPage
