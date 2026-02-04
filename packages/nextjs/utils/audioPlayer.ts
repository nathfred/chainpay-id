// Alternative implementation using prerecorded audio files
export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private volume = 1.0;

  constructor() {
    if (typeof window !== "undefined") {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  async playPaymentSound(amount: number) {
    // For production, you would host audio files and play them
    // This is a placeholder for the architecture

    // Example: Play different sounds based on amount ranges
    const soundFile = this.getSoundFileForAmount(amount);
    await this.playAudio(soundFile);
  }

  private getSoundFileForAmount(amount: number): string {
    // Map amounts to prerecorded audio files
    if (amount >= 1000000) return "/sounds/million.mp3";
    if (amount >= 100000) return "/sounds/hundred-thousand.mp3";
    if (amount >= 10000) return "/sounds/ten-thousand.mp3";
    return "/sounds/default.mp3";
  }

  private async playAudio(url: string) {
    if (!this.audioContext) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = audioBuffer;
      gainNode.gain.value = this.volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start(0);
    } catch (error) {
      console.error("Audio playback error:", error);
    }
  }
}
