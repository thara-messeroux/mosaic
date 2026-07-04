import { useEffect, useRef, useState } from 'react'
import type { Section } from '../components/navigation'
import { Icon } from '../components/Icon'
import { TopBar } from '../components/TopBar'
import { PrimaryButton, SecondaryButton } from '../components/Primitives'
import { useToast } from '../components/Toast'

interface Question {
  text: string
  chips: string[]
}

// The questions are a set of gentle prompts that Sam will ask the user to reflect on. 
// Each question has a set of suggested answers (chips) that the user can select from, or they can write their own answer.
const QUESTIONS: Question[] = [
  {
    text: 'When do you feel most at ease with another person?',
    chips: ['In easy silence', 'Over a shared meal', 'On a long walk', "When we're laughing"],
  },
  {
    text: 'What helps you feel emotionally safe?',
    chips: ['Being heard', 'Steady honesty', 'No judgment', 'Gentle patience'],
  },
  {
    text: 'What kind of connection are you hoping to build slowly?',
    chips: ['Friendship first', 'Something lasting', 'Warm and unhurried', 'Deeply honest'],
  },
  {
    text: 'Which values matter most in your everyday life?',
    chips: ['Kindness', 'Curiosity', 'Loyalty', 'Emotional honesty', 'Growth'],
  },
  {
    text: 'How do you like to feel supported when life is hard?',
    chips: ['Just presence', 'Practical help', 'Space, then talk', 'Reassurance'],
  },
]

interface Turn {
  q: string
  a: string
}

// The Sam page is a private reflection companion that asks the user a series of gentle questions and collects their answers.
function SamPage({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const [step, setStep] = useState(0)
  const [turns, setTurns] = useState<Turn[]>([])
  const [draft, setDraft] = useState('')
  const [done, setDone] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  const q = QUESTIONS[step]

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turns, step, done])

  const answer = (text: string) => {
    if (!text.trim()) return
    setTurns((prev) => [...prev, { q: q.text, a: text }])
    setDraft('')
    if (step + 1 < QUESTIONS.length) setStep(step + 1)
    else setDone(true)
  }

  const skip = () => {
    setTurns((prev) => [...prev, { q: q.text, a: '(skipped)' }])
    if (step + 1 < QUESTIONS.length) setStep(step + 1)
    else setDone(true)
  }

  const restart = () => {
    setStep(0)
    setTurns([])
    setDraft('')
    setDone(false)
  }

  if (done) return <LensResult onRestart={restart} onNavigate={onNavigate} />

  return (
    <div className="sam">
      <TopBar title="Sam, your Mosaic guide" />

      <div className="sam-thread">
        <div className="wrap sam-list">
          <div className="sam-msg-row">
            <SamAvatar />
            <div>
              <p className="sam-name">
                Sam <span className="muted">· Your Mosaic Guide</span>
              </p>
              <div className="sam-bubble">
                Hi, I'm Sam — a private reflection companion. I'm not a matchmaker or
                therapist. I'll ask a few gentle questions to help you notice what matters to
                you. Take your time.
              </div>
            </div>
          </div>

          {turns.map((t, i) => (
            <div key={i} className="sam-turn">
              <div className="sam-msg-row">
                <SamAvatar />
                <div className="sam-bubble">{t.q}</div>
              </div>
              <div className="sam-me-row">
                <div className="sam-bubble sam-bubble-me">{t.a}</div>
              </div>
            </div>
          ))}

          <div className="sam-msg-row">
            <SamAvatar />
            <div className="sam-bubble">{q.text}</div>
          </div>

          <div ref={endRef} />
        </div>
      </div>

      <div className="sam-composer">
        <div className="wrap sam-composer-inner">
          <div className="between">
            <span className="count">
              Question {step + 1} of {QUESTIONS.length}
            </span>
            <button type="button" className="pill-btn small-pill" onClick={skip}>
              <Icon name="skip" size={16} />
              Skip
            </button>
          </div>

          <div className="chip-wrap">
            {q.chips.map((c) => (
              <button key={c} type="button" className="chip chip-select" onClick={() => answer(c)}>
                {c}
              </button>
            ))}
          </div>

          <form
            className="sam-input-row"
            onSubmit={(e) => {
              e.preventDefault()
              answer(draft)
            }}
          >
            <label className="sr-only" htmlFor="sam-input">
              Your answer
            </label>
            <input
              id="sam-input"
              className="input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write your own answer…"
            />
            <button
              type="submit"
              className="send-btn"
              disabled={!draft.trim()}
              aria-label="Send answer"
            >
              <Icon name="send" />
            </button>
          </form>

          <p className="note">
            <Icon name="lock" size={14} />
            This conversation is private. Sam supports reflection — you decide what feels right.
          </p>
        </div>
      </div>
    </div>
  )
}

// The SamAvatar component renders a small icon representing Sam, the reflection companion. 
// It is used in the chat interface to indicate messages from Sam.
function SamAvatar() {
  return (
    <span className="sam-avatar" aria-hidden="true">
      <Icon name="sparkles" size={16} />
    </span>
  )
}

function LensResult({
  onRestart,
  onNavigate,
}: {
  onRestart: () => void
  onNavigate: (s: Section) => void
}) {
  const toast = useToast()
  const rows = [
    { icon: 'heart' as const, label: 'Top values', value: 'Kindness, curiosity, and emotional honesty' },
    { icon: 'waves' as const, label: 'Preferred connection style', value: 'Warm, unhurried, and honest' },
    {
      icon: 'sparkles' as const,
      label: 'What helps you feel connected',
      value: 'Being truly heard, in easy, patient presence',
    },
  ]

  // The saveToReflections function saves the generated connection lens to the user's reflections and shows a toast notification.
  const saveToReflections = () => {
    toast({ title: 'Saved to your reflections' })
    onNavigate('reflections')
  }

  return (
    <div>
      <TopBar title="Your Connection Lens" showBack onBack={onRestart} />

      <main className="wrap page-main">
        <div className="lens-hero">
          <span className="lens-hero-icon">
            <Icon name="sparkles" size={24} />
          </span>
          <h2 className="lens-hero-title">Your Connection Lens</h2>
          <p className="muted">A gentle summary of what you shared with Sam.</p>
        </div>

        <div className="stack">
          {rows.map((row) => (
            <div key={row.label} className="lens-row">
              <span className="lens-row-icon">
                <Icon name={row.icon} />
              </span>
              <div>
                <p className="section-label">{row.label}</p>
                <p className="lens-row-value">{row.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="prompt-box">
          <p className="section-label">One gentle conversation prompt</p>
          <p className="prompt-a">
            “What's something small that made you feel cared for this week?”
          </p>
        </div>

        <p className="center muted small">
          Sam supports reflection. You decide what feels right.
        </p>

        <div className="btn-row">
          <SecondaryButton onClick={onRestart}>
            <Icon name="rotate" />
            Start again
          </SecondaryButton>
          <PrimaryButton onClick={saveToReflections}>Save to my reflections</PrimaryButton>
        </div>
      </main>
    </div>
  )
}

export default SamPage
