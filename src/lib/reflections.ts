import { supabase } from './supabase'

// A reflection as used by the UI.
export interface Reflection {
  id: string
  prompt: string
  body: string
  lens: string | null
  createdAt: string
}

// A reflection row as returned by Supabase. The column names match the database schema.
interface ReflectionRow {
  id: string
  prompt: string
  body: string
  lens: string | null
  created_at: string
}

// Convert a Supabase reflection row to the UI-friendly Reflection interface.
function rowToReflection(row: ReflectionRow): Reflection {
  return {
    id: row.id,
    prompt: row.prompt,
    body: row.body,
    lens: row.lens,
    createdAt: row.created_at,
  }
}

// e.g. "Jul 5, 2026"
export function formatReflectionDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const COLUMNS = 'id, prompt, body, lens, created_at'

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
  lens: string | null
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
