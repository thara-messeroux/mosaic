import { useState } from 'react'
import { MosaicProvider } from './state/MosaicProvider'
import { ToastProvider } from './components/Toast'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import AppShell from './components/AppShell'
import './App.css'

type Screen = 'landing' | 'auth' | 'app'

function App() {
  // Top-level screen switch (no router): landing → auth → app shell.
  const [screen, setScreen] = useState<Screen>('landing')

  return (
    <MosaicProvider>
      <ToastProvider>
        {screen === 'landing' && <LandingPage onEnter={() => setScreen('auth')} />}
        {screen === 'auth' && (
          <AuthPage onAuthed={() => setScreen('app')} onBack={() => setScreen('landing')} />
        )}
        {screen === 'app' && <AppShell />}
      </ToastProvider>
    </MosaicProvider>
  )
}

export default App
