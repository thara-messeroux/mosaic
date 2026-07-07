import { supabase } from './supabase'

// Structured Connection Lens returned by the Edge Function.
export interface Lens {
  theme: string
  values: string[]
  prompt: string | null
}

// One Sam turn (question + the person's answer).
export interface Turn {
  q: string
  a: string
}

// Carries the Edge Function's friendly message (e.g. the daily-limit notice) so
// the UI can show it instead of a generic error. userMessage is undefined for
// network/unknown failures with no server body.
export class AiError extends Error {
  userMessage?: string
  constructor(message: string, userMessage?: string) {
    super(message)
    this.name = 'AiError'
    this.userMessage = userMessage
  }
}

// All AI runs through the mosaic-ai Edge Function (OpenAI key stays server-side).
async function invoke<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('mosaic-ai', {
    body: { action, ...payload },
  })
  if (error) {
    // On a non-2xx, the function returns { error: "<friendly message>" }.
    let userMessage: string | undefined
    const ctx = (error as { context?: unknown }).context
    if (ctx instanceof Response) {
      try {
        const body = await ctx.clone().json()
        if (body && typeof body.error === 'string') userMessage = body.error
      } catch {
        // response wasn't JSON — leave userMessage undefined
      }
    }
    throw new AiError(error.message, userMessage)
  }
  return data as T
}

// Generate + persist a Connection Lens for one of the user's saved reflections.
export function generateLens(reflectionId: string): Promise<Lens> {
  return invoke<Lens>('lens', { reflectionId })
}

// Ask Sam for the next adaptive question given the conversation so far.
export function samNext(history: Turn[]): Promise<{ question: string; done: boolean }> {
  return invoke<{ question: string; done: boolean }>('sam_next', { history })
}

// Ask Sam for a concise closing summary of the reflection.
export function samSummary(history: Turn[]): Promise<{ summary: string }> {
  return invoke<{ summary: string }>('sam_summary', { history })
}
