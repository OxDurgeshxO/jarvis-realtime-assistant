import { useState, useCallback, useRef, useEffect } from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import VoiceButton from './VoiceButton'
import VoiceSettings from './VoiceSettings'
import ArcReactor from './ArcReactor'
import SystemPanel from './SystemPanel'
import PerformancePanel from './PerformancePanel'
import { useWebSocket } from '../hooks/useWebSocket'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import { usePerformance } from '../hooks/usePerformance'
import { gatherSystemInfo } from '../lib/systemInfo'
import type { Message, WsMessage, VoiceStatus, SystemInfo } from '../types'

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'system-welcome',
      role: 'system',
      content: "J.A.R.V.I.S. neural link online. Systems nominal, sir. How may I assist you?",
      timestamp: Date.now(),
    },
  ])
  const [isStreaming, setIsStreaming] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle')
  const [hudMode, setHudMode] = useState(true)
  const [system, setSystem] = useState<SystemInfo | null>(null)
  const [scanning, setScanning] = useState(false)
  const wsConnectedRef = useRef(false)
  const levelRef = useRef<number>(0.2)

  const { snapshot, history: perfHistory } = usePerformance()
  const { playAudio } = useAudioPlayer()

  const scanSystem = useCallback(async () => {
    setScanning(true)
    try {
      const info = await gatherSystemInfo()
      setSystem(info)
    } finally {
      setScanning(false)
    }
  }, [])

  useEffect(() => {
    scanSystem()
  }, [scanSystem])

  const handleBinaryAudio = useCallback(
    (data: ArrayBuffer) => {
      const blob = new Blob([data], { type: 'audio/webm;codecs=opus' })
      playAudio(blob)
    },
    [playAudio]
  )

  const handleWsMessage = useCallback((msg: WsMessage) => {
    switch (msg.type) {
      case 'token':
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last?.role === 'assistant') {
            return [
              ...prev.slice(0, -1),
              { ...last, content: last.content + msg.content },
            ]
          }
          return [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: msg.content,
              timestamp: Date.now(),
            },
          ]
        })
        break
      case 'done':
        setIsStreaming(false)
        break
      case 'error':
        setIsStreaming(false)
        setVoiceStatus('idle')
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'system',
            content: `Error: ${msg.content}`,
            timestamp: Date.now(),
          },
        ])
        break
      case 'transcript':
        setMessages((prev) => [
          ...prev,
          {
            id: `user-${Date.now()}`,
            role: 'user',
            content: msg.content,
            timestamp: Date.now(),
          },
        ])
        break
      case 'status':
        if (msg.content === 'listening') setVoiceStatus('listening')
        else if (msg.content === 'thinking') setVoiceStatus('thinking')
        else if (msg.content === 'speaking') setVoiceStatus('speaking')
        else setVoiceStatus('idle')
        break
    }
  }, [])

  const { connect, send, sendBinary, disconnect, isConnected } = useWebSocket(
    handleWsMessage,
    handleBinaryAudio
  )

  wsConnectedRef.current = isConnected

  // Audio chunk handler: send recorded audio chunks via WS binary
  const handleAudioChunk = useCallback(
    (chunk: Blob) => {
      if (wsConnectedRef.current) {
        chunk.arrayBuffer().then((buffer) => {
          sendBinary(buffer)
        })
      }
    },
    [sendBinary]
  )

  const { startRecording, stopRecording, error: recorderError } = useAudioRecorder(handleAudioChunk)

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || isStreaming) return

      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: 'user',
          content: content.trim(),
          timestamp: Date.now(),
        },
      ])

      if (!isConnected) {
        connect('/ws/chat')
        // Short delay to let connection establish
        setTimeout(() => send(content), 300)
      } else {
        send(content)
      }
      setIsStreaming(true)
    },
    [isConnected, isStreaming, connect, send]
  )

  const handleVoiceToggle = useCallback(() => {
    if (voiceStatus === 'idle') {
      // Start voice mode: connect WS and begin recording
      connect('/ws/voice')
      startRecording()
    } else {
      // Stop voice mode: end recording and disconnect
      stopRecording()
      disconnect()
      setVoiceStatus('idle')
    }
  }, [voiceStatus, connect, disconnect, startRecording, stopRecording])

  // Log recorder errors
  if (recorderError) {
    console.warn('Audio recorder error:', recorderError)
  }

  return (
    <div className="flex flex-col h-dvh bg-[var(--jarvis-bg)] text-[#cfe8ff] overflow-hidden select-none">
      {/* HUD Header */}
      <header className="flex items-center justify-between px-6 py-2.5 border-b border-cyan-400/20 bg-slate-950/80 backdrop-blur-md shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#38e1ff]" />
          <h1 className="font-display text-base font-bold tracking-[0.25em] text-cyan-200 text-glow">
            J.A.R.V.I.S.
          </h1>
          <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest text-cyan-400/60 border-l border-cyan-400/20 pl-3">
            Realtime Neural Core
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* HUD Mode Toggle Button */}
          <button
            onClick={() => setHudMode((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1 rounded border border-cyan-400/30 text-[11px] font-display uppercase tracking-wider text-cyan-300 hover:bg-cyan-400/10 transition"
          >
            <span>{hudMode ? '◈ Cockpit HUD' : '◇ Minimal Chat'}</span>
          </button>

          <VoiceSettings />

          <div className="flex items-center gap-2 border border-cyan-400/20 bg-cyan-400/5 px-2.5 py-1 rounded-full text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-400 shadow-[0_0_6px_#44ff88]' : 'bg-cyan-400/40'
              }`}
            />
            <span className="text-[11px] text-cyan-300/80">
              {isConnected ? 'LIVE WS' : 'STANDBY'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Cockpit Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative hud-grid">
        {/* Top telemetry & Arc Reactor grid when HUD mode is active */}
        {hudMode && (
          <div className="shrink-0 p-4 border-b border-cyan-400/15 bg-slate-950/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Left: System Panel */}
              <div className="hidden md:block">
                <SystemPanel system={system} scanning={scanning} onRescan={scanSystem} />
              </div>

              {/* Center: Arc Reactor */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative">
                  <ArcReactor mode={voiceStatus} levelRef={levelRef} size={220} />
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-cyan-300/60">REACTOR STATUS:</span>
                  <span className="font-display text-xs font-bold uppercase tracking-wider text-cyan-200 text-glow">
                    {voiceStatus}
                  </span>
                </div>
              </div>

              {/* Right: Performance Panel */}
              <div className="hidden md:block">
                <PerformancePanel snapshot={snapshot} history={perfHistory} />
              </div>
            </div>
          </div>
        )}

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-black/30">
          <MessageList messages={messages} isStreaming={isStreaming} />
        </div>

        {/* Console Input Bar */}
        <div className="flex items-center gap-3 px-6 py-3 border-t border-cyan-400/20 bg-slate-950/80 backdrop-blur-md shrink-0">
          <VoiceButton
            status={voiceStatus}
            onToggle={handleVoiceToggle}
            disabled={isStreaming}
          />
          <div className="flex-1">
            <MessageInput onSend={handleSendMessage} disabled={isStreaming || voiceStatus !== 'idle'} />
          </div>
        </div>
      </div>
    </div>
  )
}