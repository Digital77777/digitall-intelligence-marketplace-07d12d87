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
  const isProcessingRef = useRef(false);
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
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setState('processing');
    try {
      const { data, error } = await supabase.functions.invoke('voice-search', {
        body: { transcription: text },
      });

      if (error) {
        // Handle specific HTTP errors from the edge function
        const errorMsg = error.message || 'Failed to process your request';
        if (errorMsg.includes('429') || errorMsg.includes('Rate limit')) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        if (errorMsg.includes('402') || errorMsg.includes('Payment')) {
          throw new Error('AI service temporarily unavailable. Please try again later.');
        }
        throw new Error(errorMsg);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const recs = data?.recommendations || [];
      setRecommendations(recs);
      setState('results');
    } catch (err) {
      console.error('Voice search error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to process your request. Please try again.');
      setState('error');
    } finally {
      isProcessingRef.current = false;
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

    // Prevent starting if already listening or processing
    if (recognitionRef.current) return;

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
      recognitionRef.current = null;
      
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
        setErrorMessage('No speech detected. Please try again or type your query below.');
        setState('error');
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      hasErrorRef.current = true;
      recognitionRef.current = null;
      
      if (event.error === 'not-allowed') {
        setErrorMessage('Microphone access denied. Please allow microphone access in your browser settings and try again.');
      } else if (event.error === 'no-speech') {
        setErrorMessage('No speech detected. Please try speaking again or type your query below.');
      } else if (event.error === 'network') {
        setErrorMessage('Network error. Please check your internet connection and try again.');
      } else if (event.error === 'aborted') {
        // User cancelled, don't show error
        return;
      } else {
        setErrorMessage(`Voice recognition failed. Please try again or type your query instead.`);
      }
      setState('error');
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (err) {
      recognitionRef.current = null;
      setErrorMessage('Failed to start voice recognition. Please try typing your query instead.');
      setState('error');
    }
  }, [isSupported, processTranscription, toast]);

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
    isProcessingRef.current = false;
  }, [cleanup]);

  const retrySearch = useCallback(() => {
    cancelSearch();
    setTimeout(() => startListening(), 300);
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
