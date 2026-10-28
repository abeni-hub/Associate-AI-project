import LoginPage from '../../pages/LoginPage.jsx'
import { usePortalState } from '../../state/PortalStateContext.jsx'

function LoginScreen() {
  const { role, setRole, signInDemo } = usePortalState()
  return <LoginPage selectedRole={role} setSelectedRole={setRole} onLogin={signInDemo} />
}

export default LoginScreen
