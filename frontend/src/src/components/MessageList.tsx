import { useRef, useEffect } from 'react'
import type { Message } from '../types'

interface Props {
  messages: Message[]
  isStreaming: boolean
}

export default function MessageList({ messages, isStreaming }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-[var(--jarvis-primary)] text-white rounded-br-md'
                : msg.role === 'system'
                  ? 'bg-[var(--jarvis-surface)] text-[var(--jarvis-text-secondary)] italic rounded-bl-md'
                  : 'bg-[var(--jarvis-surface)] text-[var(--jarvis-text)] rounded-bl-md'
            }`}
          >
            {msg.content}
          </div>
        </div>
      ))}

      {isStreaming && (
        <div className="flex justify-start">
          <div className="bg-[var(--jarvis-surface)] rounded-2xl rounded-bl-md px-4 py-3">
            <span className="flex gap-1">
              <span className="w-2 h-2 bg-[var(--jarvis-text-secondary)] rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-[var(--jarvis-text-secondary)] rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-[var(--jarvis-text-secondary)] rounded-full animate-bounce [animation-delay:300ms]" />
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}