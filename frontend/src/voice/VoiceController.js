export class VoiceController {
  constructor() {
    this.currentUtterance = null;
    this.voices = [];
    this.initVoices();
  }

  get recognitionSupported() {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  get microphoneSupported() {
    return Boolean(navigator.mediaDevices?.getUserMedia);
  }

  get secureContext() {
    return window.isSecureContext;
  }

  initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const loadVoices = () => {
      this.voices = window.speechSynthesis.getVoices() || [];
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  async requestMicrophone() {
    if (!this.secureContext) throw new Error('SECURE_CONTEXT_REQUIRED');
    if (!this.microphoneSupported) throw new Error('MICROPHONE_UNSUPPORTED');
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });
    stream.getTracks().forEach(track => track.stop());
    this.unlockAudio();
  }

  unlockAudio() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.resume();
      // Speak a brief silent space to unlock audio playback permissions
      const silent = new SpeechSynthesisUtterance(' ');
      silent.volume = 0.01;
      silent.rate = 2.0;
      window.speechSynthesis.speak(silent);
    } catch {
      // Ignore unlock errors
    }
  }

  getBestVoice(preferredLang = 'en-US') {
    if (!this.voices.length && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices() || [];
    }
    if (!this.voices.length) return null;

    const targetLang = (preferredLang || 'en').toLowerCase().slice(0, 2);
    const matching = this.voices.filter(v => (v.lang || '').toLowerCase().startsWith(targetLang));
    const candidates = matching.length ? matching : this.voices;

    // Prefer cheerful, female, or natural voices (e.g. Zira, Jenny, Aria, Samantha, Google, Natural)
    const priorityNames = ['zira', 'jenny', 'aria', 'samantha', 'victoria', 'natural', 'google', 'karen'];
    for (const name of priorityNames) {
      const found = candidates.find(v => (v.name || '').toLowerCase().includes(name));
      if (found) return found;
    }

    return candidates[0] || null;
  }

  speak(text, lang = 'en-US') {
    return new Promise(resolve => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
        resolve();
        return;
      }

      try {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
        }
        window.speechSynthesis.resume();
      } catch {
        // Continue
      }

      const speech = new SpeechSynthesisUtterance(text);
      this.currentUtterance = speech; // Retain reference to prevent Garbage Collection bug in Chrome

      const selectedVoice = this.getBestVoice(lang);
      if (selectedVoice) {
        speech.voice = selectedVoice;
        speech.lang = selectedVoice.lang;
      } else {
        speech.lang = lang || navigator.language || 'en-US';
      }

      // Safe rate and pitch for maximum OS and browser compatibility
      speech.rate = 1.0;
      speech.pitch = 1.08;
      speech.volume = 1.0;

      let hasResolved = false;
      const cleanup = () => {
        if (hasResolved) return;
        hasResolved = true;
        this.currentUtterance = null;
        resolve();
      };

      speech.onend = cleanup;
      speech.onerror = () => {
        try { window.speechSynthesis.resume(); } catch { /* ignore */ }
        cleanup();
      };

      // Safety timeout in case browser TTS hangs without firing events
      const safetyTimer = window.setTimeout(cleanup, Math.max(3500, text.length * 120));
      speech.onend = () => {
        window.clearTimeout(safetyTimer);
        cleanup();
      };

      try {
        window.speechSynthesis.speak(speech);
        // Workaround for Chrome bug where speech pauses after cancel
        window.setTimeout(() => {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        }, 50);
      } catch {
        cleanup();
      }
    });
  }

  stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      try { window.speechSynthesis.resume(); } catch { /* ignore */ }
    }
    this.currentUtterance = null;
  }
}
