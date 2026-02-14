import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mic, MicOff, Loader2, Sparkles, RotateCcw, AlertCircle, Search, ArrowRight, CheckCircle2, Brain, Database, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useVoiceSearch, type VoiceRecommendation } from '@/hooks/useVoiceSearch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  const {
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
  } = useVoiceSearch();

  // Auto-start listening when modal opens (only if speech is supported)
  useEffect(() => {
    if (isOpen && state === 'idle' && isSupported) {
      startListening();
    }
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    cancelSearch();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="AI Voice Search"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          "relative w-full md:max-w-lg bg-background rounded-t-3xl md:rounded-2xl shadow-2xl",
          "max-h-[90vh] overflow-y-auto",
          "animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 md:fade-in duration-300",
          "border border-border/50"
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 flex items-center justify-between p-4 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">AI Product Finder</h2>
              <p className="text-[11px] text-muted-foreground">Speak or type to find the right tool</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={handleClose} aria-label="Close voice search">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content based on state */}
        <div className="p-5">
          {!isSupported && state === 'idle' && (
            <TextFallbackView onSearch={searchByText} onClose={handleClose} />
          )}

          {state === 'listening' && (
            <ListeningView
              interimTranscript={interimTranscript}
              onStop={stopListening}
              onCancel={handleClose}
            />
          )}

          {state === 'processing' && (
            <ProcessingView transcript={transcript} />
          )}

          {state === 'results' && (
            <ResultsView
              recommendations={recommendations}
              transcript={transcript}
              onRetry={retrySearch}
              onClose={handleClose}
              onNavigate={(id) => {
                navigate(`/marketplace/listing/${id}`);
                handleClose();
              }}
              isSupported={isSupported}
              onTextSearch={searchByText}
            />
          )}

          {state === 'error' && (
            <ErrorView
              message={errorMessage}
              onRetry={retrySearch}
              onClose={handleClose}
              isSupported={isSupported}
              onTextSearch={searchByText}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-center pb-4 pt-1">
          <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5" />
            Powered by AI · Results may vary
          </span>
        </div>
      </div>
    </div>
  );
};

/* ---- Sub-components ---- */

const TextFallbackView: React.FC<{
  onSearch: (text: string) => void;
  onClose: () => void;
}> = ({ onSearch, onClose }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) onSearch(text.trim());
  };

  return (
    <div className="flex flex-col items-center text-center space-y-4 py-4">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
        <MicOff className="h-7 w-7 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-sm">Voice not available</p>
        <p className="text-xs text-muted-foreground">
          Type what you're looking for instead
        </p>
      </div>
      <form onSubmit={handleSubmit} className="w-full flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. AI tool for image generation…"
          className="flex-1 h-10 rounded-xl"
          autoFocus
        />
        <Button type="submit" disabled={!text.trim()} size="sm" className="rounded-xl h-10 px-4">
          <Search className="h-4 w-4" />
        </Button>
      </form>
      <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-muted-foreground">Cancel</Button>
    </div>
  );
};

const ListeningView: React.FC<{
  interimTranscript: string;
  onStop: () => void;
  onCancel: () => void;
}> = ({ interimTranscript, onStop, onCancel }) => (
  <div className="flex flex-col items-center text-center space-y-5 py-6" aria-live="polite">
    {/* Pulsing mic with sound wave rings */}
    <div className="relative flex items-center justify-center">
      <div className="absolute w-32 h-32 rounded-full border-2 border-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
      <div className="absolute w-28 h-28 rounded-full border border-primary/20 animate-pulse" />
      <div className="absolute w-24 h-24 rounded-full bg-primary/5 animate-pulse" style={{ animationDelay: '0.5s' }} />
      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
        <Mic className="h-8 w-8 text-primary-foreground" aria-hidden="true" />
      </div>
    </div>

    <div className="space-y-1">
      <p className="text-base font-semibold">I'm listening…</p>
      <p className="text-xs text-muted-foreground">
        Describe what you need, e.g. "AI tool for writing content"
      </p>
    </div>

    {/* Live transcript */}
    {interimTranscript && (
      <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5 max-w-xs animate-in fade-in duration-200">
        <p className="text-sm text-foreground font-medium">"{interimTranscript}"</p>
      </div>
    )}

    <div className="flex gap-2 pt-1">
      <Button variant="ghost" size="sm" onClick={onCancel} className="rounded-full text-xs h-8">
        Cancel
      </Button>
      <Button size="sm" onClick={onStop} className="rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground h-8 text-xs gap-1.5">
        <MicOff className="h-3.5 w-3.5" aria-hidden="true" />
        Done speaking
      </Button>
    </div>
  </div>
);

/** Progressive processing view with animated steps */
const ProcessingView: React.FC<{ transcript: string }> = ({ transcript }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: Brain, label: 'Understanding your request…' },
    { icon: Database, label: 'Searching marketplace…' },
    { icon: Filter, label: 'Ranking best matches…' },
  ];

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="flex flex-col items-center text-center space-y-5 py-4" aria-live="polite" aria-busy="true">
      {/* Query bubble */}
      <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-2 max-w-xs">
        <p className="text-sm text-foreground">"{transcript}"</p>
      </div>

      {/* Animated steps */}
      <div className="w-full max-w-xs space-y-2.5">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isDone = i < step;
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-500",
                isDone && "bg-primary/5",
                isActive && "bg-primary/10 shadow-sm",
                !isDone && !isActive && "opacity-40"
              )}
            >
              <div className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300",
                isDone ? "bg-primary text-primary-foreground" : isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : isActive ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </div>
              <span className={cn(
                "text-sm transition-colors duration-300",
                isDone ? "text-foreground font-medium" : isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Skeleton preview */}
      <div className="w-full space-y-2 pt-2">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl opacity-60" />
        <Skeleton className="h-16 w-3/4 rounded-xl opacity-30" />
      </div>
    </div>
  );
};

const ResultsView: React.FC<{
  recommendations: VoiceRecommendation[];
  transcript: string;
  onRetry: () => void;
  onClose: () => void;
  onNavigate: (id: string) => void;
  isSupported: boolean;
  onTextSearch: (text: string) => void;
}> = ({ recommendations, transcript, onRetry, onClose, onNavigate, isSupported, onTextSearch }) => {
  const [fallbackText, setFallbackText] = useState('');

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <Search className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-sm">No matches found</p>
          <p className="text-xs text-muted-foreground">
            Try rephrasing or being more specific
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg px-3 py-1.5">
          <p className="text-[11px] text-muted-foreground">"{transcript}"</p>
        </div>
        <div className="flex flex-col items-center gap-2 w-full">
          {isSupported && (
            <Button onClick={onRetry} size="sm" className="rounded-full gap-1.5 h-8 text-xs">
              <Mic className="h-3.5 w-3.5" />
              Try again
            </Button>
          )}
          <form onSubmit={(e) => { e.preventDefault(); if (fallbackText.trim()) onTextSearch(fallbackText.trim()); }} className="flex gap-2 w-full max-w-sm">
            <Input value={fallbackText} onChange={(e) => setFallbackText(e.target.value)} placeholder="Type a different query…" className="flex-1 h-9 rounded-xl text-xs" />
            <Button type="submit" size="sm" disabled={!fallbackText.trim()} className="h-9 rounded-xl">
              <Search className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm">
            {recommendations.length} match{recommendations.length !== 1 ? 'es' : ''} found
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">for "{transcript}"</p>
        </div>
        <Badge variant="secondary" className="text-[10px] h-5">
          <Sparkles className="h-2.5 w-2.5 mr-0.5" />
          AI ranked
        </Badge>
      </div>

      {/* Results list with staggered animation */}
      <div className="space-y-2" role="list" aria-label="Product recommendations">
        {recommendations.map((rec, index) => (
          <div
            key={rec.product_id || index}
            className="animate-in slide-in-from-bottom-2 fade-in"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
          >
            <RecommendationCard
              recommendation={rec}
              onNavigate={onNavigate}
              rank={index + 1}
            />
          </div>
        ))}
      </div>

      {/* Retry / new search */}
      <div className="pt-2 space-y-2">
        <div className="flex items-center justify-center gap-2">
          {isSupported && (
            <Button variant="ghost" onClick={onRetry} size="sm" className="rounded-full gap-1.5 h-8 text-xs text-muted-foreground">
              <Mic className="h-3.5 w-3.5" />
              Search again
            </Button>
          )}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (fallbackText.trim()) onTextSearch(fallbackText.trim()); }} className="flex gap-2 w-full">
          <Input value={fallbackText} onChange={(e) => setFallbackText(e.target.value)} placeholder="Refine your search…" className="flex-1 h-9 rounded-xl text-xs" />
          <Button type="submit" size="sm" disabled={!fallbackText.trim()} className="h-9 rounded-xl">
            <Search className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

const RecommendationCard: React.FC<{
  recommendation: VoiceRecommendation;
  onNavigate: (id: string) => void;
  rank: number;
}> = ({ recommendation, onNavigate, rank }) => {
  const hasImage = recommendation.images && recommendation.images.length > 0;

  const scoreColor = recommendation.match_score >= 80
    ? 'text-primary bg-primary/10'
    : recommendation.match_score >= 60
    ? 'text-foreground bg-secondary'
    : 'text-muted-foreground bg-muted';

  return (
    <Card
      className="group overflow-hidden cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-200 border-border/50"
      onClick={() => recommendation.product_id && onNavigate(recommendation.product_id)}
      role="listitem"
    >
      <div className="flex items-center gap-3 p-3">
        {/* Rank + Image */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted">
            {hasImage ? (
              <img
                src={recommendation.images![0]}
                alt={recommendation.product_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                <span className="text-lg font-bold text-primary">
                  {recommendation.product_name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          {/* Rank badge */}
          <div className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full bg-background border border-border flex items-center justify-center">
            <span className="text-[10px] font-bold text-muted-foreground">#{rank}</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {recommendation.product_name}
            </h4>
            <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0", scoreColor)}>
              {recommendation.match_score}%
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {recommendation.explanation}
          </p>
        </div>

        {/* Arrow */}
        <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </div>
    </Card>
  );
};

const ErrorView: React.FC<{
  message: string;
  onRetry: () => void;
  onClose: () => void;
  isSupported: boolean;
  onTextSearch: (text: string) => void;
}> = ({ message, onRetry, onClose, isSupported, onTextSearch }) => {
  const [fallbackText, setFallbackText] = useState('');

  return (
    <div className="flex flex-col items-center text-center space-y-4 py-4" aria-live="assertive">
      <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="h-7 w-7 text-destructive" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-sm">Something went wrong</p>
        <p className="text-xs text-muted-foreground max-w-xs">{message}</p>
      </div>
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full h-8 text-xs">
            Close
          </Button>
          {isSupported && (
            <Button size="sm" onClick={onRetry} className="rounded-full gap-1.5 h-8 text-xs">
              <RotateCcw className="h-3.5 w-3.5" />
              Try Again
            </Button>
          )}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (fallbackText.trim()) onTextSearch(fallbackText.trim()); }} className="flex gap-2 w-full max-w-sm">
          <Input value={fallbackText} onChange={(e) => setFallbackText(e.target.value)} placeholder="Or type your query…" className="flex-1 h-9 rounded-xl text-xs" />
          <Button type="submit" size="sm" disabled={!fallbackText.trim()} className="h-9 rounded-xl">
            <Search className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
};
