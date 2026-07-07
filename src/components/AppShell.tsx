import { useEffect } from 'react'
import { Icon } from './Icon'
import { NAV_ITEMS, type Section } from './navigation'
import { useAuth } from '../state/AuthProvider'
import { usePath, pathToSection, sectionToPath, navigate, replacePath } from '../lib/routing'
import DiscoverPage from '../pages/DiscoverPage'
import ReflectionsPage from '../pages/ReflectionsPage'
import ChallengesPage from '../pages/ChallengesPage'
import SamPage from '../pages/SamPage'
import ProfileEditPage from '../pages/ProfileEditPage'

// The persistent frame: desktop sidebar + mobile bottom nav around the active
// section's page. The active section is derived from the URL (History API).
// firstRun (no profile yet) opens on the Profile section for onboarding.
function AppShell({
  firstRun = false,
  onProfileSaved,
}: {
  firstRun?: boolean
  onProfileSaved?: () => void
}) {
  const path = usePath()
  const matched = pathToSection(path)
  const active: Section = matched ?? (firstRun ? 'profile' : 'discover')

  // Normalize unknown/root paths (and send first-run users to /profile) without
  // adding a Back step.
  useEffect(() => {
    if (!matched) replacePath(sectionToPath(active))
  }, [matched, active])

  const setActive = (section: Section) => navigate(sectionToPath(section))

  return (
    <div className="shell">
      <SideNav active={active} onSelect={setActive} />
      <div className="shell-main">
        <div className="shell-content">
          <ActivePage
            active={active}
            onNavigate={setActive}
            firstRun={firstRun}
            onProfileSaved={onProfileSaved}
          />
        </div>
        <BottomNav active={active} onSelect={setActive} />
      </div>
    </div>
  )
}

function ActivePage({
  active,
  onNavigate,
  firstRun,
  onProfileSaved,
}: {
  active: Section
  onNavigate: (s: Section) => void
  firstRun: boolean
  onProfileSaved?: () => void
}) {
  switch (active) {
    case 'discover':
      return <DiscoverPage onNavigate={onNavigate} />
    case 'reflections':
      return <ReflectionsPage onNavigate={onNavigate} />
    case 'challenges':
      return <ChallengesPage onNavigate={onNavigate} />
    case 'sam':
      return <SamPage onNavigate={onNavigate} />
    case 'profile':
      return (
        <ProfileEditPage
          onNavigate={onNavigate}
          onboarding={firstRun}
          onProfileSaved={onProfileSaved}
        />
      )
  }
}

// The side nav is only visible on desktop, but we render it always for simplicity.
function SideNav({ active, onSelect }: { active: Section; onSelect: (s: Section) => void }) {
  const { user, signOut } = useAuth()

  return (
    <aside className="sidenav">
      <div className="sidenav-brand">
        <span className="wordmark">Mosaic</span>
        <p className="sidenav-tagline">Meet slowly. Connect deeply.</p>
      </div>
      <nav className="sidenav-list" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="sidenav-link"
            aria-current={active === item.id ? 'page' : undefined}
            onClick={() => onSelect(item.id)}
          >
            <span className="nav-icon">
              <Icon name={item.icon} />
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidenav-foot">
        {user?.email && <p className="sidenav-email">{user.email}</p>}
        <button type="button" className="signout-btn" onClick={signOut}>
          <Icon name="lock" size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}

// The bottom nav is only visible on mobile, but we render it always for simplicity.
function BottomNav({ active, onSelect }: { active: Section; onSelect: (s: Section) => void }) {
  return (
    <nav className="bottomnav" aria-label="Primary">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className="bottomnav-link"
          aria-current={active === item.id ? 'page' : undefined}
          onClick={() => onSelect(item.id)}
        >
          <span className="nav-icon">
            <Icon name={item.icon} />
          </span>
          <span className="bottomnav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default AppShell
