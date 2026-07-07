import { useEffect, useState } from 'react'
import type { Section } from '../components/navigation'
import { Icon } from '../components/Icon'
import { TopBar } from '../components/TopBar'
import { PrimaryButton } from '../components/Primitives'
import { useAuth } from '../state/AuthProvider'
import { useToast } from '../components/Toast'
import { ReflectionLens } from '../components/ReflectionLens'
import { generateLens, AiError } from '../lib/ai'
import {
  fetchMyReflections,
  deleteReflection as deleteReflectionRow,
  formatReflectionDate,
  type Reflection,
} from '../lib/reflections'
import ReflectionEditorPage from './ReflectionEditorPage'

type LoadState = 'loading' | 'ready' | 'error'

// Shows the signed-in user's own reflections (newest first) with create/edit/delete.
function ReflectionsPage({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const { user } = useAuth()
  const toast = useToast()
  const userId = user?.id

  const [load, setLoad] = useState<LoadState>('loading')
  const [reloadKey, setReloadKey] = useState(0)
  const [reflections, setReflections] = useState<Reflection[]>([])
  // Editor view: closed, creating (no row), or editing a specific row.
  const [editor, setEditor] = useState<{ open: boolean; editing?: Reflection }>({ open: false })
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    let active = true
    fetchMyReflections(userId)
      .then((rows) => {
        if (!active) return
        setReflections(rows)
        setLoad('ready')
      })
      .catch(() => {
        if (active) setLoad('error')
      })
    return () => {
      active = false
    }
  }, [userId, reloadKey])

  const reload = () => setReloadKey((k) => k + 1)
  const retry = () => {
    setLoad('loading')
    reload()
  }

  const confirmDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteReflectionRow(id)
      toast({ title: 'Reflection deleted' })
      setConfirmingId(null)
      reload()
    } catch {
      toast({ title: "We couldn't delete that", description: 'Please try again.' })
    } finally {
      setDeletingId(null)
    }
  }

  // Generate (or regenerate) a real AI Connection Lens for one saved reflection.
  const generate = async (id: string) => {
    if (generatingId) return // one at a time; avoids accidental repeat calls
    setGeneratingId(id)
    try {
      await generateLens(id)
      toast({ title: 'Connection Lens ready' })
      reload()
    } catch (e) {
      // Prefer the function's friendly message (e.g. the daily limit).
      if (e instanceof AiError && e.userMessage) {
        toast({ title: e.userMessage })
      } else {
        toast({ title: "We couldn't generate a lens", description: 'Please try again.' })
      }
    } finally {
      setGeneratingId(null)
    }
  }

  if (editor.open) {
    return (
      <ReflectionEditorPage
        editing={editor.editing}
        onDone={() => setEditor({ open: false })}
        onSaved={reload}
        onNavigate={onNavigate}
      />
    )
  }

  return (
    <div>
      <TopBar title="My Reflections" showAvatar onAvatar={() => onNavigate('profile')} />

      <main className="wrap page-main">
        <p className="muted">A private space to notice what you're looking for.</p>

        <button type="button" className="dashed-btn" onClick={() => setEditor({ open: true })}>
          <Icon name="plus" strokeWidth={2} />
          Create reflection
        </button>

        {load === 'loading' && <p className="muted">Loading your reflections…</p>}

        {load === 'error' && (
          <div className="stack">
            <p className="auth-error" role="alert">
              We couldn't load your reflections.
            </p>
            <div className="narrow">
              <PrimaryButton onClick={retry}>Retry</PrimaryButton>
            </div>
          </div>
        )}

        {load === 'ready' && reflections.length === 0 && (
          <div className="empty">
            <span className="empty-icon">
              <Icon name="notebook" size={24} strokeWidth={1.5} />
            </span>
            <h3 className="empty-title">Your reflections begin here</h3>
            <p className="empty-text">
              Take a quiet moment to notice what matters to you in connection. There's no
              wrong answer — only what's true today.
            </p>
            <div className="narrow">
              <PrimaryButton onClick={() => setEditor({ open: true })}>
                <Icon name="plus" strokeWidth={2} />
                Write your first reflection
              </PrimaryButton>
            </div>
          </div>
        )}

        {load === 'ready' && reflections.length > 0 && (
          <ul className="list">
            {reflections.map((r) => (
              <li key={r.id} className="reflection">
                <p className="reflection-date">{formatReflectionDate(r.createdAt)}</p>
                <p className="reflection-prompt">{r.prompt}</p>
                <p className="reflection-body">{r.body}</p>

                {r.lens ? (
                  <>
                    <ReflectionLens lens={r.lens} />
                    <button
                      type="button"
                      className="link-btn lens-regen"
                      onClick={() => generate(r.id)}
                      disabled={generatingId === r.id}
                    >
                      <Icon name="rotate" size={14} />
                      {generatingId === r.id ? 'Regenerating…' : 'Regenerate lens'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="pill-btn lens-generate"
                    onClick={() => generate(r.id)}
                    disabled={generatingId === r.id}
                  >
                    <Icon name="sparkles" size={16} />
                    {generatingId === r.id ? 'Generating…' : 'Generate Connection Lens'}
                  </button>
                )}

                {confirmingId === r.id ? (
                  <div className="row-actions confirm-row" role="alertdialog" aria-label="Confirm delete">
                    <span className="muted small">Delete this reflection?</span>
                    <button
                      type="button"
                      className="pill-btn"
                      onClick={() => setConfirmingId(null)}
                      disabled={deletingId === r.id}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="pill-btn danger"
                      onClick={() => confirmDelete(r.id)}
                      disabled={deletingId === r.id}
                    >
                      <Icon name="trash" size={16} />
                      {deletingId === r.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                ) : (
                  <div className="row-actions">
                    <button
                      type="button"
                      className="pill-btn"
                      onClick={() => setEditor({ open: true, editing: r })}
                    >
                      <Icon name="pencil" size={16} />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="pill-btn"
                      onClick={() => setConfirmingId(r.id)}
                    >
                      <Icon name="trash" size={16} />
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

export default ReflectionsPage
