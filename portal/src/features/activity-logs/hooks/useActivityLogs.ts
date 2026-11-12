import { useState, useMemo } from 'react';
import { useGetAuditLogsQuery } from '../api/auditLogsApi';

export const useActivityLogs = () => {
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
          const fieldsStr = displayDiffs.map((d) => d.field).join(', ');
          changeSummary = `Updated: ${fieldsStr}`;
          communicativeTitle = `${actorName} updated ${fieldsStr} on ${log.entity_type} #${log.entity_id || log.id}`;
        } else {
          communicativeTitle = `${actorName} triggered ${log.action} on ${log.entity_type} #${log.entity_id || log.id}`;
        }

        const dateObj = new Date(log.created_at);
        const timeAgo = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Just now';

        return {
          id: `EVT-${log.id}`,
          rawId: log.id,
          timestamp: timeAgo,
          fullTimestamp: log.created_at,
          category,
          actionType,
          actionLabel: (log.action || 'TRANSACTION').toUpperCase(),
          actor: {
            name: actorName,
            username: actorUsername,
            role: actorRole,
            avatar: initials,
          },
          target: {
            name: `${log.entity_type} #${log.entity_id || log.id}`,
            jurisdiction: log.organization?.name || 'City Central Administration',
          },
          change: {
            field: changeField,
            from: changeFrom,
            to: changeTo,
            summary: changeSummary,
          },
          communicativeTitle,
          displayDiffs,
          allDiffs: diffs,
          oldValues: oldVals,
          newValues: newVals,
          statusCode,
          status: log.status || (isSuccess ? 'success' : 'failed'),
          statusTone,
          method: log.method || (actionType === 'CREATE' ? 'POST' : actionType === 'DELETE' ? 'DELETE' : 'PUT'),
          endpoint: log.url || `/api/v1/${(log.entity_type || 'records').toLowerCase()}`,
          durationMs: log.duration_ms || 45,
          errorMessage: log.error_message || null,
          network: {
            ip: log.ip_address || '127.0.0.1',
            userAgent: log.user_agent || 'Mozilla/5.0 (AdminPortal/1.0)',
            channel: 'Sanctum Web SPA',
            location: 'Addis Ababa, ET',
          },
          hasTelemetry: Boolean(log.request_payload || log.response_payload || log.duration_ms || log.ip_address),
          requestPayload: log.request_payload || null,
          responsePayload: log.response_payload || null,
        };
      });
    }
    return [];
  }, [apiLogs]);

  const filteredActivities = useMemo(() => {
    return activities.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }
      if (actionTypeFilter !== 'all' && item.actionType !== actionTypeFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesActor =
          item.actor?.name?.toLowerCase().includes(q) ||
          item.actor?.username?.toLowerCase().includes(q) ||
          item.actor?.role?.toLowerCase().includes(q);
        const matchesAction =
          item.actionType?.toLowerCase().includes(q) ||
          item.actionLabel?.toLowerCase().includes(q);
        const matchesTarget =
          item.target?.name?.toLowerCase().includes(q) ||
          item.target?.jurisdiction?.toLowerCase().includes(q);
        const matchesChange =
          item.change?.field?.toLowerCase().includes(q) ||
          item.change?.from?.toLowerCase().includes(q) ||
          item.change?.to?.toLowerCase().includes(q) ||
          item.change?.summary?.toLowerCase().includes(q);
        const matchesDiffs = item.displayDiffs?.some(
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

  const stats = useMemo(() => {
    return {
      total: activities.length,
      diffsCount: activities.filter(
        (a) => a.actionType === 'UPDATE' || a.actionType === 'STATUS' || a.displayDiffs?.length > 0
      ).length,
      telemetryCount: activities.filter((a) => a.hasTelemetry).length,
      actorsCount: new Set(activities.map((a) => a.actor?.username)).size,
    };
  }, [activities]);

  return {
    activities,
    filteredActivities,
    isLoading,
    apiLogs,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    actionTypeFilter,
    setActionTypeFilter,
    selectedEvent,
    setSelectedEvent,
    downloadNotice,
    handleExportCsv,
    stats,
  };
};

export default useActivityLogs;

