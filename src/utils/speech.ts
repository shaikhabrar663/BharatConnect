/**
 * Web Speech API wrapper for Voice Input (STT) and Audio Readout (TTS)
 * Supporting English, Hindi, and Indian regional languages.
 */

// Mapping of BharatConnect language codes to BCP-47 locale tags for Web Speech
const LOCALE_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  pa: 'pa-IN',
};

// Check if Speech Recognition is supported in the browser
export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

// Start voice recognition
export function createSpeechRecognizer(
  languageCode: string,
  onResult: (transcript: string) => void,
  onError: (error: string) => void,
  onEnd: () => void
) {
  if (!isSpeechRecognitionSupported()) {
    onError('Speech recognition is not supported in this browser. Please use keyboard input or Chrome/Edge.');
    return null;
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = LOCALE_MAP[languageCode] || 'en-IN';

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    const currentText = finalTranscript || interimTranscript;
    if (currentText) {
      onResult(currentText);
    }
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error);
    onError(event.error === 'not-allowed' ? 'Microphone access was denied. Please allow microphone permissions.' : `Voice recognition: ${event.error}`);
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}

// Text-to-Speech audio reader
export function speakText(
  text: string,
  languageCode: string,
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return false;
  }

  window.speechSynthesis.cancel(); // cancel any active speech

  // Strip markdown formatting for cleaner natural voice readout
  const cleanText = text
    .replace(/[#*_`~>-]/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .slice(0, 1500); // Read first portion naturally

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = LOCALE_MAP[languageCode] || 'en-IN';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
