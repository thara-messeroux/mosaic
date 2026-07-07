import { useState } from 'react'
import type { Section } from '../components/navigation'
import { Icon } from '../components/Icon'
import { TopBar } from '../components/TopBar'
import { Field, TextArea, PrimaryButton, SecondaryButton } from '../components/Primitives'
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

// Create or edit a reflection. `editing` is the existing row (undefined = new).
// The AI Connection Lens is generated later from the saved reflection card.
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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bodyValid = body.trim().length > 0
  const canSave = bodyValid && !saving

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave || !user) return
    setSaving(true)
    setError(null)
    try {
      const input = { prompt, body: body.trim() }
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

        <div className="btn-row">
          <SecondaryButton type="button" onClick={() => onNavigate('sam')}>
            <Icon name="message" />
            Talk with Sam
          </SecondaryButton>
        </div>

        <p className="note note-left">
          <Icon name="info" size={16} />
          After saving, you can generate an AI Connection Lens from your reflection — a
          gentle reflection aid, not advice or diagnosis.
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
