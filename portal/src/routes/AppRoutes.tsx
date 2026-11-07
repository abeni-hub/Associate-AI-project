import React from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { RoleGuard } from './RoleGuard';
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

const AdminRedirect: React.FC = () => {
  const { page } = useParams<{ role?: string; page?: string }>();
  return <Navigate to={`/${page || 'overview'}`} replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />

        {/* Directory / Offices - Accessible with organizations.view permission */}
        <Route
          path="offices"
          element={
            <RoleGuard allowedRoles={['super', 'subcity']} requiredPermission="organizations.view">
              <OfficesPage />
            </RoleGuard>
          }
        />
        <Route
          path="subcities"
          element={
            <RoleGuard allowedRoles={['super', 'subcity']} requiredPermission="organizations.view">
              <OfficesPage />
            </RoleGuard>
          }
        />
        <Route
          path="bureaus"
          element={
            <RoleGuard allowedRoles={['super', 'subcity']} requiredPermission="organizations.view">
              <OfficesPage />
            </RoleGuard>
          }
        />

        {/* Administration routes */}
        <Route
          path="accounts"
          element={
            <RoleGuard allowedRoles={['super', 'subcity']} requiredPermission="users.view">
              <AccountsPage />
            </RoleGuard>
          }
        />
        <Route
          path="roles"
          element={
            <RoleGuard allowedRoles={['super']} requiredPermission="roles.view">
              <RolesPermissionsPage />
            </RoleGuard>
          }
        />
        <Route
          path="levels"
          element={
            <RoleGuard allowedRoles={['super']} requiredPermission="organizations.view">
              <LevelsPage />
            </RoleGuard>
          }
        />
        <Route
          path="cms"
          element={
            <RoleGuard allowedRoles={['super']} requiredPermission="cms.manage">
              <LandingPageCms />
            </RoleGuard>
          }
        />
        <Route
          path="activity"
          element={
            <RoleGuard allowedRoles={['super']} requiredPermission="audit_logs.view">
              <ActivityPage />
            </RoleGuard>
          }
        />

        {/* News & notices */}
        <Route
          path="news/:id"
          element={
            <RoleGuard allowedRoles={['super', 'subcity']} requiredPermission="news.view">
              <NewsDetailPage />
            </RoleGuard>
          }
        />
        <Route
          path="news"
          element={
            <RoleGuard allowedRoles={['super', 'subcity']} requiredPermission="news.view">
              <NewsPage />
            </RoleGuard>
          }
        />

        {/* Service standards */}
        <Route
          path="services"
          element={
            <RoleGuard allowedRoles={['super', 'subcity']} requiredPermission="services.view">
              <ServicesPage />
            </RoleGuard>
          }
        />
        <Route
          path="documents"
          element={
            <RoleGuard allowedRoles={['super', 'subcity', 'bureau']} requiredPermission="documents.view">
              <DocumentsPage />
            </RoleGuard>
          }
        />

        {/* Bureau / Operations routes */}
        <Route
          path="routes"
          element={
            <RoleGuard allowedRoles={['super', 'bureau']} requiredPermission="service_steps.view">
              <RoutesPage />
            </RoleGuard>
          }
        />
        <Route
          path="qr"
          element={
            <RoleGuard allowedRoles={['super', 'bureau', 'subcity']} requiredPermission="qr_codes.view">
              <QRPage />
            </RoleGuard>
          }
        />
        <Route
          path="office"
          element={
            <RoleGuard allowedRoles={['super', 'bureau']} requiredPermission="services.view">
              <OfficePage />
            </RoleGuard>
          }
        />

        {/* Citizen Feedback */}
        <Route
          path="feedback"
          element={
            <RoleGuard requiredPermission={['feedback.view_own', 'feedback.view_descendants']}>
              <FeedbackPage />
            </RoleGuard>
          }
        />
      </Route>

      {/* Admin path redirect for backwards-compatibility */}
      <Route path="/admin/:role/:page" element={<AdminRedirect />} />
      <Route path="/admin/:role" element={<Navigate to="/overview" replace />} />
      <Route path="/admin" element={<Navigate to="/overview" replace />} />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
};
