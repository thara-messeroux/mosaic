import { useState } from 'react'
import { Icon } from '../components/Icon'
import { Field, TextInput, PrimaryButton } from '../components/Primitives'
import { useToast } from '../components/Toast'

// Create-account / log-in UI. Local only — submitting just enters the app.
function AuthPage({ onAuthed, onBack }: { onAuthed: () => void; onBack: () => void }) {
  const toast = useToast()
  const [mode, setMode] = useState<'signup' | 'login'>('signup')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: mode === 'signup' ? 'Welcome to Mosaic' : 'Welcome back',
      description: "Let's set up your space to connect.",
    })
    onAuthed()
  }

  return (
    <div className="page">
      <div className="auth-wrap">
        <button type="button" className="link-btn auth-back" onClick={onBack}>
          <Icon name="chevron-left" size={16} /> Back
        </button>

        <header className="center auth-header">
          <span className="wordmark">Mosaic</span>
          <h1 className="auth-title">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="muted">
            {mode === 'signup'
              ? 'Begin slowly. Connect deeply.'
              : "We're glad you're here again."}
          </p>
        </header>

        <form onSubmit={submit} className="stack">
          <Field label="Email">
            <TextInput type="email" required placeholder="you@example.com" autoComplete="email" />
          </Field>
          <Field label="Password">
            <TextInput
              type="password"
              required
              placeholder="••••••••"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </Field>
          <PrimaryButton type="submit">
            {mode === 'signup' ? 'Create account' : 'Log in'}
          </PrimaryButton>
        </form>

        <div className="divider">
          <span className="divider-line" />
          <span>or</span>
          <span className="divider-line" />
        </div>

        {/* Not a working sign-in yet — clearly labeled as a future feature. */}
        <button type="button" className="btn btn-secondary btn-block" disabled>
          Google sign-in coming soon
        </button>

        <button
          type="button"
          className="link-btn auth-switch"
          onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
        >
          {mode === 'signup'
            ? 'Already have an account? Log in'
            : 'New to Mosaic? Create an account'}
        </button>

        <p className="note auth-note">
          <Icon name="lock" size={14} />
          We protect your privacy. Nothing is ever shared without you.
        </p>
      </div>
    </div>
  )
}

export default AuthPage
