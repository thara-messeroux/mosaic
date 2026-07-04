import { useState, type ReactNode } from 'react'
import './App.css'

type Section = 'discover' | 'reflections' | 'challenges' | 'sam' | 'profile'

// Small inline SVG icons keep the nav visual without a dependency (no lucide).
// Each is a 20x20 stroked glyph that inherits the current text color.
const ICONS: Record<Section, ReactNode> = {
  discover: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-2.5 5.5L7 17l2.5-5.5L15 9Z" />
    </svg>
  ),
  reflections: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </svg>
  ),
  challenges: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.9 4.6L19 8.3l-3.5 3.4.8 4.9L12 14.3 7.7 16.6l.8-4.9L5 8.3l5.1-.7L12 3Z" />
    </svg>
  ),
  sam: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.5 8.5 0 0 1-12.2 7.6L3 21l1.9-5.8A8.5 8.5 0 1 1 21 11.5Z" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  ),
}

const NAV_ITEMS: { id: Section; label: string }[] = [
  { id: 'discover', label: 'Discover' },
  { id: 'reflections', label: 'Reflections' },
  { id: 'challenges', label: 'Challenges' },
  { id: 'sam', label: 'Sam' },
  { id: 'profile', label: 'Profile' },
]

function AppShell() {
  // Navigation only — temporary local state, no router. Discover is the default.
  const [active, setActive] = useState<Section>('discover')
  const activeLabel = NAV_ITEMS.find((item) => item.id === active)?.label ?? ''

  return (
    <div className="shell">
      <SideNav active={active} onSelect={setActive} />

      <div className="shell-main">
        <TopBar title={activeLabel} />
        <main className="shell-content">
          <SectionPlaceholder label={activeLabel} />
        </main>
        <BottomNav active={active} onSelect={setActive} />
      </div>
    </div>
  )
}

function SideNav({ active, onSelect }: { active: Section; onSelect: (s: Section) => void }) {
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
            <span className="nav-icon">{ICONS[item.id]}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

function TopBar({ title }: { title: string }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <span className="topbar-brand">Mosaic</span>
        <span className="topbar-title">{title}</span>
      </div>
    </header>
  )
}

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
          <span className="nav-icon">{ICONS[item.id]}</span>
          <span className="bottomnav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

// Intentionally quiet: just a heading + one line. Real content comes later.
function SectionPlaceholder({ label }: { label: string }) {
  return (
    <div className="placeholder">
      <h1 className="placeholder-title">{label}</h1>
      <p className="placeholder-text">This section is coming soon.</p>
    </div>
  )
}

export default AppShell
