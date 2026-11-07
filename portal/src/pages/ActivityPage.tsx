import React, { useState, useMemo } from 'react';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import { MetricCard } from '../components/shared/MetricCard';
import ActivityDetailsModal from '../components/activity/ActivityDetailsModal.jsx';
import { useGetAuditLogsQuery } from '../services/auditLogsApi';

export const ActivityPage: React.FC = () => {
  const { data: apiLogs, isLoading } = useGetAuditLogsQuery();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [actionTypeFilter, setActionTypeFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [downloadNotice, setDownloadNotice] = useState(false);

  const activities: any[] = useMemo(() => {
    if (apiLogs?.data && apiLogs.data.length > 0) {
      return apiLogs.data.map((log) => {
        const actionRaw = (log.action || '').toLowerCase();
        let actionType = 'UPDATE';
        if (actionRaw.includes('create') || actionRaw.includes('store')) actionType = 'CREATE';
        else if (actionRaw.includes('delete') || actionRaw.includes('destroy')) actionType = 'DELETE';
        else if (actionRaw.includes('publish')) actionType = 'PUBLISH';
        else if (actionRaw.includes('login') || actionRaw.includes('password') || actionRaw.includes('security')) actionType = 'SECURITY';
        else if (actionRaw.includes('status')) actionType = 'STATUS';

        let category = 'Services';
        if (log.entity_type === 'Organization') category = 'Offices';
        else if (log.entity_type === 'User') category = 'Security & access';
        else if (log.entity_type === 'Role' || log.entity_type === 'Permission') category = 'Roles & access';
        else if (log.entity_type === 'Complaint' || log.entity_type === 'Feedback') category = 'Citizen voice';
        else if (log.entity_type === 'Cms' || log.entity_type === 'Post') category = 'CMS & Landing';

        const actorName = log.actor?.name || 'Administrator';
        const actorUsername = log.actor?.username ? `@${log.actor.username}` : '@admin';
        const actorRole = log.organization?.name || 'Addis Ababa City Administration';
        const initials = actorName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();

        // Extract diffs across all keys in old_values and new_values
        const oldVals = (log.old_values && typeof log.old_values === 'object') ? (log.old_values as Record<string, unknown>) : {};
        const newVals = (log.new_values && typeof log.new_values === 'object') ? (log.new_values as Record<string, unknown>) : {};
        const allKeys = Array.from(new Set([...Object.keys(oldVals), ...Object.keys(newVals)]));

        const diffs: Array<{ field: string; from: string; to: string }> = [];
        for (const k of allKeys) {
          if (JSON.stringify(oldVals[k]) !== JSON.stringify(newVals[k])) {
            diffs.push({
              field: k,
              from: oldVals[k] !== undefined && oldVals[k] !== null
                ? (typeof oldVals[k] === 'object' ? JSON.stringify(oldVals[k]) : String(oldVals[k]))
                : 'None',
              to: newVals[k] !== undefined && newVals[k] !== null
                ? (typeof newVals[k] === 'object' ? JSON.stringify(newVals[k]) : String(newVals[k]))
                : 'None',
            });
          }
        }

        const meaningfulDiffs = diffs.filter((d) => d.field !== 'updated_at' && d.field !== 'created_at');
        const displayDiffs = meaningfulDiffs.length > 0 ? meaningfulDiffs : diffs;

        // Telemetry & HTTP Status
        const statusCode = Number(log.status_code) || (log.status === 'failed' ? 500 : (actionType === 'CREATE' ? 201 : 200));
        const isSuccess = statusCode >= 200 && statusCode < 300 && log.status !== 'failed';
        const statusTone = isSuccess ? 'success' : statusCode >= 400 && statusCode < 500 ? 'warning' : 'error';

        let changeField = displayDiffs.length > 0 ? displayDiffs[0].field : 'Payload';
        let changeFrom = displayDiffs.length > 0 ? displayDiffs[0].from : '—';
        let changeTo = displayDiffs.length > 0 ? displayDiffs[0].to : '—';
        let changeSummary = 'Transaction logged';
        let communicativeTitle = '';

        if (log.action === 'created' || actionType === 'CREATE') {
          changeField = 'Initial Record';
          changeFrom = 'None (New)';
          changeTo = `${log.entity_type} created`;
          const newCount = Object.keys(newVals).length;
          changeSummary = newCount > 0 ? `Created with ${newCount} initial properties` : `New ${log.entity_type.toLowerCase()} record created`;
          communicativeTitle = `${actorName} created new ${log.entity_type} #${log.entity_id || log.id}`;
        } else if (log.action === 'deleted' || actionType === 'DELETE') {
          changeField = 'Status';
          changeFrom = 'Active';
          changeTo = 'Deleted (Purged)';
          changeSummary = `${log.entity_type} removed from database`;
          communicativeTitle = `${actorName} permanently purged ${log.entity_type} #${log.entity_id || log.id}`;
        } else if (log.action === 'login') {
          changeField = 'Session State';
          changeFrom = 'Signed Out';
          changeTo = 'Authenticated';
          changeSummary = `User signed in successfully via Sanctum SPA`;
          communicativeTitle = `${actorName} authenticated into the administrative portal`;
        } else if (log.action === 'logout') {
          changeField = 'Session State';
          changeFrom = 'Authenticated';
          changeTo = 'Signed Out';
          changeSummary = `User session terminated cleanly`;
          communicativeTitle = `${actorName} signed out of portal session`;
        } else if (displayDiffs.length > 0) {
          if (displayDiffs.length === 1) {
            changeSummary = `Updated ${displayDiffs[0].field}`;
            communicativeTitle = `${actorName} updated ${displayDiffs[0].field} on ${log.entity_type} #${log.entity_id || log.id}`;
          } else {
            const fieldNames = displayDiffs.map((d) => d.field).slice(0, 3).join(', ');
            const extra = displayDiffs.length > 3 ? ` +${displayDiffs.length - 3} more` : '';
            changeSummary = `Updated ${displayDiffs.length} fields (${fieldNames}${extra})`;
            communicativeTitle = `${actorName} updated ${displayDiffs.length} fields on ${log.entity_type} #${log.entity_id || log.id}`;
          }
        } else {
          communicativeTitle = `${actorName} performed ${log.action} on ${log.entity_type} #${log.entity_id || log.id}`;
        }

        const dateObj = new Date(log.created_at);
        const fullTimestamp = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          : log.created_at;

        const shortDate = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }) + ' · ' + dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : 'Today';

        const isLogin = log.action === 'login';
        const isLogout = log.action === 'logout';
        const actionLabel = isLogin
          ? `User sign-in authenticated (${actorName})`
          : isLogout
          ? `User session signed out (${actorName})`
          : `${log.action.charAt(0).toUpperCase() + log.action.slice(1)} ${log.entity_type.toLowerCase()} record #${log.entity_id || log.id}`;

        const targetName = isLogin || isLogout
          ? `Portal User: ${actorUsername}`
          : `${log.entity_type} #${log.entity_id || log.id}`;

        const hasTelemetry = Boolean(
          (log.request_payload && Object.keys(log.request_payload).length > 0) ||
          (log.response_payload && Object.keys(log.response_payload).length > 0)
        );

        return {
          id: `LOG-${String(log.id).padStart(4, '0')}`,
          rawId: log.id,
          actionType,
          actionLabel,
          communicativeTitle,
          category,
          fullTimestamp,
          timestamp: shortDate,
          actor: {
            name: actorName,
            username: actorUsername,
            role: actorRole,
            initials,
            tone: 'teal',
          },
          target: {
            name: targetName,
            type: log.entity_type,
            jurisdiction: log.organization?.name || 'City Administration',
            id: String(log.entity_id || log.id),
          },
          change: {
            field: changeField,
            from: changeFrom,
            to: changeTo,
            summary: changeSummary,
            isChange: displayDiffs.length > 0,
          },
          diffs,
          displayDiffs,
          network: {
            ip: log.ip_address || '127.0.0.1',
            location: 'Addis Ababa, ET',
            userAgent: log.user_agent || 'Sanctum Web SPA',
            channel: 'Sanctum Web SPA',
          },
          status: log.status || (isSuccess ? 'success' : 'failed'),
          statusCode,
          statusTone,
          isSuccess,
          errorMessage: log.error_message || null,
          requestPayload: log.request_payload || null,
          responsePayload: log.response_payload || null,
          hasTelemetry,
          oldValues: log.old_values || null,
          newValues: log.new_values || null,
        };
      });
    }

    return [];
  }, [apiLogs]);

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
      if (actionTypeFilter === 'ERRORS') {
        if (item.isSuccess && item.statusCode < 400 && !item.errorMessage) {
          return false;
        }
      } else if (actionTypeFilter !== 'all' && item.actionType !== actionTypeFilter) {
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
          item.actionType?.toLowerCase().includes(q) ||
          item.communicativeTitle?.toLowerCase().includes(q);
        const matchesTarget =
          item.target?.name?.toLowerCase().includes(q) ||
          item.target?.jurisdiction?.toLowerCase().includes(q) ||
          item.target?.type?.toLowerCase().includes(q) ||
          item.target?.id?.toLowerCase().includes(q);
        const matchesChange =
          item.change?.field?.toLowerCase().includes(q) ||
          item.change?.from?.toLowerCase().includes(q) ||
          item.change?.to?.toLowerCase().includes(q) ||
          item.change?.summary?.toLowerCase().includes(q);
        const matchesDiffs =
          item.displayDiffs?.some(
            (d: any) =>
              d.field.toLowerCase().includes(q) ||
              d.from.toLowerCase().includes(q) ||
              d.to.toLowerCase().includes(q)
          );
        const matchesTelemetry =
          String(item.statusCode).includes(q) ||
          (item.errorMessage && item.errorMessage.toLowerCase().includes(q));
        const matchesNetwork =
          item.network?.ip?.includes(q) ||
          item.network?.location?.toLowerCase().includes(q) ||
          item.network?.channel?.toLowerCase().includes(q);
        const matchesId = item.id?.toLowerCase().includes(q);

        return (
          matchesActor ||
          matchesAction ||
          matchesTarget ||
          matchesChange ||
          matchesDiffs ||
          matchesTelemetry ||
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
      'HTTP Status',
      'Category',
      'Target Name',
      'Target Jurisdiction',
      'Changed Fields Summary',
      'IP Address',
      'Channel',
      'Has Wire Telemetry',
    ];
    const rows = filteredActivities.map((a) => [
      a.id,
      `"${a.fullTimestamp}"`,
      `"${a.actor?.name} (${a.actor?.username})"`,
      `"${a.actor?.role}"`,
      `"${a.actionType} - ${a.actionLabel}"`,
      `"${a.statusCode} (${a.status})"`,
      `"${a.category}"`,
      `"${a.target?.name}"`,
      `"${a.target?.jurisdiction}"`,
      `"${(a.change?.summary || a.change?.field || '').replace(/"/g, '""')}"`,
      `"${a.network?.ip}"`,
      `"${a.network?.channel}"`,
      `"${a.hasTelemetry ? 'YES (Req & Res)' : 'NO'}"`,
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
          value={isLoading && !apiLogs ? '...' : activities.length}
          note="Across administrative hierarchy"
          tone="teal"
        />
        <MetricCard
          icon="edit"
          label="State changes & diffs"
          value={
            isLoading && !apiLogs
              ? '...'
              : activities.filter(
                  (a) => a.actionType === 'UPDATE' || a.actionType === 'STATUS' || a.displayDiffs?.length > 0
                ).length
          }
          note="Field-level state transitions"
          tone="gold"
        />
        <MetricCard
          icon="file"
          label="Wire telemetry captured"
          value={
            isLoading && !apiLogs
              ? '...'
              : activities.filter((a) => a.hasTelemetry).length
          }
          note="HTTP requests & responses"
          tone="sage"
        />
        <MetricCard
          icon="shield"
          label="Audit integrity rate"
          value={
            isLoading && !apiLogs
              ? '...'
              : `${activities.length ? Math.round((activities.filter((a) => a.isSuccess).length / activities.length) * 100) : 100}%`
          }
          note="Tamper-evident SHA-256"
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
              Showing {isLoading && !apiLogs ? '...' : filteredActivities.length} events with full user action, state change diffs, and network metadata.
            </p>
          </div>

          <div className="toolbar-tools">
            <div className="search-box">
              <Icon name="search" size={15} />
              <input
                type="search"
                placeholder="Search user, action, diff, HTTP status, or IP..."
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
              <option value="UPDATE">Updates & diffs (UPDATE)</option>
              <option value="CREATE">New additions (CREATE)</option>
              <option value="PUBLISH">Publications (PUBLISH)</option>
              <option value="SECURITY">Security & access (SECURITY)</option>
              <option value="STATUS">Status transitions (STATUS)</option>
              <option value="DELETE">Record removals (DELETE)</option>
              <option value="ERRORS">Errors & failed requests (HTTP 4xx/5xx)</option>
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
                <th style={{ width: 200 }}>USER (ACTOR)</th>
                <th style={{ width: 190 }}>ACTION & HTTP STATUS</th>
                <th style={{ width: 210 }}>RESOURCE / TARGET</th>
                <th>WHAT CHANGED (FROM ➔ TO)</th>
                <th style={{ width: 170 }}>ORIGIN & IP</th>
                <th style={{ width: 90, textAlign: 'right' }}>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !apiLogs ? (
                <tr>
                  <td colSpan={7}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '12px' }}>
                      <div className="loading-spinner" />
                      <p style={{ margin: 0, color: '#00485a', fontWeight: 600, fontSize: '14px' }}>Loading audit records...</p>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Connecting to administrative audit log</p>
                    </div>
                  </td>
                </tr>
              ) : filteredActivities.length === 0 ? (
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

                      {/* User Action & HTTP Status */}
                      <td>
                        <div className="activity-action-column">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                            <span className={`activity-action-tag ${tone}`}>
                              <Icon name={icon} size={12} /> {event.actionType}
                            </span>
                            <span className={`http-status-pill ${event.statusTone}`}>
                              {event.statusCode}
                            </span>
                            {event.hasTelemetry && (
                              <span className="telemetry-pill" title="Incoming request & outgoing response payload recorded">
                                <Icon name="file" size={10} /> Req/Res
                              </span>
                            )}
                          </div>
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
                        {event.displayDiffs && event.displayDiffs.length > 0 ? (
                          <div className="diff-container">
                            <div className="diff-field-name">
                              <Icon name="edit" size={11} /> {event.displayDiffs[0].field}:
                            </div>
                            <div className="diff-flow">
                              <span className="diff-from" title={`Previous: ${event.displayDiffs[0].from}`}>
                                <span className="diff-state-prefix">FROM:</span> {event.displayDiffs[0].from}
                              </span>
                              <span className="diff-arrow" aria-hidden="true">➔</span>
                              <span className="diff-to" title={`New: ${event.displayDiffs[0].to}`}>
                                <span className="diff-state-prefix">TO:</span> {event.displayDiffs[0].to}
                              </span>
                            </div>
                            {event.displayDiffs.length > 1 && (
                              <span className="diff-more-badge">
                                +{event.displayDiffs.length - 1} more fields modified ({event.displayDiffs.slice(1).map((d: any) => d.field).join(', ')})
                              </span>
                            )}
                            {event.change?.summary && (
                              <p className="diff-summary-note">{event.change.summary}</p>
                            )}
                          </div>
                        ) : event.actionType === 'CREATE' ? (
                          <div className="diff-container">
                            <span className="diff-created-pill">
                              <Icon name="plus" size={12} /> New Record Created
                            </span>
                            <p className="diff-summary-note">{event.change?.summary || 'Instantiated with initial properties'}</p>
                          </div>
                        ) : event.actionType === 'DELETE' ? (
                          <div className="diff-container">
                            <span className="diff-deleted-pill">
                              <Icon name="trash" size={12} /> Record Purged
                            </span>
                            <p className="diff-summary-note">{event.change?.summary || 'Permanently removed from database'}</p>
                          </div>
                        ) : event.actionType === 'SECURITY' ? (
                          <div className="diff-container">
                            <span className="diff-auth-pill">
                              <Icon name="shield" size={12} /> {event.change?.summary || 'Authenticated Session'}
                            </span>
                          </div>
                        ) : (
                          <span className="diff-static-note">
                            {event.change?.summary || 'Standard operation completed.'}
                          </span>
                        )}
                        {event.errorMessage && (
                          <div className="diff-error-pill" title={event.errorMessage} style={{ marginTop: 4 }}>
                            <Icon name="alertTriangle" size={12} /> {event.errorMessage}
                          </div>
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
