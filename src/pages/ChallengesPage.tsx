import { useState } from 'react'
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
import { useMosaic } from '../state/MosaicProvider'
import { useToast } from '../components/Toast'

const CATEGORIES = ['Curiosity', 'Kindness', 'Honesty', 'Presence', 'Play']
const DURATIONS = ['1 day', '3 days', '7 days']

function ChallengesPage({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const { challenges, addChallenge, deleteChallenge } = useMosaic()
  const toast = useToast()
  const [open, setOpen] = useState(false)

  const remove = (id: string) => {
    deleteChallenge(id)
    toast({ title: 'Challenge deleted' })
  }

  return (
    <div>
      <TopBar title="Connection Challenges" showAvatar onAvatar={() => onNavigate('profile')} />

      <main className="wrap page-main">
        <p className="muted">
          Small, low-pressure invitations to practice connection — at your own pace.
        </p>

        <button type="button" className="dashed-btn" onClick={() => setOpen(true)}>
          <Icon name="plus" strokeWidth={2} />
          Create challenge
        </button>

        <ul className="grid-cards">
          {challenges.map((c) => (
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

              {c.isOwn && (
                <div className="row-actions">
                  <button type="button" className="pill-btn grow" onClick={() => remove(c.id)}>
                    <Icon name="trash" size={16} />
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </main>

      {open && <CreateChallengeDialog onClose={() => setOpen(false)} onCreate={addChallenge} />}
    </div>
  )
}

function CreateChallengeDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (c: { title: string; category: string; description: string; duration: string }) => void
}) {
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(DURATIONS[1])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onCreate({ title, category, description, duration })
    toast({ title: 'Challenge created' })
    onClose()
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Create a connection challenge"
      onClick={onClose}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 className="modal-title">New challenge</h2>
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

          <div className="btn-row">
            <SecondaryButton type="button" onClick={onClose}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit">Create</PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChallengesPage
