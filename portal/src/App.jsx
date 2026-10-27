import { useMemo, useState } from 'react'
import './App.css'

const ROLE = {
  super: { label: 'Super admin', title: 'Platform administration', organization: 'CivicLink Ethiopia', name: 'Mekdes Tadesse', initials: 'MT' },
  subcity: { label: 'Sub-city admin', title: 'Sub-city administration', organization: 'Lemi Kura Sub-city', name: 'Aster Bekele', initials: 'AB' },
  bureau: { label: 'Bureau admin', title: 'Bureau operations', organization: 'Revenues Bureau · Lemi Kura', name: 'Dawit Alemu', initials: 'DA' },
}

const NAV = {
  super: [
    { label: 'Workspace', items: [{ id: 'overview', text: 'Overview', icon: 'overview' }, { id: 'subcities', text: 'Sub-cities', icon: 'map' }, { id: 'accounts', text: 'Accounts', icon: 'users' }] },
    { label: 'Platform', items: [{ id: 'feedback', text: 'Citizen feedback', icon: 'message', badge: '23' }, { id: 'activity', text: 'Activity log', icon: 'activity' }] },
  ],
  subcity: [
    { label: 'Workspace', items: [{ id: 'overview', text: 'Overview', icon: 'overview' }, { id: 'bureaus', text: 'Bureaus', icon: 'building' }, { id: 'services', text: 'Service standards', icon: 'layers' }] },
    { label: 'Community', items: [{ id: 'feedback', text: 'Citizen feedback', icon: 'message', badge: '8' }, { id: 'news', text: 'News & events', icon: 'news' }] },
  ],
  bureau: [
    { label: 'Workspace', items: [{ id: 'overview', text: 'Overview', icon: 'overview' }, { id: 'routes', text: 'Room routes', icon: 'route' }, { id: 'feedback', text: 'Citizen feedback', icon: 'message', badge: '5' }] },
    { label: 'Office tools', items: [{ id: 'qr', text: 'Feedback QR codes', icon: 'qr' }, { id: 'office', text: 'Office profile', icon: 'building' }] },
  ],
}

const INITIAL_SUBCITIES = [
  { id: 1, name: 'Lemi Kura', admin: 'Aster Bekele', bureaus: 9, services: 32, status: 'Active', updated: 'Today' },
  { id: 2, name: 'Bole', admin: 'Henok Girma', bureaus: 11, services: 41, status: 'Active', updated: 'Yesterday' },
  { id: 3, name: 'Yeka', admin: 'Mimi Tesfaye', bureaus: 8, services: 27, status: 'Active', updated: 'Oct 20, 2026' },
  { id: 4, name: 'Kirkos', admin: 'Solomon Worku', bureaus: 10, services: 36, status: 'Setup', updated: 'Oct 19, 2026' },
  { id: 5, name: 'Arada', admin: 'Rahel Kebede', bureaus: 7, services: 24, status: 'Active', updated: 'Oct 18, 2026' },
  { id: 6, name: 'Addis Ketema', admin: 'Abel Fikru', bureaus: 9, services: 29, status: 'Active', updated: 'Oct 17, 2026' },
  { id: 7, name: 'Gulele', admin: 'Samrawit Mamo', bureaus: 6, services: 21, status: 'Active', updated: 'Oct 16, 2026' },
  { id: 8, name: 'Kolfe Keranio', admin: 'Natnael Assefa', bureaus: 7, services: 25, status: 'Active', updated: 'Oct 15, 2026' },
  { id: 9, name: 'Lideta', admin: 'Hana Mekonnen', bureaus: 5, services: 19, status: 'Active', updated: 'Oct 14, 2026' },
  { id: 10, name: 'Akaki Kality', admin: 'Yohannes Daba', bureaus: 8, services: 28, status: 'Active', updated: 'Oct 13, 2026' },
  { id: 11, name: 'Nifas Silk-Lafto', admin: 'Marta Solomon', bureaus: 10, services: 33, status: 'Active', updated: 'Oct 12, 2026' },
]

const INITIAL_BUREAUS = [
  { id: 1, name: 'Revenues Bureau', category: 'Revenue & tax', admin: 'Dawit Alemu', services: 8, completion: 92, status: 'Published' },
  { id: 2, name: 'Civil Registration Office', category: 'Civil services', admin: 'Meseret Hailu', services: 12, completion: 84, status: 'Published' },
  { id: 3, name: 'Land Administration', category: 'Land & property', admin: 'Tewodros Kassa', services: 6, completion: 68, status: 'Needs attention' },
  { id: 4, name: 'Trade & Industry Office', category: 'Business services', admin: 'Selamawit Abate', services: 9, completion: 100, status: 'Published' },
  { id: 5, name: 'Planning & Development', category: 'Planning', admin: 'Biruk Getachew', services: 5, completion: 56, status: 'In progress' },
  { id: 6, name: 'Health Services Office', category: 'Health & wellbeing', admin: 'Liya Getu', services: 7, completion: 73, status: 'Published' },
  { id: 7, name: 'Housing & Settlements', category: 'Housing', admin: 'Kebede Fanta', services: 4, completion: 48, status: 'In progress' },
  { id: 8, name: 'Public Transport Office', category: 'Transport', admin: 'Saron Abebe', services: 3, completion: 82, status: 'Published' },
  { id: 9, name: 'Social Development Office', category: 'Community services', admin: 'Abel Girma', services: 6, completion: 61, status: 'Needs attention' },
]

const INITIAL_ACCOUNTS = [
  { id: 1, name: 'Aster Bekele', username: 'a.bekele', role: 'Sub-city admin', organization: 'Lemi Kura', status: 'Active', lastActive: 'Today, 9:42 AM' },
  { id: 2, name: 'Dawit Alemu', username: 'd.alemu', role: 'Bureau admin', organization: 'Revenues Bureau · Lemi Kura', status: 'Active', lastActive: 'Today, 9:18 AM' },
  { id: 3, name: 'Henok Girma', username: 'h.girma', role: 'Sub-city admin', organization: 'Bole', status: 'Active', lastActive: 'Yesterday' },
  { id: 4, name: 'Mimi Tesfaye', username: 'm.tesfaye', role: 'Sub-city admin', organization: 'Yeka', status: 'Active', lastActive: 'Oct 20, 2026' },
  { id: 5, name: 'Tewodros Kassa', username: 't.kassa', role: 'Bureau admin', organization: 'Land Administration · Lemi Kura', status: 'Pending', lastActive: 'Never' },
]

const INITIAL_SERVICES = [
  { id: 1, name: 'Business license renewal', category: 'Business services', serviceType: 'Main service', parentService: '', description: 'Renew an active trade license for the new business year.', documents: ['Valid trade license', 'Tax clearance certificate', 'Renewal application form'], bureaus: 8, published: true, customerExpectations: 'Bring a valid trade license, tax clearance and a completed renewal form.', bureauExpectations: 'Review complete applications within 3 working days and explain any missing items.' },
  { id: 2, name: 'Birth registration & certificate', category: 'Civil registration', serviceType: 'Main service', parentService: '', description: 'Register a child’s birth and receive the official certificate.', documents: ['Birth notification paper', 'Parent or guardian ID', 'Child’s full name and date of birth'], bureaus: 7, published: true, customerExpectations: 'Bring original documents where available and have the child’s full details ready.', bureauExpectations: 'Check the details with care and explain the next step clearly.' },
  { id: 3, name: 'Landholding record correction', category: 'Land & property', serviceType: 'Sub-service', parentService: 'Land administration', description: 'Request an update to an existing land record.', documents: ['Kebele ID or Fayda ID', 'Current landholding certificate', 'Correction request letter'], bureaus: 4, published: true, customerExpectations: 'Bring your current certificate and clearly identify the record that needs correction.', bureauExpectations: 'Acknowledge complete requests at the service desk and explain the review steps.' },
  { id: 4, name: 'e-TIN registration', category: 'Revenue & tax', serviceType: 'Main service', parentService: '', description: 'Register for or update a taxpayer identification number.', documents: ['Valid ID', 'Business registration, if applicable'], bureaus: 6, published: false, customerExpectations: 'Bring a valid ID and business registration when applicable.', bureauExpectations: 'Explain any missing requirements and where to complete them.' },
  { id: 5, name: 'Residence ID card', category: 'Civil registration', serviceType: 'Sub-service', parentService: 'Civil registration', description: 'Apply for a resident identification card or update your details.', documents: ['Proof of residence', 'Recent photograph', 'Valid ID'], bureaus: 5, published: true, customerExpectations: 'Bring proof of residence, one recent photograph and a valid ID.', bureauExpectations: 'Review applications in the order received and provide clear status information.' },
]

const INITIAL_ROUTES = [
  { id: 1, service: 'Business license renewal', category: 'Business services', bureau: 'Revenues Bureau', status: 'Published', updated: 'Oct 21, 2026', steps: [{ room: '03', title: 'Application review', detail: 'Submit your renewal documents for an initial check.' }, { room: '07', title: 'Payment desk', detail: 'Pay the service fee and keep your receipt.' }, { room: '09', title: 'License collection', detail: 'Collect your stamped renewed license.' }] },
  { id: 2, service: 'e-TIN registration', category: 'Revenue & tax', bureau: 'Revenues Bureau', status: 'Published', updated: 'Oct 20, 2026', steps: [{ room: '03', title: 'Document check', detail: 'An officer checks your ID and application.' }, { room: '05', title: 'Registration desk', detail: 'Complete your registration details.' }, { room: '09', title: 'Confirmation', detail: 'Receive your taxpayer identification confirmation.' }] },
  { id: 3, service: 'Tax clearance certificate', category: 'Revenue & tax', bureau: 'Revenues Bureau', status: 'Draft', updated: 'Oct 18, 2026', steps: [{ room: '03', title: 'Request review', detail: 'Present your account reference and request.' }, { room: '06', title: 'Account check', detail: 'An officer reviews your tax account.' }] },
  { id: 4, service: 'Business license amendment', category: 'Business services', bureau: 'Trade & Industry Office', status: 'Published', updated: 'Oct 17, 2026', steps: [{ room: '11', title: 'Submit change request', detail: 'Share your updated business information.' }, { room: '14', title: 'Verification', detail: 'The officer checks supporting documents.' }] },
]

const INITIAL_FEEDBACK = [
  { id: 'FB-2048', type: 'Complaint', rating: null, service: 'Business license renewal', bureau: 'Revenues Bureau', subcity: 'Lemi Kura', message: 'I had to visit two desks before finding out one supporting paper was missing. A clearer checklist at the entrance would help.', status: 'Open', priority: 'High', time: 'Today · 9:24 AM' },
  { id: 'FB-2047', type: 'Satisfaction', rating: 5, service: 'Birth registration', bureau: 'Civil Registration Office', subcity: 'Lemi Kura', message: 'The room guide was very clear and the staff helped us finish in one visit. Thank you.', status: 'Resolved', priority: 'Low', time: 'Today · 8:51 AM' },
  { id: 'FB-2046', type: 'Suggestion', rating: null, service: 'Landholding record correction', bureau: 'Land Administration', subcity: 'Lemi Kura', message: 'Could the office list the accepted document formats on the public guide?', status: 'In review', priority: 'Normal', time: 'Yesterday · 3:16 PM' },
  { id: 'FB-2045', type: 'Complaint', rating: null, service: 'e-TIN registration', bureau: 'Revenues Bureau', subcity: 'Bole', message: 'The payment desk was closed during the posted opening hours.', status: 'Open', priority: 'Normal', time: 'Yesterday · 1:40 PM' },
  { id: 'FB-2044', type: 'Satisfaction', rating: 4, service: 'Residence ID card', bureau: 'Civil Registration Office', subcity: 'Yeka', message: 'Clear instructions and a friendly team. The wait was a little longer than expected.', status: 'Resolved', priority: 'Low', time: 'Oct 20 · 11:03 AM' },
  { id: 'FB-2043', type: 'Suggestion', rating: null, service: 'Business license renewal', bureau: 'Revenues Bureau', subcity: 'Lemi Kura', message: 'An example of a completed renewal form would make it easier to prepare.', status: 'In review', priority: 'Normal', time: 'Oct 20 · 10:17 AM' },
]

const INITIAL_POSTS = [
  { id: 1, type: 'News', title: 'New service hours for the public holiday week', excerpt: 'All sub-city service desks will open from 8:30 AM to 4:30 PM during the upcoming public holiday week.', date: 'Oct 21, 2026', status: 'Published', audience: 'All residents' },
  { id: 2, type: 'Event', title: 'Community services information day', excerpt: 'Meet local bureau teams and learn how to prepare for the most requested services.', date: 'Oct 29, 2026', status: 'Published', audience: 'Lemi Kura residents' },
  { id: 3, type: 'News', title: 'Updated document checklist for business renewals', excerpt: 'The business license renewal guide now includes the latest supporting document requirements.', date: 'Oct 24, 2026', status: 'Draft', audience: 'Business owners' },
]

function Icon({ name, size = 18, strokeWidth = 1.8 }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const paths = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" /><path d="M9 3v15m6-12v15" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    building: <><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" /><path d="M9 9h.01M15 9h.01M9 12h.01M15 12h.01" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    message: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" /></>,
    activity: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
    news: <><path d="M4 5h16v15H4z" /><path d="M8 9h8M8 13h8M8 17h5" /></>,
    route: <><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18h3a4 4 0 0 0 4-4v-4a4 4 0 0 1 4-4" /></>,
    qr: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zm5 0h2m-7 5v2m5-3v3h3" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 13h4" /></>,
    chevron: <path d="m7 10 5 5 5-5" />,
    arrow: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></>,
    eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5m-5 5V3" /></>,
    external: <><path d="M14 3h7v7m0-7L10 14" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>,
    dots: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    logout: <><path d="M10 17l5-5-5-5m5 5H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z" /></>,
    filter: <><path d="M4 7h16M7 12h10m-7 5h4" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18m0-18a14 14 0 0 0 0 18" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  }
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" {...common}>{paths[name] || paths.spark}</svg>
}

function Brand({ compact = false }) {
  return <div className={`brand-lockup${compact ? ' compact' : ''}`}>
    <span className="brand-mark"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3.5 35 12v16L20 36.5 5 28V12L20 3.5Z" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M12 25V15h3.4l4.6 6 4.6-6H28v10h-3v-5.4l-5 6.2-5-6.2V25h-3Z" fill="currentColor"/><circle cx="32" cy="8" r="2.3" fill="var(--gold)"/></svg></span>
    {!compact && <span className="brand-wordmark"><strong>Civic<span>Link</span></strong><small>ETHIOPIA · SERVICE PORTAL</small></span>}
  </div>
}

function Login({ selectedRole, setSelectedRole, onLogin }) {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const submit = (event) => {
    event.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Enter your username and password, or choose a demo workspace below.')
      return
    }
    setError('This preview has no authentication service connected yet. Choose a demo workspace to explore the portal.')
  }

  return <main className="login-shell">
    <section className="login-story">
      <div className="login-story-inner">
        <Brand />
        <div className="story-copy">
          <div className="eyebrow inverse"><span className="eyebrow-line" />A CLEARER WAY TO SERVE</div>
          <h1>Every visit.<br /><em>Better informed.</em></h1>
          <p>One shared workspace for the people who keep public service information clear, useful, and up to date.</p>
        </div>
        <div className="story-card">
          <div className="story-card-orbit orbit-one" /><div className="story-card-orbit orbit-two" />
          <div className="story-card-heading"><span className="story-icon"><Icon name="route" size={19} /></span><span>THE CITIZEN JOURNEY</span><span className="live-dot" /></div>
          <div className="journey-track">
            <div className="journey-step"><span className="journey-node"><Icon name="check" size={13} /></span><span><b>Before the visit</b><small>Requirements & room guide</small></span></div>
            <span className="journey-line" />
            <div className="journey-step"><span className="journey-node"><Icon name="building" size={13} /></span><span><b>At the bureau</b><small>Clear, step-by-step service</small></span></div>
            <span className="journey-line" />
            <div className="journey-step"><span className="journey-node gold-node"><Icon name="message" size={13} /></span><span><b>After the visit</b><small>Feedback reaches the right team</small></span></div>
          </div>
          <div className="story-card-foot"><span>One connected service experience</span><span>01 — 03</span></div>
        </div>
        <div className="login-story-footer"><span><Icon name="shield" size={15} /> Role-based access for public service teams</span><span>ADDIS ABABA · ETHIOPIA</span></div>
      </div>
      <div className="story-pattern" aria-hidden="true"><span /><span /><span /><span /><span /><span /></div>
    </section>

    <section className="login-panel">
      <div className="login-panel-top"><span className="secure-label"><Icon name="lock" size={14} /> SECURE ADMIN ACCESS</span><span className="language-chip"><Icon name="globe" size={14} /> EN <Icon name="chevron" size={13} /></span></div>
      <div className="login-content">
        <div className="mobile-brand"><Brand /></div>
        <span className="login-kicker">WELCOME BACK</span>
        <h2>Sign in to your<br />workspace<span>.</span></h2>
        <p className="login-intro">Use your government account to manage service information and citizen feedback.</p>
        <form className="login-form" onSubmit={submit}>
          <label htmlFor="username">Username</label>
          <div className="input-shell"><Icon name="users" size={17} /><input id="username" autoComplete="username" placeholder="Enter your username" value={username} onChange={(e) => { setUsername(e.target.value); setError('') }} /></div>
          <div className="label-row"><label htmlFor="password">Password</label><button type="button" className="text-button" onClick={() => setError('Please contact your system administrator to reset your password.')}>Forgot password?</button></div>
          <div className="input-shell"><Icon name="lock" size={17} /><input id="password" autoComplete="current-password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => { setPassword(e.target.value); setError('') }} /><button aria-label={showPassword ? 'Hide password' : 'Show password'} type="button" className="input-action" onClick={() => setShowPassword(!showPassword)}><Icon name="eye" size={17} /></button></div>
          {error && <div className="login-error" role="status">{error}</div>}
          <button className="button primary login-submit" type="submit">Sign in <Icon name="arrow" size={17} /></button>
        </form>
        <div className="login-divider"><span />OR EXPLORE A DEMO WORKSPACE<span /></div>
        <p className="demo-prompt">Choose a role to preview its dashboard</p>
        <div className="demo-roles">
          {Object.entries(ROLE).map(([key, role]) => <button key={key} type="button" onClick={() => { setSelectedRole(key); onLogin(key) }} className={`demo-role${selectedRole === key ? ' selected' : ''}`}>
            <span className="demo-role-icon"><Icon name={key === 'super' ? 'shield' : key === 'subcity' ? 'map' : 'building'} size={17} /></span><span><b>{role.label}</b><small>{key === 'super' ? 'Platform-wide access' : key === 'subcity' ? 'Manage a sub-city' : 'Manage a bureau'}</small></span><Icon name="arrow" size={15} />
          </button>)}
        </div>
        <div className="prototype-note"><span className="note-dot" /> Preview environment <span className="note-separator">·</span> Sample information</div>
      </div>
      <div className="login-panel-footer"><span>© 2026 CivicLink Ethiopia</span><span>Public service information platform</span></div>
    </section>
  </main>
}

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

function Topbar({ role, onMenu, onLogout }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const data = ROLE[role]
  return <header className="topbar">
    <div className="topbar-left"><button className="mobile-menu" onClick={onMenu} aria-label="Open navigation"><Icon name="menu" /></button><div className="breadcrumb"><span>{data.organization.split(' · ')[0]}</span><Icon name="chevron" size={13} /><b>Admin portal</b></div></div>
    <div className="topbar-tools"><span className="sample-badge"><span /> Demo data</span><button className={`icon-button notification-button${notificationsOpen ? ' pressed' : ''}`} onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false) }} aria-label="Notifications"><Icon name="bell" size={18} /><i /></button>
      {notificationsOpen && <div className="popover notification-popover"><div className="popover-heading"><b>Notifications</b><span>2 new</span></div><div className="notification-item"><span className="notif-dot gold-bg" /><span><b>Feedback needs attention</b><small>Two complaints were received today</small></span></div><div className="notification-item"><span className="notif-dot sage-bg" /><span><b>Service guide updated</b><small>Business renewal · 1 hour ago</small></span></div><button className="popover-link" onClick={() => setNotificationsOpen(false)}>You're all caught up</button></div>}
      <span className="topbar-divider" />
      <div className="profile-anchor"><button className="top-profile" onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false) }}><span className="avatar small-avatar">{data.initials}</span><span><b>{data.name}</b><small>{data.label}</small></span><Icon name="chevron" size={14} /></button>{profileOpen && <div className="popover profile-popover"><div className="profile-popover-heading"><span className="avatar">{data.initials}</span><span><b>{data.name}</b><small>{data.organization}</small></span></div><button className="popover-link" onClick={onLogout}><Icon name="logout" size={15} /> Sign out</button></div>}</div>
    </div>
  </header>
}

function MetricCard({ icon, label, value, note, trend, tone = 'teal' }) {
  return <article className="metric-card"><div className="metric-top"><span className={`metric-icon ${tone}`}><Icon name={icon} size={18} /></span><span className="metric-menu"><Icon name="dots" size={17} /></span></div><div className="metric-value">{value}</div><div className="metric-label">{label}</div><div className="metric-foot"><span className={trend ? 'trend-up' : 'trend-neutral'}>{trend && <span>↗</span>} {note}</span></div></article>
}

function ActivityChart({ period }) {
  const data = period === 'This week' ? [42, 58, 47, 72, 60, 84, 66] : [51, 43, 61, 55, 70, 63, 58]
  const labels = ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu']
  const max = 100
  return <div className="chart-wrap">
    <div className="chart-summary"><div><span className="chart-total">{period === 'This week' ? '1,284' : '1,137'}</span><span className="chart-period">responses {period.toLowerCase()}</span></div><span className="chart-change"><Icon name="arrow" size={13} /> {period === 'This week' ? '12.8%' : '8.4%'} <small>vs previous week</small></span></div>
    <div className="chart" role="img" aria-label="Feedback responses increased through Wednesday, with a slight dip today.">
      <div className="chart-ylabels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
      <div className="chart-plot"><div className="chart-grid"><i /><i /><i /><i /><i /></div><svg viewBox="0 0 700 182" preserveAspectRatio="none" className="chart-svg"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#76a6a5" stopOpacity=".24" /><stop offset="100%" stopColor="#76a6a5" stopOpacity="0" /></linearGradient></defs><path d={data.map((n, i) => `${i ? 'L' : 'M'} ${(i / (data.length - 1)) * 680 + 10} ${170 - (n / max) * 155}`).join(' ') + ' L 690 182 L 10 182 Z'} fill="url(#chartFill)" /><path d={data.map((n, i) => `${i ? 'L' : 'M'} ${(i / (data.length - 1)) * 680 + 10} ${170 - (n / max) * 155}`).join(' ')} fill="none" stroke="#367b7d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />{data.map((n, i) => <circle key={i} cx={(i / (data.length - 1)) * 680 + 10} cy={170 - (n / max) * 155} r="4" fill="#fff" stroke="#367b7d" strokeWidth="2.5" />)}</svg><div className="chart-xlabels">{labels.map((label) => <span key={label}>{label}</span>)}</div></div>
    </div>
  </div>
}

function StatusPill({ children }) {
  const key = String(children).toLowerCase().replaceAll(' ', '-')
  return <span className={`status-pill status-${key}`}><i />{children}</span>
}

function TypePill({ type }) {
  const key = type.toLowerCase()
  return <span className={`type-pill type-${key}`}>{type === 'Satisfaction' ? '★' : type === 'Complaint' ? '!' : '↗'} <span>{type}</span></span>
}

function FeedbackTable({ items, onOpen, compact = false }) {
  return <div className="table-scroll"><table className="data-table feedback-table"><thead><tr><th>Feedback</th><th>Service & office</th><th>Received</th><th>Status</th><th aria-label="Actions" /></tr></thead><tbody>{items.slice(0, compact ? 4 : undefined).map((item) => <tr key={item.id} onClick={() => onOpen(item)} className="clickable-row"><td><div className="feedback-id"><b>{item.id}</b><TypePill type={item.type} /></div><p>{item.message}</p></td><td><b>{item.service}</b><small>{item.bureau} · {item.subcity}</small></td><td className="time-cell">{item.time}</td><td><StatusPill>{item.status}</StatusPill></td><td><button className="row-more" aria-label={`Open ${item.id}`} onClick={(e) => { e.stopPropagation(); onOpen(item) }}><Icon name="arrow" size={16} /></button></td></tr>)}</tbody></table>{items.length === 0 && <div className="empty-state"><span className="empty-icon"><Icon name="message" size={22} /></span><b>No feedback found</b><p>Try changing your filters or search terms.</p></div>}</div>
}

function Overview({ role, onNavigate, feedback, onFeedback, onCreate }) {
  const [period, setPeriod] = useState('This week')
  const info = role === 'super'
    ? { title: 'Good morning, Mekdes', subtitle: 'Here’s the latest across the citizen service platform.', metrics: [['map', 'Sub-cities', '11', 'All city administrations', ''], ['building', 'Bureaus', '86', 'Across all sub-cities', ''], ['layers', 'Published services', '248', '12 added this month', '12%'], ['message', 'Feedback to review', '156', '23 need attention', ''] ] }
    : role === 'subcity'
      ? { title: 'Good morning, Aster', subtitle: 'Here’s what’s happening across Lemi Kura today.', metrics: [['building', 'Active bureaus', '9', 'All bureau offices', ''], ['layers', 'Service guides', '32', '28 published to citizens', '8%'], ['message', 'Feedback this month', '284', '18% more than September', '18%'], ['clock', 'Needs your review', '8', '2 high-priority items', ''] ] }
      : { title: 'Good morning, Dawit', subtitle: 'A clear view of your office services and citizen experience.', metrics: [['layers', 'Service guides', '8', '6 published to citizens', ''], ['route', 'Room routes', '6', '1 route needs an update', ''], ['message', 'Feedback this month', '64', '12% more than September', '12%'], ['clock', 'Needs your review', '5', '1 high-priority item', ''] ] }
  const quick = role === 'super'
    ? [{ text: 'Add a sub-city', icon: 'map', page: 'subcities' }, { text: 'Create an account', icon: 'users', page: 'accounts' }, { text: 'Review feedback', icon: 'message', page: 'feedback' }]
    : role === 'subcity'
      ? [{ text: 'Add a bureau', icon: 'building', page: 'bureaus' }, { text: 'Create a service', icon: 'layers', page: 'services' }, { text: 'Post an update', icon: 'news', page: 'news' }]
      : [{ text: 'Update a room route', icon: 'route', page: 'routes' }, { text: 'Review feedback', icon: 'message', page: 'feedback' }, { text: 'Open QR codes', icon: 'qr', page: 'qr' }]
  const focus = role === 'super' ? feedback.filter((f) => f.status !== 'Resolved').slice(0, 3) : feedback.filter((f) => f.status !== 'Resolved' && (role === 'subcity' ? f.subcity === 'Lemi Kura' : f.bureau === 'Revenues Bureau' && f.subcity === 'Lemi Kura')).slice(0, 3)
  return <>
    <div className="page-heading dashboard-heading"><div><span className="eyebrow page-eyebrow"><span className="eyebrow-line" />THURSDAY, OCTOBER 22, 2026</span><h1>{info.title}<span>.</span></h1><p>{info.subtitle}</p></div><div className="heading-actions"><button className="button secondary" onClick={() => window.alert('Dashboard report is ready in this preview.') }><Icon name="download" size={16} /> Export report</button><button className="button primary" onClick={onCreate}><Icon name="plus" size={16} /> {role === 'super' ? 'New sub-city' : role === 'subcity' ? 'Add a bureau' : 'Update room route'}</button></div></div>
    <section className="metric-grid">{info.metrics.map(([icon, label, value, note, trend], i) => <MetricCard key={label} icon={icon} label={label} value={value} note={note} trend={trend} tone={['teal', 'sage', 'gold', 'blue'][i]} />)}</section>
    <section className="dashboard-grid">
      <article className="panel activity-panel"><div className="panel-heading"><div><span className="panel-eyebrow">PLATFORM PULSE</span><h2>Citizen engagement</h2></div><button className="select-like" onClick={() => setPeriod((current) => current === 'This week' ? 'Last week' : 'This week')}>{period} <Icon name="chevron" size={14} /></button></div><ActivityChart period={period} /></article>
      <article className="panel satisfaction-panel"><div className="panel-heading"><div><span className="panel-eyebrow">CITIZEN SENTIMENT</span><h2>Service satisfaction</h2></div><span className="subtle-icon"><Icon name="spark" size={17} /></span></div><div className="satisfaction-score"><strong>4.6</strong><span className="score-out-of">/ 5</span><span className="score-stars">★★★★★</span></div><p className="satisfaction-copy">Average citizen rating from the last 30 days</p><div className="rating-bars">{[['5', 68], ['4', 19], ['3', 8], ['2', 3], ['1', 2]].map(([n, width]) => <div className="rating-row" key={n}><span>{n} <i>★</i></span><div className="rating-track"><i style={{ width: `${width}%` }} /></div><small>{width}%</small></div>)}</div><button className="panel-link" onClick={() => onNavigate('feedback')}>Explore citizen feedback <Icon name="arrow" size={15} /></button></article>
    </section>
    <section className="dashboard-grid lower-grid">
      <article className="panel recent-panel"><div className="panel-heading"><div><span className="panel-eyebrow">VOICE OF THE COMMUNITY</span><h2>Feedback needing attention</h2></div><button className="panel-link" onClick={() => onNavigate('feedback')}>View all <Icon name="arrow" size={15} /></button></div><div className="focus-list">{focus.map((item) => <button key={item.id} className="focus-item" onClick={() => onFeedback(item)}><span className={`focus-type ${item.type.toLowerCase()}`}>{item.type === 'Complaint' ? '!' : '↗'}</span><span className="focus-copy"><span><b>{item.id}</b><TypePill type={item.type} /></span><p>{item.message}</p><small>{item.bureau} · {item.time}</small></span><span className={`priority-tag ${item.priority.toLowerCase()}`}>{item.priority}</span></button>)}{focus.length === 0 && <div className="quiet-state"><Icon name="check" />You’re all caught up.</div>}</div></article>
      <article className="panel quick-panel"><div className="panel-heading"><div><span className="panel-eyebrow">MOVE THINGS FORWARD</span><h2>Quick actions</h2></div></div><div className="quick-action-list">{quick.map((action) => <button key={action.text} onClick={() => { onNavigate(action.page); if (action.page === 'subcities' || action.page === 'bureaus' || action.page === 'services' || action.page === 'routes') onCreate(action.page) }}><span className="quick-action-icon"><Icon name={action.icon} size={17} /></span><b>{action.text}</b><Icon name="arrow" size={15} /></button>)}</div><div className="quick-foot"><span className="online-indicator" /> All systems operational <span>Updated moments ago</span></div></article>
    </section>
    <section className="panel table-panel overview-table"><div className="panel-heading"><div><span className="panel-eyebrow">LATEST RESPONSES</span><h2>Recent citizen feedback</h2></div><button className="panel-link" onClick={() => onNavigate('feedback')}>Open feedback inbox <Icon name="arrow" size={15} /></button></div><FeedbackTable items={feedback} onOpen={onFeedback} compact /></section>
    <p className="data-footnote">This dashboard shows illustrative sample information for the {ROLE[role].label.toLowerCase()} workspace.</p>
  </>
}

function SearchBox({ value, onChange, placeholder = 'Search' }) {
  return <label className="search-box"><Icon name="search" size={17} /><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />{value && <button type="button" onClick={() => onChange('')} aria-label="Clear search"><Icon name="close" size={14} /></button>}</label>
}

function SubcitiesPage({ items, onAdd, search, setSearch }) {
  const filtered = items.filter((item) => `${item.name} ${item.admin} ${item.status}`.toLowerCase().includes(search.toLowerCase()))
  return <>
    <PageHeading eyebrow="PLATFORM DIRECTORY" title="Sub-cities" subtitle="Create and oversee the local administrations connected to CivicLink." action="Add sub-city" onAction={onAdd} />
    <div className="directory-overview"><div className="directory-stat"><span className="directory-stat-icon"><Icon name="map" /></span><span><b>{items.length}</b><small>Connected sub-cities</small></span></div><div className="directory-stat"><span className="directory-stat-icon sage"><Icon name="building" /></span><span><b>86</b><small>Registered bureaus</small></span></div><div className="directory-stat"><span className="directory-stat-icon gold"><Icon name="users" /></span><span><b>10 / 11</b><small>Admins activated</small></span></div><div className="directory-stat directory-note"><span className="online-indicator" /><span><b>Platform is running smoothly</b><small>All services operational</small></span></div></div>
    <section className="panel table-panel"><div className="table-toolbar"><div><h2>Sub-city directory</h2><p>Manage local administrators and monitor setup progress.</p></div><div className="toolbar-tools"><SearchBox value={search} onChange={setSearch} placeholder="Search sub-cities" /><button className="button secondary small-button"><Icon name="filter" size={16} /> Filters</button></div></div><div className="table-scroll"><table className="data-table"><thead><tr><th>SUB-CITY</th><th>SUB-CITY ADMIN</th><th>BUREAUS</th><th>SERVICES</th><th>STATUS</th><th>LAST UPDATED</th><th /></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><div className="entity-cell"><span className="entity-icon"><Icon name="map" size={17} /></span><b>{item.name}</b></div></td><td><span className="table-person"><span className="mini-avatar">{item.admin.split(' ').map((n) => n[0]).join('')}</span>{item.admin}</span></td><td>{item.bureaus}</td><td>{item.services}</td><td><StatusPill>{item.status}</StatusPill></td><td className="time-cell">{item.updated}</td><td><button className="row-more" aria-label={`Manage ${item.name}`}><Icon name="dots" /></button></td></tr>)}</tbody></table>{!filtered.length && <div className="empty-state"><b>No sub-cities match</b><p>Try another search.</p></div>}</div><div className="table-footer"><span>Showing <b>{filtered.length}</b> of <b>{items.length}</b> sub-cities</span><div><button disabled>Previous</button><button>Next <Icon name="arrow" size={13} /></button></div></div></section>
    <div className="tip-banner"><span className="tip-icon"><Icon name="shield" size={17} /></span><span><b>Access stays in the right hands</b><small>Sub-city admins can manage only the bureaus, services and feedback in their own organization.</small></span><Icon name="arrow" size={15} /></div>
  </>
}

function PageHeading({ eyebrow, title, subtitle, action, onAction, secondary, onSecondary }) {
  return <div className="page-heading"><div><span className="eyebrow page-eyebrow"><span className="eyebrow-line" />{eyebrow}</span><h1>{title}<span>.</span></h1><p>{subtitle}</p></div><div className="heading-actions">{secondary && <button className="button secondary" onClick={onSecondary}><Icon name="download" size={16} />{secondary}</button>}{action && <button className="button primary" onClick={onAction}><Icon name="plus" size={16} />{action}</button>}</div></div>
}

function AccountsPage({ items, onAdd, search, setSearch }) {
  const [roleFilter, setRoleFilter] = useState('All roles')
  const filtered = items.filter((item) => (roleFilter === 'All roles' || item.role === roleFilter) && `${item.name} ${item.username} ${item.role} ${item.organization}`.toLowerCase().includes(search.toLowerCase()))
  return <>
    <PageHeading eyebrow="ACCESS & PERMISSIONS" title="Accounts" subtitle="Manage administrator access across every connected organization." action="Create account" onAction={onAdd} secondary="Export list" onSecondary={() => window.alert('Account list export is ready in this preview.')} />
    <div className="metric-grid compact-metrics"><MetricCard icon="users" label="Total accounts" value={items.length + 84} note="Across all workspaces" tone="teal" /><MetricCard icon="check" label="Active accounts" value={items.length + 81} note="Access confirmed" tone="sage" /><MetricCard icon="clock" label="Invitations pending" value="3" note="Awaiting first sign-in" tone="gold" /><MetricCard icon="shield" label="Access reviews" value="Due soon" note="3 reviews this month" tone="blue" /></div>
    <section className="panel table-panel"><div className="table-toolbar"><div><h2>Administrator accounts</h2><p>Role and organization determine what each admin can see and manage.</p></div><div className="toolbar-tools"><SearchBox value={search} onChange={setSearch} placeholder="Search accounts" /><select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filter by admin role"><option>All roles</option><option>Sub-city admin</option><option>Bureau admin</option></select></div></div><div className="table-scroll"><table className="data-table"><thead><tr><th>ACCOUNT</th><th>ROLE</th><th>ORGANIZATION</th><th>STATUS</th><th>LAST ACTIVE</th><th /></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><span className="table-person"><span className="mini-avatar">{item.name.split(' ').map((n) => n[0]).join('')}</span><span><b>{item.name}</b><small>@{item.username}</small></span></span></td><td><span className="role-tag">{item.role}</span></td><td>{item.organization}</td><td><StatusPill>{item.status}</StatusPill></td><td className="time-cell">{item.lastActive}</td><td><button className="row-more" aria-label={`Account options for ${item.name}`}><Icon name="dots" /></button></td></tr>)}</tbody></table></div><div className="table-footer"><span>Showing <b>{filtered.length}</b> accounts</span><div><button disabled>Previous</button><button>Next <Icon name="arrow" size={13} /></button></div></div></section>
    <div className="tip-banner"><span className="tip-icon"><Icon name="lock" size={17} /></span><span><b>Temporary credentials should be shared securely</b><small>Ask new admins to change their password the first time they sign in.</small></span></div>
  </>
}

function BureausPage({ items, onAdd, search, setSearch }) {
  const filtered = items.filter((item) => `${item.name} ${item.category} ${item.admin} ${item.status}`.toLowerCase().includes(search.toLowerCase()))
  return <>
    <PageHeading eyebrow="LEMI KURA · ORGANIZATION" title="Bureaus" subtitle="Manage bureau teams and track the information citizens can see." action="Add a bureau" onAction={onAdd} />
    <div className="metric-grid compact-metrics"><MetricCard icon="building" label="Registered bureaus" value={items.length} note="In this sub-city" tone="teal" /><MetricCard icon="check" label="Public guides" value="28" note="Visible to citizens" tone="sage" /><MetricCard icon="clock" label="Needs attention" value="2" note="Room guides incomplete" tone="gold" /><MetricCard icon="message" label="Feedback this month" value="284" note="Across all bureaus" tone="blue" /></div>
    <section className="panel table-panel"><div className="table-toolbar"><div><h2>Bureau directory</h2><p>Service readiness across the Lemi Kura administration.</p></div><div className="toolbar-tools"><SearchBox value={search} onChange={setSearch} placeholder="Find a bureau" /><button className="button secondary small-button"><Icon name="filter" size={16} /> Filters</button></div></div><div className="table-scroll"><table className="data-table bureau-table"><thead><tr><th>BUREAU / OFFICE</th><th>ADMINISTRATOR</th><th>SERVICES</th><th>GUIDE COMPLETION</th><th>STATUS</th><th /></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><div className="entity-cell"><span className="entity-icon"><Icon name="building" size={17} /></span><span><b>{item.name}</b><small>{item.category}</small></span></div></td><td><span className="table-person"><span className="mini-avatar">{item.admin.split(' ').map((n) => n[0]).join('')}</span>{item.admin}</span></td><td>{item.services} guides</td><td><div className="progress-cell"><span className="progress-track"><i style={{ width: `${item.completion}%` }} /></span><small>{item.completion}%</small></div></td><td><StatusPill>{item.status}</StatusPill></td><td><button className="row-more" aria-label={`Options for ${item.name}`}><Icon name="dots" /></button></td></tr>)}</tbody></table></div><div className="table-footer"><span>Showing <b>{filtered.length}</b> of <b>{items.length}</b> bureaus</span><div><button disabled>Previous</button><button>Next <Icon name="arrow" size={13} /></button></div></div></section>
    <div className="tip-banner"><span className="tip-icon"><Icon name="users" size={17} /></span><span><b>New bureau?</b><small>Create a bureau and assign its administrator. The bureau team can then set room-by-room steps for shared services.</small></span></div>
  </>
}

function ServicesPage({ items, onAdd, onEdit, search, setSearch, onTogglePublish }) {
  const [serviceFilter, setServiceFilter] = useState('All services')
  const filtered = items.filter((item) => (serviceFilter === 'All services' || (serviceFilter === 'Published' ? item.published : !item.published)) && `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(search.toLowerCase()))
  return <>
    <PageHeading eyebrow="SERVICE INFORMATION" title="Service standards" subtitle="Set clear, consistent requirements and expectations for every bureau in your sub-city." action="Create a service" onAction={onAdd} />
    <div className="service-intro"><div className="service-intro-mark"><Icon name="layers" size={23} /></div><div><b>One shared standard, every local office</b><p>These service definitions are shared with the bureaus below. Each bureau adds its own room numbers and step-by-step route.</p></div><span className="service-intro-count"><b>{items.length}</b><small>standards</small></span></div>
    <div className="service-toolbar"><SearchBox value={search} onChange={setSearch} placeholder="Search service standards" /><div>{['All services', 'Published', 'Drafts'].map((filter) => <button key={filter} className={`chip-button${serviceFilter === filter ? ' active' : ''}`} onClick={() => setServiceFilter(filter)}>{filter} {filter === 'All services' && <span>{items.length}</span>}</button>)}</div></div>
    <section className="service-list">{filtered.map((item) => <article className="panel service-card" key={item.id}><div className="service-card-main"><span className="service-card-icon"><Icon name="layers" size={20} /></span><div className="service-card-content"><div className="service-title-row"><span className="service-category">{item.category}</span><span className="service-level-tag">{item.serviceType || 'Main service'}{item.parentService ? ` · ${item.parentService}` : ''}</span><StatusPill>{item.published ? 'Published' : 'Draft'}</StatusPill></div><h2>{item.name}</h2><p>{item.description}</p><div className="service-meta"><span><Icon name="check" size={14} /> {item.documents.length} required documents</span><span><Icon name="building" size={14} /> Shared with {item.bureaus} bureaus</span></div><div className="document-chips">{item.documents.slice(0, 3).map((document) => <span key={document}><Icon name="check" size={11} />{document}</span>)}{item.documents.length > 3 && <small>+{item.documents.length - 3} more</small>}</div></div></div><div className="service-card-side"><button className="button secondary small-button" onClick={() => onEdit(item)}>Edit standard</button><button className={`publish-toggle${item.published ? ' is-on' : ''}`} aria-label={item.published ? 'Unpublish service' : 'Publish service'} onClick={() => onTogglePublish(item.id)}><i /></button></div><div className="service-expectation"><span>EXPECTATIONS</span><div><p><b>Citizen:</b> {item.customerExpectations}</p><p><b>Bureau:</b> {item.bureauExpectations}</p></div></div></article>)}{!filtered.length && <div className="panel empty-state"><b>No services found</b><p>Try another search or add a new standard.</p></div>}</section>
    <div className="tip-banner"><span className="tip-icon"><Icon name="route" size={17} /></span><span><b>Room numbers are managed by each bureau</b><small>Once shared, bureau admins can define and publish their location-specific service route.</small></span></div>
  </>
}

function RoutesPage({ items, onEdit, search, setSearch }) {
  const filtered = items.filter((item) => `${item.service} ${item.category} ${item.status}`.toLowerCase().includes(search.toLowerCase()))
  return <>
    <PageHeading eyebrow="BUREAU OPERATIONS" title="Room routes" subtitle="Give citizens a clear path through your office, one room at a time." secondary="Preview public guide" onSecondary={() => window.alert('Public guide preview is available when a citizen-facing site is connected.')} />
    <div className="route-summary"><div><span className="summary-icon"><Icon name="route" /></span><span><b>{items.length} service routes</b><small>Configured for Revenues Bureau</small></span></div><span className="summary-divider" /><div><span className="route-progress-big">75%</span><span><b>Route readiness</b><small>6 of 8 service guides are published</small></span></div><span className="summary-note"><i /> Citizens can see published routes</span></div>
    <div className="route-toolbar"><div><h2>Your service routes</h2><p>Room locations can be updated whenever your office layout changes.</p></div><SearchBox value={search} onChange={setSearch} placeholder="Search routes" /></div>
    <div className="route-grid">{filtered.map((item) => <article className="panel route-card" key={item.id}><div className="route-card-header"><span className="route-card-icon"><Icon name="route" size={18} /></span><StatusPill>{item.status}</StatusPill><button className="row-more" aria-label="Route actions"><Icon name="dots" /></button></div><span className="service-category">{item.category}</span><h3>{item.service}</h3><p className="route-card-office">{item.bureau} <span>·</span> Updated {item.updated}</p><div className="mini-route">{item.steps.map((step, index) => <div className="mini-route-step" key={`${item.id}-${step.room}`}><span className="mini-route-room">{step.room}</span><span className="mini-route-copy"><b>{step.title}</b><small>{step.detail}</small></span>{index < item.steps.length - 1 && <i className="mini-route-line" />}</div>)}</div><button className="route-edit-button" onClick={() => onEdit(item)}>{item.status === 'Draft' ? 'Finish this route' : 'Edit room sequence'} <Icon name="arrow" size={15} /></button></article>)}{!filtered.length && <div className="panel empty-state"><b>No room routes found</b><p>Try another search.</p></div>}</div>
    <div className="tip-banner"><span className="tip-icon"><Icon name="globe" size={17} /></span><span><b>Publishing keeps the citizen guide current</b><small>Review room numbers and directions after any change to your office layout.</small></span></div>
  </>
}

function FeedbackPage({ items, onOpen, search, setSearch, typeFilter, setTypeFilter, statusFilter, setStatusFilter }) {
  const filtered = items.filter((item) => (typeFilter === 'All types' || item.type === typeFilter) && (statusFilter === 'All statuses' || item.status === statusFilter) && `${item.id} ${item.message} ${item.service} ${item.bureau} ${item.subcity}`.toLowerCase().includes(search.toLowerCase()))
  return <>
    <PageHeading eyebrow="CITIZEN VOICE" title="Feedback inbox" subtitle="Read what citizens are saying and follow each item through to resolution." secondary="Export feedback" onSecondary={() => window.alert('Feedback export is ready in this preview.')} />
    <div className="metric-grid compact-metrics"><MetricCard icon="message" label="All responses" value={items.length + 48} note="This month" tone="teal" /><MetricCard icon="clock" label="Open" value={items.filter((x) => x.status === 'Open').length + 14} note="Waiting for a first response" tone="gold" /><MetricCard icon="activity" label="In review" value={items.filter((x) => x.status === 'In review').length + 7} note="Being followed up" tone="blue" /><MetricCard icon="check" label="Resolved" value="82%" note="Closed this month" tone="sage" /></div>
    <section className="panel table-panel feedback-inbox"><div className="table-toolbar"><div><h2>All citizen responses</h2><p>Feedback is routed to the relevant bureau and sub-city teams.</p></div><div className="toolbar-tools"><SearchBox value={search} onChange={setSearch} placeholder="Search feedback" /><select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option>All types</option><option>Complaint</option><option>Suggestion</option><option>Satisfaction</option></select><select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option>All statuses</option><option>Open</option><option>In review</option><option>Resolved</option></select></div></div><FeedbackTable items={filtered} onOpen={onOpen} /><div className="table-footer"><span>Showing <b>{filtered.length}</b> responses</span><div><button disabled>Previous</button><button>Next <Icon name="arrow" size={13} /></button></div></div></section>
    <div className="tip-banner"><span className="tip-icon"><Icon name="shield" size={17} /></span><span><b>Respectful follow-up builds trust</b><small>Share feedback only with the administrators responsible for its sub-city and bureau.</small></span></div>
  </>
}

function NewsPage({ items, onAdd, search, setSearch, onTogglePublish }) {
  const [typeFilter, setTypeFilter] = useState('All types')
  const filtered = items.filter((item) => (typeFilter === 'All types' || item.type === typeFilter) && `${item.title} ${item.type} ${item.audience} ${item.excerpt}`.toLowerCase().includes(search.toLowerCase()))
  return <>
    <PageHeading eyebrow="PUBLIC INFORMATION" title="News & events" subtitle="Keep residents informed with timely updates from Lemi Kura Sub-city." action="Create an update" onAction={onAdd} />
    <div className="news-feature"><div className="news-feature-content"><span className="news-feature-kicker"><Icon name="news" size={15} /> SUB-CITY NOTICEBOARD</span><h2>Good information<br /><em>brings us closer.</em></h2><p>Your updates appear on the public citizen landing page. Review content before publishing so residents always have clear, current information.</p><div className="news-feature-stats"><span><b>{items.length + 12}</b><small>updates this year</small></span><span><b>94%</b><small>published on time</small></span></div></div><div className="news-feature-art"><span className="art-sun" /><span className="art-hill hill-back" /><span className="art-hill hill-front" /><span className="art-building"><i /><i /><i /><i /><b /></span><span className="art-caption">LEMI KURA · COMMUNITY</span></div></div>
    <section className="panel table-panel news-list-panel"><div className="table-toolbar"><div><h2>Published updates & drafts</h2><p>Manage community news and upcoming public events.</p></div><div className="toolbar-tools"><SearchBox value={search} onChange={setSearch} placeholder="Search updates" /><select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Filter news by type"><option>All types</option><option>News</option><option>Event</option></select></div></div><div className="news-list">{filtered.map((item) => <article className="news-row" key={item.id}><span className={`news-type-icon ${item.type.toLowerCase()}`}><Icon name={item.type === 'Event' ? 'calendar' : 'news'} size={18} /></span><div className="news-row-copy"><div><span className="service-category">{item.type}</span><span className="news-row-date">{item.date}</span></div><h3>{item.title}</h3><p>{item.excerpt}</p><small>Audience: {item.audience}</small></div><div className="news-row-actions"><StatusPill>{item.status}</StatusPill><button className="button secondary small-button" onClick={() => onTogglePublish(item.id)}>{item.status === 'Published' ? 'Unpublish' : 'Publish'}</button><button className="row-more" aria-label={`More actions for ${item.title}`}><Icon name="dots" /></button></div></article>)}{!filtered.length && <div className="empty-state"><b>No updates found</b><p>Try another search.</p></div>}</div><div className="table-footer"><span>Showing <b>{filtered.length}</b> updates</span><div><button disabled>Previous</button><button>Next <Icon name="arrow" size={13} /></button></div></div></section>
  </>
}

function qrGfMultiply(a, b) {
  let result = 0
  for (let i = 7; i >= 0; i -= 1) {
    result = (result << 1) ^ ((result >>> 7) * 0x11d)
    result ^= ((b >>> i) & 1) * a
  }
  return result
}

function qrErrorCorrection(data, degree) {
  let generator = [1]
  let root = 1
  for (let i = 0; i < degree; i += 1) {
    const next = Array(generator.length + 1).fill(0)
    generator.forEach((coefficient, index) => {
      next[index] ^= coefficient
      next[index + 1] ^= qrGfMultiply(coefficient, root)
    })
    generator = next
    root = qrGfMultiply(root, 2)
  }
  const work = [...data, ...Array(degree).fill(0)]
  for (let i = 0; i < data.length; i += 1) {
    const factor = work[i]
    if (factor !== 0) generator.forEach((coefficient, offset) => { work[i + offset] ^= qrGfMultiply(coefficient, factor) })
  }
  return work.slice(data.length)
}

function feedbackQrMatrix(text) {
  // QR version 3-L: enough capacity for the office feedback URL and a quiet-zone-safe print.
  const size = 29
  const dataCapacity = 55
  const bits = []
  const appendBits = (value, count) => { for (let bit = count - 1; bit >= 0; bit -= 1) bits.push((value >>> bit) & 1) }
  const bytes = Array.from(new TextEncoder().encode(text))
  appendBits(0b0100, 4)
  appendBits(bytes.length, 8)
  bytes.forEach((byte) => appendBits(byte, 8))
  for (let i = 0; i < Math.min(4, dataCapacity * 8 - bits.length); i += 1) bits.push(0)
  while (bits.length % 8 !== 0) bits.push(0)
  const data = []
  for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((value, bit) => (value << 1) | bit, 0))
  for (let pad = 0; data.length < dataCapacity; pad += 1) data.push(pad % 2 === 0 ? 0xec : 0x11)
  const codewords = [...data, ...qrErrorCorrection(data, 15)]
  const matrix = Array.from({ length: size }, () => Array(size).fill(false))
  const reserved = Array.from({ length: size }, () => Array(size).fill(false))
  const setFunction = (x, y, dark) => { if (x >= 0 && y >= 0 && x < size && y < size) { matrix[y][x] = dark; reserved[y][x] = true } }
  const finder = (ox, oy) => {
    for (let dy = -1; dy <= 7; dy += 1) for (let dx = -1; dx <= 7; dx += 1) {
      const distance = Math.max(Math.abs(dx - 3), Math.abs(dy - 3))
      setFunction(ox + dx, oy + dy, distance === 3 || distance <= 1)
    }
  }
  finder(0, 0)
  finder(size - 7, 0)
  finder(0, size - 7)
  for (let dy = -2; dy <= 2; dy += 1) for (let dx = -2; dx <= 2; dx += 1) setFunction(22 + dx, 22 + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
  for (let i = 8; i < size - 8; i += 1) {
    setFunction(i, 6, i % 2 === 0)
    setFunction(6, i, i % 2 === 0)
  }
  const mask = (x, y) => (x + y) % 2 === 0
  const formatBits = ((1 << 3) | 0) << 10
  let remainder = formatBits
  for (let i = 14; i >= 10; i -= 1) if ((remainder >>> i) & 1) remainder ^= 0x537 << (i - 10)
  const format = (((1 << 3) | 0) << 10 | remainder) ^ 0x5412
  for (let i = 0; i <= 5; i += 1) setFunction(8, i, ((format >>> i) & 1) !== 0)
  setFunction(8, 7, ((format >>> 6) & 1) !== 0)
  setFunction(8, 8, ((format >>> 7) & 1) !== 0)
  setFunction(7, 8, ((format >>> 8) & 1) !== 0)
  for (let i = 9; i < 15; i += 1) setFunction(14 - i, 8, ((format >>> i) & 1) !== 0)
  for (let i = 0; i < 8; i += 1) setFunction(size - 1 - i, 8, ((format >>> i) & 1) !== 0)
  for (let i = 8; i < 15; i += 1) setFunction(8, size - 15 + i, ((format >>> i) & 1) !== 0)
  setFunction(8, size - 8, true)
  let bitIndex = 0
  let upward = true
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right -= 1
    for (let vert = 0; vert < size; vert += 1) {
      const y = upward ? size - 1 - vert : vert
      for (let offset = 0; offset < 2; offset += 1) {
        const x = right - offset
        if (!reserved[y][x]) {
          const bit = bitIndex < codewords.length * 8 ? (codewords[bitIndex >>> 3] >>> (7 - (bitIndex & 7))) & 1 : 0
          matrix[y][x] = Boolean(bit ^ Number(mask(x, y)))
          bitIndex += 1
        }
      }
    }
    upward = !upward
  }
  return matrix
}

function QRPattern({ data = 'https://civiclink.gov.et/feedback/rev-001' }) {
  const matrix = useMemo(() => feedbackQrMatrix(data), [data])
  const size = matrix.length
  const quietZone = 4
  return <svg className="qr-pattern" viewBox={`0 0 ${size + quietZone * 2} ${size + quietZone * 2}`} role="img" aria-label="Scannable QR code for the bureau feedback form"><rect width={size + quietZone * 2} height={size + quietZone * 2} fill="#fff" />{matrix.flatMap((row, y) => row.map((filled, x) => filled ? <rect key={`${x}-${y}`} x={x + quietZone} y={y + quietZone} width="1" height="1" fill="#06495a" /> : null))}</svg>
}

function QRPage({ onGenerate, onCopy }) {
  const [copied, setCopied] = useState(false)
  return <>
    <PageHeading eyebrow="CITIZEN ACCESS" title="Feedback QR codes" subtitle="Help citizens open the right feedback form from a poster or service desk." action="Generate QR code" onAction={onGenerate} />
    <div className="qr-hero panel"><div className="qr-hero-copy"><span className="panel-eyebrow">YOUR BUREAU · REVENUES BUREAU</span><h2>Make your voice<br /><em>easy to reach.</em></h2><p>Print this code and place it at your service desks. Citizens can scan it to share a complaint, suggestion or satisfaction rating about their visit.</p><div className="qr-hero-actions"><button className="button primary" onClick={() => window.print()}><Icon name="download" size={16} /> Print QR poster</button><button className="button secondary" onClick={() => { onCopy(); setCopied(true); setTimeout(() => setCopied(false), 1800) }}><Icon name="external" size={15} /> {copied ? 'Link copied' : 'Copy feedback link'}</button></div></div><div className="qr-preview-card"><span className="qr-corner corner-tl" /><span className="qr-corner corner-tr" /><span className="qr-corner corner-bl" /><QRPattern /><div className="qr-preview-caption"><b>Share your experience</b><small>Scan to leave feedback</small></div><span className="qr-live"><i /> ACTIVE</span></div><div className="qr-hero-glow" /></div>
    <div className="qr-stats-grid"><div className="panel qr-stat"><span className="metric-icon teal"><Icon name="qr" /></span><span><b>QR-REV-001</b><small>Active code ID</small></span><StatusPill>Active</StatusPill></div><div className="panel qr-stat"><span className="metric-icon gold"><Icon name="message" /></span><span><b>64 scans</b><small>Feedback visits this month</small></span><em>↗ 16%</em></div><div className="panel qr-stat"><span className="metric-icon sage"><Icon name="globe" /></span><span><b>Public feedback form</b><small>civiclink.gov.et/feedback/rev-001</small></span><button className="row-more" aria-label="Copy feedback link" onClick={() => { onCopy(); setCopied(true) }}><Icon name="external" size={16} /></button></div></div>
    <div className="panel qr-instructions"><div><span className="panel-eyebrow">A SIMPLE WAY TO LISTEN</span><h2>From scan to response</h2><p>Your QR code takes citizens to a guided feedback form. Responses appear in your bureau inbox and the sub-city dashboard.</p></div><div className="qr-flow"><div><span>01</span><Icon name="qr" /><b>Citizen scans</b><small>At your office</small></div><i /><div><span>02</span><Icon name="message" /><b>They share</b><small>Feedback in minutes</small></div><i /><div><span>03</span><Icon name="activity" /><b>Your team responds</b><small>In the admin inbox</small></div></div></div>
    <div className="tip-banner"><span className="tip-icon"><Icon name="shield" size={17} /></span><span><b>Keep printed codes easy to find</b><small>Place the QR poster near the exit or service desk, with clear instructions in the languages your citizens use.</small></span></div>
  </>
}

function OfficePage() {
  return <>
    <PageHeading eyebrow="BUREAU SETTINGS" title="Office profile" subtitle="Keep your bureau details clear and consistent for the citizens you serve." action="Edit profile" onAction={() => window.alert('Office profile editing is available in a connected backend.')} />
    <section className="panel office-profile-card"><div className="office-profile-banner"><span className="office-emblem"><Icon name="building" size={28} /></span><span className="office-status"><i /> ACTIVE BUREAU</span></div><div className="office-profile-body"><div><span className="panel-eyebrow">LEMI KURA SUB-CITY · PUBLIC OFFICE</span><h2>Revenues Bureau</h2><p>Support for tax registration, payments, clearance and business revenue services.</p></div><div className="office-detail-grid"><div><small>PUBLIC SERVICE HOURS</small><b>Monday – Friday · 8:30 AM – 5:30 PM</b></div><div><small>LOCATION</small><b>Lemi Kura Sub-city, Addis Ababa</b></div><div><small>BUREAU ADMINISTRATOR</small><b>Dawit Alemu</b></div><div><small>PUBLIC CONTACT</small><b>+251 11 000 0000</b></div></div><div className="office-profile-note"><Icon name="info" size={16} /> Public profile changes should be reviewed by your sub-city administrator before publishing.</div></div></section>
  </>
}

function ActivityPage() {
  const events = [['Today · 10:14 AM', 'Service standard published', 'Business license renewal · Lemi Kura', 'sage'], ['Today · 9:42 AM', 'Sub-city admin signed in', 'Aster Bekele · Lemi Kura', 'teal'], ['Today · 9:24 AM', 'New complaint received', 'Feedback FB-2048 · Revenues Bureau', 'gold'], ['Yesterday · 4:06 PM', 'New bureau added', 'Planning & Development · Kirkos', 'blue'], ['Oct 20 · 2:31 PM', 'Account invitation created', 'Tewodros Kassa · Lemi Kura', 'teal'], ['Oct 20 · 11:18 AM', 'Citizen guide updated', 'Residence ID card · Yeka', 'sage']]
  return <><PageHeading eyebrow="PLATFORM OVERSIGHT" title="Activity log" subtitle="A clear record of the updates and access events across CivicLink." secondary="Download log" onSecondary={() => window.alert('Activity log download is ready in this preview.')} /><div className="panel activity-log"><div className="table-toolbar"><div><h2>Recent platform activity</h2><p>Showing updates from the past 30 days.</p></div><button className="button secondary small-button"><Icon name="filter" size={16} /> All activity</button></div><div className="log-list">{events.map(([time, title, detail, tone], i) => <div className="log-item" key={`${title}-${i}`}><span className={`log-icon ${tone}`}><Icon name={title.includes('signed') ? 'users' : title.includes('complaint') ? 'message' : title.includes('Account') ? 'lock' : title.includes('bureau') ? 'building' : 'layers'} size={16} /></span><div><b>{title}</b><p>{detail}</p></div><small>{time}</small></div>)}</div></div></> 
}

function ModalForm({ modal, onClose }) {
  const [values, setValues] = useState(() => Object.fromEntries(modal.fields.map((field) => [field.name, field.value || ''])))
  const update = (name, value) => setValues((current) => ({ ...current, [name]: value }))
  return <form onSubmit={(event) => { event.preventDefault(); modal.onSubmit(values); onClose() }}><div className="modal-header"><div><span className="panel-eyebrow">{modal.eyebrow || 'WORKSPACE UPDATE'}</span><h2>{modal.title}</h2><p>{modal.description}</p></div><button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button></div><div className="modal-form-grid">{modal.fields.map((field) => <label className={`modal-field${field.full ? ' full' : ''}`} key={field.name}><span>{field.label}{field.required && <i> *</i>}</span>{field.type === 'select' ? <select required={field.required} value={values[field.name]} onChange={(e) => update(field.name, e.target.value)}><option value="" disabled>Select {field.label.toLowerCase()}</option>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select> : field.type === 'textarea' ? <textarea required={field.required} rows={field.rows || 3} placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`} value={values[field.name]} onChange={(e) => update(field.name, e.target.value)} /> : <input required={field.required} type={field.type || 'text'} placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`} value={values[field.name]} onChange={(e) => update(field.name, e.target.value)} />}</label>)}</div><div className="modal-footer"><span><Icon name="lock" size={14} /> Changes are limited to your workspace.</span><div><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" type="submit">{modal.submit || 'Save changes'} <Icon name="arrow" size={15} /></button></div></div></form>
}

function RouteEditor({ route, onClose, onSave }) {
  const [steps, setSteps] = useState(() => route.steps.map((step) => ({ ...step })))
  const update = (index, key, value) => setSteps((items) => items.map((step, i) => i === index ? { ...step, [key]: value } : step))
  return <div><div className="modal-header"><div><span className="panel-eyebrow">ROOM-BY-ROOM GUIDE · {route.category.toUpperCase()}</span><h2>Edit route</h2><p>{route.service}</p></div><button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button></div><div className="route-editor-list">{steps.map((step, index) => <div className="route-editor-step" key={index}><span className="route-editor-index">{String(index + 1).padStart(2, '0')}</span><label><span>Room number</span><input value={step.room} onChange={(e) => update(index, 'room', e.target.value)} aria-label={`Room number for step ${index + 1}`} /></label><label><span>Step name</span><input value={step.title} onChange={(e) => update(index, 'title', e.target.value)} aria-label={`Step name for step ${index + 1}`} /></label><button className="remove-step" aria-label="Remove step" onClick={() => setSteps((items) => items.filter((_, i) => i !== index))}><Icon name="close" size={16} /></button><label className="step-description"><span>Citizen instructions</span><input value={step.detail} onChange={(e) => update(index, 'detail', e.target.value)} aria-label={`Instructions for step ${index + 1}`} /></label></div>)}</div><button className="add-step-button" onClick={() => setSteps((items) => [...items, { room: '', title: '', detail: '' }])}><Icon name="plus" size={15} /> Add another step</button><div className="modal-footer"><span><Icon name="globe" size={14} /> Published guides appear on the citizen page.</span><div><button className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" onClick={() => { onSave(steps); onClose() }}>Save route <Icon name="arrow" size={15} /></button></div></div></div>
}

function FeedbackDetail({ item, onClose, onUpdate }) {
  const [status, setStatus] = useState(item.status)
  return <div><div className="modal-header"><div><span className="panel-eyebrow">CITIZEN RESPONSE · {item.id}</span><h2>{item.type} received</h2><p>{item.time} · {item.subcity}</p></div><button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button></div><div className="feedback-detail-body"><div className="detail-context"><span><small>SERVICE</small><b>{item.service}</b></span><span><small>BUREAU</small><b>{item.bureau}</b></span>{item.rating && <span><small>CITIZEN RATING</small><b className="detail-stars">{'★'.repeat(item.rating)}<i>{'★'.repeat(5 - item.rating)}</i> <span>{item.rating}.0 / 5</span></b></span>}</div><blockquote>“{item.message}”</blockquote><label className="detail-status-label">Follow-up status<select value={status} onChange={(e) => setStatus(e.target.value)}><option>Open</option><option>In review</option><option>Resolved</option></select></label><div className="feedback-routing-note"><Icon name="shield" size={16} /><span><b>Routed to authorized teams</b><small>Visible to {item.subcity} Sub-city Admin and {item.bureau} Admin</small></span></div></div><div className="modal-footer"><span><Icon name="lock" size={14} /> Citizen details are kept private.</span><div><button className="button secondary" onClick={onClose}>Close</button><button className="button primary" onClick={() => { onUpdate(status); onClose() }}>Save follow-up <Icon name="check" size={15} /></button></div></div></div>
}

function QRDialog({ onClose, onGenerate }) {
  return <div><div className="modal-header"><div><span className="panel-eyebrow">BUREAU FEEDBACK ACCESS</span><h2>Your QR code is ready</h2><p>Use this code to guide citizens directly to the feedback form.</p></div><button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button></div><div className="qr-dialog-body"><QRPattern data="https://civiclink.gov.et/feedback/rev-002" /><div><b>QR-REV-002</b><p>Revenues Bureau · Lemi Kura</p><StatusPill>Active</StatusPill></div></div><div className="modal-footer"><span><Icon name="globe" size={14} /> Citizens can scan without an account.</span><div><button className="button secondary" onClick={onClose}>Close</button><button className="button primary" onClick={() => { onGenerate(); onClose() }}><Icon name="download" size={15} /> Save code</button></div></div></div>
}

function Modal({ modal, onClose }) {
  if (!modal) return null
  return <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}><section className={`modal-card modal-${modal.kind}`} role="dialog" aria-modal="true" aria-label={modal.title || modal.item?.type || 'Workspace dialog'}>{modal.kind === 'form' ? <ModalForm modal={modal} onClose={onClose} /> : modal.kind === 'route' ? <RouteEditor route={modal.route} onClose={onClose} onSave={modal.onSave} /> : modal.kind === 'feedback' ? <FeedbackDetail item={modal.item} onClose={onClose} onUpdate={modal.onUpdate} /> : <QRDialog onClose={onClose} onGenerate={modal.onGenerate} />}</section></div>
}

function App() {
  const [role, setRole] = useState('super')
  const [session, setSession] = useState(null)
  const [activePage, setActivePage] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [modal, setModal] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All types')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [subcities, setSubcities] = useState(INITIAL_SUBCITIES)
  const [bureaus, setBureaus] = useState(INITIAL_BUREAUS)
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS)
  const [services, setServices] = useState(INITIAL_SERVICES)
  const [routes, setRoutes] = useState(INITIAL_ROUTES)
  const [feedback, setFeedback] = useState(INITIAL_FEEDBACK)
  const [posts, setPosts] = useState(INITIAL_POSTS)
  const [, setCopiedLink] = useState(false)

  const resetSearch = () => { setSearch(''); setTypeFilter('All types'); setStatusFilter('All statuses') }
  const navigate = (page) => { setActivePage(page); resetSearch() }
  const signInDemo = (selected) => { setRole(selected); setSession({ role: selected }); setActivePage('overview'); resetSearch() }
  const signOut = () => { setSession(null); setActivePage('overview'); setModal(null) }

  const openForm = (config) => setModal({ kind: 'form', ...config })
  const openFeedback = (item) => setModal({ kind: 'feedback', item, onUpdate: (status) => setFeedback((list) => list.map((entry) => entry.id === item.id ? { ...entry, status } : entry)) })

  const createForPage = (page = activePage) => {
    if (page === 'subcities') return openForm({ eyebrow: 'PLATFORM DIRECTORY', title: 'Add a sub-city', description: 'Create a local workspace and invite its administrator.', submit: 'Create sub-city', fields: [{ name: 'name', label: 'Sub-city name', required: true }, { name: 'admin', label: 'Administrator name', required: true }, { name: 'username', label: 'Admin username', required: true }, { name: 'email', label: 'Work email', type: 'email', required: true }] , onSubmit: (v) => { setSubcities((list) => [{ id: Date.now(), name: v.name, admin: v.admin, bureaus: 0, services: 0, status: 'Setup', updated: 'Just now' }, ...list]); setAccounts((list) => [{ id: Date.now() + 1, name: v.admin, username: v.username, role: 'Sub-city admin', organization: v.name, status: 'Pending', lastActive: 'Never' }, ...list]) } })
    if (page === 'bureaus') return openForm({ eyebrow: 'LEMI KURA · ORGANIZATION', title: 'Add a bureau', description: 'Register an office and assign a bureau administrator.', submit: 'Create bureau', fields: [{ name: 'name', label: 'Bureau name', required: true }, { name: 'category', label: 'Service category', placeholder: 'e.g. Civil registration' }, { name: 'admin', label: 'Administrator name', required: true }, { name: 'username', label: 'Admin username', required: true }, { name: 'email', label: 'Work email', type: 'email', required: true }], onSubmit: (v) => { setBureaus((list) => [{ id: Date.now(), name: v.name, category: v.category || 'Public services', admin: v.admin, services: 0, completion: 0, status: 'In progress' }, ...list]); setAccounts((list) => [{ id: Date.now() + 1, name: v.admin, username: v.username, role: 'Bureau admin', organization: `${v.name} · Lemi Kura`, status: 'Pending', lastActive: 'Never' }, ...list]) } })
    if (page === 'accounts') return openForm({ eyebrow: 'ACCESS & PERMISSIONS', title: 'Create an account', description: 'Assign a role and organization to give an administrator the right workspace.', submit: 'Create account', fields: [{ name: 'name', label: 'Full name', required: true }, { name: 'username', label: 'Username', required: true }, { name: 'email', label: 'Work email', type: 'email', required: true }, { name: 'role', label: 'Admin role', type: 'select', required: true, options: ['Sub-city admin', 'Bureau admin'] }, { name: 'organization', label: 'Organization', required: true }, { name: 'password', label: 'Temporary password', placeholder: 'Set a temporary password', required: true }], onSubmit: (v) => setAccounts((list) => [{ id: Date.now(), name: v.name, username: v.username, role: v.role, organization: v.organization, status: 'Pending', lastActive: 'Never' }, ...list]) })
    if (page === 'services') return openForm({ eyebrow: 'SERVICE INFORMATION', title: 'Create a service standard', description: 'Define the service, required documents and expectations on both sides.', submit: 'Save service', fields: [{ name: 'name', label: 'Service name', required: true }, { name: 'serviceType', label: 'Service level', type: 'select', required: true, options: ['Main service', 'Sub-service'] }, { name: 'parentService', label: 'Parent service', placeholder: 'Required for a sub-service' }, { name: 'category', label: 'Category', placeholder: 'e.g. Civil registration' }, { name: 'description', label: 'What this service does', type: 'textarea', full: true, required: true }, { name: 'documents', label: 'Required documents', type: 'textarea', full: true, rows: 3, placeholder: 'Add one document per line' }, { name: 'customerExpectations', label: 'What the citizen should prepare or do', type: 'textarea', full: true, required: true }, { name: 'bureauExpectations', label: 'What the bureau commits to', type: 'textarea', full: true, required: true }], onSubmit: (v) => setServices((list) => [{ id: Date.now(), name: v.name, serviceType: v.serviceType, parentService: v.parentService, category: v.category || 'Public service', description: v.description, documents: (v.documents || '').split('\n').filter(Boolean), bureaus: 0, published: false, customerExpectations: v.customerExpectations, bureauExpectations: v.bureauExpectations }, ...list]) })
    if (page === 'news') return openForm({ eyebrow: 'PUBLIC INFORMATION', title: 'Create an update', description: 'Share an official announcement or upcoming event with your community.', submit: 'Save update', fields: [{ name: 'type', label: 'Update type', type: 'select', required: true, options: ['News', 'Event'] }, { name: 'title', label: 'Title', required: true }, { name: 'date', label: 'Publish or event date', type: 'date', required: true }, { name: 'audience', label: 'Audience', placeholder: 'e.g. All residents' }, { name: 'excerpt', label: 'What residents should know', type: 'textarea', full: true, required: true }, { name: 'status', label: 'Save as', type: 'select', required: true, options: ['Draft', 'Published'] }], onSubmit: (v) => setPosts((list) => [{ id: Date.now(), type: v.type, title: v.title, excerpt: v.excerpt, date: v.date, status: v.status, audience: v.audience || 'All residents' }, ...list]) })
    if (page === 'routes') return setModal({ kind: 'route', route: routes[0], onSave: (steps) => setRoutes((list) => list.map((route) => route.id === routes[0]?.id ? { ...route, steps, status: 'Draft', updated: 'Just now' } : route)) })
    return null
  }

  const onUpdateService = (item) => openForm({ eyebrow: 'SERVICE INFORMATION', title: 'Edit service standard', description: 'Update the service description, checklist and shared expectations.', submit: 'Save standard', fields: [{ name: 'name', label: 'Service name', required: true, value: item.name }, { name: 'serviceType', label: 'Service level', type: 'select', required: true, value: item.serviceType || 'Main service', options: ['Main service', 'Sub-service'] }, { name: 'parentService', label: 'Parent service', value: item.parentService || '' }, { name: 'category', label: 'Category', value: item.category }, { name: 'description', label: 'What this service does', type: 'textarea', full: true, required: true, value: item.description }, { name: 'documents', label: 'Required documents', type: 'textarea', full: true, rows: 3, value: item.documents.join('\n') }, { name: 'customerExpectations', label: 'What the citizen should prepare or do', type: 'textarea', full: true, required: true, value: item.customerExpectations }, { name: 'bureauExpectations', label: 'What the bureau commits to', type: 'textarea', full: true, required: true, value: item.bureauExpectations }], onSubmit: (v) => setServices((list) => list.map((service) => service.id === item.id ? { ...service, name: v.name, category: v.category, serviceType: v.serviceType, parentService: v.parentService, description: v.description, documents: v.documents.split('\n').filter(Boolean), customerExpectations: v.customerExpectations, bureauExpectations: v.bureauExpectations } : service)) })

  const visibleFeedback = useMemo(() => role === 'bureau' ? feedback.filter((item) => item.bureau === 'Revenues Bureau' && item.subcity === 'Lemi Kura') : role === 'subcity' ? feedback.filter((item) => item.subcity === 'Lemi Kura') : feedback, [feedback, role])
  if (!session) return <Login selectedRole={role} setSelectedRole={setRole} onLogin={signInDemo} />

  return <div className="app-shell">
    <Sidebar role={role} activePage={activePage} setActivePage={navigate} onLogout={signOut} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
    <main className="main-area"><Topbar role={role} onMenu={() => setMobileOpen(true)} onLogout={signOut} /><div className="main-content" key={activePage}>
      {activePage === 'overview' && <Overview role={role} onNavigate={navigate} feedback={visibleFeedback} onFeedback={openFeedback} onCreate={(page) => createForPage(page || (role === 'super' ? 'subcities' : role === 'subcity' ? 'bureaus' : 'routes'))} />}
      {activePage === 'subcities' && role === 'super' && <SubcitiesPage items={subcities} onAdd={() => createForPage('subcities')} search={search} setSearch={setSearch} />}
      {activePage === 'accounts' && role === 'super' && <AccountsPage items={accounts} onAdd={() => createForPage('accounts')} search={search} setSearch={setSearch} />}
      {activePage === 'bureaus' && role === 'subcity' && <BureausPage items={bureaus} onAdd={() => createForPage('bureaus')} search={search} setSearch={setSearch} />}
      {activePage === 'services' && role === 'subcity' && <ServicesPage items={services} onAdd={() => createForPage('services')} onEdit={onUpdateService} search={search} setSearch={setSearch} onTogglePublish={(id) => setServices((list) => list.map((item) => item.id === id ? { ...item, published: !item.published } : item))} />}
      {activePage === 'feedback' && <FeedbackPage items={visibleFeedback} onOpen={openFeedback} search={search} setSearch={setSearch} typeFilter={typeFilter} setTypeFilter={setTypeFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />}
      {activePage === 'news' && role === 'subcity' && <NewsPage items={posts} onAdd={() => createForPage('news')} search={search} setSearch={setSearch} onTogglePublish={(id) => setPosts((list) => list.map((item) => item.id === id ? { ...item, status: item.status === 'Published' ? 'Draft' : 'Published' } : item))} />}
      {activePage === 'routes' && role === 'bureau' && <RoutesPage items={routes.filter((route) => route.bureau === 'Revenues Bureau')} onEdit={(route) => setModal({ kind: 'route', route, onSave: (steps) => setRoutes((list) => list.map((item) => item.id === route.id ? { ...item, steps, status: 'Draft', updated: 'Just now' } : item)) })} search={search} setSearch={setSearch} />}
      {activePage === 'qr' && role === 'bureau' && <QRPage onGenerate={() => setModal({ kind: 'qr', onGenerate: () => setCopiedLink(true) })} onCopy={() => { navigator.clipboard?.writeText('https://civiclink.gov.et/feedback/rev-001'); setCopiedLink(true) }} />}
      {activePage === 'office' && role === 'bureau' && <OfficePage />}
      {activePage === 'activity' && role === 'super' && <ActivityPage />}
      <footer className="app-footer"><span>© 2026 CivicLink Ethiopia</span><span><Icon name="shield" size={13} /> Protected admin workspace</span><span>Help center <Icon name="external" size={12} /></span></footer>
    </div></main>
    <Modal modal={modal} onClose={() => setModal(null)} />
  </div>
}

export default App
