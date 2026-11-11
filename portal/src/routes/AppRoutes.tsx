import React from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { RoleGuard, getFirstAuthorizedPath, AccessDeniedScreen } from './RoleGuard';
import { usePermissions } from '../hooks/usePermissions';
import { useGetSidebarNavigationQuery } from '../services/navigationApi';
import { tokenStorage } from '../utils/tokenStorage';
import {
  AccountsPage,
  ActivityPage,
  FeedbackPage,
  LandingPageCms,
  LoginPage,
  NewsPage,
  NewsDetailPage,
  OfficePage,
  OfficesPage,
  OverviewPage,
  QRPage,
  RolesPermissionsPage,
  RoutesPage,
  ServicesPage,
  LevelsPage,
  DocumentsPage,
} from '../pages';

const RootIndexRedirect: React.FC = () => {
  const { isSuperAdmin, hasPermission } = usePermissions();
  const hasToken = tokenStorage.hasToken();
  const { data: apiNavResponse, isLoading } = useGetSidebarNavigationQuery(undefined, {
    skip: !hasToken,
    refetchOnMountOrArgChange: true,
  });

  if (isSuperAdmin) {
    return <Navigate to="/overview" replace />;
  }

  if (isLoading && !apiNavResponse) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: '#64748b' }}>
        <span>Loading workspace…</span>
      </div>
    );
  }

  const firstPath = getFirstAuthorizedPath(apiNavResponse?.data, hasPermission);
  if (firstPath) {
    return <Navigate to={firstPath} replace />;
  }

  return <AccessDeniedScreen />;
};

const AdminRedirect: React.FC = () => {
  const { page } = useParams<{ role?: string; page?: string }>();
  return <Navigate to={page ? `/${page}` : '/'} replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<RootIndexRedirect />} />
        <Route
          path="overview"
          element={
            <RoleGuard requiredPermission="dashboard.view" pageKey="overview">
              <OverviewPage />
            </RoleGuard>
          }
        />

        {/* Directory / Offices - Accessible with organizations.view permission */}
        <Route
          path="offices"
          element={
            <RoleGuard allowedRoles={['super', 'subcity', 'bureau']} requiredPermission="organizations.view" pageKey="offices">
              <OfficesPage />
            </RoleGuard>
          }
        />
        <Route
          path="subcities"
          element={
            <RoleGuard allowedRoles={['super', 'subcity', 'bureau']} requiredPermission="organizations.view" pageKey="subcities">
              <OfficesPage />
            </RoleGuard>
          }
        />
        <Route
          path="bureaus"
          element={
            <RoleGuard allowedRoles={['super', 'subcity', 'bureau']} requiredPermission="organizations.view" pageKey="bureaus">
              <OfficesPage />
            </RoleGuard>
          }
        />

        {/* Administration routes */}
        <Route
          path="accounts"
          element={
            <RoleGuard allowedRoles={['super', 'subcity', 'bureau']} requiredPermission="users.view" pageKey="accounts">
              <AccountsPage />
            </RoleGuard>
          }
        />
        <Route
          path="roles"
          element={
            <RoleGuard allowedRoles={['super']} requiredPermission="roles.view" pageKey="roles">
              <RolesPermissionsPage />
            </RoleGuard>
          }
        />
        <Route
          path="levels"
          element={
            <RoleGuard allowedRoles={['super']} requiredPermission="organizations.view" pageKey="levels">
              <LevelsPage />
            </RoleGuard>
          }
        />
        <Route
          path="cms"
          element={
            <RoleGuard allowedRoles={['super']} requiredPermission="cms.manage" pageKey="cms">
              <LandingPageCms />
            </RoleGuard>
          }
        />
        <Route
          path="activity"
          element={
            <RoleGuard allowedRoles={['super']} requiredPermission="audit_logs.view" pageKey="activity">
              <ActivityPage />
            </RoleGuard>
          }
        />

        {/* News & notices */}
        <Route
          path="news/:id"
          element={
            <RoleGuard allowedRoles={['super', 'subcity', 'bureau']} requiredPermission="news.view" pageKey="news">
              <NewsDetailPage />
            </RoleGuard>
          }
        />
        <Route
          path="news"
          element={
            <RoleGuard allowedRoles={['super', 'subcity', 'bureau']} requiredPermission="news.view" pageKey="news">
              <NewsPage />
            </RoleGuard>
          }
        />

        {/* Service standards */}
        <Route
          path="services"
          element={
            <RoleGuard allowedRoles={['super', 'subcity', 'bureau']} requiredPermission="services.view" pageKey="services">
              <ServicesPage />
            </RoleGuard>
          }
        />
        <Route
          path="documents"
          element={
            <RoleGuard allowedRoles={['super', 'subcity', 'bureau']} requiredPermission="documents.view" pageKey="documents">
              <DocumentsPage />
            </RoleGuard>
          }
        />

        {/* Bureau / Operations routes */}
        <Route
          path="routes"
          element={
            <RoleGuard allowedRoles={['super', 'subcity', 'bureau']} requiredPermission="service_steps.view" pageKey="routes">
              <RoutesPage />
            </RoleGuard>
          }
        />
        <Route
          path="qr"
          element={
            <RoleGuard allowedRoles={['super', 'subcity', 'bureau']} requiredPermission="qr_codes.view" pageKey="qr">
              <QRPage />
            </RoleGuard>
          }
        />
        <Route
          path="office"
          element={
            <RoleGuard allowedRoles={['super', 'subcity', 'bureau']} requiredPermission="services.view" pageKey="office">
              <OfficePage />
            </RoleGuard>
          }
        />

        {/* Citizen Feedback */}
        <Route
          path="feedback"
          element={
            <RoleGuard requiredPermission={['feedback.view_own', 'feedback.view_descendants']} pageKey="feedback">
              <FeedbackPage />
            </RoleGuard>
          }
        />
      </Route>

      {/* Admin path redirect for backwards-compatibility */}
      <Route path="/admin/:role/:page" element={<AdminRedirect />} />
      <Route path="/admin/:role" element={<Navigate to="/" replace />} />
      <Route path="/admin" element={<Navigate to="/" replace />} />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
