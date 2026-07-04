import { Icon } from './Icon'

// Sticky page header. Shows an optional Back button and an optional profile
// avatar. On desktop the section title is shown; on mobile the Mosaic wordmark
// sits above the title.
export function TopBar({
  title,
  showBack = false,
  onBack,
  showAvatar = false,
  onAvatar,
}: {
  title: string
  showBack?: boolean
  onBack?: () => void
  showAvatar?: boolean
  onAvatar?: () => void
}) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        {showBack && (
          <button type="button" className="icon-btn" aria-label="Go back" onClick={onBack}>
            <Icon name="chevron-left" size={24} />
          </button>
        )}
        <div className="topbar-titles">
          <span className="topbar-brand">Mosaic</span>
          <span className="topbar-title">{title}</span>
        </div>
        {showAvatar && (
          <button
            type="button"
            className="avatar-btn"
            aria-label="Your profile"
            onClick={onAvatar}
          >
            <Icon name="user" />
          </button>
        )}
      </div>
    </header>
  )
}
