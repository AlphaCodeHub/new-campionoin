import { useEffect, useRef, useState } from 'react';
import { VoiceController } from './VoiceController';
import { generateCompanionReply } from './companionBrain';

export function useVoice({ onSpeech, companionName = 'Nova', stats = {}, voiceEnabled = true } = {}) {
  const controller = useRef(new VoiceController()).current;
  const recognition = useRef(null);
  const keepListening = useRef(false);
  const speaking = useRef(false);

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
  const [error, setError] = useState('');

  function startRecognition() {
    if (!keepListening.current || speaking.current) return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;

    try {
      if (recognition.current) {
        recognition.current.abort();
      }
    } catch {
      // Continue
    }

    const instance = new Recognition();
    recognition.current = instance;
    instance.lang = navigator.language || 'en-US';
    instance.continuous = true;
    instance.interimResults = false;
    instance.maxAlternatives = 1;

    instance.onstart = () => {
      setListening(true);
      setError('');
    };

    instance.onresult = async event => {
      const result = event.results[event.results.length - 1];
      if (!result?.isFinal) return;
      const text = result[0]?.transcript?.trim();
      if (!text) return;

      speaking.current = true;
      try { instance.stop(); } catch { /* ignore */ }
      setListening(false);

      // Generate companion reply
      const replyData = generateCompanionReply(text, companionNameRef.current, statsRef.current);

      if (onSpeechRef.current) {
        onSpeechRef.current({ userText: text, ...replyData });
      }

      // Speak the companion reply
      if (voiceEnabledRef.current) {
        setSpeaking(true);
        await controller.speak(replyData.reply, instance.lang);
        setSpeaking(false);
      }

      speaking.current = false;
      if (keepListening.current) {
        window.setTimeout(startRecognition, 300);
      }
    };

    instance.onerror = event => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        keepListening.current = false;
        setEnabled(false);
        setError('Microphone permission was blocked. Enable it in browser settings and try again.');
      } else if (event.error === 'network') {
        keepListening.current = false;
        setEnabled(false);
        setError('Browser speech service is unavailable. Please check your internet connection.');
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setError('Voice recognition paused. Tap the voice indicator to resume.');
      }
    };

    instance.onend = () => {
      setListening(false);
      if (keepListening.current && !speaking.current) {
        window.setTimeout(startRecognition, 200);
      }
    };

    try {
      instance.start();
    } catch {
      keepListening.current = false;
      setEnabled(false);
      setError('Voice recognition could not start. Please refresh and try again.');
    }
  }

  async function enableHandsFree() {
    setError('');
    if (!controller.secureContext) {
      setError('Microphone requires HTTPS or localhost. Open this game securely, then try again.');
      return;
    }
    if (!controller.recognitionSupported) {
      setError('This browser does not support Speech Recognition. Please use Chrome, Edge, or a supported browser.');
      return;
    }

    try {
      await controller.requestMicrophone();
      controller.unlockAudio();
      keepListening.current = true;
      setEnabled(true);
      startRecognition();
    } catch (err) {
      if (err.message === 'MICROPHONE_UNSUPPORTED') {
        setError('Microphone access is unavailable in this browser.');
      } else if (err.message === 'SECURE_CONTEXT_REQUIRED') {
        setError('Secure HTTPS context required for microphone.');
      } else {
        setError('Microphone permission is required for hands-free chat.');
      }
    }
  }

  function stopHandsFree() {
    keepListening.current = false;
    if (recognition.current) {
      try { recognition.current.abort(); } catch { /* ignore */ }
    }
    controller.stopSpeaking();
    setListening(false);
    setSpeaking(false);
    setEnabled(false);
  }

  // Allow manual speak trigger (e.g. for testing or direct interaction)
  async function speakText(text) {
    if (!voiceEnabledRef.current || !text) return;
    controller.unlockAudio();
    setSpeaking(true);
    await controller.speak(text);
    setSpeaking(false);
  }

  useEffect(() => () => stopHandsFree(), []);

  return {
    listening,
    speaking: isSpeaking,
    enabled,
    error,
    enableHandsFree,
    stopHandsFree,
    speakText,
    supported: controller.recognitionSupported
  };
}
