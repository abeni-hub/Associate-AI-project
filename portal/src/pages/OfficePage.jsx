import Icon from '../components/ui/Icon.jsx'
import PageHeading from '../components/ui/PageHeading.jsx'

function OfficePage({ profile, onEdit }) {
  const data = profile || {
    bureau: 'Revenues Bureau',
    hours: 'Monday – Friday · 8:30 AM – 5:30 PM',
    location: 'Lemi Kura Sub-city, Addis Ababa',
    admin: 'Dawit Alemu',
    contact: '+251 11 000 0000',
  }

  return <>
    <PageHeading
      eyebrow="BUREAU SETTINGS"
      title="Office profile"
      subtitle="Keep your bureau details clear and consistent for the citizens you serve."
      action="Edit profile"
      onAction={onEdit}
    />
    <section className="panel office-profile-card">
      <div className="office-profile-banner">
        <span className="office-emblem"><Icon name="building" size={28} /></span>
        <span className="office-status"><i /> ACTIVE BUREAU</span>
      </div>
      <div className="office-profile-body">
        <div>
          <span className="panel-eyebrow">LEMI KURA SUB-CITY · PUBLIC OFFICE</span>
          <h2>{data.bureau}</h2>
          <p>Support for tax registration, payments, clearance and business revenue services.</p>
        </div>
        <div className="office-detail-grid">
          <div><small>PUBLIC SERVICE HOURS</small><b>{data.hours}</b></div>
          <div><small>LOCATION</small><b>{data.location}</b></div>
          <div><small>BUREAU ADMINISTRATOR</small><b>{data.admin}</b></div>
          <div><small>PUBLIC CONTACT</small><b>{data.contact}</b></div>
        </div>
        <div className="office-profile-note">
          <Icon name="info" size={16} /> Public profile changes should be reviewed by your sub-city administrator before publishing.
        </div>
      </div>
    </section>
  </>
}

export default OfficePage
