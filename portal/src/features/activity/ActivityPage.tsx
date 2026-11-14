import React, { useState, useMemo } from 'react';
import {
  Activity,
  ShieldCheck,
  Users,
  Layers,
  Search,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
} from 'lucide-react';
import { useLanguage } from '../../i18n/i18nContext';
import { getLocalizedText } from '../../i18n/utils/getLocalized';
import ActivityDetailsModal from '../../components/activity/ActivityDetailsModal.jsx';
import { useGetAuditLogsQuery } from '../../services/auditLogsApi';

export const ActivityPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { data: apiLogs, isLoading } = useGetAuditLogsQuery();
  const [search, setSearch] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

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
        const actorRole = getLocalizedText(log.organization?.name as any, language) || (typeof log.organization?.name === 'string' ? log.organization.name : 'Addis Ababa City Administration');
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

        return {
          id: log.id,
          actor: actorName,
          actorHandle: actorUsername,
          actorRole,
          initials,
          category,
          entityType: log.entity_type || 'System',
          entityId: log.entity_id ? `#${log.entity_id}` : '',
          action: log.action || 'system.action',
          actionType,
          description: getLocalizedText(log.description as any, language) || (typeof log.description === 'string' ? log.description : `Performed ${log.action} on ${log.entity_type}`),
          ip: log.ip_address || '127.0.0.1',
          time: log.created_at ? new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent',
          diffs,
        };
      });
    }
    return [];
  }, [apiLogs, language]);

  const filtered = useMemo(() => {
    return activities.filter((act) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        q === '' ||
        act.actor.toLowerCase().includes(q) ||
        act.description.toLowerCase().includes(q) ||
        act.entityType.toLowerCase().includes(q) ||
        act.action.toLowerCase().includes(q);

      const matchAction =
        actionTypeFilter === 'all' ||
        act.actionType.toLowerCase() === actionTypeFilter.toLowerCase();

      return matchSearch && matchAction;
    });
  }, [activities, search, actionTypeFilter]);

  const createEvents = activities.filter((a) => a.actionType === 'CREATE').length;
  const updateEvents = activities.filter((a) => a.actionType === 'UPDATE').length;
  const securityEvents = activities.filter((a) => a.actionType === 'SECURITY').length;

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1.5 w-6 rounded-full bg-[#efbd58]" />
            <span className="text-[11px] font-bold tracking-widest text-[#064552] uppercase">
              {t('activity.eyebrow')}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t('activity.title')}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t('activity.subtitle')}
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#064552]">
            <Activity size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {activities.length}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('activity.totalEvents')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {createEvents}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('activity.createEvents')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <Layers size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {updateEvents}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('activity.updateEvents')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700">
            <ShieldCheck size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {securityEvents}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {t('activity.securityEvents')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        {/* Card Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                System Activity Stream
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                {filtered.length} entries
              </span>
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/70 text-xs font-semibold self-end sm:self-auto">
              {(['all', 'CREATE', 'UPDATE', 'DELETE', 'SECURITY'] as const).map((aType) => (
                <button
                  key={aType}
                  type="button"
                  onClick={() => setActionTypeFilter(aType)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    actionTypeFilter === aType
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {aType === 'all' ? 'All events' : aType.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="relative max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actor, action description, entity..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#064552] transition-all"
            />
          </div>
        </div>

        {/* Content List */}
        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              Loading audit logs...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center max-w-sm mx-auto">
              <Activity size={36} className="mx-auto text-slate-300 mb-2" />
              <h3 className="text-sm font-bold text-slate-700">No activity events found</h3>
              <p className="text-xs text-slate-500 mt-1">
                {search ? `No logs match "${search}".` : 'System actions and audit records will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-200/80 rounded-xl p-4 bg-white hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center font-bold text-[#064552] text-xs flex-shrink-0 mt-0.5">
                      {item.initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.actionType === 'CREATE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : item.actionType === 'DELETE'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            : item.actionType === 'SECURITY'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                            : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                        }`}>
                          {item.actionType}
                        </span>

                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.entityType} {item.entityId}
                        </span>

                        <span className="text-xs font-bold text-slate-900">
                          {item.actor}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({item.actorRole})
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                        <span>{item.time}</span>
                        <span>·</span>
                        <span>IP: {item.ip}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-[#064552] hover:text-white transition-colors"
                    >
                      <Eye size={13} />
                      <span>{t('activity.inspectDiff', 'Inspect diff')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Audit Diff Details Modal */}
      {selectedEvent && (
        <ActivityDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default ActivityPage;

