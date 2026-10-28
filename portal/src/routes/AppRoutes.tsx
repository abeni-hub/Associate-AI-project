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
  OfficePage,
  OfficesPage,
  OverviewPage,
  QRPage,
  RolesPermissionsPage,
  RoutesPage,
  ServicesPage,
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

        {/* Directory / Offices - Accessible by Super Admin & Sub-city Admin */}
        <Route
          path="offices"
          element={
            <RoleGuard allowedRoles={['super', 'subcity']}>
              <OfficesPage />
            </RoleGuard>
          }
        />
        <Route
          path="subcities"
          element={
            <RoleGuard allowedRoles={['super', 'subcity']}>
              <OfficesPage />
            </RoleGuard>
          }
        />
        <Route
          path="bureaus"
          element={
            <RoleGuard allowedRoles={['super', 'subcity']}>
              <OfficesPage />
            </RoleGuard>
          }
        />

        {/* Super admin routes */}
        <Route
          path="accounts"
          element={
            <RoleGuard allowedRoles={['super']}>
              <AccountsPage />
            </RoleGuard>
          }
        />
        <Route
          path="roles"
          element={
            <RoleGuard allowedRoles={['super']}>
              <RolesPermissionsPage />
            </RoleGuard>
          }
        />
        <Route
          path="cms"
          element={
            <RoleGuard allowedRoles={['super']}>
              <LandingPageCms />
            </RoleGuard>
          }
        />
        <Route
          path="activity"
          element={
            <RoleGuard allowedRoles={['super']}>
              <ActivityPage />
            </RoleGuard>
          }
        />

        {/* News & notices - Super admin & Sub-city admin */}
        <Route
          path="news"
          element={
            <RoleGuard allowedRoles={['super', 'subcity']}>
              <NewsPage />
            </RoleGuard>
          }
        />

        {/* Sub-city admin routes */}
        <Route
          path="services"
          element={
            <RoleGuard allowedRoles={['subcity']}>
              <ServicesPage />
            </RoleGuard>
          }
        />

        {/* Bureau admin routes */}
        <Route
          path="routes"
          element={
            <RoleGuard allowedRoles={['bureau']}>
              <RoutesPage />
            </RoleGuard>
          }
        />
        <Route
          path="qr"
          element={
            <RoleGuard allowedRoles={['bureau']}>
              <QRPage />
            </RoleGuard>
          }
        />
        <Route
          path="office"
          element={
            <RoleGuard allowedRoles={['bureau']}>
              <OfficePage />
            </RoleGuard>
          }
        />

        {/* Shared routes across all roles */}
        <Route path="feedback" element={<FeedbackPage />} />
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
