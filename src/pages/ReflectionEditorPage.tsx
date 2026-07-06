import { useState } from 'react'
import type { Section } from '../components/navigation'
import { Icon } from '../components/Icon'
import { TopBar } from '../components/TopBar'
import { Field, TextArea, PrimaryButton, SecondaryButton } from '../components/Primitives'
import { ConnectionLens } from '../components/ConnectionLens'
import { useAuth } from '../state/AuthProvider'
import { useToast } from '../components/Toast'
import { createReflection, updateReflection, type Reflection } from '../lib/reflections'

// Guided reflection prompts the user can choose from.
const PROMPTS = [
  'A friendship becomes something more when…',
  'What does emotional honesty look like to me?',
  'When do I feel most at ease with another person?',
  'What am I hoping to grow toward right now?',
]

// Placeholder insight lines — NOT a real model. Real, secure AI arrives in Phase 4.
const LENS_LINES = [
  'This reflection leans on emotional safety and slow trust.',
  "There's a gentle theme of curiosity and openness here.",
  'You seem to value presence over performance.',
]

// Create or edit a reflection. `editing` is the existing row (undefined = new).
function ReflectionEditorPage({
  editing,
  onDone,
  onSaved,
  onNavigate,
}: {
  editing?: Reflection
  onDone: () => void
  onSaved: () => void
  onNavigate: (s: Section) => void
}) {
  const { user } = useAuth()
  const toast = useToast()
  const isEdit = Boolean(editing)

  const [prompt, setPrompt] = useState(editing?.prompt ?? PROMPTS[0])
  const [body, setBody] = useState(editing?.body ?? '')
  const [lens, setLens] = useState<string | null>(editing?.lens ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bodyValid = body.trim().length > 0
  const canSave = bodyValid && !saving

  const generateLens = () => {
    if (!bodyValid) {
      toast({ title: 'Write a little first', description: 'The insight reflects on your own words.' })
      return
    }
    setLens(LENS_LINES[Math.floor(Math.random() * LENS_LINES.length)])
    toast({ title: 'Reflection insight ready' })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave || !user) return
    setSaving(true)
    setError(null)
    try {
      const input = { prompt, body: body.trim(), lens }
      if (isEdit && editing) {
        await updateReflection(editing.id, input)
      } else {
        await createReflection(user.id, input)
      }
      toast({ title: 'Reflection saved' })
      onSaved()
      onDone()
    } catch {
      setError("We couldn't save your reflection. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <TopBar title={isEdit ? 'Edit reflection' : 'New reflection'} showBack onBack={onDone} />

      <form onSubmit={save} className="wrap page-main">
        <div className="guided">
          <p className="section-label">Guided prompt</p>
          <div className="stack">
            {PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrompt(p)}
                aria-pressed={prompt === p}
                className={`guided-option ${prompt === p ? 'is-selected' : ''}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <Field label="Your reflection">
          <TextArea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Take your time. Write what feels honest."
            className="tall"
            required
            aria-invalid={body.length > 0 && !bodyValid}
          />
        </Field>

        {lens && <ConnectionLens copy={lens} />}

        <div className="btn-row">
          <SecondaryButton type="button" onClick={() => onNavigate('sam')}>
            <Icon name="message" />
            Talk with Sam
          </SecondaryButton>
          <SecondaryButton type="button" onClick={generateLens}>
            <Icon name="sparkles" />
            Preview reflection insight
          </SecondaryButton>
        </div>

        <p className="note note-left">
          <Icon name="info" size={16} />
          Reflection insight is a gentle preview, not real AI yet — secure AI arrives in a
          later update. It does not provide relationship advice or make decisions for you.
        </p>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <PrimaryButton type="submit" disabled={!canSave}>
          {saving ? 'Saving…' : 'Save reflection'}
        </PrimaryButton>
      </form>
    </div>
  )
}

export default ReflectionEditorPage
