import { useContext } from 'react';
import { PortalContext } from './portalContextDef';
import type { PortalContextType } from './portalContextDef';

export const usePortal = (): PortalContextType => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};
