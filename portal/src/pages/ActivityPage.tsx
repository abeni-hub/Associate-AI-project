import React, { useState, useMemo } from 'react';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import { MetricCard } from '../components/shared/MetricCard';
import ActivityDetailsModal from '../components/activity/ActivityDetailsModal.jsx';
import { INITIAL_ACTIVITIES } from '../data/portalData.js';

export const ActivityPage: React.FC = () => {
  const [activities] = useState<any[]>(INITIAL_ACTIVITIES || []);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [actionTypeFilter, setActionTypeFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [downloadNotice, setDownloadNotice] = useState(false);

  // Categories with counts
  const categories = [
    { id: 'all', label: 'All activity', count: activities.length },
    { id: 'Services', label: 'Service standards', count: activities.filter((a) => a.category === 'Services').length },
    { id: 'Citizen voice', label: 'Citizen voice', count: activities.filter((a) => a.category === 'Citizen voice').length },
    { id: 'Security & access', label: 'Security & access', count: activities.filter((a) => a.category === 'Security & access').length },
    { id: 'CMS & Landing', label: 'CMS & landing', count: activities.filter((a) => a.category === 'CMS & Landing').length },
    { id: 'Offices', label: 'Offices & bureaus', count: activities.filter((a) => a.category === 'Offices').length },
    { id: 'Roles & access', label: 'Roles & permissions', count: activities.filter((a) => a.category === 'Roles & access').length },
  ];

  // Filtered list
  const filteredActivities = useMemo(() => {
    return activities.filter((item) => {
      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }

      // Action type filter
      if (actionTypeFilter !== 'all' && item.actionType !== actionTypeFilter) {
        return false;
      }

      // Search filter across all rich fields
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesActor =
          item.actor?.name?.toLowerCase().includes(q) ||
          item.actor?.username?.toLowerCase().includes(q);
        const matchesAction =
          item.actionLabel?.toLowerCase().includes(q) ||
          item.actionType?.toLowerCase().includes(q);
        const matchesTarget =
          item.target?.name?.toLowerCase().includes(q) ||
          item.target?.jurisdiction?.toLowerCase().includes(q) ||
          item.target?.id?.toLowerCase().includes(q);
        const matchesChange =
          item.change?.field?.toLowerCase().includes(q) ||
          item.change?.from?.toLowerCase().includes(q) ||
          item.change?.to?.toLowerCase().includes(q) ||
          item.change?.summary?.toLowerCase().includes(q);
        const matchesNetwork =
          item.network?.ip?.includes(q) ||
          item.network?.location?.toLowerCase().includes(q);
        const matchesId = item.id?.toLowerCase().includes(q);

        return (
          matchesActor ||
          matchesAction ||
          matchesTarget ||
          matchesChange ||
          matchesNetwork ||
          matchesId
        );
      }

      return true;
    });
  }, [activities, categoryFilter, actionTypeFilter, search]);

  // CSV Export handler
  const handleExportCsv = () => {
    const headers = [
      'Event ID',
      'Timestamp',
      'Actor Name',
      'Actor Role',
      'Action',
      'Category',
      'Target Name',
      'Target Jurisdiction',
      'Changed Field',
      'Value Before',
      'Value After',
      'IP Address',
      'Channel',
    ];
    const rows = filteredActivities.map((a) => [
      a.id,
      `"${a.fullTimestamp}"`,
      `"${a.actor?.name} (${a.actor?.username})"`,
      `"${a.actor?.role}"`,
      `"${a.actionType} - ${a.actionLabel}"`,
      `"${a.category}"`,
      `"${a.target?.name}"`,
      `"${a.target?.jurisdiction}"`,
      `"${a.change?.field || 'N/A'}"`,
      `"${(a.change?.from || '').replace(/"/g, '""')}"`,
      `"${(a.change?.to || '').replace(/"/g, '""')}"`,
      `"${a.network?.ip}"`,
      `"${a.network?.channel}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `civiclink_activity_log_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 3500);
  };

  const actionToneMap: Record<string, string> = {
    UPDATE: 'amber',
    CREATE: 'green',
    PUBLISH: 'teal',
    SECURITY: 'purple',
    STATUS: 'blue',
    DELETE: 'red',
  };

  const actionIconMap: Record<string, string> = {
    UPDATE: 'edit',
    CREATE: 'plus',
    PUBLISH: 'spark',
    SECURITY: 'shield',
    STATUS: 'arrow',
    DELETE: 'close',
  };

  return (
    <>
      <PageHeading
        eyebrow="AUDIT TRAIL & SYSTEM COMPLIANCE"
        title="Activity & audit log"
        subtitle="Cryptographically verified record of system actions, state changes from what to what, and administrative access across all sub-cities."
        secondary="Export CSV audit"
        onSecondary={handleExportCsv}
      />

      {downloadNotice && (
        <div className="tip-banner" style={{ marginBottom: 16 }}>
          <Icon name="checkCircle" size={18} />
          <div>
            <b>Audit log CSV exported successfully</b>
            <small>
              Downloaded signed activity log with complete before/after transitions and IP origin stamps.
            </small>
          </div>
        </div>
      )}

      {/* Metric Summary Cards */}
      <section className="metric-grid" aria-label="Activity statistics">
        <MetricCard
          icon="activity"
          label="Logged system actions"
          value="1,428"
          note="Across 11 sub-cities"
          tone="teal"
        />
        <MetricCard
          icon="edit"
          label="State & config changes"
          value={
            activities.filter(
              (a) => a.actionType === 'UPDATE' || a.actionType === 'STATUS'
            ).length
          }
          note="Tracked with before/after diffs"
          tone="gold"
        />
        <MetricCard
          icon="shield"
          label="Security & sign-ins"
          value={activities.filter((a) => a.actionType === 'SECURITY').length}
          note="Fayda SSO & 2FA verified"
          tone="sage"
        />
        <MetricCard
          icon="lock"
          label="Audit integrity"
          value="100%"
          note="Tamper-evident logs"
          tone="blue"
        />
      </section>

      {/* Main Table Panel */}
      <div className="panel activity-table-panel">
        {/* Table Toolbar */}
        <div className="table-toolbar">
          <div>
            <h2>Recorded audit entries</h2>
            <p>
              Showing {filteredActivities.length} events with full user action, state change diffs, and network metadata.
            </p>
          </div>

          <div className="toolbar-tools">
            <div className="search-box">
              <Icon name="search" size={15} />
              <input
                type="search"
                placeholder="Search user, action, change diff, or IP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <Icon name="close" size={13} />
                </button>
              )}
            </div>

            <select
              className="filter-select"
              value={actionTypeFilter}
              onChange={(e) => setActionTypeFilter(e.target.value)}
              aria-label="Filter by action type"
            >
              <option value="all">All action types</option>
              <option value="UPDATE">Updates & changes (UPDATE)</option>
              <option value="CREATE">New additions (CREATE)</option>
              <option value="PUBLISH">Publications (PUBLISH)</option>
              <option value="SECURITY">Security & access (SECURITY)</option>
              <option value="STATUS">Status transitions (STATUS)</option>
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="activity-filter-chips">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`chip-button${categoryFilter === cat.id ? ' active' : ''}`}
              onClick={() => setCategoryFilter(cat.id)}
            >
              {cat.label} <span>{cat.count}</span>
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className="table-scroll">
          <table className="data-table activity-rich-table">
            <thead>
              <tr>
                <th style={{ width: 140 }}>TIME & EVENT ID</th>
                <th style={{ width: 210 }}>USER (ACTOR)</th>
                <th style={{ width: 170 }}>USER ACTION</th>
                <th style={{ width: 220 }}>RESOURCE / TARGET</th>
                <th>WHAT CHANGED (FROM ➔ TO)</th>
                <th style={{ width: 170 }}>ORIGIN & IP</th>
                <th style={{ width: 90, textAlign: 'right' }}>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <Icon name="activity" size={32} />
                      <b>No matching activity records</b>
                      <p>Try clearing your search term or selecting a different filter.</p>
                      <button
                        type="button"
                        className="button secondary small-button"
                        onClick={() => {
                          setSearch('');
                          setCategoryFilter('all');
                          setActionTypeFilter('all');
                        }}
                      >
                        Reset all filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredActivities.map((event) => {
                  const tone = actionToneMap[event.actionType] || 'teal';
                  const icon = actionIconMap[event.actionType] || 'spark';

                  return (
                    <tr
                      key={event.id}
                      className="clickable-row"
                      onClick={() => setSelectedEvent(event)}
                    >
                      {/* Time & Event ID */}
                      <td className="activity-time-cell">
                        <span className="activity-id-badge">{event.id}</span>
                        <b>{event.timestamp}</b>
                      </td>

                      {/* Actor (User) */}
                      <td>
                        <div className="table-person activity-actor-person">
                          <span className={`mini-avatar ${event.actor?.tone || 'teal'}`}>
                            {event.actor?.initials}
                          </span>
                          <div>
                            <b>{event.actor?.name}</b>
                            <small>
                              {event.actor?.username} ·{' '}
                              <span className="role-subpill">{event.actor?.role}</span>
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* User Action */}
                      <td>
                        <div className="activity-action-column">
                          <span className={`activity-action-tag ${tone}`}>
                            <Icon name={icon} size={12} /> {event.actionType}
                          </span>
                          <span className="activity-action-title">{event.actionLabel}</span>
                        </div>
                      </td>

                      {/* Resource / Target */}
                      <td>
                        <div className="activity-target-column">
                          <b>{event.target?.name}</b>
                          <div className="activity-target-meta">
                            <span className="type-pill">{event.target?.type}</span>
                            <small>{event.target?.jurisdiction}</small>
                          </div>
                        </div>
                      </td>

                      {/* What Changed */}
                      <td className="activity-diff-cell">
                        {event.change?.isChange ? (
                          <div className="diff-container">
                            <div className="diff-field-name">
                              <Icon name="edit" size={11} /> {event.change.field}:
                            </div>
                            <div className="diff-flow">
                              <span className="diff-from" title={`Previous: ${event.change.from}`}>
                                <span className="diff-state-prefix">FROM:</span> {event.change.from}
                              </span>
                              <span className="diff-arrow" aria-hidden="true">➔</span>
                              <span className="diff-to" title={`New: ${event.change.to}`}>
                                <span className="diff-state-prefix">TO:</span> {event.change.to}
                              </span>
                            </div>
                            {event.change.summary && (
                              <p className="diff-summary-note">{event.change.summary}</p>
                            )}
                          </div>
                        ) : (
                          <span className="diff-static-note">
                            {event.change?.summary || 'Standard operation completed.'}
                          </span>
                        )}
                      </td>

                      {/* Origin & IP */}
                      <td>
                        <div className="activity-network-column">
                          <code>{event.network?.ip}</code>
                          <small>{event.network?.location}</small>
                          <span className="channel-tag">{event.network?.channel}</span>
                        </div>
                      </td>

                      {/* Details button */}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="button secondary small-button inspect-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                          title="Inspect full audit record"
                        >
                          <Icon name="eye" size={13} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="table-footer">
          <span>
            Showing <b>{filteredActivities.length}</b> of <b>{activities.length}</b> recorded audit logs
          </span>
          <div className="table-pagination">
            <button type="button" className="button secondary small-button" disabled>
              Previous
            </button>
            <button type="button" className="button secondary small-button" disabled>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Security compliance banner at bottom */}
      <div className="tip-banner" style={{ marginTop: 14 }}>
        <Icon name="shield" size={18} />
        <div>
          <b>Immutable Government Audit Compliance</b>
          <small>
            All administrator updates, service modifications, and access sessions are digitally signed and retained in compliance with Federal Government Digital Information Security Directives.
          </small>
        </div>
      </div>

      {/* Activity Details Modal */}
      {selectedEvent && (
        <ActivityDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  );
};

export default ActivityPage;
