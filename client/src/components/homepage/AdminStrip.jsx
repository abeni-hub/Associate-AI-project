import Icon from '../ui/Icon.jsx'

export default function AdminStrip({ t }) {
  return (
    <section className="admin-strip section-wrap scroll-reveal">
      <div className="admin-strip-icon"><Icon name="building" size={23} /></div>
      <div>
        <span className="admin-strip-kicker">{t('FOR PUBLIC SERVICE TEAMS')}</span>
        <h3>{t('Manage information where it belongs.')}</h3>
        <p>{t('Sub-city and bureau admins keep service guides, room routes, news, and feedback up to date.')}</p>
      </div>
      <div className="admin-strip-roles"><span>{t('SUPER ADMIN')}</span><i /> <span>{t('SUB-CITY')}</span><i /> <span>{t('BUREAU')}</span></div>
    </section>
  )
}
