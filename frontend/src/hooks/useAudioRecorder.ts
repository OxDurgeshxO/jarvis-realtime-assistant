import { useRef, useCallback, useState } from 'react'
import { PcmCaptureController } from '../lib/pcmRingBuffer'

type ChunkHandler = (chunk: Blob | Uint8Array) => void

export interface UseAudioRecorderOptions {
  useWorkletPcm?: boolean
  sampleRate?: number
  onVadStateChange?: (isSpeaking: boolean) => void
}

export function useAudioRecorder(onChunk?: ChunkHandler, options: UseAudioRecorderOptions = {}) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const pcmControllerRef = useRef<PcmCaptureController | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      setError(null)

      if (options.useWorkletPcm && window.AudioWorklet) {
        // High-performance zero-allocation AudioWorklet PCM mode
        const controller = new PcmCaptureController({
          sampleRate: options.sampleRate ?? 24000,
          onChunk: (pcmBytes) => onChunk?.(pcmBytes),
          onVadStateChange: (speaking) => {
            setIsSpeaking(speaking)
            options.onVadStateChange?.(speaking)
          },
        })
        await controller.start()
        pcmControllerRef.current = controller
        setIsRecording(true)
        return
      }

      // Fallback MediaRecorder mode
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          onChunk?.(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      mediaRecorder.start(250)
      setIsRecording(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start recording'
      setError(msg)
    }
  }, [onChunk, options])

  const stopRecording = useCallback(() => {
    if (pcmControllerRef.current) {
      pcmControllerRef.current.stop()
      pcmControllerRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    setIsSpeaking(false)
  }, [])

  return { startRecording, stopRecording, isRecording, isSpeaking, error }
}
