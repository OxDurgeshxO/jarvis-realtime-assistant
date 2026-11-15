/**
 * pcmRingBuffer.ts
 * Real-time AudioWorklet Linear PCM Capture Controller with VAD energy estimation.
 * Captures 16-bit linear PCM audio at 24,000 Hz or 16,000 Hz for Gemini Live API streaming.
 */

export interface PcmCaptureOptions {
  sampleRate?: number;
  vadThresholdDb?: number;
  onChunk: (pcmBytes: Uint8Array) => void;
  onVadStateChange?: (isSpeaking: boolean) => void;
}

export class PcmCaptureController {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private options: PcmCaptureOptions;
  private isSpeaking = false;

  constructor(options: PcmCaptureOptions) {
    this.options = {
      sampleRate: options.sampleRate ?? 24000,
      vadThresholdDb: options.vadThresholdDb ?? -45,
      ...options,
    };
  }

  public async start(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: this.options.sampleRate,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    this.mediaStream = stream;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContextClass({
      sampleRate: this.options.sampleRate,
    });

    // Load worklet processor
    await this.audioContext.audioWorklet.addModule('/pcm-ring-buffer-processor.js');

    const source = this.audioContext.createMediaStreamSource(stream);
    this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm-ring-buffer-processor');

    this.workletNode.port.onmessage = (event) => {
      if (event.data?.type === 'pcm-chunk' && event.data.buffer) {
        const int16View = new Int16Array(event.data.buffer);
        const uint8View = new Uint8Array(event.data.buffer);

        // Compute RMS energy for lightweight VAD
        let sumSq = 0;
        for (let i = 0; i < int16View.length; i++) {
          const norm = int16View[i] / 32768;
          sumSq += norm * norm;
        }
        const rms = Math.sqrt(sumSq / int16View.length);
        const db = 20 * Math.log10(rms + 1e-6);

        const speaking = db > (this.options.vadThresholdDb ?? -45);
        if (speaking !== this.isSpeaking) {
          this.isSpeaking = speaking;
          this.options.onVadStateChange?.(speaking);
        }

        // Stream PCM frame
        this.options.onChunk(uint8View);
      }
    };

    source.connect(this.workletNode);
  }

  public stop(): void {
    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isSpeaking = false;
  }
}
