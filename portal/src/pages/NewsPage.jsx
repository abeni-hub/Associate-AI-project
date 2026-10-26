import { useState } from 'react'
import Icon from '../components/ui/Icon.jsx'
import PageHeading from '../components/ui/PageHeading.jsx'
import SearchBox from '../components/ui/SearchBox.jsx'
import StatusPill from '../components/ui/StatusPill.jsx'

function NewsPage({ items, onAdd, search, setSearch, onTogglePublish }) {
  const [typeFilter, setTypeFilter] = useState('All types')
  const filtered = items.filter((item) => (typeFilter === 'All types' || item.type === typeFilter) && `${item.title} ${item.type} ${item.audience} ${item.excerpt}`.toLowerCase().includes(search.toLowerCase()))

  return <>
    <PageHeading
      eyebrow="PUBLIC INFORMATION"
      title="News & events"
      subtitle="Keep residents informed with timely updates from Lemi Kura Sub-city."
      action="Create an update"
      onAction={onAdd}
    />
    <div className="news-feature">
      <div className="news-feature-content">
        <span className="news-feature-kicker"><Icon name="news" size={15} /> SUB-CITY NOTICEBOARD</span>
        <h2>Good information<br /><em>brings us closer.</em></h2>
        <p>Your updates appear on the public citizen landing page. Review content before publishing so residents always have clear, current information.</p>
        <div className="news-feature-stats">
          <span><b>{items.length + 12}</b><small>updates this year</small></span>
          <span><b>94%</b><small>published on time</small></span>
        </div>
      </div>
      <div className="news-feature-art">
        <span className="art-sun" />
        <span className="art-hill hill-back" />
        <span className="art-hill hill-front" />
        <span className="art-building"><i /><i /><i /><i /><b /></span>
        <span className="art-caption">LEMI KURA · COMMUNITY</span>
      </div>
    </div>
    <section className="panel table-panel news-list-panel">
      <div className="table-toolbar">
        <div>
          <h2>Published updates & drafts</h2>
          <p>Manage community news and upcoming public events.</p>
        </div>
        <div className="toolbar-tools">
          <SearchBox value={search} onChange={setSearch} placeholder="Search updates" />
          <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Filter news by type">
            <option>All types</option>
            <option>News</option>
            <option>Event</option>
          </select>
        </div>
      </div>
      <div className="news-list">
        {filtered.map((item) => <article className="news-row" key={item.id}>
          <span className={`news-type-icon ${item.type.toLowerCase()}`}>
            <Icon name={item.type === 'Event' ? 'calendar' : 'news'} size={18} />
          </span>
          <div className="news-row-copy">
            <div>
              <span className="service-category">{item.type}</span>
              <span className="news-row-date">{item.date}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.excerpt}</p>
            <small>Audience: {item.audience}</small>
          </div>
          <div className="news-row-actions">
            <StatusPill>{item.status}</StatusPill>
            <button className="button secondary small-button" onClick={() => onTogglePublish(item.id)}>
              {item.status === 'Published' ? 'Unpublish' : 'Publish'}
            </button>
            <button className="row-more" aria-label={`More actions for ${item.title}`}>
              <Icon name="dots" />
            </button>
          </div>
        </article>)}
        {!filtered.length && <div className="empty-state"><b>No updates found</b><p>Try another search.</p></div>}
      </div>
      <div className="table-footer">
        <span>Showing <b>{filtered.length}</b> updates</span>
        <div>
          <button disabled>Previous</button>
          <button>Next <Icon name="arrow" size={13} /></button>
        </div>
      </div>
    </section>
  </>
}

export default NewsPage
