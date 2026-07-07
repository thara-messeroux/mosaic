import { supabase } from './supabase'
import type { Member } from '../data/members'

export type Decision = 'save' | 'pass'

interface SampleProfileRow {
  id: string
  first_name: string | null
  age: number | null
  city: string | null
  country: string | null
  originally_from: string | null
  intent: string | null
  connection_style: string | null
  values: string[] | null
  prompt_question: string | null
  prompt_answer: string | null
  photo_url: string | null
}

// Joins values into a natural "a, b, and c" list for the derived lens copy.
function humanJoin(values: string[]): string {
  const lower = values.map((v) => v.toLowerCase())
  if (lower.length <= 1) return lower.join('')
  if (lower.length === 2) return `${lower[0]} and ${lower[1]}`
  return `${lower.slice(0, -1).join(', ')}, and ${lower[lower.length - 1]}`
}

// Maps a sample profile row into the existing Member UI shape. There is no lens
// column, so we derive preview copy from the profile's values.
function rowToMember(row: SampleProfileRow): Member {
  const values = row.values ?? []
  return {
    id: row.id,
    firstName: row.first_name ?? '',
    age: row.age ?? 0,
    city: row.city ?? '',
    country: row.country ?? '',
    originallyFrom: row.originally_from ?? '',
    intent: row.intent ?? '',
    values,
    connectionStyle: row.connection_style ?? '',
    prompt: {
      question: row.prompt_question ?? '',
      answer: row.prompt_answer ?? '',
    },
    lens: values.length ? `Possible shared values: ${humanJoin(values)}.` : '',
    photo: row.photo_url ?? '',
  }
}

const SAMPLE_COLUMNS =
  'id, first_name, age, city, country, originally_from, intent, connection_style, values, prompt_question, prompt_answer, photo_url'

// The six public sample profiles, ordered by first name for a stable deck.
export async function fetchSampleProfiles(): Promise<Member[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(SAMPLE_COLUMNS)
    .eq('is_sample', true)
    .order('first_name', { ascending: true })

  if (error) throw error
  return (data as SampleProfileRow[]).map(rowToMember)
}

// The set of profile ids the signed-in user has already saved or passed.
export async function fetchMyDecisions(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('profile_decisions')
    .select('profile_id')
    .eq('user_id', userId)

  if (error) throw error
  return new Set((data as { profile_id: string }[]).map((d) => d.profile_id))
}

// Records a decision. The unique (user_id, profile_id) constraint makes this an
// idempotent upsert — a repeated or changed decision updates the same row.
export async function recordDecision(
  userId: string,
  profileId: string,
  decision: Decision,
): Promise<void> {
  const { error } = await supabase
    .from('profile_decisions')
    .upsert(
      { user_id: userId, profile_id: profileId, decision },
      { onConflict: 'user_id,profile_id' },
    )
  if (error) throw error
}
