import Icon from '../ui/Icon.jsx'

export default function AnnouncementBar({ t, onNavigateToHomeSection }) {
  return (
    <div className="announcement-bar">
      <span className="announcement-dot" />
      <span className="announcement-copy">{t('One clear place to plan your next public service visit')}</span>
      <a
        href="#find-service"
        onClick={(event) => {
          event.preventDefault()
          onNavigateToHomeSection('find-service')
        }}
      >
        {t('Explore the guide')} <Icon name="arrow" size={14} />
      </a>
    </div>
  )
}
