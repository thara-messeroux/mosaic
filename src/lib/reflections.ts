import { supabase } from './supabase'
import type { Lens } from './ai'

// A reflection as used by the UI. lens is the structured Connection Lens (from
// the connection_lenses table), or null if one hasn't been generated yet.
export interface Reflection {
  id: string
  prompt: string
  body: string
  lens: Lens | null
  createdAt: string
}

interface LensRow {
  theme: string
  values: string[]
  prompt: string | null
}

// A reflection row as returned by Supabase, with its embedded lens (if any).
// connection_lenses is one-to-one (reflection_id is unique), so PostgREST
// returns a single object or null — not an array.
interface ReflectionRow {
  id: string
  prompt: string
  body: string
  created_at: string
  connection_lenses: LensRow | LensRow[] | null
}

function rowToReflection(row: ReflectionRow): Reflection {
  // Support both shapes: an object (one-to-one) or an array (defensive).
  const cl = row.connection_lenses
  const lensRow = Array.isArray(cl) ? cl[0] : cl
  return {
    id: row.id,
    prompt: row.prompt,
    body: row.body,
    lens: lensRow
      ? { theme: lensRow.theme, values: lensRow.values, prompt: lensRow.prompt }
      : null,
    createdAt: row.created_at,
  }
}

// e.g. "Jul 6, 2026"
export function formatReflectionDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Reflection columns plus the embedded connection_lenses row (one-to-one).
const COLUMNS = 'id, prompt, body, created_at, connection_lenses(theme, values, prompt)'

// Newest first. RLS also restricts this to the caller's own rows.
export async function fetchMyReflections(userId: string): Promise<Reflection[]> {
  const { data, error } = await supabase
    .from('reflections')
    .select(COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as ReflectionRow[]).map(rowToReflection)
}

interface ReflectionInput {
  prompt: string
  body: string
}

// RLS ensures a user can only insert their own row.
export async function createReflection(
  userId: string,
  input: ReflectionInput,
): Promise<void> {
  const { error } = await supabase
    .from('reflections')
    .insert({ user_id: userId, ...input })
  if (error) throw error
}

// RLS ensures a user can only update their own row.
export async function updateReflection(id: string, input: ReflectionInput): Promise<void> {
  const { error } = await supabase.from('reflections').update(input).eq('id', id)
  if (error) throw error
}

// RLS ensures a user can only delete their own row.
export async function deleteReflection(id: string): Promise<void> {
  const { error } = await supabase.from('reflections').delete().eq('id', id)
  if (error) throw error
}
