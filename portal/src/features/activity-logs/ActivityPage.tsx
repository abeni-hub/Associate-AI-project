import React from 'react';
import { Icon, PageHeading, useLanguage } from '../shared';
import ActivityDetailsModal from './components/ActivityDetailsModal.jsx';
import { ActivityMetrics } from './components/ActivityMetrics';
import { ActivityFilters } from './components/ActivityFilters';
import { ActivityTable } from './components/ActivityTable';
import { useActivityLogs } from './hooks/useActivityLogs';

export const ActivityPage: React.FC = () => {
  const { t } = useLanguage();
  const {
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
  } = useActivityLogs();

  return (
    <>
      <PageHeading
        eyebrow={t('activity.eyebrow', 'AUDIT TRAILS & SECURITY LOGS')}
        title={t('activity.title', 'Audit Activity Log')}
        subtitle={t('activity.subtitle', 'Immutable record of administrative modifications, role changes, and citizen interactions.')}
        secondary={t('activity.exportCsv', 'Export CSV audit')}
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
      <ActivityMetrics
        stats={stats}
        isLoading={isLoading}
        hasData={Boolean(apiLogs)}
      />

      {/* Filter Toolbar */}
      <ActivityFilters
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        actionTypeFilter={actionTypeFilter}
        setActionTypeFilter={setActionTypeFilter}
        totalFiltered={filteredActivities.length}
      />

      {/* Activity Records Table */}
      <ActivityTable
        filteredActivities={filteredActivities}
        activities={activities}
        isLoading={isLoading}
        hasData={Boolean(apiLogs)}
        setSelectedEvent={setSelectedEvent}
        setSearch={setSearch}
        setCategoryFilter={setCategoryFilter}
        setActionTypeFilter={setActionTypeFilter}
      />

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
