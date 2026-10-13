import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { OrganizationProvider, useOrganization } from '@/contexts/org-context';
import { SignInPage } from '@/pages/auth/signin';
import { SignUpPage } from '@/pages/auth/signup';
import { WorkspaceSetupPage } from '@/pages/auth/setup';
import { OverviewPage } from '@/pages/overview';
import { JobsListPage } from '@/pages/jobs/jobs-list';
import { JobFormPage } from '@/pages/jobs/job-form';
import { JobDetailPage } from '@/pages/jobs/job-detail';
import { AnalysisPage } from '@/pages/analysis';
import { CandidatesListPage } from '@/pages/candidates/candidates-list';
import { CandidateDetailPage } from '@/pages/candidates/candidate-detail';
import { ReportsPage } from '@/pages/reports';
import { TeamPage } from '@/pages/team';
import { SettingsPage } from '@/pages/settings';
import { PageLoading } from '@/components/empty-states';
import { Toaster } from '@/components/ui/toaster';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoading />;
  if (!session) return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}

function SetupGate({ children }: { children: ReactNode }) {
  const { loading, organizations } = useOrganization();

  if (loading) return <PageLoading />;
  if (organizations.length === 0) return <Navigate to="/setup" replace />;
  return <>{children}</>;
}

function AuthRedirect({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <PageLoading />;
  if (session) return <Navigate to="/overview" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/signin" element={<AuthRedirect><SignInPage /></AuthRedirect>} />
      <Route path="/signup" element={<AuthRedirect><SignUpPage /></AuthRedirect>} />
      <Route path="/setup" element={<ProtectedRoute><WorkspaceSetupPage /></ProtectedRoute>} />

      {/* Protected routes */}
      <Route path="/overview" element={<ProtectedRoute><SetupGate><OverviewPage /></SetupGate></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute><SetupGate><JobsListPage /></SetupGate></ProtectedRoute>} />
      <Route path="/jobs/new" element={<ProtectedRoute><SetupGate><JobFormPage /></SetupGate></ProtectedRoute>} />
      <Route path="/jobs/:jobId" element={<ProtectedRoute><SetupGate><JobDetailPage /></SetupGate></ProtectedRoute>} />
      <Route path="/jobs/:jobId/edit" element={<ProtectedRoute><SetupGate><JobFormPage /></SetupGate></ProtectedRoute>} />
      <Route path="/analysis" element={<ProtectedRoute><SetupGate><AnalysisPage /></SetupGate></ProtectedRoute>} />
      <Route path="/candidates" element={<ProtectedRoute><SetupGate><CandidatesListPage /></SetupGate></ProtectedRoute>} />
      <Route path="/candidates/:candidateId" element={<ProtectedRoute><SetupGate><CandidateDetailPage /></SetupGate></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><SetupGate><ReportsPage /></SetupGate></ProtectedRoute>} />
      <Route path="/team" element={<ProtectedRoute><SetupGate><TeamPage /></SetupGate></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SetupGate><SettingsPage /></SetupGate></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/overview" replace />} />
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <OrganizationProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster />
        </BrowserRouter>
      </OrganizationProvider>
    </AuthProvider>
  );
}

export default App;
