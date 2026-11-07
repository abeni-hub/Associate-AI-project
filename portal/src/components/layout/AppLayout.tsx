import React, { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePortal } from '../../context';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Modal } from '../modals/Modal';
import { Icon } from '../shared/Icon';
import { useGetMeQuery } from '../../services/authApi';
import { tokenStorage } from '../../utils/tokenStorage';

export const AppLayout: React.FC = () => {
  const { session, modal, setModal, signInLive, signOut } = usePortal();
  const location = useLocation();

  const hasToken = tokenStorage.hasToken();

  // Validate live session with backend /auth/me when token is present
  const { data: meResponse, error: meError } = useGetMeQuery(undefined, {
    skip: !hasToken,
  });

  const syncedUserIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (meResponse?.success && meResponse.data) {
      // Only invoke signInLive if this user ID hasn't been synced yet
      if (syncedUserIdRef.current !== meResponse.data.id) {
        syncedUserIdRef.current = meResponse.data.id;
        signInLive(meResponse.data);
      }
    }
  }, [meResponse, signInLive]);

  useEffect(() => {
    if (meError) {
      const status = (meError as { status?: number })?.status;
      if (status === 401 || status === 403) {
        void signOut();
      }
    }
  }, [meError, signOut]);

  if (!hasToken || !session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">
        <Topbar />
        <div className="main-content" key={location.pathname}>
          <Outlet />
          <footer className="app-footer">
            <span>© 2026 CivicLink Ethiopia</span>
            <span>
              <Icon name="shield" size={13} /> Protected admin workspace
            </span>
            <span>
              Help center <Icon name="external" size={12} />
            </span>
          </footer>
        </div>
      </main>
      <Modal modal={modal} onClose={() => setModal(null)} />
    </div>
  );
};

export default AppLayout;
