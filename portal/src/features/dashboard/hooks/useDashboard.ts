import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortal } from '../../shared';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import type { FeedbackItem, RoleKey } from '../../../types/portal.types';
import type {
  DashboardMetricItem,
  DashboardQuickAction,
  OverviewPageProps,
} from '../types/dashboard.types';
import {
  useGetDashboardOverviewQuery,
  useGetRecentActivityQuery,
  useGetFeedbackReportQuery,
  useGetServicesReportQuery,
  useGetOrganizationsReportQuery,
} from '../api/dashboardApi';
import {
  selectDashboardPeriod,
  toggleDashboardPeriod,
  setIsExporting,
} from '../slice/dashboardSlice';
import { useGetServicesQuery } from '../../services';
import { useGetOrganizationsQuery } from '../../organizations';
import { useGetUsersQuery } from '../../accounts';
import { useGetFeedbackListQuery } from '../../feedback';

export const useDashboard = (props?: OverviewPageProps) => {
  const portal = usePortal();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const period = useAppSelector(selectDashboardPeriod);

  // Unified Dashboard API Queries (api.md Section 12)
  const { data: dashboardOverview, isLoading: overviewLoading } = useGetDashboardOverviewQuery();
  const { data: recentActivity, isLoading: isActivityLoading } = useGetRecentActivityQuery({ limit: 15 });
  const { data: feedbackReport } = useGetFeedbackReportQuery();
  const { data: servicesReport } = useGetServicesReportQuery();
  const { data: orgsReport } = useGetOrganizationsReportQuery();

  // Resource queries (live backend data)
  const { data: servicesData, isLoading: servicesLoading } = useGetServicesQuery();
  const { data: orgsData, isLoading: orgsLoading } = useGetOrganizationsQuery();
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();
  const { data: feedbackData, isLoading: feedbackLoading } = useGetFeedbackListQuery();

  const isPageLoading =
    (overviewLoading || (!dashboardOverview && (servicesLoading || orgsLoading || usersLoading || feedbackLoading))) &&
    !dashboardOverview;

  const role = (props?.role || portal.role || 'super') as RoleKey;
  const onNavigate =
    props?.onNavigate ||
    ((path: string) => navigate(path.startsWith('/') ? path : `/${path}`));
  const onFeedback =
    props?.onFeedback || ((item: FeedbackItem) => portal.openFeedback(item));
  const onCreate =
    props?.onCreate ||
    ((targetPage?: string) => {
      const target =
        targetPage ||
        (role === 'super' ? 'offices' : role === 'subcity' ? 'services' : 'routes');
      portal.createForPage?.(target);
    });

  // Calculate dynamic metrics strictly from backend API data
  const dData = dashboardOverview?.data;

  const totalServices =
    dData?.services?.total_catalog ??
    (servicesData?.meta?.total ?? servicesData?.data?.length ?? 0);
  const publishedServices =
    dData?.services?.active_catalog ??
    (servicesData?.data?.filter((s) => s.is_active).length ?? totalServices);
  const totalOrgs =
    dData?.organizations?.total ??
    (orgsReport?.data?.summary?.total_organizations ??
      (orgsData?.meta?.total ?? orgsData?.data?.length ?? 0));
  const activeOrgs =
    dData?.organizations?.active ??
    (orgsReport?.data?.summary?.active ??
      (orgsData?.data?.filter((o) => o.status === 'active').length ?? totalOrgs));
  const totalUsers =
    dData?.users?.total ?? (usersData?.meta?.total ?? usersData?.data?.length ?? 0);
  const activeUsers =
    dData?.users?.active ??
    (usersData?.data?.filter((u) => u.status === 'active').length ?? totalUsers);

  const totalFeedback =
    dData?.feedback?.total ??
    (feedbackReport?.data?.summary?.total_feedback ??
      (feedbackData?.meta?.total ?? feedbackData?.data?.length ?? 0));
  const complaintsCount =
    dData?.feedback?.by_type?.complaint ??
    (feedbackReport?.data?.summary?.complaints_count ?? 0);
  const satisfactionCount =
    dData?.feedback?.by_type?.satisfaction ??
    (feedbackReport?.data?.summary?.satisfaction_count ?? 0);
  const recentFeedback30Days =
    dData?.feedback?.recent_last_30_days ?? totalFeedback;

  // Resolve current greeting from authenticated user session
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const timeGreeting =
      hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const userName =
      portal.session?.user?.name || portal.authUser?.name || 'Administrator';
    return `${timeGreeting}, ${userName}`;
  }, [portal.session?.user?.name, portal.authUser?.name]);

  const subtitle = useMemo(() => {
    const orgName =
      dData?.scope?.organization_name ||
      portal.session?.user?.organization?.name ||
      portal.authUser?.organization?.name;
    const roleName =
      portal.session?.user?.role?.name ||
      portal.authUser?.role?.name ||
      'Administrative';
    if (orgName) {
      return `Here’s what’s happening across ${orgName} (${roleName}) today.`;
    }
    return 'Live overview of citizen services, administrative offices, and community feedback.';
  }, [dData?.scope?.organization_name, portal.session?.user, portal.authUser]);

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

  const metrics: DashboardMetricItem[] = useMemo(() => {
    if (role === 'super') {
      return [
        {
          icon: 'map',
          label: 'Sub-cities & offices',
          value: totalOrgs,
          note: `${activeOrgs} active administrative unit${activeOrgs === 1 ? '' : 's'}`,
          trend: '',
          tone: 'teal',
        },
        {
          icon: 'users',
          label: 'Staff & accounts',
          value: totalUsers,
          note: `${activeUsers} active system user${activeUsers === 1 ? '' : 's'}`,
          trend: '',
          tone: 'sage',
        },
        {
          icon: 'layers',
          label: 'Published services',
          value: publishedServices,
          note: `${totalServices} total catalog service${totalServices === 1 ? '' : 's'}`,
          trend: '',
          tone: 'gold',
        },
        {
          icon: 'message',
          label: 'Citizen feedback',
          value: totalFeedback,
          note: `${recentFeedback30Days} in the last 30 days`,
          trend: '',
          tone: 'blue',
        },
      ];
    }
    if (role === 'subcity') {
      return [
        {
          icon: 'building',
          label: 'Active bureaus',
          value: totalOrgs,
          note: `${activeOrgs} connected office${activeOrgs === 1 ? '' : 's'}`,
          trend: '',
          tone: 'teal',
        },
        {
          icon: 'layers',
          label: 'Service standards',
          value: totalServices,
          note: `${publishedServices} active for citizens`,
          trend: '',
          tone: 'sage',
        },
        {
          icon: 'message',
          label: 'Feedback received',
          value: totalFeedback,
          note: `${satisfactionCount} positive rating${satisfactionCount === 1 ? '' : 's'}`,
          trend: '',
          tone: 'gold',
        },
        {
          icon: 'clock',
          label: 'Pending complaints',
          value: complaintsCount,
          note: 'Awaiting administrative review',
          trend: '',
          tone: 'blue',
        },
      ];
    }
    return [
      {
        icon: 'layers',
        label: 'Service guides',
        value: totalServices,
        note: `${publishedServices} published to citizens`,
        trend: '',
        tone: 'teal',
      },
      {
        icon: 'route',
        label: 'Room routes',
        value: servicesReport?.data?.summary?.total_steps ?? totalServices,
        note: 'Connected service steps',
        trend: '',
        tone: 'sage',
      },
      {
        icon: 'message',
        label: 'Feedback this month',
        value: totalFeedback,
        note: `${satisfactionCount} satisfaction entries`,
        trend: '',
        tone: 'gold',
      },
      {
        icon: 'clock',
        label: 'Pending items',
        value: complaintsCount,
        note: 'Actionable citizen complaints',
        trend: '',
        tone: 'blue',
      },
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

  const quickActions: DashboardQuickAction[] = useMemo(() => {
    if (role === 'super') {
      return [
        { text: 'Manage offices', icon: 'building', page: 'offices' },
        { text: 'Manage accounts', icon: 'users', page: 'accounts' },
        { text: 'Review feedback', icon: 'message', page: 'feedback' },
      ];
    }
    if (role === 'subcity') {
      return [
        { text: 'Create a service', icon: 'layers', page: 'services' },
        { text: 'Explore offices', icon: 'building', page: 'offices' },
        { text: 'Publish an update', icon: 'news', page: 'news' },
      ];
    }
    return [
      { text: 'Update a room route', icon: 'route', page: 'routes' },
      { text: 'Review feedback', icon: 'message', page: 'feedback' },
      { text: 'Open QR codes', icon: 'qr', page: 'qr' },
    ];
  }, [role]);

  // Feedback focus priority list strictly from real backend API responses
  const focusFeedback = useMemo<FeedbackItem[]>(() => {
    if (feedbackReport?.data?.recent_feedback && feedbackReport.data.recent_feedback.length > 0) {
      return feedbackReport.data.recent_feedback.slice(0, 4).map((rf) => ({
        id: rf.tracking_number ? `#${rf.tracking_number}` : `FB-${rf.id}`,
        type:
          rf.feedback_type === 'complaint'
            ? 'Complaint'
            : rf.feedback_type === 'satisfaction'
              ? 'Satisfaction'
              : 'Suggestion',
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
        type: String(
          item.type ||
            (item.feedback_type
              ? item.feedback_type.charAt(0).toUpperCase() + item.feedback_type.slice(1)
              : 'Feedback')
        ),
        service: item.service || 'Civil Service',
        bureau: item.bureau || item.organization?.name || 'General Bureau',
        subcity: item.subcity || item.organization?.code || 'City Administration',
        message: item.message || item.feedback_content || '',
        rating: item.rating ?? 4,
        time: item.created_at
          ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : 'Today',
        status: String(item.status || 'Open'),
        priority: String(
          item.priority || (item.feedback_type === 'complaint' ? 'High' : 'Normal')
        ),
        trackingNumber: item.tracking_number,
      }));
    }

    return [];
  }, [feedbackReport, feedbackData]);

  // Export Executive Dashboard Report as CSV
  const handleExportReport = () => {
    dispatch(setIsExporting(true));
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const headers = ['Category', 'Indicator', 'Value', 'Details'];
      const rows: string[][] = [
        headers,
        ['Scope', 'User Role', role, portal.session?.user?.name || portal.authUser?.name || 'Administrator'],
        [
          'Scope',
          'Organization',
          dData?.scope?.organization_name || 'Addis Ababa City Administration',
          `Scope ID: ${dData?.scope?.organization_id || 1}`,
        ],
        [
          'Organizations',
          'Total Organizations',
          String(totalOrgs),
          `${activeOrgs} active, ${dData?.organizations?.inactive ?? 0} inactive`,
        ],
        ['Organizations', 'Sub-Cities', String(dData?.organizations?.by_type?.sub_city ?? 1), 'Administrative districts'],
        ['Organizations', 'Woredas', String(dData?.organizations?.by_type?.woreda ?? 0), 'Woreda offices'],
        ['Organizations', 'Bureaus', String(dData?.organizations?.by_type?.bureau ?? 0), 'Service delivery bureaus'],
        ['Users', 'Total System Users', String(totalUsers), `${activeUsers} active administrators and staff`],
        ['Services', 'Catalog Services', String(totalServices), `${publishedServices} active for citizens`],
        ['Services', 'Master Services', String(dData?.services?.master_services ?? 0), 'Top-level service categories'],
        ['Services', 'Subservices', String(dData?.services?.subservices ?? 0), 'Specialized citizen procedures'],
        ['Feedback', 'Total Citizen Submissions', String(totalFeedback), 'Combined complaints and ratings'],
        [
          'Feedback',
          'Complaints',
          String(complaintsCount),
          `${feedbackReport?.data?.summary?.complaints_percentage ?? 0}% complaint rate`,
        ],
        ['Feedback', 'Satisfaction Ratings', String(satisfactionCount), 'Positive citizen experience responses'],
        ['Feedback', '30-Day Velocity', String(recentFeedback30Days), 'Submissions in the last 30 calendar days'],
      ];

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        rows.map((e) => e.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `civiclink_dashboard_report_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      dispatch(setIsExporting(false));
    }
  };

  const handleTogglePeriod = () => {
    dispatch(toggleDashboardPeriod());
  };

  const displayRoleLabel =
    portal.session?.user?.role?.name ||
    portal.authUser?.role?.name ||
    (role === 'super' ? 'Super Admin' : role === 'subcity' ? 'Sub-City Admin' : 'Bureau Admin');

  return {
    isPageLoading,
    role,
    displayRoleLabel,
    greeting,
    subtitle,
    formattedDate,
    metrics,
    quickActions,
    focusFeedback,
    recentActivities: recentActivity?.data,
    isActivityLoading,
    period,
    totalFeedback,
    feedbackReport: feedbackReport?.data,
    feedbackOverview: dData?.feedback,
    onTogglePeriod: handleTogglePeriod,
    onExportReport: handleExportReport,
    onNavigate,
    onFeedback,
    onCreate,
  };
};

