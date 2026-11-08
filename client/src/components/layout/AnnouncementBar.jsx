import Icon from '../ui/Icon.jsx'

export default function AnnouncementBar({ t, onNavigateToHomeSection, announcement }) {
  if (announcement?.enabled === false) return null

  const message = announcement?.message || 'One clear place to plan your next public service visit'
  const linkText = announcement?.linkText || 'Explore the guide'
  const linkUrl = announcement?.linkUrl || '#find-service'

  return (
    <div className="announcement-bar">
      <span className="announcement-dot" />
      {announcement?.tag && <span className="announcement-tag">{announcement.tag}</span>}
      <span className="announcement-copy">{t(message)}</span>
      <a
        href={linkUrl}
        onClick={(event) => {
          if (!onNavigateToHomeSection || !linkUrl.startsWith('#')) return
          event.preventDefault()
          onNavigateToHomeSection(linkUrl.startsWith('#/') ? 'news' : linkUrl.slice(1))
        }}
      >
        {t(linkText)} <Icon name="arrow" size={14} />
      </a>
    </div>
  )
}
