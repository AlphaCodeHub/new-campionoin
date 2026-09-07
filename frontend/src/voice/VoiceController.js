export class VoiceController {
  get recognitionSupported() { return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition); }
  get microphoneSupported() { return Boolean(navigator.mediaDevices?.getUserMedia); }
  get secureContext() { return window.isSecureContext; }
  async requestMicrophone() { if (!this.secureContext) throw new Error('SECURE_CONTEXT_REQUIRED'); if (!this.microphoneSupported) throw new Error('MICROPHONE_UNSUPPORTED'); const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); stream.getTracks().forEach(track => track.stop()); }
  speak(text) { return new Promise(resolve => { speechSynthesis.cancel(); const speech = new SpeechSynthesisUtterance(text); speech.rate = 1.08; speech.pitch = 1.28; speech.volume = 0.9; speech.onend = resolve; speech.onerror = resolve; speechSynthesis.speak(speech); }); }
  stopSpeaking() { speechSynthesis.cancel(); }
}
