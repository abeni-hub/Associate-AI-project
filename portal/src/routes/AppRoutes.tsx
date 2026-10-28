import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { RoleGuard } from './RoleGuard';
import {
  AccountsPage,
  ActivityPage,
  BureausPage,
  FeedbackPage,
  LoginPage,
  NewsPage,
  OfficePage,
  OverviewPage,
  QRPage,
  RoutesPage,
  ServicesPage,
  SubcitiesPage,
} from '../pages';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />

        {/* Super admin routes */}
        <Route
          path="subcities"
          element={
            <RoleGuard allowedRoles={['super']}>
              <SubcitiesPage />
            </RoleGuard>
          }
        />
        <Route
          path="accounts"
          element={
            <RoleGuard allowedRoles={['super']}>
              <AccountsPage />
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

        {/* Sub-city admin routes */}
        <Route
          path="bureaus"
          element={
            <RoleGuard allowedRoles={['subcity']}>
              <BureausPage />
            </RoleGuard>
          }
        />
        <Route
          path="services"
          element={
            <RoleGuard allowedRoles={['subcity']}>
              <ServicesPage />
            </RoleGuard>
          }
        />
        <Route
          path="news"
          element={
            <RoleGuard allowedRoles={['subcity']}>
              <NewsPage />
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

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
};
