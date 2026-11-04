import { useState, useEffect, useRef, useCallback } from 'react';
import '../types/speech.d';

export interface UseSpeechToTextReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  audioLevel: number; // 0 to 100 volume meter
  hasMicPermission: boolean | null;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetTranscript: () => void;
}

export const useSpeechToText = (
  onFinalText?: (text: string) => void
): UseSpeechToTextReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isManuallyStoppedRef = useRef<boolean>(false);

  const isSupported = typeof window !== 'undefined' && 
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Setup live audio level analyzer (Visualizer)
  const startAudioAnalyzer = async (): Promise<MediaStream> => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;
    setHasMicPermission(true);

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioContextRef.current = ctx;

    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const updateLevel = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
    return stream;
  };

  const stopAudioAnalyzer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  // Initialize SpeechRecognition on demand
  const startListening = useCallback(async () => {
    setError(null);
    isManuallyStoppedRef.current = false;

    if (!isSupported) {
      setError('Web Speech API is not supported in this browser. Chrome, Edge, or Safari is recommended.');
      return;
    }

    // 1. Request microphone permission and start audio visualizer
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        await startAudioAnalyzer();
      }
    } catch (micErr: any) {
      console.warn('Microphone permission error:', micErr);
      setHasMicPermission(false);
      setError('Microphone permission denied. Please allow microphone access in your browser URL bar.');
      return;
    }

    // 2. Tear down existing recognition instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    try {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass!();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalStr = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          const text = item[0].transcript;
          if (item.isFinal) {
            finalStr += text;
          } else {
            interim += text;
          }
        }

        setInterimTranscript(interim);

        if (finalStr.trim()) {
          const cleanFinal = finalStr.trim();
          setTranscript((prev) => (prev ? `${prev} ${cleanFinal}` : cleanFinal));
          if (onFinalText) {
            onFinalText(cleanFinal);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'no-speech') {
          // Normal silence, don't display as error
          return;
        }
        if (event.error === 'not-allowed') {
          setError('Microphone blocked or not allowed. Check browser permissions.');
          setIsListening(false);
          stopAudioAnalyzer();
          return;
        }
        if (event.error === 'network') {
          setError('Speech service network error. (Ensure online connection or check browser speech settings).');
          return;
        }
        setError(`Speech recognition note: ${event.error}`);
      };

      recognition.onend = () => {
        // Automatically restart if continuous listening was not manually stopped
        if (!isManuallyStoppedRef.current && recognitionRef.current) {
          try {
            recognition.start();
            return;
          } catch (e) {
            // Already started or restarting
          }
        }
        setIsListening(false);
        setInterimTranscript('');
        stopAudioAnalyzer();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start SpeechRecognition:', err);
      setError(err?.message || 'Failed to initialize speech recognition.');
      setIsListening(false);
      stopAudioAnalyzer();
    }
  }, [isSupported, onFinalText]);

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    setIsListening(false);
    setInterimTranscript('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    stopAudioAnalyzer();
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isManuallyStoppedRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      stopAudioAnalyzer();
    };
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    audioLevel,
    hasMicPermission,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
};
