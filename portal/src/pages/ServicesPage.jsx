import { useState } from 'react'
import Icon from '../components/ui/Icon.jsx'
import PageHeading from '../components/ui/PageHeading.jsx'
import SearchBox from '../components/ui/SearchBox.jsx'
import StatusPill from '../components/ui/StatusPill.jsx'

function ServicesPage({ items, onAdd, onEdit, search, setSearch, onTogglePublish }) {
  const [serviceFilter, setServiceFilter] = useState('All services')
  const filtered = items.filter((item) => (serviceFilter === 'All services' || (serviceFilter === 'Published' ? item.published : !item.published)) && `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(search.toLowerCase()))

  return <>
    <PageHeading
      eyebrow="SERVICE INFORMATION"
      title="Service standards"
      subtitle="Set clear, consistent requirements and expectations for every bureau in your sub-city."
      action="Create a service"
      onAction={onAdd}
    />
    <div className="service-intro">
      <div className="service-intro-mark"><Icon name="layers" size={23} /></div>
      <div>
        <b>One shared standard, every local office</b>
        <p>These service definitions are shared with the bureaus below. Each bureau adds its own room numbers and step-by-step route.</p>
      </div>
      <span className="service-intro-count"><b>{items.length}</b><small>standards</small></span>
    </div>
    <div className="service-toolbar">
      <SearchBox value={search} onChange={setSearch} placeholder="Search service standards" />
      <div>
        {['All services', 'Published', 'Drafts'].map((filter) => <button
          key={filter}
          className={`chip-button${serviceFilter === filter ? ' active' : ''}`}
          onClick={() => setServiceFilter(filter)}
        >
          {filter} {filter === 'All services' && <span>{items.length}</span>}
        </button>)}
      </div>
    </div>
    <section className="service-list">
      {filtered.map((item) => <article className="panel service-card" key={item.id}>
        <div className="service-card-main">
          <span className="service-card-icon"><Icon name="layers" size={20} /></span>
          <div className="service-card-content">
            <div className="service-title-row">
              <span className="service-category">{item.category}</span>
              <span className="service-level-tag">{item.serviceType || 'Main service'}{item.parentService ? ` · ${item.parentService}` : ''}</span>
              <StatusPill>{item.published ? 'Published' : 'Draft'}</StatusPill>
            </div>
            <h2>{item.name}</h2>
            <p>{item.description}</p>
            <div className="service-meta">
              <span><Icon name="check" size={14} /> {item.documents.length} required documents</span>
              <span><Icon name="building" size={14} /> Shared with {item.bureaus} bureaus</span>
            </div>
            <div className="document-chips">
              {item.documents.slice(0, 3).map((document) => <span key={document}><Icon name="check" size={11} />{document}</span>)}
              {item.documents.length > 3 && <small>+{item.documents.length - 3} more</small>}
            </div>
          </div>
        </div>
        <div className="service-card-side">
          <button className="button secondary small-button" onClick={() => onEdit(item)}>Edit standard</button>
          <button
            className={`publish-toggle${item.published ? ' is-on' : ''}`}
            aria-label={item.published ? 'Unpublish service' : 'Publish service'}
            onClick={() => onTogglePublish(item.id)}
          >
            <i />
          </button>
        </div>
        <div className="service-expectation">
          <span>EXPECTATIONS</span>
          <div>
            <p><b>Citizen:</b> {item.customerExpectations}</p>
            <p><b>Bureau:</b> {item.bureauExpectations}</p>
          </div>
        </div>
      </article>)}
      {!filtered.length && <div className="panel empty-state"><b>No services found</b><p>Try another search or add a new standard.</p></div>}
    </section>
    <div className="tip-banner">
      <span className="tip-icon"><Icon name="route" size={17} /></span>
      <span>
        <b>Room numbers are managed by each bureau</b>
        <small>Once shared, bureau admins can define and publish their location-specific service route.</small>
      </span>
    </div>
  </>
}

export default ServicesPage
