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
    const load = () => {
      this.voices = window.speechSynthesis.getVoices() || [];
    };
    load();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = load;
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
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      // Speak a brief blank space to prime the audio engine on user gesture
      const primer = new SpeechSynthesisUtterance('');
      window.speechSynthesis.speak(primer);
    } catch {
      // Ignore unlock errors
    }
  }

  getBestVoice(preferredLang = 'en-US') {
    if (!this.voices.length && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices() || [];
    }
    if (!this.voices.length) return null;

    const target = (preferredLang || 'en').toLowerCase().slice(0, 2);
    const matching = this.voices.filter(v => (v.lang || '').toLowerCase().startsWith(target));
    const candidates = matching.length ? matching : this.voices;

    // Cheerful English / Natural voice preferences
    const priorityNames = ['zira', 'jenny', 'aria', 'samantha', 'victoria', 'google', 'natural', 'david', 'mark'];
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
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
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
        speech.lang = lang || 'en-US';
      }

      speech.rate = 1.0;
      speech.pitch = 1.0;
      speech.volume = 1.0;

      let hasResolved = false;
      const cleanup = () => {
        if (hasResolved) return;
        hasResolved = true;
        this.currentUtterance = null;
        resolve();
      };

      speech.onend = cleanup;
      speech.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        try { window.speechSynthesis.resume(); } catch { /* ignore */ }
        cleanup();
      };

      // Safety timeout to prevent hanging UI
      const safetyTimer = window.setTimeout(cleanup, Math.max(3500, text.length * 140));
      speech.onend = () => {
        window.clearTimeout(safetyTimer);
        cleanup();
      };

      try {
        window.speechSynthesis.speak(speech);
        // Chrome bug workaround: ensure synthesis is unpaused
        window.setTimeout(() => {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        }, 50);
      } catch (err) {
        console.error('speak error:', err);
        cleanup();
      }
    });
  }

  stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
      } catch { /* ignore */ }
    }
    this.currentUtterance = null;
  }
}
