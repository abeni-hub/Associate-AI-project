import React from 'react';
import {
  useDashboard,
  DashboardHeading,
  DashboardMetricsGrid,
  DashboardActivityChart,
  DashboardSatisfactionPanel,
  DashboardFeedbackFocusList,
  DashboardQuickActions,
  DashboardRecentActivityFeed,
  DashboardLoadingState,
  type OverviewPageProps,
} from './index';
import styles from './styles/dashboard.module.css';

export const OverviewPage: React.FC<OverviewPageProps> = (props) => {
  const {
    isPageLoading,
    greeting,
    subtitle,
    formattedDate,
    displayRoleLabel,
    role,
    metrics,
    quickActions,
    focusFeedback,
    recentActivities,
    isActivityLoading,
    period,
    totalFeedback,
    feedbackReport,
    feedbackOverview,
    onTogglePeriod,
    onExportReport,
    onNavigate,
    onFeedback,
    onCreate,
  } = useDashboard(props);

  return (
    <div className={styles.container}>
      <DashboardHeading
        formattedDate={formattedDate}
        greeting={greeting}
        subtitle={subtitle}
        role={role}
        isPageLoading={isPageLoading}
        onExport={onExportReport}
        onCreate={onCreate}
      />

      {isPageLoading ? (
        <DashboardLoadingState />
      ) : (
        <>
          <DashboardMetricsGrid metrics={metrics} />

          <section className={styles.dashboardGrid}>
            <DashboardActivityChart
              period={period}
              totalCount={totalFeedback}
              recentActivities={recentActivities}
              feedbackReport={feedbackReport}
              onTogglePeriod={onTogglePeriod}
            />
            <DashboardSatisfactionPanel
              onNavigate={onNavigate}
              feedbackReport={feedbackReport}
              feedbackOverview={feedbackOverview}
            />
          </section>

          <section className={`${styles.dashboardGrid} ${styles.lowerGrid}`}>
            <DashboardFeedbackFocusList
              items={focusFeedback}
              onFeedback={onFeedback}
              onNavigate={onNavigate}
            />
            <DashboardQuickActions
              items={quickActions}
              onNavigate={onNavigate}
              onCreate={onCreate}
            />
          </section>

          <section className={styles.dashboardGrid}>
            <DashboardRecentActivityFeed
              activities={recentActivities}
              isLoading={isActivityLoading}
              onNavigate={onNavigate}
            />
          </section>

          <p className={styles.dataFootnote}>
            Connected to CivicLink Government Platform API — workspace role: {displayRoleLabel}
          </p>
        </>
      )}
    </div>
  );
};

export default OverviewPage;

