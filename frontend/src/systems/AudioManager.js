class AudioManager {
  constructor() { this.context = null; this.enabled = true; }
  getContext() { if (!this.context) this.context = new AudioContext(); return this.context; }
  setEnabled(enabled) { this.enabled = enabled; }
  playSFX(type = 'tap') { if (!this.enabled) return; try { const context = this.getContext(); const oscillator = context.createOscillator(); const gain = context.createGain(); const tones = { tap: [520, .06], happy: [720, .13], eat: [310, .12], sleep: [210, .18], coin: [880, .14], error: [170, .14] }; const [frequency, duration] = tones[type] || tones.tap; oscillator.frequency.setValueAtTime(frequency, context.currentTime); oscillator.frequency.exponentialRampToValueAtTime(frequency * (type === 'coin' ? 1.45 : .72), context.currentTime + duration); gain.gain.setValueAtTime(.07, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + duration); oscillator.connect(gain).connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + duration); } catch { /* Audio can be blocked until a user gesture. */ } }
  stopMusic() {} playMusic() {} setVolume() {}
}
export const audioManager = new AudioManager();
