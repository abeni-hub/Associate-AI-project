import Icon from '../components/ui/Icon.jsx'
import PageHeading from '../components/ui/PageHeading.jsx'

function OfficePage() {
  return <>
    <PageHeading
      eyebrow="BUREAU SETTINGS"
      title="Office profile"
      subtitle="Keep your bureau details clear and consistent for the citizens you serve."
      action="Edit profile"
      onAction={() => window.alert('Office profile editing is available in a connected backend.')}
    />
    <section className="panel office-profile-card">
      <div className="office-profile-banner">
        <span className="office-emblem"><Icon name="building" size={28} /></span>
        <span className="office-status"><i /> ACTIVE BUREAU</span>
      </div>
      <div className="office-profile-body">
        <div>
          <span className="panel-eyebrow">LEMI KURA SUB-CITY · PUBLIC OFFICE</span>
          <h2>Revenues Bureau</h2>
          <p>Support for tax registration, payments, clearance and business revenue services.</p>
        </div>
        <div className="office-detail-grid">
          <div><small>PUBLIC SERVICE HOURS</small><b>Monday – Friday · 8:30 AM – 5:30 PM</b></div>
          <div><small>LOCATION</small><b>Lemi Kura Sub-city, Addis Ababa</b></div>
          <div><small>BUREAU ADMINISTRATOR</small><b>Dawit Alemu</b></div>
          <div><small>PUBLIC CONTACT</small><b>+251 11 000 0000</b></div>
        </div>
        <div className="office-profile-note">
          <Icon name="info" size={16} /> Public profile changes should be reviewed by your sub-city administrator before publishing.
        </div>
      </div>
    </section>
  </>
}

export default OfficePage
