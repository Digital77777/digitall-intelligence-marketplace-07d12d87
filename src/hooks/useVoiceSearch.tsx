import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type VoiceSearchState = 'idle' | 'listening' | 'processing' | 'results' | 'error';

export interface VoiceRecommendation {
  product_name: string;
  match_score: number;
  explanation: string;
  action: string;
  product_id: string | null;
  images?: string[];
  listing_type?: string;
  creation_link?: string | null;
}

interface UseVoiceSearchReturn {
  state: VoiceSearchState;
  transcript: string;
  interimTranscript: string;
  recommendations: VoiceRecommendation[];
  errorMessage: string;
  startListening: () => void;
  stopListening: () => void;
  cancelSearch: () => void;
  retrySearch: () => void;
  searchByText: (text: string) => void;
  isSupported: boolean;
}

export const useVoiceSearch = (): UseVoiceSearchReturn => {
  const [state, setState] = useState<VoiceSearchState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recommendations, setRecommendations] = useState<VoiceRecommendation[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef('');
  const interimTranscriptRef = useRef('');
  const hasErrorRef = useRef(false);
  const { toast } = useToast();

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const cleanup = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const processTranscription = useCallback(async (text: string) => {
    setState('processing');
    try {
      const { data, error } = await supabase.functions.invoke('voice-search', {
        body: { transcription: text },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      const recs = data?.recommendations || [];
      setRecommendations(recs);
      setState('results');
    } catch (err) {
      console.error('Voice search error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to process your request');
      setState('error');
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      toast({
        title: 'Not Supported',
        description: 'Voice search is not supported in your browser. Try Chrome or Edge.',
        variant: 'destructive',
      });
      return;
    }

    cleanup();
    setTranscript('');
    setInterimTranscript('');
    setRecommendations([]);
    setErrorMessage('');
    transcriptRef.current = '';
    interimTranscriptRef.current = '';
    hasErrorRef.current = false;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = navigator.language || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setState('listening');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        transcriptRef.current = final;
        setTranscript(final);
        interimTranscriptRef.current = '';
        setInterimTranscript('');
      } else {
        interimTranscriptRef.current = interim;
        setInterimTranscript(interim);
      }
    };

    recognition.onend = () => {
      // Skip processing if onerror already handled this
      if (hasErrorRef.current) return;

      const finalText = transcriptRef.current.trim();
      const interimText = interimTranscriptRef.current.trim();

      if (finalText) {
        setTranscript(finalText);
        processTranscription(finalText);
      } else if (interimText) {
        transcriptRef.current = interimText;
        setTranscript(interimText);
        setInterimTranscript('');
        processTranscription(interimText);
      } else {
        setErrorMessage('No speech detected. Please try again.');
        setState('error');
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      hasErrorRef.current = true;
      if (event.error === 'not-allowed') {
        setErrorMessage('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (event.error === 'no-speech') {
        setErrorMessage('No speech detected. Please try again.');
      } else if (event.error === 'network') {
        setErrorMessage('Network error. Please check your connection.');
      } else {
        setErrorMessage(`Speech recognition error: ${event.error}`);
      }
      setState('error');
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (err) {
      setErrorMessage('Failed to start voice recognition.');
      setState('error');
    }
  }, [isSupported, cleanup, processTranscription, toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  }, []);

  const cancelSearch = useCallback(() => {
    cleanup();
    setState('idle');
    setTranscript('');
    setInterimTranscript('');
    setRecommendations([]);
    setErrorMessage('');
    transcriptRef.current = '';
    interimTranscriptRef.current = '';
    hasErrorRef.current = false;
  }, [cleanup]);

  const retrySearch = useCallback(() => {
    cancelSearch();
    setTimeout(() => startListening(), 200);
  }, [cancelSearch, startListening]);

  const searchByText = useCallback((text: string) => {
    cleanup();
    setTranscript(text);
    setInterimTranscript('');
    setRecommendations([]);
    setErrorMessage('');
    transcriptRef.current = text;
    interimTranscriptRef.current = '';
    hasErrorRef.current = false;
    processTranscription(text);
  }, [cleanup, processTranscription]);

  return {
    state,
    transcript,
    interimTranscript,
    recommendations,
    errorMessage,
    startListening,
    stopListening,
    cancelSearch,
    retrySearch,
    searchByText,
    isSupported,
  };
};
