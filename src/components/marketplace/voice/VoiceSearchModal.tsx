import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mic, MicOff, Loader2, Sparkles, RotateCcw, AlertCircle, Search, ArrowRight, CheckCircle2, Brain, Database, Filter, Zap, Star } from 'lucide-react';
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

  useEffect(() => {
    if (isOpen && state === 'idle' && isSupported) {
      startListening();
    }
  }, [isOpen, isSupported, startListening]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    cancelSearch();
    onClose();
  };

  if (!isOpen) return null;

  const showFullscreen = state === 'idle' || state === 'listening';

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[100] animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-label="AI Voice Search"
    >
      {showFullscreen ? (
        <FullscreenListeningView
          state={state}
          interimTranscript={interimTranscript}
          isSupported={isSupported}
          onStop={stopListening}
          onClose={handleClose}
          onStart={startListening}
          onTextSearch={searchByText}
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
          <div className="relative h-full flex items-end md:items-center justify-center">
            <div className={cn(
              "relative w-full md:max-w-lg bg-background rounded-t-3xl md:rounded-2xl shadow-2xl",
              "max-h-[85vh] overflow-y-auto",
              "animate-in slide-in-from-bottom-4 duration-300",
              "border border-border/50"
            )}>
              <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 flex items-center justify-between p-4 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base leading-tight">AI Product Finder</h2>
                    <p className="text-[11px] text-muted-foreground">Results powered by AI</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={handleClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-5">
                {state === 'processing' && <ProcessingView transcript={transcript} />}
                {state === 'results' && (
                  <ResultsView
                    recommendations={recommendations}
                    transcript={transcript}
                    onRetry={retrySearch}
                    onClose={handleClose}
                    onNavigate={(id) => { navigate(`/marketplace/listing/${id}`); handleClose(); }}
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

              <div className="flex justify-center pb-4 pt-1">
                <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" />
                  Powered by AI · Results may vary
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ---- Animated Waveform SVG ---- */
const AnimatedWaveform: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const colors = ['hsl(0, 0%, 100%)', 'hsl(45, 100%, 60%)', 'hsl(140, 70%, 55%)', 'hsl(0, 80%, 60%)'];

  return (
    <svg
      viewBox="0 0 400 80"
      className="w-full h-20 md:h-24"
      preserveAspectRatio="none"
    >
      {colors.map((color, i) => (
        <path
          key={i}
          d="M0,40 Q100,40 200,40 T400,40"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeOpacity={isActive ? 0.8 : 0.4}
          className="transition-all duration-500"
          style={{
            animation: isActive
              ? `voiceWave${i} ${1.5 + i * 0.3}s ease-in-out infinite`
              : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes voiceWave0 {
          0%, 100% { d: path("M0,40 Q50,40 100,25 T200,40 Q300,55 400,40"); }
          50% { d: path("M0,40 Q50,55 100,45 T200,30 Q300,40 400,40"); }
        }
        @keyframes voiceWave1 {
          0%, 100% { d: path("M0,40 Q80,30 160,50 T320,35 Q380,45 400,40"); }
          50% { d: path("M0,40 Q80,50 160,30 T320,50 Q380,35 400,40"); }
        }
        @keyframes voiceWave2 {
          0%, 100% { d: path("M0,40 Q60,50 120,30 T240,50 Q360,30 400,40"); }
          50% { d: path("M0,40 Q60,28 120,48 T240,28 Q360,50 400,40"); }
        }
        @keyframes voiceWave3 {
          0%, 100% { d: path("M0,40 Q100,35 200,50 T400,35"); }
          50% { d: path("M0,40 Q100,50 200,30 T400,45"); }
        }
      `}</style>
    </svg>
  );
};

/* ---- Fullscreen Listening View (Google Assistant inspired) ---- */
const FullscreenListeningView: React.FC<{
  state: string;
  interimTranscript: string;
  isSupported: boolean;
  onStop: () => void;
  onClose: () => void;
  onStart: () => void;
  onTextSearch: (text: string) => void;
}> = ({ state, interimTranscript, isSupported, onStop, onClose, onStart, onTextSearch }) => {
  const [textQuery, setTextQuery] = useState('');
  const [showInfo, setShowInfo] = useState(true);
  const isListening = state === 'listening';

  useEffect(() => {
    if (isListening && interimTranscript) {
      setShowInfo(false);
    }
  }, [isListening, interimTranscript]);

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-b from-[hsl(220,90%,52%)] via-[hsl(230,90%,48%)] to-[hsl(240,85%,40%)] text-white">
      {/* Close button */}
      <div className="flex items-center justify-between p-4 pt-safe">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 text-white/80 hover:text-white hover:bg-white/10"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-1.5 opacity-60">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">AI Product Finder</span>
        </div>
        <div className="w-10" /> {/* spacer */}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-8">
        {/* Waveform */}
        <div className="w-full max-w-md mb-8">
          <AnimatedWaveform isActive={isListening} />
        </div>

        {/* Status text */}
        <div className="text-center space-y-3 mb-8">
          {isListening && interimTranscript ? (
            <p className="text-2xl md:text-3xl font-light leading-relaxed animate-in fade-in duration-300">
              "{interimTranscript}"
            </p>
          ) : isListening ? (
            <p className="text-2xl md:text-3xl font-light">
              Speak into the phone
            </p>
          ) : (
            <p className="text-2xl md:text-3xl font-light">
              {isSupported ? 'Tap the mic to start' : 'Type what you need'}
            </p>
          )}

          {!isListening && showInfo && (
            <p className="text-sm text-white/60 max-w-xs mx-auto leading-relaxed">
              Describe what you're looking for and our AI will find the best tools, services & products for you
            </p>
          )}
        </div>

        {/* Mic button */}
        {isSupported && (
          <div className="relative mb-6">
            {isListening && (
              <>
                <div className="absolute inset-0 w-20 h-20 m-auto rounded-full bg-white/10 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-0 w-24 h-24 -m-2 rounded-full bg-white/5 animate-pulse" />
              </>
            )}
            <button
              onClick={isListening ? onStop : onStart}
              className={cn(
                "relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                isListening
                  ? "bg-white text-[hsl(230,90%,48%)] scale-110"
                  : "bg-white/15 text-white hover:bg-white/25 hover:scale-105"
              )}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </button>
          </div>
        )}

        {isListening && (
          <p className="text-xs text-white/40 mb-4">Tap to stop</p>
        )}
      </div>

      {/* Bottom section: text fallback + AI info */}
      <div className="px-6 pb-8 space-y-4">
        {/* Text input fallback */}
        <form
          onSubmit={(e) => { e.preventDefault(); if (textQuery.trim()) onTextSearch(textQuery.trim()); }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              value={textQuery}
              onChange={(e) => setTextQuery(e.target.value)}
              placeholder="Or type what you're looking for…"
              className="w-full h-11 pl-10 pr-4 rounded-full bg-white/10 border border-white/15 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
            />
          </div>
          <Button
            type="submit"
            disabled={!textQuery.trim()}
            className="h-11 w-11 rounded-full bg-white/15 hover:bg-white/25 text-white border-0 p-0 flex-shrink-0 disabled:opacity-30"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* AI capabilities info */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-white/40">
          <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> Smart matching</span>
          <span className="flex items-center gap-1"><Star className="h-3 w-3" /> AI ranked</span>
          <span className="flex items-center gap-1"><Brain className="h-3 w-3" /> GPT powered</span>
        </div>
      </div>
    </div>
  );
};

/* ---- Processing View ---- */
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
      <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-2 max-w-xs">
        <p className="text-sm text-foreground">"{transcript}"</p>
      </div>

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
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : isActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
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

      <div className="w-full space-y-2 pt-2">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl opacity-60" />
        <Skeleton className="h-16 w-3/4 rounded-xl opacity-30" />
      </div>
    </div>
  );
};

/* ---- Results View ---- */
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
          <p className="text-xs text-muted-foreground">Try rephrasing or being more specific</p>
        </div>
        <div className="bg-muted/50 rounded-lg px-3 py-1.5">
          <p className="text-[11px] text-muted-foreground">"{transcript}"</p>
        </div>
        <div className="flex flex-col items-center gap-2 w-full">
          {isSupported && (
            <Button onClick={onRetry} size="sm" className="rounded-full gap-1.5 h-8 text-xs">
              <Mic className="h-3.5 w-3.5" /> Try again
            </Button>
          )}
          <form onSubmit={(e) => { e.preventDefault(); if (fallbackText.trim()) onTextSearch(fallbackText.trim()); }} className="flex gap-2 w-full max-w-sm">
            <Input value={fallbackText} onChange={(e) => setFallbackText(e.target.value)} placeholder="Type a different query…" className="flex-1 h-9 rounded-xl text-xs" />
            <Button type="submit" size="sm" disabled={!fallbackText.trim()} className="h-9 rounded-xl"><Search className="h-3.5 w-3.5" /></Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm">{recommendations.length} match{recommendations.length !== 1 ? 'es' : ''} found</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">for "{transcript}"</p>
        </div>
        <Badge variant="secondary" className="text-[10px] h-5">
          <Sparkles className="h-2.5 w-2.5 mr-0.5" /> AI ranked
        </Badge>
      </div>

      <div className="space-y-2" role="list">
        {recommendations.map((rec, index) => (
          <div
            key={rec.product_id || index}
            className="animate-in slide-in-from-bottom-2 fade-in"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
          >
            <RecommendationCard recommendation={rec} onNavigate={onNavigate} rank={index + 1} />
          </div>
        ))}
      </div>

      <div className="pt-2 space-y-2">
        <div className="flex items-center justify-center gap-2">
          {isSupported && (
            <Button variant="ghost" onClick={onRetry} size="sm" className="rounded-full gap-1.5 h-8 text-xs text-muted-foreground">
              <Mic className="h-3.5 w-3.5" /> Search again
            </Button>
          )}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (fallbackText.trim()) onTextSearch(fallbackText.trim()); }} className="flex gap-2 w-full">
          <Input value={fallbackText} onChange={(e) => setFallbackText(e.target.value)} placeholder="Refine your search…" className="flex-1 h-9 rounded-xl text-xs" />
          <Button type="submit" size="sm" disabled={!fallbackText.trim()} className="h-9 rounded-xl"><Search className="h-3.5 w-3.5" /></Button>
        </form>
      </div>
    </div>
  );
};

/* ---- Recommendation Card ---- */
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
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted">
            {hasImage ? (
              <img src={recommendation.images![0]} alt={recommendation.product_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                <span className="text-lg font-bold text-primary">{recommendation.product_name.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full bg-background border border-border flex items-center justify-center">
            <span className="text-[10px] font-bold text-muted-foreground">#{rank}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">{recommendation.product_name}</h4>
            <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0", scoreColor)}>{recommendation.match_score}%</span>
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{recommendation.explanation}</p>
        </div>

        <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </div>
    </Card>
  );
};

/* ---- Error View ---- */
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
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-sm">Something went wrong</p>
        <p className="text-xs text-muted-foreground max-w-xs">{message}</p>
      </div>
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full h-8 text-xs">Close</Button>
          {isSupported && (
            <Button size="sm" onClick={onRetry} className="rounded-full gap-1.5 h-8 text-xs">
              <RotateCcw className="h-3.5 w-3.5" /> Try Again
            </Button>
          )}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (fallbackText.trim()) onTextSearch(fallbackText.trim()); }} className="flex gap-2 w-full max-w-sm">
          <Input value={fallbackText} onChange={(e) => setFallbackText(e.target.value)} placeholder="Or type your query…" className="flex-1 h-9 rounded-xl text-xs" />
          <Button type="submit" size="sm" disabled={!fallbackText.trim()} className="h-9 rounded-xl"><Search className="h-3.5 w-3.5" /></Button>
        </form>
      </div>
    </div>
  );
};
