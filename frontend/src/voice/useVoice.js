import { useEffect, useRef, useState } from 'react';
import { VoiceController } from './VoiceController';
import { generateCompanionReply } from './companionBrain';

export function useVoice({ onSpeech, companionName = 'Nova', stats = {}, voiceEnabled = true } = {}) {
  const controller = useRef(new VoiceController()).current;
  const recognition = useRef(null);
  const keepListening = useRef(false);
  const speaking = useRef(false);
  const restartTimer = useRef(null);
  const debounceTimer = useRef(null);

  const onSpeechRef = useRef(onSpeech);
  onSpeechRef.current = onSpeech;

  const companionNameRef = useRef(companionName);
  companionNameRef.current = companionName;

  const statsRef = useRef(stats);
  statsRef.current = stats;

  const voiceEnabledRef = useRef(voiceEnabled);
  voiceEnabledRef.current = voiceEnabled;

  const [listening, setListening] = useState(false);
  const [isSpeaking, setSpeaking] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [lastHeard, setLastHeard] = useState('');
  const [error, setError] = useState('');

  function cleanTimers() {
    if (restartTimer.current) {
      clearTimeout(restartTimer.current);
      restartTimer.current = null;
    }
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
  }

  async function processSpokenPhrase(phrase) {
    const text = (phrase || '').trim();
    if (!text || speaking.current) return;

    cleanTimers();
    speaking.current = true;

    if (recognition.current) {
      try {
        recognition.current.stop();
      } catch { /* ignore */ }
    }
    setListening(false);

    // Generate companion reply
    const replyData = generateCompanionReply(text, companionNameRef.current, statsRef.current);

    if (onSpeechRef.current) {
      onSpeechRef.current({ userText: text, ...replyData });
    }

    // Speak the companion reply with voice synthesis
    if (voiceEnabledRef.current) {
      setSpeaking(true);
      await controller.speak(replyData.reply, 'en-US');
      setSpeaking(false);
    }

    speaking.current = false;
    if (keepListening.current) {
      restartTimer.current = setTimeout(startRecognition, 350);
    }
  }

  function startRecognition() {
    cleanTimers();
    if (!keepListening.current || speaking.current) return;

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      if (recognition.current) {
        recognition.current.onend = null;
        recognition.current.onerror = null;
        recognition.current.abort();
      }
    } catch {
      // Continue
    }

    const instance = new Recognition();
    recognition.current = instance;

    instance.lang = 'en-US';
    instance.continuous = true;
    instance.interimResults = true;
    instance.maxAlternatives = 1;

    instance.onstart = () => {
      setListening(true);
      setError('');
    };

    instance.onresult = event => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      const currentText = (finalTranscript || interimTranscript).trim();
      if (!currentText) return;

      setLastHeard(currentText);

      // If speech recognizer finalized the sentence
      if (finalTranscript.trim()) {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        processSpokenPhrase(finalTranscript);
      } else {
        // Wait 750ms of silence so the full user sentence (e.g. "Hello Nova") is completed
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
          processSpokenPhrase(currentText);
        }, 750);
      }
    };

    instance.onerror = event => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        keepListening.current = false;
        setEnabled(false);
        setListening(false);
        setError('Microphone permission was blocked. Please allow microphone access in your browser settings.');
      } else if (event.error === 'no-speech') {
        // Normal silence timeout in Chrome, continue listening
      } else if (event.error === 'network') {
        setError('Speech recognition requires an internet connection.');
      }
    };

    instance.onend = () => {
      setListening(false);
      if (keepListening.current && !speaking.current) {
        cleanTimers();
        restartTimer.current = setTimeout(startRecognition, 200);
      }
    };

    try {
      instance.start();
    } catch {
      if (keepListening.current && !speaking.current) {
        cleanTimers();
        restartTimer.current = setTimeout(startRecognition, 500);
      }
    }
  }

  async function enableHandsFree() {
    setError('');
    cleanTimers();

    if (!controller.secureContext) {
      setError('Microphone requires HTTPS or localhost. Open this game securely, then try again.');
      return;
    }
    if (!controller.recognitionSupported) {
      setError('This browser does not support Speech Recognition. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    try {
      await controller.requestMicrophone();
      controller.unlockAudio();
      keepListening.current = true;
      setEnabled(true);
      startRecognition();
    } catch (err) {
      console.error('Microphone access error:', err);
      if (err.message === 'MICROPHONE_UNSUPPORTED') {
        setError('Microphone hardware is not available on this device.');
      } else if (err.message === 'SECURE_CONTEXT_REQUIRED') {
        setError('Microphone access requires HTTPS or localhost.');
      } else {
        setError('Microphone permission is required. Please allow microphone in your browser.');
      }
    }
  }

  function stopHandsFree() {
    keepListening.current = false;
    cleanTimers();
    if (recognition.current) {
      try {
        recognition.current.onend = null;
        recognition.current.onerror = null;
        recognition.current.abort();
      } catch { /* ignore */ }
    }
    controller.stopSpeaking();
    setListening(false);
    setSpeaking(false);
    setEnabled(false);
  }

  // Speak any text aloud using the companion voice
  async function speakText(text) {
    if (!voiceEnabledRef.current || !text) return;
    controller.unlockAudio();
    setSpeaking(true);
    await controller.speak(text, 'en-US');
    setSpeaking(false);
  }

  // Send a message to companion (triggers animation, brain reply & voice)
  async function sendChatMessage(text) {
    if (!text) return;
    controller.unlockAudio();
    setLastHeard(text);
    const replyData = generateCompanionReply(text, companionNameRef.current, statsRef.current);
    if (onSpeechRef.current) {
      onSpeechRef.current({ userText: text, ...replyData });
    }
    if (voiceEnabledRef.current) {
      setSpeaking(true);
      await controller.speak(replyData.reply, 'en-US');
      setSpeaking(false);
    }
  }

  useEffect(() => () => stopHandsFree(), []);

  return {
    listening,
    speaking: isSpeaking,
    enabled,
    lastHeard,
    error,
    enableHandsFree,
    stopHandsFree,
    speakText,
    sendChatMessage,
    supported: controller.recognitionSupported
  };
}
