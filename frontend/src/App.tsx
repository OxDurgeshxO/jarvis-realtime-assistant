import { useState, useEffect } from 'react'
import ChatContainer from './components/ChatContainer'
import BootSequence from './components/BootSequence'
import { gatherSystemInfo } from './lib/systemInfo'
import type { SystemInfo } from './types'
import ParticleBackground from './components/ParticleBackground'
import './styles/globals.css'

function App() {
  const [booted, setBooted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [system, setSystem] = useState<SystemInfo | null>(null)

  useEffect(() => {
    gatherSystemInfo().then(setSystem)
    const start = Date.now()
    const duration = 1200
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min(100, (elapsed / duration) * 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(interval)
      }
    }, 35)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <ParticleBackground />
      {!booted && (
        <BootSequence
          progress={progress}
          system={system}
          onDone={() => setBooted(true)}
        />
      )}
      {/* Visual Beta Audit Marker */}
      <div
        id="beta-audit-badge"
        className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 text-xs font-mono shadow-lg shadow-cyan-950/50 backdrop-blur-md pointer-events-auto"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span className="font-semibold tracking-wide">BETA AUDIT PREVIEW</span>
      </div>
      <ChatContainer />
    </>
  )
}

export default App