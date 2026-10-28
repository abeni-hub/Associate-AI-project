import { NavLink } from 'react-router'
import Icon from '../ui/Icon.jsx'
import Brand from '../ui/Brand.jsx'
import { ROLE, NAV } from '../../data/portalData.js'
import { portalPagePath } from '../../routing/portalRoutes.js'

function Sidebar({ role, onNavigate, onLogout, mobileOpen, setMobileOpen }) {
  const data = ROLE[role]
  return <>
      <div className={`sidebar-backdrop${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)} />
      <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
      <div className="sidebar-brand-row"><Brand /><button className="sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><Icon name="close" /></button></div>
      <nav className="side-nav" aria-label="Admin navigation">
        <div className="side-nav-groups">
          {NAV[role].map((group) => <div className="nav-group" key={group.items[0]?.id ?? group.label}>{group.label && <span className="nav-group-label">{group.label}</span>}{group.items.map((item) => <NavLink key={item.id} to={portalPagePath(role, item.id)} end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={() => { onNavigate(); setMobileOpen(false) }}><Icon name={item.icon} size={18} /><span>{item.text}</span>{item.badge && <span className="nav-badge">{item.badge}</span>}</NavLink>)}</div>)}
        </div>
      </nav>
      <div className="sidebar-bottom">
        <div className="side-profile"><span className="avatar">{data.initials}</span><span className="profile-copy"><b>{data.name}</b><small>{data.label}</small></span><button className="logout-button" onClick={onLogout} title="Sign out" aria-label="Sign out"><Icon name="logout" size={16} /></button></div>
      </div>
    </aside>
  </>
}

export default Sidebar
