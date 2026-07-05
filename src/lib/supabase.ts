import { createClient } from '@supabase/supabase-js'

// Single Supabase browser client. The URL + anon key are safe to expose here;
// every request is still enforced by the database RLS policies.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Missing Supabase env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
      'to .env.local, then restart the dev server.',
  )
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true, // keep the session across refreshes
    autoRefreshToken: true, // refresh the access token in the background
    detectSessionInUrl: true, // handle the email-confirmation redirect
  },
})
