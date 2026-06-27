import { useState, useCallback, useRef } from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import VoiceButton from './VoiceButton'
import VoiceSettings from './VoiceSettings'
import { useWebSocket } from '../hooks/useWebSocket'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import type { Message, WsMessage, VoiceStatus } from '../types'

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'system-welcome',
      role: 'system',
      content: 'Hello, I\'m J.A.R.V.I.S. How can I help you today?',
      timestamp: Date.now(),
    },
  ])
  const [isStreaming, setIsStreaming] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle')
  const wsConnectedRef = useRef(false)

  const { playAudio } = useAudioPlayer()

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

  // Sync connection state ref
  wsConnectedRef.current = isConnected

  // Audio chunk handler: send recorded audio chunks via WS binary
  const handleAudioChunk = useCallback(
    (chunk: Blob) => {
      if (wsConnectedRef.current) {
        chunk.arrayBuffer().then((buf) => sendBinary(buf))
      }
    },
    [sendBinary]
  )

  const {
    startRecording,
    stopRecording,
    error: recorderError,
  } = useAudioRecorder(handleAudioChunk)

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
    <div className="flex flex-col h-dvh bg-[var(--jarvis-bg)]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--jarvis-border)] shrink-0">
        <h1 className="text-lg font-semibold text-[var(--jarvis-text)]">
          J.A.R.V.I.S.
        </h1>
        <div className="flex items-center gap-3">
          <VoiceSettings />
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-[var(--jarvis-text-secondary)]'
              }`}
            />
            <span className="text-xs text-[var(--jarvis-text-secondary)]">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <MessageList messages={messages} isStreaming={isStreaming} />

      {/* Input area */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-[var(--jarvis-border)] shrink-0">
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
  )
}