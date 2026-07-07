import { useEffect, useState } from 'react'
import type { Section } from '../components/navigation'
import { Icon } from '../components/Icon'
import { TopBar } from '../components/TopBar'
import {
  Field,
  TextInput,
  TextArea,
  SectionLabel,
  SelectableChip,
  PrimaryButton,
  SecondaryButton,
} from '../components/Primitives'
import { useAuth } from '../state/AuthProvider'
import { useToast } from '../components/Toast'
import {
  fetchChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge as deleteChallengeRow,
  type Challenge,
} from '../lib/challenges'

const CATEGORIES = ['Curiosity', 'Kindness', 'Honesty', 'Presence', 'Play']
const DURATIONS = ['1 day', '3 days', '7 days']

type LoadState = 'loading' | 'ready' | 'error'

// Shows seeded public challenges plus the signed-in user's own, with create and
// owner-only delete.
function ChallengesPage({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const { user } = useAuth()
  const toast = useToast()
  const userId = user?.id

  const [load, setLoad] = useState<LoadState>('loading')
  const [reloadKey, setReloadKey] = useState(0)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  // Dialog is used for both creating and editing (with the row being edited).
  const [dialog, setDialog] = useState<{ open: boolean; editing?: Challenge }>({ open: false })
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetchChallenges()
      .then((rows) => {
        if (!active) return
        setChallenges(rows)
        setLoad('ready')
      })
      .catch(() => {
        if (active) setLoad('error')
      })
    return () => {
      active = false
    }
  }, [reloadKey])

  const reload = () => setReloadKey((k) => k + 1)
  const retry = () => {
    setLoad('loading')
    reload()
  }

  const confirmDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteChallengeRow(id)
      toast({ title: 'Challenge deleted' })
      setConfirmingId(null)
      reload()
    } catch {
      toast({ title: "We couldn't delete that", description: 'Please try again.' })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <TopBar title="Connection Challenges" showAvatar onAvatar={() => onNavigate('profile')} />

      <main className="wrap page-main">
        <p className="muted">
          Small, low-pressure invitations to practice connection — at your own pace.
        </p>

        <button
          type="button"
          className="dashed-btn"
          onClick={() => setDialog({ open: true })}
        >
          <Icon name="plus" strokeWidth={2} />
          Create challenge
        </button>

        {load === 'loading' && <p className="muted">Loading challenges…</p>}

        {load === 'error' && (
          <div className="stack">
            <p className="auth-error" role="alert">
              We couldn't load challenges.
            </p>
            <div className="narrow">
              <PrimaryButton onClick={retry}>Retry</PrimaryButton>
            </div>
          </div>
        )}

        {load === 'ready' && challenges.length === 0 && (
          <div className="empty">
            <span className="empty-icon">
              <Icon name="sparkles" size={24} strokeWidth={1.5} />
            </span>
            <h3 className="empty-title">No challenges yet</h3>
            <p className="empty-text">
              Create the first one — a small, kind invitation to practice connection.
            </p>
          </div>
        )}

        {load === 'ready' && challenges.length > 0 && (
          <ul className="grid-cards">
            {challenges.map((c) => {
              // Ownership drives the Delete affordance; RLS is the real guard.
              const isOwn = c.user_id === userId
              return (
                <li key={c.id} className="challenge">
                  <div className="challenge-head">
                    <span className="badge">{c.category}</span>
                    <span className="muted-inline">
                      <Icon name="clock" size={14} />
                      {c.duration}
                    </span>
                  </div>
                  <h3 className="challenge-title">{c.title}</h3>
                  <p className="challenge-text">{c.description}</p>

                  {isOwn &&
                    (confirmingId === c.id ? (
                      <div
                        className="row-actions confirm-row"
                        role="alertdialog"
                        aria-label="Confirm delete"
                      >
                        <span className="muted small">Delete this challenge?</span>
                        <button
                          type="button"
                          className="pill-btn"
                          onClick={() => setConfirmingId(null)}
                          disabled={deletingId === c.id}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="pill-btn danger"
                          onClick={() => confirmDelete(c.id)}
                          disabled={deletingId === c.id}
                        >
                          <Icon name="trash" size={16} />
                          {deletingId === c.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    ) : (
                      <div className="row-actions">
                        <button
                          type="button"
                          className="pill-btn grow"
                          onClick={() => setDialog({ open: true, editing: c })}
                        >
                          <Icon name="pencil" size={16} />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="pill-btn grow"
                          onClick={() => setConfirmingId(c.id)}
                        >
                          <Icon name="trash" size={16} />
                          Delete
                        </button>
                      </div>
                    ))}
                </li>
              )
            })}
          </ul>
        )}
      </main>

      {dialog.open && (
        <ChallengeDialog
          userId={userId}
          editing={dialog.editing}
          onClose={() => setDialog({ open: false })}
          onSaved={reload}
        />
      )}
    </div>
  )
}

// Modal sheet to create OR edit a challenge, with validation, saving, and error
// states. Passing `editing` switches it to edit mode (prefilled + "Save changes").
function ChallengeDialog({
  userId,
  editing,
  onClose,
  onSaved,
}: {
  userId?: string
  editing?: Challenge
  onClose: () => void
  onSaved: () => void
}) {
  const toast = useToast()
  const isEdit = Boolean(editing)
  const [title, setTitle] = useState(editing?.title ?? '')
  const [category, setCategory] = useState(editing?.category ?? CATEGORIES[0])
  const [description, setDescription] = useState(editing?.description ?? '')
  const [duration, setDuration] = useState(editing?.duration ?? DURATIONS[1])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSave = title.trim().length > 0 && !saving

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      const input = { title, category, description, duration }
      if (isEdit && editing) {
        await updateChallenge(editing.id, input)
        toast({ title: 'Challenge updated' })
      } else {
        if (!userId) return
        await createChallenge(userId, input)
        toast({ title: 'Challenge created' })
      }
      onSaved()
      onClose()
    } catch {
      setError(
        isEdit
          ? "We couldn't save your changes. Please try again."
          : "We couldn't create your challenge. Please try again.",
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Edit your challenge' : 'Create a connection challenge'}
      onClick={onClose}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 className="modal-title">{isEdit ? 'Edit challenge' : 'New challenge'}</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <Icon name="x" />
          </button>
        </div>

        <form onSubmit={submit} className="modal-body">
          <Field label="Title">
            <TextInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The unhurried question"
              required
            />
          </Field>

          <div>
            <SectionLabel>Category</SectionLabel>
            <div className="chip-wrap">
              {CATEGORIES.map((c) => (
                <SelectableChip
                  key={c}
                  label={c}
                  selected={category === c}
                  onClick={() => setCategory(c)}
                />
              ))}
            </div>
          </div>

          <Field label="Description">
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe a small, kind, low-pressure invitation."
            />
          </Field>

          <div>
            <SectionLabel>Duration</SectionLabel>
            <div className="chip-wrap">
              {DURATIONS.map((d) => (
                <SelectableChip
                  key={d}
                  label={d}
                  selected={duration === d}
                  onClick={() => setDuration(d)}
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <div className="btn-row">
            <SecondaryButton type="button" onClick={onClose}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={!canSave}>
              {saving
                ? isEdit
                  ? 'Saving…'
                  : 'Creating…'
                : isEdit
                  ? 'Save changes'
                  : 'Create'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChallengesPage
