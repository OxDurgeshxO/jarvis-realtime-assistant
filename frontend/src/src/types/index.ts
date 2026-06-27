export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export interface WsMessage {
  type: 'message' | 'token' | 'done' | 'error' | 'transcript' | 'status'
  content: string
}

export type VoiceStatus = 'idle' | 'listening' | 'thinking' | 'speaking'

export interface ChatState {
  messages: Message[]
  isConnected: boolean
  isStreaming: boolean
}

export interface VoiceState {
  status: VoiceStatus
  isMicActive: boolean
}