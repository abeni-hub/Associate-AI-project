import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortal } from '../context';
import { Icon } from '../components/shared/Icon';
import { MetricCard } from '../components/shared/MetricCard';
import ActivityChart from '../components/overview/ActivityChart';
import SatisfactionPanel from '../components/overview/SatisfactionPanel';
import FeedbackFocusList from '../components/overview/FeedbackFocusList';
import QuickActions from '../components/overview/QuickActions';
import RecentActivityFeed from '../components/overview/RecentActivityFeed';
import { ROLE } from '../data/portalData.js';
import type { FeedbackItem, RoleKey } from '../types/portal.types';
import { useGetServicesQuery } from '../services/servicesApi';
import { useGetOrganizationsQuery } from '../services/organizationsApi';
import { useGetUsersQuery } from '../services/usersApi';
import { useGetFeedbackListQuery } from '../services/feedbackApi';
import {
  useGetDashboardOverviewQuery,
  useGetRecentActivityQuery,
  useGetFeedbackReportQuery,
  useGetServicesReportQuery,
  useGetOrganizationsReportQuery,
} from '../services/dashboardApi';

export interface OverviewPageProps {
  role?: RoleKey | string;
  onNavigate?: (path: string) => void;
  feedback?: FeedbackItem[];
  onFeedback?: (item: FeedbackItem) => void;
  onCreate?: (targetPage?: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  role: propRole,
  onNavigate: propOnNavigate,
  feedback: propFeedback,
  onFeedback: propOnFeedback,
  onCreate: propOnCreate,
}) => {
  const portal = usePortal();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('This week');

  // Unified Dashboard API Queries (api.md Section 12)
  const { data: dashboardOverview } = useGetDashboardOverviewQuery();
  const { data: recentActivity, isLoading: activityLoading } = useGetRecentActivityQuery({ limit: 15 });
  const { data: feedbackReport } = useGetFeedbackReportQuery();
  const { data: servicesReport } = useGetServicesReportQuery();
  const { data: orgsReport } = useGetOrganizationsReportQuery();

  // Resource queries (provide local caching and graceful fallback)
  const { data: servicesData } = useGetServicesQuery();
  const { data: orgsData } = useGetOrganizationsQuery();
  const { data: usersData } = useGetUsersQuery();
  const { data: feedbackData } = useGetFeedbackListQuery();

  const role = (propRole || portal.role || 'super') as RoleKey;
  const onNavigate = propOnNavigate || ((path: string) => navigate(path.startsWith('/') ? path : `/${path}`));
  const onFeedback = propOnFeedback || ((item: FeedbackItem) => portal.openFeedback(item));
  const onCreate =
    propOnCreate ||
    (() => {
      const target = role === 'super' ? 'offices' : role === 'subcity' ? 'services' : 'routes';
      portal.createForPage?.(target);
    });

  // Calculate dynamic metrics with graceful fallback
  const dData = dashboardOverview?.data;

  const totalServices = dData?.services?.total_catalog ?? (servicesData?.meta?.total ?? servicesData?.data?.length ?? 0);
  const publishedServices = dData?.services?.active_catalog ?? (servicesData?.data?.filter((s) => s.is_active).length ?? totalServices);
  const totalOrgs = dData?.organizations?.total ?? (orgsReport?.data?.summary?.total_organizations ?? (orgsData?.meta?.total ?? orgsData?.data?.length ?? 0));
  const activeOrgs = dData?.organizations?.active ?? (orgsReport?.data?.summary?.active ?? (orgsData?.data?.filter((o) => o.status === 'active').length ?? totalOrgs));
  const totalUsers = dData?.users?.total ?? (usersData?.meta?.total ?? usersData?.data?.length ?? 0);
  const activeUsers = dData?.users?.active ?? (usersData?.data?.filter((u) => u.status === 'active').length ?? totalUsers);
  
  const totalFeedback = dData?.feedback?.total ?? (feedbackReport?.data?.summary?.total_feedback ?? (feedbackData?.meta?.total ?? feedbackData?.data?.length ?? 0));
  const complaintsCount = dData?.feedback?.by_type?.complaint ?? feedbackReport?.data?.summary?.complaints_count ?? 0;
  const satisfactionCount = dData?.feedback?.by_type?.satisfaction ?? feedbackReport?.data?.summary?.satisfaction_count ?? 0;
  const recentFeedback30Days = dData?.feedback?.recent_last_30_days ?? totalFeedback;

  // Resolve current greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const userFirstName = portal.session?.user?.name ? portal.session.user.name.split(' ')[0] : 'Administrator';
    return `${timeGreeting}, ${userFirstName}`;
  }, [portal.session?.user?.name]);

  const subtitle = useMemo(() => {
    const orgName = dData?.scope?.organization_name || portal.session?.user?.organization?.name;
    const roleName = portal.session?.user?.role?.name || 'Administrative';
    if (orgName) {
      return `Here’s what’s happening across ${orgName} (${roleName}) today.`;
    }
    return `Active overview of citizen services, administrative offices, and community feedback.`;
  }, [dData?.scope?.organization_name, portal.session?.user]);

  const formattedDate = useMemo(() => {
    return new Date()
      .toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      .toUpperCase();
  }, []);

  const metrics: Array<[string, string, string | number, string, string]> = useMemo(() => {
    if (role === 'super') {
      return [
        ['map', 'Sub-cities & offices', totalOrgs, `${activeOrgs} active administrative units`, ''],
        ['users', 'Staff & accounts', totalUsers, `${activeUsers} active system users`, ''],
        ['layers', 'Published services', publishedServices, `${totalServices} total catalog services`, ''],
        ['message', 'Citizen feedback', totalFeedback, `${recentFeedback30Days} in the last 30 days`, ''],
      ];
    }
    if (role === 'subcity') {
      return [
        ['building', 'Active bureaus', totalOrgs, `${activeOrgs} connected offices`, ''],
        ['layers', 'Service standards', totalServices, `${publishedServices} active for citizens`, ''],
        ['message', 'Feedback received', totalFeedback, `${satisfactionCount} positive ratings`, ''],
        ['clock', 'Pending complaints', complaintsCount, 'Awaiting administrative review', ''],
      ];
    }
    return [
      ['layers', 'Service guides', totalServices, `${publishedServices} published to citizens`, ''],
      ['route', 'Room routes', servicesReport?.data?.summary?.total_steps ?? totalServices, 'Connected service steps', ''],
      ['message', 'Feedback this month', totalFeedback, `${satisfactionCount} satisfaction entries`, ''],
      ['clock', 'Pending items', complaintsCount, 'Actionable citizen complaints', ''],
    ];
  }, [
    role,
    totalOrgs,
    activeOrgs,
    totalUsers,
    activeUsers,
    totalServices,
    publishedServices,
    totalFeedback,
    recentFeedback30Days,
    satisfactionCount,
    complaintsCount,
    servicesReport?.data?.summary?.total_steps,
  ]);

  const quick =
    role === 'super'
      ? [
          { text: 'Create an office', icon: 'building', page: 'offices' },
          { text: 'Manage accounts', icon: 'users', page: 'accounts' },
          { text: 'Review feedback', icon: 'message', page: 'feedback' },
        ]
      : role === 'subcity'
        ? [
            { text: 'Create a service', icon: 'layers', page: 'services' },
            { text: 'Explore offices', icon: 'building', page: 'offices' },
            { text: 'Publish an update', icon: 'news', page: 'news' },
          ]
        : [
            { text: 'Update a room route', icon: 'route', page: 'routes' },
            { text: 'Review feedback', icon: 'message', page: 'feedback' },
            { text: 'Open QR codes', icon: 'qr', page: 'qr' },
          ];

  // Feedback focus priority list from report or fallback
  const focus = useMemo<FeedbackItem[]>(() => {
    if (propFeedback && propFeedback.length > 0) return propFeedback;

    if (feedbackReport?.data?.recent_feedback && feedbackReport.data.recent_feedback.length > 0) {
      return feedbackReport.data.recent_feedback.slice(0, 4).map((rf) => ({
        id: rf.tracking_number ? `#${rf.tracking_number}` : `FB-${rf.id}`,
        type: rf.feedback_type === 'complaint' ? 'Complaint' : rf.feedback_type === 'satisfaction' ? 'Satisfaction' : 'Suggestion',
        service: 'Citizen Service',
        bureau: rf.organization?.name || 'Municipal Bureau',
        subcity: rf.organization?.code || 'City Administration',
        message: rf.content_snippet || '',
        rating: rf.feedback_type === 'satisfaction' ? 5 : rf.feedback_type === 'complaint' ? 2 : 4,
        time: rf.created_at
          ? new Date(rf.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : 'Today',
        status: 'Open',
        priority: rf.feedback_type === 'complaint' ? 'High' : 'Normal',
        trackingNumber: rf.tracking_number,
      }));
    }

    if (feedbackData?.data && feedbackData.data.length > 0) {
      return feedbackData.data.slice(0, 4).map((item) => ({
        id: `FB-${item.id}`,
        type: String(item.type || (item.feedback_type ? item.feedback_type.charAt(0).toUpperCase() + item.feedback_type.slice(1) : 'Feedback')),
        service: item.service || 'Civil Service',
        bureau: item.bureau || item.organization?.name || 'General Bureau',
        subcity: item.subcity || item.organization?.code || 'City Administration',
        message: item.message || item.feedback_content || '',
        rating: item.rating ?? 4,
        time: item.created_at
          ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : 'Today',
        status: String(item.status || 'Open'),
        priority: String(item.priority || (item.feedback_type === 'complaint' ? 'High' : 'Normal')),
        trackingNumber: item.tracking_number,
      }));
    }
    return [];
  }, [propFeedback, feedbackReport, feedbackData]);

  // Export Executive Dashboard Report as CSV
  const handleExportReport = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const headers = ['Category', 'Indicator', 'Value', 'Details'];
    const rows: string[][] = [
      headers,
      ['Scope', 'User Role', role, portal.session?.user?.name || 'Administrator'],
      ['Scope', 'Organization', dData?.scope?.organization_name || 'Addis Ababa City Administration', `Scope ID: ${dData?.scope?.organization_id || 1}`],
      ['Organizations', 'Total Organizations', String(totalOrgs), `${activeOrgs} active, ${dData?.organizations?.inactive ?? 0} inactive`],
      ['Organizations', 'Sub-Cities', String(dData?.organizations?.by_type?.sub_city ?? 1), 'Administrative districts'],
      ['Organizations', 'Woredas', String(dData?.organizations?.by_type?.woreda ?? 0), 'Woreda offices'],
      ['Organizations', 'Bureaus', String(dData?.organizations?.by_type?.bureau ?? 0), 'Service delivery bureaus'],
      ['Users', 'Total System Users', String(totalUsers), `${activeUsers} active administrators and staff`],
      ['Services', 'Catalog Services', String(totalServices), `${publishedServices} active for citizens`],
      ['Services', 'Master Services', String(dData?.services?.master_services ?? 0), 'Top-level service categories'],
      ['Services', 'Subservices', String(dData?.services?.subservices ?? 0), 'Specialized citizen procedures'],
      ['Feedback', 'Total Citizen Submissions', String(totalFeedback), 'Combined complaints and ratings'],
      ['Feedback', 'Complaints', String(complaintsCount), `${feedbackReport?.data?.summary?.complaints_percentage ?? 0}% complaint rate`],
      ['Feedback', 'Satisfaction Ratings', String(satisfactionCount), 'Positive citizen experience responses'],
      ['Feedback', '30-Day Velocity', String(recentFeedback30Days), 'Submissions in the last 30 calendar days'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `civiclink_dashboard_report_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const roleMeta = ROLE[role] || ROLE.super;

  return (
    <>
      <div className="page-heading dashboard-heading">
        <div>
          <span className="eyebrow page-eyebrow">
            <span className="eyebrow-line" />
            {formattedDate}
          </span>
          <h1>
            {greeting}
            <span>.</span>
          </h1>
          <p>{subtitle}</p>
        </div>
        <div className="heading-actions">
          <button
            className="button secondary"
            onClick={handleExportReport}
            title="Download executive CSV report"
          >
            <Icon name="download" size={16} /> Export report
          </button>
          <button className="button primary" onClick={() => onCreate()}>
            <Icon name="plus" size={16} />{' '}
            {role === 'super'
              ? 'New office'
              : role === 'subcity'
                ? 'Create a service'
                : 'Update room route'}
          </button>
        </div>
      </div>

      <section className="metric-grid">
        {metrics.map(([icon, label, value, note, trend], i) => (
          <MetricCard
            key={label}
            icon={icon}
            label={label}
            value={value}
            note={note}
            trend={trend}
            tone={(['teal', 'sage', 'gold', 'blue'] as const)[i]}
          />
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">PLATFORM PULSE</span>
              <h2>Citizen engagement</h2>
            </div>
            <button
              className="select-like"
              onClick={() =>
                setPeriod((current) => (current === 'This week' ? 'Last week' : 'This week'))
              }
            >
              {period} <Icon name="chevron" size={14} />
            </button>
          </div>
          <ActivityChart
            period={period}
            totalCount={totalFeedback}
            recentActivities={recentActivity?.data}
            feedbackReport={feedbackReport?.data}
          />
        </article>
        <SatisfactionPanel
          onNavigate={onNavigate}
          feedbackReport={feedbackReport?.data}
          feedbackOverview={dData?.feedback}
        />
      </section>

      <section className="dashboard-grid lower-grid">
        <FeedbackFocusList items={focus} onFeedback={onFeedback} onNavigate={onNavigate} />
        <QuickActions items={quick} onNavigate={onNavigate} onCreate={onCreate} />
      </section>

      <section className="dashboard-grid">
        <RecentActivityFeed
          activities={recentActivity?.data}
          isLoading={activityLoading}
          onNavigate={onNavigate}
        />
      </section>

      <p className="data-footnote">
        Connected to CivicLink Government Platform API — workspace role: {roleMeta.label}
      </p>
    </>
  );
};

export default OverviewPage;
