import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AppLayout, usePermissions, useGetSidebarNavigationQuery } from '../features/shared';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { RoleGuard, getFirstAuthorizedPath, AccessDeniedScreen } from './RoleGuard';
import { RouteLoadingFallback } from './RouteLoadingFallback';
import { tokenStorage } from '../utils/tokenStorage';

/* =========================================================================
 * Route-Level Code Splitting (React.lazy)
 * ========================================================================= */
const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const OverviewPage = lazy(() => import('../features/dashboard/OverviewPage'));
const OfficesPage = lazy(() => import('../features/organizations/OfficesPage'));
const OfficePage = lazy(() => import('../features/organizations/OfficePage'));
const AccountsPage = lazy(() => import('../features/accounts/AccountsPage'));
const RolesPermissionsPage = lazy(() => import('../features/roles-permissions/RolesPermissionsPage'));
const LevelsPage = lazy(() => import('../features/organizations/LevelsPage'));
const LandingPageCms = lazy(() => import('../features/cms/LandingPageCms'));
const ActivityPage = lazy(() => import('../features/activity-logs/ActivityPage'));
const NewsPage = lazy(() => import('../features/news-events/NewsPage'));
const NewsDetailPage = lazy(() => import('../features/news-events/NewsDetailPage'));
const ServicesPage = lazy(() => import('../features/services/ServicesPage'));
const DocumentsPage = lazy(() => import('../features/documents/DocumentsPage'));
const RoutesPage = lazy(() => import('../features/services/RoutesPage'));
const QRPage = lazy(() => import('../features/qr-codes/QRPage'));
const FeedbackPage = lazy(() => import('../features/feedback/FeedbackPage'));

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

          {/* Administration & System */}
          <Route
            path="accounts"
            element={
              <RoleGuard
                allowedRoles={['super', 'subcity', 'bureau']}
                requiredPermission="users.view"
                pageKey="accounts"
              >
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
              <RoleGuard
                allowedRoles={['super']}
                requiredPermission="organizations.view"
                pageKey="levels"
              >
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
              <RoleGuard
                allowedRoles={['super']}
                requiredPermission="audit_logs.view"
                pageKey="activity"
              >
                <ActivityPage />
              </RoleGuard>
            }
          />

          {/* News & Communications */}
          <Route
            path="news/:id"
            element={
              <RoleGuard
                allowedRoles={['super', 'subcity', 'bureau']}
                requiredPermission="news.view"
                pageKey="news"
              >
                <NewsDetailPage />
              </RoleGuard>
            }
          />
          <Route
            path="news"
            element={
              <RoleGuard
                allowedRoles={['super', 'subcity', 'bureau']}
                requiredPermission="news.view"
                pageKey="news"
              >
                <NewsPage />
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

          {/* Operations & Physical Touchpoints */}
          <Route
            path="routes"
            element={
              <RoleGuard
                allowedRoles={['super', 'subcity', 'bureau']}
                requiredPermission="service_steps.view"
                pageKey="routes"
              >
                <RoutesPage />
              </RoleGuard>
            }
          />
          <Route
            path="qr"
            element={
              <RoleGuard
                allowedRoles={['super', 'subcity', 'bureau']}
                requiredPermission="qr_codes.view"
                pageKey="qr"
              >
                <QRPage />
              </RoleGuard>
            }
          />
          <Route
            path="office"
            element={
              <RoleGuard
                allowedRoles={['super', 'subcity', 'bureau']}
                requiredPermission="services.view"
                pageKey="office"
              >
                <OfficePage />
              </RoleGuard>
            }
          />

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
