import { useState } from 'react'
import Icon from '../components/ui/Icon.jsx'
import PageHeading from '../components/ui/PageHeading.jsx'
import MetricCard from '../components/ui/MetricCard.jsx'
import SearchBox from '../components/ui/SearchBox.jsx'
import StatusPill from '../components/ui/StatusPill.jsx'

function AccountsPage({ items, onAdd, onEdit, search, setSearch }) {
  const [roleFilter, setRoleFilter] = useState('All roles')
  const filtered = items.filter((item) => (roleFilter === 'All roles' || item.role === roleFilter) && `${item.name} ${item.username} ${item.role} ${item.organization}`.toLowerCase().includes(search.toLowerCase()))

  return <>
    <PageHeading
      eyebrow="ACCESS & PERMISSIONS"
      title="Accounts"
      subtitle="Manage administrator access across every connected organization."
      action="Create account"
      onAction={onAdd}
      secondary="Export list"
      onSecondary={() => window.alert('Account list export is ready in this preview.')}
    />
    <div className="metric-grid compact-metrics">
      <MetricCard icon="users" label="Total accounts" value={items.length + 84} note="Across all workspaces" tone="teal" />
      <MetricCard icon="check" label="Active accounts" value={items.length + 81} note="Access confirmed" tone="sage" />
      <MetricCard icon="clock" label="Invitations pending" value="3" note="Awaiting first sign-in" tone="gold" />
      <MetricCard icon="shield" label="Access reviews" value="Due soon" note="3 reviews this month" tone="blue" />
    </div>
    <section className="panel table-panel">
      <div className="table-toolbar">
        <div>
          <h2>Administrator accounts</h2>
          <p>Role and organization determine what each admin can see and manage.</p>
        </div>
        <div className="toolbar-tools">
          <SearchBox value={search} onChange={setSearch} placeholder="Search accounts" />
          <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filter by admin role">
            <option>All roles</option>
            <option>Sub-city admin</option>
            <option>Bureau admin</option>
          </select>
        </div>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>ACCOUNT</th>
              <th>ROLE</th>
              <th>ORGANIZATION</th>
              <th>STATUS</th>
              <th>LAST ACTIVE</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => <tr key={item.id}>
              <td>
                <span className="table-person">
                  <span className="mini-avatar">{item.name.split(' ').map((n) => n[0]).join('')}</span>
                  <span><b>{item.name}</b><small>@{item.username}</small></span>
                </span>
              </td>
              <td><span className="role-tag">{item.role}</span></td>
              <td>{item.organization}</td>
              <td><StatusPill>{item.status}</StatusPill></td>
              <td className="time-cell">{item.lastActive}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                  <button type="button" className="button secondary small-button" onClick={() => onEdit?.(item)}>
                    Edit
                  </button>
                  <button type="button" className="row-more" aria-label={`Account options for ${item.name}`}><Icon name="dots" /></button>
                </div>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>Showing <b>{filtered.length}</b> accounts</span>
        <div>
          <button disabled>Previous</button>
          <button>Next <Icon name="arrow" size={13} /></button>
        </div>
      </div>
    </section>
    <div className="tip-banner">
      <span className="tip-icon"><Icon name="lock" size={17} /></span>
      <span>
        <b>Temporary credentials should be shared securely</b>
        <small>Ask new admins to change their password the first time they sign in.</small>
      </span>
    </div>
  </>
}

export default AccountsPage
