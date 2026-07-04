import type { IconName } from './Icon'

// The five primary app sections, shared by the sidebar and bottom nav.
export type Section = 'discover' | 'reflections' | 'challenges' | 'sam' | 'profile'

export const NAV_ITEMS: { id: Section; label: string; icon: IconName }[] = [
  { id: 'discover', label: 'Discover', icon: 'compass' },
  { id: 'reflections', label: 'Reflections', icon: 'notebook' },
  { id: 'challenges', label: 'Challenges', icon: 'sparkles' },
  { id: 'sam', label: 'Sam', icon: 'message' },
  { id: 'profile', label: 'Profile', icon: 'user' },
]
