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

export type ReactorMode = 'idle' | 'listening' | 'thinking' | 'speaking' | 'warning'

export interface GpuInfo {
  vendor: string
  renderer: string
  webglVersion?: string
  maxTextureSize?: number
}

export interface ScreenInfo {
  width: number
  height: number
  availWidth: number
  availHeight: number
  colorDepth: number
  pixelRatio: number
  orientation?: string
}

export interface ConnectionInfo {
  available: boolean
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}

export interface BatteryInfo {
  supported: boolean
  level?: number
  charging?: boolean
  chargingTime?: number
  dischargingTime?: number
}

export interface SystemFeatures {
  webgl2: boolean
  touch: boolean
  maxTouchPoints: number
  serviceWorker: boolean
  cookieEnabled: boolean
  online: boolean
  doNotTrack?: string
  languages: string[]
  timezone: string
}

export interface SystemInfo {
  cpuCores: number
  deviceMemory: number
  gpu: GpuInfo
  screen: ScreenInfo
  platform: string
  platformBits?: number
  browser: string
  browserVersion?: string
  engine?: string
  userAgent: string
  connection: ConnectionInfo
  battery: BatteryInfo
  features: SystemFeatures
  jarvisIndex: number
  scannedAt: number
}

export interface PerfSnapshot {
  fps: number
  msPerFrame: number
  memoryUsedMB: number
  memoryTotalMB: number
  jsHeapLimitMB: number
  memorySupported: boolean
}