import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { useAuth } from '../state/AuthProvider'
import { fetchMyProfile } from '../lib/profiles'

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
  const { user } = useAuth()
  // Load the signed-in user's uploaded photo for the header avatar (if any).
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!showAvatar || !user?.id) return
    let active = true
    fetchMyProfile(user.id)
      .then((result) => {
        if (active) setAvatarUrl(result?.form.photoUrl ?? null)
      })
      .catch(() => {
        // Fall back to the generic icon on any load error.
      })
    return () => {
      active = false
    }
  }, [showAvatar, user?.id])

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
            {avatarUrl ? (
              <img src={avatarUrl} alt="Your profile photo" className="avatar-img" />
            ) : (
              <Icon name="user" />
            )}
          </button>
        )}
      </div>
    </header>
  )
}
