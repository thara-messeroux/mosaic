import { useState } from 'react'
import type { Section } from '../components/navigation'
import { Icon } from '../components/Icon'
import { TopBar } from '../components/TopBar'
import { PrimaryButton } from '../components/Primitives'
import { useMosaic } from '../state/MosaicProvider'
import { useToast } from '../components/Toast'
import ReflectionEditorPage from './ReflectionEditorPage'

function ReflectionsPage({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const { reflections, deleteReflection } = useMosaic()
  const toast = useToast()
  // Internal view: the list, or the editor (with an optional id when editing).
  const [editor, setEditor] = useState<{ open: boolean; id?: string }>({ open: false })

  if (editor.open) {
    return (
      <ReflectionEditorPage
        id={editor.id}
        onDone={() => setEditor({ open: false })}
        onNavigate={onNavigate}
      />
    )
  }

  const remove = (id: string) => {
    deleteReflection(id)
    toast({ title: 'Reflection deleted' })
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

        {reflections.length === 0 ? (
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
        ) : (
          <ul className="list">
            {reflections.map((r) => (
              <li key={r.id} className="reflection">
                <p className="reflection-date">{r.date}</p>
                <p className="reflection-prompt">{r.prompt}</p>
                <p className="reflection-body">{r.body}</p>

                {r.lens && (
                  <div className="lens-inline">
                    <Icon name="sparkles" size={16} />
                    <span>{r.lens}</span>
                  </div>
                )}

                {r.isOwn && (
                  <div className="row-actions">
                    <button
                      type="button"
                      className="pill-btn"
                      onClick={() => setEditor({ open: true, id: r.id })}
                    >
                      <Icon name="pencil" size={16} />
                      Edit
                    </button>
                    <button type="button" className="pill-btn" onClick={() => remove(r.id)}>
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
