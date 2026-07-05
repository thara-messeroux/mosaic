import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type ProfileStatus = 'loading' | 'missing' | 'present'

// Checks whether the signed-in user already has a profiles row, so first-time
// users can be routed to complete their profile. Read-only (no schema change).
export function useHasProfile(userId: string | undefined): ProfileStatus {
  const [status, setStatus] = useState<ProfileStatus>('loading')

  useEffect(() => {
    if (!userId) return
    let active = true
    supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        // On an unexpected error, don't trap the user in onboarding.
        if (error) setStatus('present')
        else setStatus(data ? 'present' : 'missing')
      })
    return () => {
      active = false
    }
  }, [userId])

  return status
}
