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

        {/* Visual only — not real OAuth yet. Clicking explains it's coming soon. */}
        <button
          type="button"
          className="btn btn-secondary btn-block"
          onClick={() => toast({ title: 'Google sign-in is coming soon.' })}
        >
          <GoogleMark />
          Continue with Google
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

// Small multicolor Google "G" mark (visual only).
function GoogleMark() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

export default AuthPage
