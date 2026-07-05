/// <reference types="vite/client" />

// Typed Vite env vars. Only VITE_-prefixed values reach the browser, and both
// of these are browser-safe (protected by Supabase RLS).
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
