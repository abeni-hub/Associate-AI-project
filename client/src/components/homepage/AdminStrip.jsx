import Icon from '../ui/Icon.jsx'

export default function AdminStrip({ t, adminStripContent }) {
  const kicker = adminStripContent?.adminStripKicker || 'FOR PUBLIC SERVICE TEAMS'
  const title = adminStripContent?.adminStripTitle || 'Manage information where it belongs.'
  const description = adminStripContent?.adminStripDescription || 'Sub-city and bureau admins keep service guides, room routes, news, and feedback up to date.'

  return (
    <section className="admin-strip section-wrap scroll-reveal">
      <div className="admin-strip-icon"><Icon name="building" size={23} /></div>
      <div>
        <span className="admin-strip-kicker">{t(kicker)}</span>
        <h3>{t(title)}</h3>
        <p>{t(description)}</p>
      </div>
      <div className="admin-strip-roles"><span>{t('SUPER ADMIN')}</span><i /> <span>{t('SUB-CITY')}</span><i /> <span>{t('BUREAU')}</span></div>
    </section>
  )
}
