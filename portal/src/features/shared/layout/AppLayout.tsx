import React, { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePortal } from '../hooks/usePortal';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Modal } from '../modals/Modal';
import { useGetMeQuery } from '../../auth';
import { SessionTimeoutDialog, restoreSessionDraft } from './SessionTimeoutDialog';
import { tokenStorage } from '../../../utils/tokenStorage';

export const AppLayout: React.FC = () => {
  const { session, modal, setModal, signInLive, signOut } = usePortal();
  const location = useLocation();

  const hasToken = tokenStorage.hasToken();

  // Validate live session with backend /auth/me when token is present
  const { data: meResponse, error: meError, isFetching } = useGetMeQuery(undefined, {
    skip: !hasToken,
    refetchOnMountOrArgChange: true,
  });

  const syncedDataRef = useRef<string>('');

  useEffect(() => {
    if (meResponse?.success && meResponse.data) {
      const dataStr = JSON.stringify(meResponse.data);
      if (syncedDataRef.current !== dataStr) {
        syncedDataRef.current = dataStr;
        signInLive(meResponse.data);
      }
    }
  }, [meResponse, signInLive]);

  useEffect(() => {
    if (meError && !isFetching) {
      const status = (meError as { status?: number })?.status;
      if (status === 401 || status === 403) {
        void signOut();
      }
    }
  }, [meError, isFetching, signOut]);

  const sessionUser = session?.user;
  const sessionPath = `${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    if (!sessionUser?.id) return;
    return restoreSessionDraft(sessionUser.id, sessionPath);
  }, [sessionPath, sessionUser?.id]);

  if (!hasToken || !sessionUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="app-shell portal-shell">
      <Sidebar />
      <main className="main-area">
        <Topbar />
        <div className="main-content content" key={location.pathname}>
          <Outlet />
          <footer className="app-footer page-footer">
            <span>© 2026 CivicLink Ethiopia</span>
            <span>·</span>
            <span>Unified Public Service Administration Platform</span>
          </footer>
        </div>
      </main>
      <Modal modal={modal} onClose={() => setModal(null)} />
      <SessionTimeoutDialog user={sessionUser} path={sessionPath} />
    </div>
  );
};

export default AppLayout;
