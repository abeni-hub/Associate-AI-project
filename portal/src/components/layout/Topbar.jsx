import { useState } from 'react'
import Icon from '../ui/Icon.jsx'
import { ROLE } from '../../data/portalData.js'

function Topbar({ role, onMenu, onLogout }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const data = ROLE[role]
  return <header className="topbar">
    <div className="topbar-left"><button className="mobile-menu" onClick={onMenu} aria-label="Open navigation"><Icon name="menu" /></button><div className="breadcrumb"><span>{data.organization.split(' · ')[0]}</span><Icon name="chevron" size={13} /><b>Admin portal</b></div></div>
    <div className="topbar-tools">
      <div className="profile-anchor"><button className="top-profile" onClick={() => setProfileOpen(!profileOpen)}><span className="avatar small-avatar">{data.initials}</span><span><b>{data.name}</b><small>{data.label}</small></span><Icon name="chevron" size={14} /></button>{profileOpen && <div className="popover profile-popover"><div className="profile-popover-heading"><span className="avatar">{data.initials}</span><span><b>{data.name}</b><small>{data.organization}</small></span></div><button className="popover-link" onClick={onLogout}><Icon name="logout" size={15} /> Sign out</button></div>}</div>
    </div>
  </header>
}

export default Topbar
