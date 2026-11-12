import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Folder,
  FileText,
  Building2,
  Users,
  MessageSquare,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Shield,
  Layers,
  MapPin,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { usePortal } from '../../context';
import { useLanguage } from '../../i18n/i18nContext';
import { getLocalizedText } from '../../i18n/utils/getLocalized';
import ActivityChart from '../../components/overview/ActivityChart';
import SatisfactionPanel from '../../components/overview/SatisfactionPanel';
import RecentActivityFeed from '../../components/overview/RecentActivityFeed';
import {
  useGetDashboardOverviewQuery,
  useGetRecentActivityQuery,
  useGetFeedbackReportQuery,
  useGetServicesReportQuery,
  useGetOrganizationsReportQuery,
} from '../../services/dashboardApi';
import { useGetServicesQuery } from '../../services/servicesApi';
import { useGetOrganizationsQuery } from '../../services/organizationsApi';
import { useGetUsersQuery } from '../../services/usersApi';
import { useGetFeedbackListQuery } from '../../services/feedbackApi';

export const OverviewPage: React.FC = () => {
  const portal = usePortal();
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  // Live backend overview data
  const { data: dashboardOverview, isLoading: overviewLoading } = useGetDashboardOverviewQuery();
  const { data: recentActivity, isLoading: activityLoading } = useGetRecentActivityQuery({ limit: 10 });
  const { data: feedbackReport } = useGetFeedbackReportQuery();
  const { data: servicesReport } = useGetServicesReportQuery();
  const { data: orgsReport } = useGetOrganizationsReportQuery();

  const { data: servicesData } = useGetServicesQuery();
  const { data: orgsData } = useGetOrganizationsQuery();
  const { data: usersData } = useGetUsersQuery();
  const { data: feedbackData } = useGetFeedbackListQuery();

  const dData = dashboardOverview?.data;

  const totalServices = dData?.services?.total_catalog ?? (servicesData?.meta?.total ?? servicesData?.data?.length ?? 0);
  const publishedServices = dData?.services?.active_catalog ?? (servicesData?.data?.filter((s) => s.is_active).length ?? totalServices);
  const totalOrgs = dData?.organizations?.total ?? (orgsReport?.data?.summary?.total_organizations ?? (orgsData?.meta?.total ?? orgsData?.data?.length ?? 0));
  const activeOrgs = dData?.organizations?.active ?? (orgsReport?.data?.summary?.active ?? (orgsData?.data?.filter((o) => o.status === 'active').length ?? totalOrgs));
  const totalUsers = dData?.users?.total ?? (usersData?.meta?.total ?? usersData?.data?.length ?? 0);
  const totalFeedback = dData?.feedback?.total ?? (feedbackReport?.data?.summary?.total_feedback ?? (feedbackData?.meta?.total ?? feedbackData?.data?.length ?? 0));
  const recentFeedback30Days = dData?.feedback?.recent_last_30_days ?? totalFeedback;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? t('overview.goodMorning') : hour < 18 ? t('overview.goodAfternoon') : t('overview.goodEvening');
    const userName = portal.session?.user?.name || portal.authUser?.name || 'Administrator';
    return `${timeGreeting}, ${userName}`;
  }, [portal.session?.user?.name, portal.authUser?.name, t]);

  const dateStr = useMemo(() => {
    const locale = language === 'am' ? 'am-ET' : language === 'om' ? 'om-ET' : 'en-US';
    try {
      return new Date().toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  }, [language]);

  return (
    <div className="space-y-6">
      {/* Page Heading & Scope Bar */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span />
            {t('overview.eyebrow')} · {dateStr}
          </div>
          <h1>{greeting}</h1>
          <p>{t('overview.subtitle')}</p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 flex-wrap self-start sm:self-auto">
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="primary-button"
          >
            <Folder size={16} />
            <span>{t('overview.serviceCatalog')}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/feedback')}
            className="outline-button"
          >
            <MessageSquare size={16} />
            <span>{t('overview.feedbackInbox')}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid" aria-label="Operational metrics summary">
        <div className="stat-card" onClick={() => navigate('/offices')} style={{ cursor: 'pointer' }}>
          <span className="stat-icon">
            <Building2 size={20} />
          </span>
          <div>
            <strong>{totalOrgs}</strong>
            <small>{t('overview.kpiOffices')}</small>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/services')} style={{ cursor: 'pointer' }}>
          <span className="stat-icon" style={{ color: '#075363', background: '#edf4f2' }}>
            <Layers size={20} />
          </span>
          <div>
            <strong>{publishedServices}</strong>
            <small>{t('overview.kpiPublishedServices')} ({totalServices} {t('overview.kpiTotalServices')})</small>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/feedback')} style={{ cursor: 'pointer' }}>
          <span className="stat-icon" style={{ color: '#b45309', background: '#fffbeb' }}>
            <MessageSquare size={20} />
          </span>
          <div>
            <strong>{totalFeedback}</strong>
            <small>{t('overview.kpiFeedback')} ({recentFeedback30Days} {t('overview.kpiRecent')})</small>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/accounts')} style={{ cursor: 'pointer' }}>
          <span className="stat-icon" style={{ color: '#047857', background: '#ecfdf5' }}>
            <Users size={20} />
          </span>
          <div>
            <strong>{totalUsers}</strong>
            <small>{t('overview.kpiStaff')}</small>
          </div>
        </div>
      </div>

      {/* Analytics Grid: Activity Chart & Satisfaction Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="catalog-card lg:col-span-8 p-0">
          <div className="catalog-heading">
            <div>
              <h2>{t('overview.engagementTitle')}</h2>
              <p>{t('overview.engagementSubtitle')}</p>
            </div>
          </div>
          <div className="p-5 pt-0">
            <ActivityChart
              period="this week"
              totalCount={totalFeedback}
              recentActivities={recentActivity?.data}
              feedbackReport={feedbackReport?.data}
            />
          </div>
        </section>

        <section className="catalog-card lg:col-span-4 p-0 flex flex-col justify-between">
          <div>
            <div className="catalog-heading">
              <div>
                <h2>{t('overview.satisfactionTitle')}</h2>
                <p>{t('overview.satisfactionSubtitle')}</p>
              </div>
            </div>
            <div className="p-5 pt-0">
              <SatisfactionPanel
                onNavigate={(p) => navigate(`/${p}`)}
                feedbackReport={feedbackReport?.data}
              />
            </div>
          </div>

          <div className="p-5 pt-3 border-t border-slate-100 mt-2 bg-slate-50/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">{t('overview.confidenceScore')}</span>
              <span className="font-bold text-emerald-700">{t('overview.highConfidence')}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Recent Activity Feed */}
      <section className="catalog-card p-0">
        <div className="catalog-heading">
          <div>
            <h2>{t('overview.auditStreamTitle')}</h2>
            <p>{t('overview.auditStreamSubtitle')}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/activity')}
            className="outline-button text-xs"
            style={{ minHeight: '34px', padding: '0 12px' }}
          >
            <span>{t('overview.fullAuditLog')}</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="p-5 pt-0">
          <RecentActivityFeed
            activities={recentActivity?.data}
            isLoading={activityLoading}
            onNavigate={(p) => navigate(`/${p}`)}
          />
        </div>
      </section>
    </div>
  );
};

export default OverviewPage;

