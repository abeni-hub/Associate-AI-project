import { useState } from 'react'
import Icon from '../components/ui/Icon.jsx'
import PageHeading from '../components/ui/PageHeading.jsx'
import SearchBox from '../components/ui/SearchBox.jsx'
import StatusPill from '../components/ui/StatusPill.jsx'

function formatDate(value) {
  if (!value) return 'Date not set'
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-ET', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getSubCity(item) {
  return item.type === 'event' ? item.location?.subCity : item.subCity
}

function getPublishedStatus(item) {
  return item.isPublished === false ? 'Draft' : 'Published'
}

function NewsPage({ items, onAdd, onEdit, search, setSearch, onTogglePublish }) {
  const [typeFilter, setTypeFilter] = useState('all')
  const [publicationFilter, setPublicationFilter] = useState('all')
  const publishedCount = items.filter((item) => item.isPublished !== false).length
  const eventCount = items.filter((item) => item.type === 'event').length
  const filtered = items.filter((item) => {
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    const matchesPublication = publicationFilter === 'all' || (publicationFilter === 'published' ? item.isPublished !== false : item.isPublished === false)
    const searchable = [item.title, item.titleAm, item.type, item.summary, item.summaryAm, item.content, item.contentAm, item.category, item.categoryAm, item.bureau, item.bureauAm, getSubCity(item)]
      .filter(Boolean).join(' ').toLowerCase()
    return matchesType && matchesPublication && searchable.includes(search.toLowerCase())
  })

  return <>
    <PageHeading
      eyebrow="PUBLIC INFORMATION"
      title="News & events"
      subtitle="Manage the bilingual updates and public events shown to residents in the client app."
      action="Create an update"
      onAction={onAdd}
    />
    <section className="feed-overview" aria-labelledby="feed-overview-title">
      <div className="feed-overview-intro">
        <div className="feed-overview-heading">
          <span className="feed-overview-icon"><Icon name="news" size={19} /></span>
          <div>
            <span className={`feed-live-status${publishedCount ? ' is-live' : ' is-empty'}`}><i />{publishedCount ? 'Live in the client app' : 'Nothing published yet'}</span>
            <h2 id="feed-overview-title">Public feed overview</h2>
          </div>
        </div>
        <p>Keep titles, summaries, and full content clear in English and Amharic before publishing.</p>
      </div>
      <dl className="feed-overview-stats" aria-label="News and events totals">
        <div><dt>Total updates</dt><dd>{items.length}</dd></div>
        <div><dt>Published</dt><dd>{publishedCount}</dd></div>
        <div><dt>Events</dt><dd>{eventCount}</dd></div>
      </dl>
    </section>
    <section className="panel table-panel news-list-panel">
      <div className="table-toolbar">
        <div>
          <h2>News and event content</h2>
          <p>Search, edit, and control publication for client feed items.</p>
        </div>
        <div className="toolbar-tools">
          <SearchBox value={search} onChange={setSearch} placeholder="Search content, bureau, sub-city" />
          <select className="filter-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by content type">
            <option value="all">All types</option>
            <option value="news">News</option>
            <option value="event">Events</option>
          </select>
          <select className="filter-select" value={publicationFilter} onChange={(event) => setPublicationFilter(event.target.value)} aria-label="Filter by publication status">
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>
      <div className="news-list">
        {filtered.map((item) => {
          const isEvent = item.type === 'event'
          const subCity = getSubCity(item)
          const publishedStatus = getPublishedStatus(item)
          const date = isEvent ? item.eventDate : item.publishedAt
          return <article className="news-row" key={item.id}>
            <span className={`news-type-icon${isEvent ? ' event' : ''}`}>
              <Icon name={isEvent ? 'calendar' : 'news'} size={18} />
            </span>
            <div className="news-row-copy">
              <div>
                <span className="service-category">{isEvent ? 'Event' : 'News'}</span>
                <span className="news-row-date">{formatDate(date)}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <small>{[item.bureau, subCity, item.category].filter(Boolean).join(' · ')}</small>
            </div>
            <div className="news-row-actions">
              <StatusPill>{publishedStatus}</StatusPill>
              <button type="button" className="button secondary small-button" onClick={() => onEdit?.(item)}>Edit</button>
              <button type="button" className="button secondary small-button" onClick={() => onTogglePublish(item.id)}>
                {publishedStatus === 'Published' ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          </article>
        })}
        {!filtered.length && <div className="empty-state"><b>No updates found</b><p>Try another search or change the filters.</p></div>}
      </div>
      <div className="table-footer">
        <span>Showing <b>{filtered.length}</b> of <b>{items.length}</b> updates</span>
      </div>
    </section>
  </>
}

export default NewsPage
