import { supabase } from './supabase'

// A challenge as used by the UI. user_id is null for seeded public challenges;
// the page derives ownership from challenge.user_id === userId.
export interface Challenge {
  id: string
  user_id: string | null
  title: string
  category: string | null
  description: string | null
  duration: string | null
}

const COLUMNS = 'id, user_id, title, category, description, duration'

// Seeded public challenges + the signed-in user's own (RLS scopes the read).
// Newest first, so a user's new challenge appears above the older seeds.
export async function fetchChallenges(): Promise<Challenge[]> {
  const { data, error } = await supabase
    .from('challenges')
    .select(COLUMNS)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Challenge[]
}

interface ChallengeInput {
  title: string
  category: string
  description: string
  duration: string
}

export async function createChallenge(userId: string, input: ChallengeInput): Promise<void> {
  const { error } = await supabase.from('challenges').insert({
    user_id: userId,
    is_sample: false,
    title: input.title.trim(),
    category: input.category,
    description: input.description.trim() || null,
    duration: input.duration,
  })
  if (error) throw error
}

// RLS ensures a user can only update their own non-sample row.
export async function updateChallenge(id: string, input: ChallengeInput): Promise<void> {
  const { error } = await supabase
    .from('challenges')
    .update({
      title: input.title.trim(),
      category: input.category,
      description: input.description.trim() || null,
      duration: input.duration,
    })
    .eq('id', id)
  if (error) throw error
}

// RLS ensures a user can only delete their own row (seeds have user_id = null).
export async function deleteChallenge(id: string): Promise<void> {
  const { error } = await supabase.from('challenges').delete().eq('id', id)
  if (error) throw error
}
