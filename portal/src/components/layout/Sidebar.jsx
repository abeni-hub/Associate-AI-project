import Icon from '../ui/Icon.jsx'
import Brand from '../ui/Brand.jsx'
import { ROLE, NAV } from '../../data/portalData.js'

function Sidebar({ role, activePage, setActivePage, onLogout, mobileOpen, setMobileOpen }) {
  const data = ROLE[role]
  return <>
    <div className={`sidebar-backdrop${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)} />
    <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
      <div className="sidebar-brand-row"><Brand /><button className="sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><Icon name="close" /></button></div>
      <div className="sidebar-workspace"><span className="workspace-avatar"><Icon name={role === 'super' ? 'globe' : role === 'subcity' ? 'map' : 'building'} size={17} /></span><span><small>YOUR WORKSPACE</small><b>{data.organization.split(' · ')[0]}</b></span><Icon name="chevron" size={15} /></div>
      <nav className="side-nav" aria-label="Admin navigation">
        {NAV[role].map((group) => <div className="nav-group" key={group.label}><span className="nav-group-label">{group.label}</span>{group.items.map((item) => <button key={item.id} className={`nav-item${activePage === item.id ? ' active' : ''}`} onClick={() => { setActivePage(item.id); setMobileOpen(false) }}><Icon name={item.icon} size={18} /><span>{item.text}</span>{item.badge && <span className="nav-badge">{item.badge}</span>}</button>)}</div>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card"><span className="help-card-icon"><Icon name="spark" size={16} /></span><b>Here to help</b><p>Need a hand with your workspace?</p><button onClick={() => window.alert('Your system support team can help with workspace access and setup.')}>Contact support <Icon name="arrow" size={14} /></button></div>
        <div className="side-profile"><span className="avatar">{data.initials}</span><span className="profile-copy"><b>{data.name}</b><small>{data.label}</small></span><button className="logout-button" onClick={onLogout} title="Sign out" aria-label="Sign out"><Icon name="logout" size={16} /></button></div>
      </div>
    </aside>
  </>
}

export default Sidebar
