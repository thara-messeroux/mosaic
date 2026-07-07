import { useState } from 'react'
import { MosaicProvider } from './state/MosaicProvider'
import { AuthProvider, useAuth } from './state/AuthProvider'
import { useHasProfile } from './state/useHasProfile'
import { ToastProvider } from './components/Toast'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import AppShell from './components/AppShell'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MosaicProvider>
          <Root />
        </MosaicProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

// Renders by auth session: booting → splash, signed out → landing/auth,
// signed in → the app shell.
function Root() {
  const { session, loading } = useAuth()
  if (loading) return <Splash />
  if (!session) return <LoggedOut />
  return <SignedIn />
}

// Signed-out flow: landing → account screen (in sign-up or sign-in mode).
type LoggedOutView = { screen: 'landing' } | { screen: 'auth'; mode: 'signup' | 'login' }

function LoggedOut() {
  const [view, setView] = useState<LoggedOutView>({ screen: 'landing' })

  if (view.screen === 'auth') {
    return <AuthPage mode={view.mode} onBack={() => setView({ screen: 'landing' })} />
  }
  return (
    <LandingPage
      onJoin={() => setView({ screen: 'auth', mode: 'signup' })}
      onSignIn={() => setView({ screen: 'auth', mode: 'login' })}
    />
  )
}

// Signed-in: route first-time users (no profile row) to the Profile section.
function SignedIn() {
  const { user } = useAuth()
  const { status, markPresent } = useHasProfile(user?.id)
  if (status === 'loading') return <Splash />
  return <AppShell firstRun={status === 'missing'} onProfileSaved={markPresent} />
}

// Minimal Mosaic loading state.
function Splash() {
  return (
    <div className="splash">
      <span className="wordmark">Mosaic</span>
      <p className="splash-text">Meet slowly. Connect deeply.</p>
    </div>
  )
}

export default App
