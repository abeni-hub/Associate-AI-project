import Icon from '../ui/Icon.jsx'

export default function AnnouncementBar({ t, onNavigateToHomeSection, announcement, language }) {
  if (announcement?.enabled === false) return null

  const message = (language === 'am' && announcement?.messageAm) || announcement?.message || 'One clear place to plan your next public service visit'
  const linkText = (language === 'am' && announcement?.linkTextAm) || announcement?.linkText || 'Explore the guide'
  const linkUrl = announcement?.linkUrl || '#find-service'

  return (
    <div className="announcement-bar">
      <span className="announcement-dot" />
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
