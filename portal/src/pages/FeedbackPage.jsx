import Icon from '../components/ui/Icon.jsx'
import PageHeading from '../components/ui/PageHeading.jsx'
import MetricCard from '../components/ui/MetricCard.jsx'
import SearchBox from '../components/ui/SearchBox.jsx'
import FeedbackTable from '../components/feedback/FeedbackTable.jsx'

function FeedbackPage({ items, onOpen, search, setSearch, typeFilter, setTypeFilter, statusFilter, setStatusFilter }) {
  const filtered = items.filter((item) => (typeFilter === 'All types' || item.type === typeFilter) && (statusFilter === 'All statuses' || item.status === statusFilter) && `${item.id} ${item.message} ${item.service} ${item.bureau} ${item.subcity}`.toLowerCase().includes(search.toLowerCase()))

  return <>
    <PageHeading
      eyebrow="CITIZEN VOICE"
      title="Feedback inbox"
      subtitle="Read what citizens are saying and follow each item through to resolution."
      secondary="Export feedback"
      onSecondary={() => window.alert('Feedback export is ready in this preview.')}
    />
    <div className="metric-grid compact-metrics">
      <MetricCard icon="message" label="All responses" value={items.length + 48} note="This month" tone="teal" />
      <MetricCard icon="clock" label="Open" value={items.filter((x) => x.status === 'Open').length + 14} note="Waiting for a first response" tone="gold" />
      <MetricCard icon="activity" label="In review" value={items.filter((x) => x.status === 'In review').length + 7} note="Being followed up" tone="blue" />
      <MetricCard icon="check" label="Resolved" value="82%" note="Closed this month" tone="sage" />
    </div>
    <section className="panel table-panel feedback-inbox">
      <div className="table-toolbar">
        <div>
          <h2>All citizen responses</h2>
          <p>Feedback is routed to the relevant bureau and sub-city teams.</p>
        </div>
        <div className="toolbar-tools">
          <SearchBox value={search} onChange={setSearch} placeholder="Search feedback" />
          <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option>All types</option>
            <option>Complaint</option>
            <option>Suggestion</option>
            <option>Satisfaction</option>
          </select>
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All statuses</option>
            <option>Open</option>
            <option>In review</option>
            <option>Resolved</option>
          </select>
        </div>
      </div>
      <FeedbackTable items={filtered} onOpen={onOpen} />
      <div className="table-footer">
        <span>Showing <b>{filtered.length}</b> responses</span>
        <div>
          <button disabled>Previous</button>
          <button>Next <Icon name="arrow" size={13} /></button>
        </div>
      </div>
    </section>
    <div className="tip-banner">
      <span className="tip-icon"><Icon name="shield" size={17} /></span>
      <span>
        <b>Respectful follow-up builds trust</b>
        <small>Share feedback only with the administrators responsible for its sub-city and bureau.</small>
      </span>
    </div>
  </>
}

export default FeedbackPage
