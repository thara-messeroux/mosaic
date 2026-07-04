import { useState } from 'react'
import LandingPage from './LandingPage'
import AppShell from './AppShell'
import './App.css'

type Screen = 'landing' | 'app'

function App() {
  // Simple local toggle between the landing screen and the app shell (no router yet).
  const [screen, setScreen] = useState<Screen>('landing')

  if (screen === 'app') {
    return <AppShell />
  }

  return <LandingPage onEnter={() => setScreen('app')} />
}

export default App
