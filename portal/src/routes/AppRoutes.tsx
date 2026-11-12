import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { RoleGuard, getFirstAuthorizedPath, AccessDeniedScreen } from './RoleGuard';
import { RouteLoadingFallback } from './RouteLoadingFallback';
import { tokenStorage } from '../utils/tokenStorage';
import {
  OverviewPage,
  ServicesPage,
  FeedbackPage,
  OfficesPage,
  DocumentsPage,
  RoutesPage,
  QRPage,
  NewsPage,
  NewsDetailPage,
  AccountsPage,
  RolesPermissionsPage,
  LevelsPage,
  LandingPageCms,
  ActivityPage,
} from '../features';
import { LoginPage, OfficePage } from '../pages';

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
    return <RouteLoadingFallback />;
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
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* Public Guest Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Protected Authenticated Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RootIndexRedirect />} />

          {/* Overview Dashboard */}
          <Route
            path="overview"
            element={
              <RoleGuard requiredPermission="dashboard.view" pageKey="overview">
                <OverviewPage />
              </RoleGuard>
            }
          />

          {/* Directory & Jurisdictions */}
          <Route
            path="offices"
            element={
              <RoleGuard
                allowedRoles={['super', 'subcity', 'bureau']}
                requiredPermission="organizations.view"
                pageKey="offices"
              >
                <OfficesPage />
              </RoleGuard>
            }
          />
          <Route
            path="subcities"
            element={
              <RoleGuard
                allowedRoles={['super', 'subcity', 'bureau']}
                requiredPermission="organizations.view"
                pageKey="subcities"
              >
                <OfficesPage />
              </RoleGuard>
            }
          />
          <Route
            path="bureaus"
            element={
              <RoleGuard
                allowedRoles={['super', 'subcity', 'bureau']}
                requiredPermission="organizations.view"
                pageKey="bureaus"
              >
                <OfficesPage />
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
            <RoleGuard requiredPermission="documents.view" pageKey="documents">
              <DocumentsPage />
            </RoleGuard>
          }
        />

        {/* Bureau / Operations room routes - commented out
        <Route
          path="routes"
          element={
            <RoleGuard allowedRoles={['super', 'subcity', 'bureau']} requiredPermission="service_steps.view" pageKey="routes">
              <RoutesPage />
            </RoleGuard>
          }
        />
        */}
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

          {/* Service Delivery & Standards */}
          <Route
            path="services"
            element={
              <RoleGuard
                allowedRoles={['super', 'subcity', 'bureau']}
                requiredPermission="services.view"
                pageKey="services"
              >
                <ServicesPage />
              </RoleGuard>
            }
          />
          <Route
            path="documents"
            element={
              <RoleGuard
                allowedRoles={['super', 'subcity', 'bureau']}
                requiredPermission="documents.view"
                pageKey="documents"
              >
                <DocumentsPage />
              </RoleGuard>
            }
          />

      {/* Admin path redirect for backwards-compatibility */}
      <Route path="/admin/:role/:page" element={<AdminRedirect />} />
      <Route path="/admin/:page" element={<AdminRedirect />} />
      <Route path="/admin/:role" element={<Navigate to="/" replace />} />
      <Route path="/admin" element={<Navigate to="/" replace />} />

          {/* Citizen Feedback */}
          <Route
            path="feedback"
            element={
              <RoleGuard
                requiredPermission={['feedback.view_own', 'feedback.view_descendants']}
                pageKey="feedback"
              >
                <FeedbackPage />
              </RoleGuard>
            }
          />
        </Route>

        {/* Legacy redirect aliases */}
        <Route path="/admin/:role/:page" element={<AdminRedirect />} />
        <Route path="/admin/:role" element={<Navigate to="/" replace />} />
        <Route path="/admin" element={<Navigate to="/" replace />} />

        {/* Fallback Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
