import { useEffect, useState } from 'react'
import type { Section } from '../components/navigation'

// Client-side routing over the browser History API — no routing package.
// Each top-level section maps to one clean path.
const SECTION_PATHS: Record<Section, string> = {
  discover: '/discover',
  reflections: '/reflections',
  challenges: '/challenges',
  sam: '/sam',
  profile: '/profile',
}

// Sub-routes within the Profile section.
export const PROFILE_PATH = '/profile'
export const PROFILE_EDIT_PATH = '/profile/edit'

// Fired after a programmatic navigate/replace so usePath() can update
// (pushState/replaceState do not emit popstate on their own).
const NAV_EVENT = 'mosaic:navigate'

export function sectionToPath(section: Section): string {
  return SECTION_PATHS[section]
}

// Returns the Section for a pathname by its first segment, so sub-routes like
// /profile/edit still resolve to their section (keeps nav highlight + avoids
// the unknown-path redirect). Null if the first segment isn't a section.
export function pathToSection(pathname: string): Section | null {
  const firstSegment = '/' + (pathname.split('/').filter(Boolean)[0] ?? '')
  const match = (Object.keys(SECTION_PATHS) as Section[]).find(
    (s) => SECTION_PATHS[s] === firstSegment,
  )
  return match ?? null
}

// Push a new history entry (adds to Back/Forward) and notify subscribers.
export function navigate(path: string): void {
  if (path === window.location.pathname) return
  window.history.pushState({}, '', path)
  window.dispatchEvent(new Event(NAV_EVENT))
}

// Replace the current entry (no extra Back step) — used for normalizing redirects.
export function replacePath(path: string): void {
  if (path === window.location.pathname) return
  window.history.replaceState({}, '', path)
  window.dispatchEvent(new Event(NAV_EVENT))
}

// Subscribes to Back/Forward (popstate) and programmatic navigation.
export function usePath(): string {
  const [path, setPath] = useState(() => window.location.pathname)

  useEffect(() => {
    const sync = () => setPath(window.location.pathname)
    window.addEventListener('popstate', sync)
    window.addEventListener(NAV_EVENT, sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener(NAV_EVENT, sync)
    }
  }, [])

  return path
}
