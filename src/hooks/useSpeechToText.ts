import { useState, useEffect, useRef, useCallback } from 'react';
import '../types/speech.d';

interface UseSpeechToTextOptions {
  continuous?: boolean;
  lang?: string;
  onTranscriptComplete?: (finalTranscript: string) => void;
}

export const useSpeechToText = (options: UseSpeechToTextOptions = {}) => {
  const { continuous = true, lang = 'en-US', onTranscriptComplete } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const isSupported = typeof window !== 'undefined' && 
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser (Chrome/Edge/Safari recommended).');
      return;
    }

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass!();

    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let currentInterim = '';
      let currentFinal = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          currentFinal += item[0].transcript;
        } else {
          currentInterim += item[0].transcript;
        }
      }

      setInterimTranscript(currentInterim);

      if (currentFinal) {
        setTranscript((prev) => {
          const updated = prev ? `${prev} ${currentFinal.trim()}` : currentFinal.trim();
          if (onTranscriptComplete) {
            onTranscriptComplete(currentFinal.trim());
          }
          return updated;
        });
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setError(`Speech error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [isSupported, continuous, lang, onTranscriptComplete]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    try {
      recognitionRef.current.start();
    } catch (e: any) {
      console.warn('Recognition start exception:', e);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e: any) {
      console.warn('Recognition stop exception:', e);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
};
