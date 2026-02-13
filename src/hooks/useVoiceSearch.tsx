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
  isSupported: boolean;
}

export const useVoiceSearch = (): UseVoiceSearchReturn => {
  const [state, setState] = useState<VoiceSearchState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recommendations, setRecommendations] = useState<VoiceRecommendation[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef<any>(null);
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
      setState(recs.length > 0 ? 'results' : 'results');
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
        setTranscript(final);
        setInterimTranscript('');
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onend = () => {
      // Get the final transcript from state
      setTranscript(prev => {
        const finalText = prev;
        if (finalText && finalText.trim()) {
          processTranscription(finalText.trim());
        } else {
          // Check interim as fallback
          setInterimTranscript(interimPrev => {
            if (interimPrev && interimPrev.trim()) {
              setTranscript(interimPrev.trim());
              processTranscription(interimPrev.trim());
            } else {
              setErrorMessage('No speech detected. Please try again.');
              setState('error');
            }
            return '';
          });
        }
        return prev;
      });
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
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
  }, [cleanup]);

  const retrySearch = useCallback(() => {
    cancelSearch();
    // Small delay before restarting
    setTimeout(() => startListening(), 200);
  }, [cancelSearch, startListening]);

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
    isSupported,
  };
};
