import { Navigate } from 'react-router'
import { usePortalState } from '../state/PortalStateContext.jsx'
import { portalPagePath } from './portalRoutes.js'
import LoginScreen from '../components/layout/LoginScreen.jsx'

export function PortalEntryRoute() {
  const { session } = usePortalState()
  return session ? <Navigate to={portalPagePath(session.role, 'overview')} replace /> : <LoginScreen />
}

export function PortalFallbackRoute() {
  const { session } = usePortalState()
  return session ? <Navigate to={portalPagePath(session.role, 'overview')} replace /> : <LoginScreen />
}
