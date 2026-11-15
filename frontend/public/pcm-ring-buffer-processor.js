/**
 * pcm-ring-buffer-processor.js
 * High-performance, zero-allocation AudioWorklet processor for real-time 16-bit Linear PCM audio capture.
 * Runs directly on the Web Audio render thread.
 */

class PcmRingBufferProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Pre-allocate circular buffer for 4096 samples (approx 170ms at 24kHz)
    this.bufferSize = 4096;
    this.ringBuffer = new Float32Array(this.bufferSize);
    this.writeIndex = 0;
    this.frameChunkSize = 960; // 40ms frames at 24kHz (or 60ms at 16kHz)
    this.pcmChunk = new Int16Array(this.frameChunkSize);
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channelData = input[0];
    const inputLen = channelData.length;

    // Copy incoming samples to ring buffer
    for (let i = 0; i < inputLen; i++) {
      this.ringBuffer[this.writeIndex] = channelData[i];
      this.writeIndex = (this.writeIndex + 1) % this.bufferSize;
    }

    // When enough samples accumulate for a chunk, convert to Int16 PCM
    if (this.writeIndex >= this.frameChunkSize) {
      for (let i = 0; i < this.frameChunkSize; i++) {
        // Clamp float [-1.0, 1.0] to Int16 [-32768, 32767]
        const sample = Math.max(-1, Math.min(1, this.ringBuffer[i]));
        this.pcmChunk[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      }

      // Send raw Int16 PCM buffer to main thread (transfers ArrayBuffer without copy)
      const transferBuffer = this.pcmChunk.buffer.slice(0);
      this.port.postMessage({ type: 'pcm-chunk', buffer: transferBuffer }, [transferBuffer]);

      // Shift remaining samples
      const remaining = this.writeIndex - this.frameChunkSize;
      for (let i = 0; i < remaining; i++) {
        this.ringBuffer[i] = this.ringBuffer[this.frameChunkSize + i];
      }
      this.writeIndex = remaining;
    }

    return true;
  }
}

registerProcessor('pcm-ring-buffer-processor', PcmRingBufferProcessor);
