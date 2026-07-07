// Mosaic AI Edge Function — the only place that talks to OpenAI.
// Actions: 'lens' (Connection Lens from a saved reflection), 'sam_next'
// (adaptive next question), 'sam_summary' (final reflection summary).
//
// Secrets (server-side only): OPENAI_API_KEY, optional OPENAI_MODEL.
// Auto-injected by Supabase: SUPABASE_URL, SUPABASE_ANON_KEY,
// SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? ''
// A currently-available, economical small text model. Override with OPENAI_MODEL.
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const DAILY_CAP = 100 // gentle per-user daily guard against runaway calls
const MAX_QUESTIONS = 5

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

interface Turn {
  q: string
  a: string
}

// --- Prompts ---------------------------------------------------------------

const LENS_SYSTEM =
  "You are Mosaic's Connection Lens, a gentle reflection aid. From a person's " +
  'private reflection, offer: one gentle theme (a single supportive sentence), ' +
  '2-4 possible values, needs, or patterns (short phrases), and optionally one ' +
  'open, non-prescriptive conversation prompt. Do not diagnose, give therapy, or ' +
  "claim certainty. Use tentative, kind phrasing ('it sounds like', 'there may be'), " +
  "never 'you should' or 'you are'. Keep the whole thing under about 100 words."

const SAM_NEXT_SYSTEM =
  "You are Sam, Mosaic's warm, private reflection companion. You guide a short " +
  `self-reflection (maximum ${MAX_QUESTIONS} questions) to help someone notice what ` +
  'they value, need, or hope to feel in connection. Ask ONE gentle, open question ' +
  'at a time, adapting to their previous answers. Keep each question under about 30 ' +
  'words, kind and specific, never clinical. You are not a therapist, matchmaker, or ' +
  'advisor; do not diagnose, give directives, or discuss crisis or medical topics. If ' +
  'the person shares distress or risk, gently suggest reaching out to a trusted person ' +
  'or local support, and keep a caring, non-clinical tone. Set done=true when you have ' +
  'enough to summarize.'

const SAM_SUMMARY_SYSTEM =
  'You are Sam. From the person\'s reflection answers, write a concise, warm summary ' +
  '(under about 120 words) in second person, reflecting what they seem to value, need, ' +
  'and hope to feel in connection. Tentative, supportive, non-clinical; no advice as ' +
  'certainty, no diagnosis. End with one gentle line inviting them to keep noticing. ' +
  'This is reflection support, not therapy or professional advice.'

// --- OpenAI ----------------------------------------------------------------

async function callOpenAI(
  system: string,
  user: string,
  schemaName: string,
  schema: Record<string, unknown>,
  maxTokens: number,
): Promise<Record<string, unknown>> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
      response_format: {
        type: 'json_schema',
        json_schema: { name: schemaName, strict: true, schema },
      },
    }),
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`OpenAI ${res.status}: ${detail}`)
  }
  const data = await res.json()
  const choice = data?.choices?.[0]
  if (choice?.message?.refusal) throw new Error('model refused')
  const content = choice?.message?.content
  if (typeof content !== 'string' || content.trim() === '') {
    throw new Error('empty AI response')
  }
  try {
    return JSON.parse(content)
  } catch {
    throw new Error('malformed AI response')
  }
}

// Untrusted input from the browser — clamp count and field lengths to bound
// token usage (cost) and abuse.
const MAX_FIELD = 600
function sanitizeHistory(raw: unknown): Turn[] {
  if (!Array.isArray(raw)) return []
  return raw.slice(0, MAX_QUESTIONS).map((t) => ({
    q: String((t as Turn)?.q ?? '').slice(0, MAX_FIELD),
    a: String((t as Turn)?.a ?? '').slice(0, MAX_FIELD),
  }))
}

const LENS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['theme', 'values', 'prompt'],
  properties: {
    theme: { type: 'string' },
    values: { type: 'array', items: { type: 'string' } },
    prompt: { type: ['string', 'null'] },
  },
}

const SAM_NEXT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['question', 'done'],
  properties: {
    question: { type: 'string' },
    done: { type: 'boolean' },
  },
}

const SAM_SUMMARY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['summary'],
  properties: { summary: { type: 'string' } },
}

function transcript(history: Turn[]): string {
  return history.map((t, i) => `Q${i + 1}: ${t.q}\nA${i + 1}: ${t.a}`).join('\n\n')
}

// --- Handler ---------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const authHeader = req.headers.get('Authorization') ?? ''

  // User-scoped client: RLS applies, so reflection reads/writes are owner-only.
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
  const {
    data: { user },
  } = await userClient.auth.getUser()
  if (!user) return json({ error: 'Not signed in' }, 401)

  // Service-role client for the usage counter only (bypasses RLS).
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const today = new Date().toISOString().slice(0, 10)
  const { data: usage } = await admin
    .from('ai_usage')
    .select('count')
    .eq('user_id', user.id)
    .eq('day', today)
    .maybeSingle()
  const usedToday = usage?.count ?? 0
  if (usedToday >= DAILY_CAP) {
    return json({ error: "You've reached today's reflection limit. Please return tomorrow." }, 429)
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid request' }, 400)
  }
  const action = body.action

  // Reserve a usage slot BEFORE calling OpenAI, so the daily cap bounds the
  // number of paid attempts (not just successes). Only called when we're about
  // to hit OpenAI.
  const countCall = () =>
    admin
      .from('ai_usage')
      .upsert({ user_id: user.id, day: today, count: usedToday + 1 }, { onConflict: 'user_id,day' })

  try {
    let result: Record<string, unknown>

    if (action === 'lens') {
      const reflectionId = String(body.reflectionId ?? '')
      const { data: reflection, error } = await userClient
        .from('reflections')
        .select('id, prompt, body')
        .eq('id', reflectionId)
        .maybeSingle()
      if (error || !reflection) return json({ error: 'Reflection not found' }, 404)

      await countCall()
      const lens = await callOpenAI(
        LENS_SYSTEM,
        `Reflection prompt: ${String(reflection.prompt ?? '').slice(0, 300)}\n` +
          `Reflection: ${String(reflection.body ?? '').slice(0, 2000)}`,
        'connection_lens',
        LENS_SCHEMA,
        220,
      )

      const { error: upsertError } = await userClient.from('connection_lenses').upsert(
        {
          reflection_id: reflection.id,
          user_id: user.id,
          theme: lens.theme,
          values: lens.values,
          prompt: lens.prompt,
          model: OPENAI_MODEL,
        },
        { onConflict: 'reflection_id' },
      )
      if (upsertError) return json({ error: 'Could not save your lens' }, 500)

      result = lens
    } else if (action === 'sam_next') {
      const history = sanitizeHistory(body.history)
      if (history.length >= MAX_QUESTIONS) {
        result = { question: '', done: true } // server-side cap; no OpenAI call
      } else {
        await countCall()
        result = await callOpenAI(
          SAM_NEXT_SYSTEM,
          `Conversation so far (${history.length} of ${MAX_QUESTIONS} questions asked):\n\n${transcript(history)}\n\nAsk the next gentle question.`,
          'sam_next',
          SAM_NEXT_SCHEMA,
          120,
        )
      }
    } else if (action === 'sam_summary') {
      const history = sanitizeHistory(body.history)
      await countCall()
      result = await callOpenAI(
        SAM_SUMMARY_SYSTEM,
        `The person's reflection answers:\n\n${transcript(history)}\n\nWrite the warm summary.`,
        'sam_summary',
        SAM_SUMMARY_SCHEMA,
        260,
      )
    } else {
      return json({ error: 'Unknown action' }, 400)
    }

    return json(result)
  } catch (_err) {
    return json({ error: "Sam couldn't respond just now. Please try again." }, 502)
  }
})
