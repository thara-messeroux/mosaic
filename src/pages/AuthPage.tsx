import { useState } from 'react'
import { Icon } from '../components/Icon'
import { Field, TextInput, PrimaryButton } from '../components/Primitives'
import { useToast } from '../components/Toast'
import { useAuth } from '../state/AuthProvider'

type Mode = 'signup' | 'login'

// Turns Supabase auth errors into gentle, human messages.
function friendlyError(message: string, mode: Mode): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return "That email or password doesn't match."
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'This email is already registered — try signing in.'
  if (m.includes('email not confirmed'))
    return 'Please confirm your email first — check your inbox.'
  if (m.includes('password')) return 'Please use a password with at least 8 characters.'
  return mode === 'signup'
    ? "We couldn't create your account. Please try again."
    : "We couldn't sign you in. Please try again."
}

function AuthPage({ mode: initialMode, onBack }: { mode: Mode; onBack: () => void }) {
  const toast = useToast()
  const { signUpWithPassword, signInWithPassword } = useAuth()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmSent, setConfirmSent] = useState(false)

  const emailValid = /\S+@\S+\.\S+/.test(email)
  const passwordValid = password.length >= 8
  const canSubmit = emailValid && passwordValid && !submitting

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)

    const action = mode === 'signup' ? signUpWithPassword : signInWithPassword
    const { error: authError, needsEmailConfirmation } = await action(email, password)
    setSubmitting(false)

    if (authError) {
      setError(friendlyError(authError.message, mode))
      return
    }
    if (mode === 'signup' && needsEmailConfirmation) {
      setConfirmSent(true)
      return
    }
    // Otherwise the session updates and the app routes automatically.
    toast({
      title: mode === 'signup' ? 'Welcome to Mosaic' : 'Welcome back',
      description: "Let's set up your space to connect.",
    })
  }

  const switchMode = () => {
    setMode(mode === 'signup' ? 'login' : 'signup')
    setError(null)
  }

  // Email-confirmation state — shown after a sign-up that needs verification.
  if (confirmSent) {
    return (
      <div className="page">
        <div className="auth-wrap">
          <button type="button" className="link-btn auth-back" onClick={onBack}>
            <Icon name="chevron-left" size={16} /> Back
          </button>
          <div className="auth-confirm">
            <span className="auth-confirm-icon">
              <Icon name="message" size={24} />
            </span>
            <h1 className="auth-title">Check your inbox</h1>
            <p className="muted">
              We sent a confirmation link to <strong>{email}</strong>. Open it to finish
              creating your account — this page will continue once you're confirmed.
            </p>
            <button
              type="button"
              className="link-btn auth-switch"
              onClick={() => {
                setConfirmSent(false)
                setPassword('')
              }}
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    )
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

        <form onSubmit={submit} className="stack" noValidate>
          <Field label="Email">
            <TextInput
              type="email"
              required
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={email.length > 0 && !emailValid}
            />
          </Field>
          <Field label="Password">
            <TextInput
              type="password"
              required
              placeholder="••••••••"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={password.length > 0 && !passwordValid}
              aria-describedby="password-hint"
            />
          </Field>
          {mode === 'signup' && (
            <p id="password-hint" className="field-hint">
              At least 8 characters.
            </p>
          )}

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <PrimaryButton type="submit" disabled={!canSubmit}>
            {submitting
              ? mode === 'signup'
                ? 'Creating account…'
                : 'Signing in…'
              : mode === 'signup'
                ? 'Create account'
                : 'Log in'}
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

        <button type="button" className="link-btn auth-switch" onClick={switchMode}>
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
