import React, { useState, useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePortal } from '../context';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Modal } from '../components/modals/Modal';
import { useGetMeQuery } from '../services/authApi';
import { tokenStorage } from '../utils/tokenStorage';

export const AppLayout: React.FC = () => {
  const { session, modal, setModal, signInLive, signOut } = usePortal();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const hasToken = tokenStorage.hasToken();

  // Validate live session with backend /auth/me when token is present
  const { data: meResponse, error: meError } = useGetMeQuery(undefined, {
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
    <div className="portal-shell">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <main className="main-area">
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <div className="content" key={location.pathname}>
          <Outlet />
          <footer className="page-footer">
            CivicLink Ethiopia <span>·</span> Unified Public Service Administration Platform
          </footer>
        </div>
      </main>
      <Modal modal={modal} onClose={() => setModal(null)} />
    </div>
  );
};

export default AppLayout;

