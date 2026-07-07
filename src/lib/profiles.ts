import { supabase } from './supabase'

// The fixed prompt question the profile form edits the answer to.
export const PROFILE_PROMPT_QUESTION = 'A friendship becomes something more when…'

// Form shape used by the Profile page (all strings for inputs; photoUrl nullable).
export interface ProfileForm {
  firstName: string
  age: string
  city: string
  country: string
  originallyFrom: string
  intent: string
  connectionStyle: string
  values: string[]
  prompt: string
  photoUrl: string | null
}

export const emptyProfileForm: ProfileForm = {
  firstName: '',
  age: '',
  city: '',
  country: '',
  originallyFrom: '',
  intent: '',
  connectionStyle: '',
  values: [],
  prompt: '',
  photoUrl: null,
}

// A row as read back from public.profiles.
interface ProfileRow {
  id: string
  first_name: string | null
  age: number | null
  city: string | null
  country: string | null
  originally_from: string | null
  intent: string | null
  connection_style: string | null
  values: string[] | null
  prompt_answer: string | null
  photo_url: string | null
}

function rowToForm(row: ProfileRow): ProfileForm {
  return {
    firstName: row.first_name ?? '',
    age: row.age != null ? String(row.age) : '',
    city: row.city ?? '',
    country: row.country ?? '',
    originallyFrom: row.originally_from ?? '',
    intent: row.intent ?? '',
    connectionStyle: row.connection_style ?? '',
    values: row.values ?? [],
    prompt: row.prompt_answer ?? '',
    photoUrl: row.photo_url ?? null,
  }
}

function formToRow(userId: string, form: ProfileForm) {
  const parsedAge = parseInt(form.age, 10)
  return {
    user_id: userId,
    is_sample: false,
    first_name: form.firstName.trim() || null,
    age: Number.isFinite(parsedAge) ? parsedAge : null,
    city: form.city.trim() || null,
    country: form.country.trim() || null,
    originally_from: form.originallyFrom.trim() || null,
    intent: form.intent || null,
    connection_style: form.connectionStyle || null,
    values: form.values,
    prompt_question: PROFILE_PROMPT_QUESTION,
    prompt_answer: form.prompt.trim() || null,
    photo_url: form.photoUrl,
  }
}

const PROFILE_COLUMNS =
  'id, first_name, age, city, country, originally_from, intent, connection_style, values, prompt_answer, photo_url'

// Returns { id, form } for the signed-in user, or null if they have no profile.
export async function fetchMyProfile(
  userId: string,
): Promise<{ id: string; form: ProfileForm } | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('user_id', userId)
    .maybeSingle<ProfileRow>()

  if (error) throw error
  if (!data) return null
  return { id: data.id, form: rowToForm(data) }
}

// Creates (no existing row) or updates the signed-in user's profile.
// We deliberately branch instead of upsert: the user_id unique index is partial,
// which ON CONFLICT can't infer.
export async function saveMyProfile(
  existingId: string | null,
  userId: string,
  form: ProfileForm,
): Promise<string> {
  const row = formToRow(userId, form)

  if (existingId) {
    const { data, error } = await supabase
      .from('profiles')
      .update(row)
      .eq('user_id', userId)
      .select('id')
      .single()
    if (error) throw error
    return data.id
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert(row)
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

// Uploads a photo to profile-photos/{userId}/{timestamp}.{ext} and returns its
// public URL. We never delete old files here (kept simple + safe for this bundle).
export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${userId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('profile-photos')
    .upload(path, file, { upsert: false, contentType: file.type })
  if (error) throw error

  const { data } = supabase.storage.from('profile-photos').getPublicUrl(path)
  return data.publicUrl
}
