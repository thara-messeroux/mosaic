import { createContext, useContext, useState, type ReactNode } from 'react'

// Shared local app state (profile + reflections + challenges) so pages can read
// and mutate the same data without prop-drilling. All in-memory mock data.

// The Profile interface defines the shape of the user's profile data, 
// including personal information, intent, values, connection style, and a prompt.
export interface Profile {
  firstName: string
  age: string
  city: string
  country: string
  originallyFrom: string
  intent: string
  values: string[]
  connectionStyle: string
  prompt: string
}

// The Reflection interface defines the shape of a reflection, 
// including an id, prompt, body, date, optional lens, and a flag 
// indicating if it is the user's own reflection.
export interface Reflection {
  id: string
  prompt: string
  body: string
  date: string
  lens?: string
  isOwn: boolean
}

// The Challenge interface defines the shape of a challenge, 
// including an id, title, category, description, duration, 
// and a flag indicating if it is the user's own challenge.
export interface Challenge {
  id: string
  title: string
  category: string
  description: string
  duration: string
  isOwn: boolean
}

// The MosaicStore interface defines the shape of the shared state 
// and the functions to manipulate it, including profile, reflections, challenges, 
// and their respective add, update, and delete functions.
interface MosaicStore {
  profile: Profile
  setProfile: (p: Profile) => void
  reflections: Reflection[]
  addReflection: (r: Pick<Reflection, 'prompt' | 'body' | 'lens'>) => void
  updateReflection: (id: string, r: Partial<Reflection>) => void
  deleteReflection: (id: string) => void
  challenges: Challenge[]
  addChallenge: (c: Omit<Challenge, 'id' | 'isOwn'>) => void
  deleteChallenge: (id: string) => void
}

// Simple incrementing id — fine for local mock data.
let idCounter = 0
const uid = () => `id-${++idCounter}`

const initialProfile: Profile = {
  firstName: 'Amara',
  age: '31',
  city: 'Lisbon',
  country: 'Portugal',
  originallyFrom: 'Cape Verde',
  intent: 'Long-term, friendship first',
  values: ['Curiosity', 'Kindness', 'Emotional honesty'],
  connectionStyle: 'Slow and steady',
  prompt: 'we can be quiet together and still feel completely at ease — no performance, just presence.',
}

// The initialReflections array contains some mock reflections to populate the app initially.
const initialReflections: Reflection[] = [
  {
    id: uid(),
    prompt: 'A friendship becomes something more when…',
    body: 'we can be quiet together and still feel completely at ease — no performance, just presence.',
    date: 'June 28, 2026',
    lens: 'This reflection leans on emotional safety and slow trust.',
    isOwn: true,
  },
  {
    id: uid(),
    prompt: 'What does emotional honesty look like to me?',
    body: 'Saying the small true thing before it becomes a big unspoken one.',
    date: 'June 21, 2026',
    isOwn: true,
  },
]

// The initialChallenges array contains some mock challenges to populate the app initially.
const initialChallenges: Challenge[] = [
  {
    id: uid(),
    title: 'The unhurried question',
    category: 'Curiosity',
    description:
      "Ask someone one question you're genuinely curious about — and really listen to the answer.",
    duration: '1 day',
    isOwn: false,
  },
  {
    id: uid(),
    title: 'A week of small kindnesses',
    category: 'Kindness',
    description:
      'Offer one small, unprompted kindness each day. Notice how it changes your week.',
    duration: '7 days',
    isOwn: true,
  },
  {
    id: uid(),
    title: 'Say the true thing',
    category: 'Honesty',
    description: "Practice sharing one honest feeling you'd normally keep to yourself.",
    duration: '3 days',
    isOwn: false,
  },
]

// The MosaicContext is a React context that holds the shared state and functions defined in MosaicStore.
const MosaicContext = createContext<MosaicStore | null>(null)

export function MosaicProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [reflections, setReflections] = useState<Reflection[]>(initialReflections)
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges)

  const addReflection: MosaicStore['addReflection'] = (r) =>
    setReflections((prev) => [{ ...r, id: uid(), date: 'Today', isOwn: true }, ...prev])

  const updateReflection: MosaicStore['updateReflection'] = (id, r) =>
    setReflections((prev) => prev.map((x) => (x.id === id ? { ...x, ...r } : x)))

  const deleteReflection: MosaicStore['deleteReflection'] = (id) =>
    setReflections((prev) => prev.filter((x) => x.id !== id))

  const addChallenge: MosaicStore['addChallenge'] = (c) =>
    setChallenges((prev) => [{ ...c, id: uid(), isOwn: true }, ...prev])

  const deleteChallenge: MosaicStore['deleteChallenge'] = (id) =>
    setChallenges((prev) => prev.filter((x) => x.id !== id))

  return (
    <MosaicContext.Provider
      value={{
        profile,
        setProfile,
        reflections,
        addReflection,
        updateReflection,
        deleteReflection,
        challenges,
        addChallenge,
        deleteChallenge,
      }}
    >
      {children}
    </MosaicContext.Provider>
  )
}

// The useMosaic hook provides access to the MosaicContext, 
// allowing components to read and manipulate the shared state.
export function useMosaic() {
  const ctx = useContext(MosaicContext)
  if (!ctx) throw new Error('useMosaic must be used within MosaicProvider')
  return ctx
}
