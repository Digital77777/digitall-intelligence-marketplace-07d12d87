import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mic, MicOff, Loader2, Sparkles, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
    isSupported,
  } = useVoiceSearch();

  // Auto-start listening when modal opens
  useEffect(() => {
    if (isOpen && state === 'idle') {
      startListening();
    }
  }, [isOpen]);

  // Auto-navigate for high-confidence match
  useEffect(() => {
    if (state === 'results' && recommendations.length > 0) {
      const top = recommendations[0];
      if (top.match_score >= 90 && top.product_id) {
        toast({
          title: '🎯 Opening the best match for you…',
          description: top.product_name,
        });
        const timer = setTimeout(() => {
          navigate(`/marketplace/listing/${top.product_id}`);
          handleClose();
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [state, recommendations]);

  const handleClose = () => {
    cancelSearch();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className={cn(
        "relative w-full md:max-w-lg bg-background rounded-t-3xl md:rounded-2xl shadow-2xl",
        "max-h-[90vh] overflow-y-auto",
        "animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 md:fade-in",
        "border border-border/50"
      )}>
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 flex items-center justify-between p-4 border-b border-border/30">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-lg">AI Voice Search</h2>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content based on state */}
        <div className="p-6">
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
            />
          )}

          {state === 'error' && (
            <ErrorView
              message={errorMessage}
              onRetry={retrySearch}
              onClose={handleClose}
            />
          )}
        </div>

        {/* Powered by badge */}
        <div className="flex justify-center pb-4">
          <Badge variant="secondary" className="text-xs gap-1">
            <Sparkles className="h-3 w-3" />
            Powered by AI
          </Badge>
        </div>
      </div>
    </div>
  );
};

/* ---- Sub-components ---- */

const ListeningView: React.FC<{
  interimTranscript: string;
  onStop: () => void;
  onCancel: () => void;
}> = ({ interimTranscript, onStop, onCancel }) => (
  <div className="flex flex-col items-center text-center space-y-6 py-8">
    {/* Pulsing mic */}
    <div className="relative">
      <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
      <div className="absolute -inset-3 rounded-full bg-primary/10 animate-pulse" />
      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
        <Mic className="h-10 w-10 text-primary-foreground" />
      </div>
    </div>

    <div className="space-y-2">
      <p className="text-lg font-semibold">Listening…</p>
      <p className="text-sm text-muted-foreground">
        Tell me what you're looking for
      </p>
    </div>

    {/* Interim transcript */}
    {interimTranscript && (
      <div className="bg-muted/50 rounded-xl px-4 py-3 max-w-sm">
        <p className="text-sm italic text-muted-foreground">"{interimTranscript}"</p>
      </div>
    )}

    <div className="flex gap-3">
      <Button variant="outline" onClick={onCancel} className="rounded-full">
        Cancel
      </Button>
      <Button onClick={onStop} className="rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground">
        <MicOff className="h-4 w-4 mr-2" />
        Stop Listening
      </Button>
    </div>
  </div>
);

const ProcessingView: React.FC<{ transcript: string }> = ({ transcript }) => (
  <div className="flex flex-col items-center text-center space-y-6 py-8">
    <div className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
    </div>

    <div className="space-y-2">
      <p className="text-lg font-semibold">Finding the best tools…</p>
      <div className="bg-muted/50 rounded-xl px-4 py-3">
        <p className="text-sm text-muted-foreground">"{transcript}"</p>
      </div>
    </div>
  </div>
);

const ResultsView: React.FC<{
  recommendations: VoiceRecommendation[];
  transcript: string;
  onRetry: () => void;
  onClose: () => void;
  onNavigate: (id: string) => void;
}> = ({ recommendations, transcript, onRetry, onClose, onNavigate }) => {
  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center text-center space-y-4 py-6">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold">No perfect match found</p>
          <p className="text-sm text-muted-foreground">
            Try being more specific or rephrase your request.
          </p>
        </div>
        <div className="bg-muted/50 rounded-xl px-4 py-2">
          <p className="text-xs text-muted-foreground">You said: "{transcript}"</p>
        </div>
        <Button onClick={onRetry} className="rounded-full gap-2">
          <RotateCcw className="h-4 w-4" />
          Speak Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="font-bold text-lg">AI Recommendations for you</h3>
        <p className="text-sm text-muted-foreground">
          I found the perfect tools for your need
        </p>
        <div className="bg-muted/50 rounded-lg px-3 py-1.5 inline-block">
          <p className="text-xs text-muted-foreground">"{transcript}"</p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <RecommendationCard
            key={rec.product_id || index}
            recommendation={rec}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <Button variant="outline" onClick={onRetry} className="rounded-full gap-2">
          <RotateCcw className="h-4 w-4" />
          Not quite right? Speak again
        </Button>
      </div>
    </div>
  );
};

const RecommendationCard: React.FC<{
  recommendation: VoiceRecommendation;
  onNavigate: (id: string) => void;
}> = ({ recommendation, onNavigate }) => {
  const gradients = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-purple-500 to-pink-600',
    'from-orange-500 to-red-600',
    'from-cyan-500 to-blue-600',
  ];
  const gradient = gradients[recommendation.product_name.charCodeAt(0) % gradients.length];
  const hasImage = recommendation.images && recommendation.images.length > 0;

  const scoreColor = recommendation.match_score >= 80
    ? 'bg-green-500'
    : recommendation.match_score >= 60
    ? 'bg-yellow-500'
    : 'bg-orange-500';

  return (
    <Card
      className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
      onClick={() => recommendation.product_id && onNavigate(recommendation.product_id)}
    >
      <div className="flex gap-3 p-3">
        {/* Image / Icon */}
        <div className={cn(
          "relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0",
          !hasImage && `bg-gradient-to-br ${gradient}`
        )}>
          {hasImage ? (
            <img
              src={recommendation.images![0]}
              alt={recommendation.product_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {recommendation.product_name.charAt(0)}
              </span>
            </div>
          )}
          {/* Match score badge */}
          <Badge className={cn(
            "absolute -top-1 -right-1 text-[10px] px-1.5 py-0 text-white border-0",
            scoreColor
          )}>
            {recommendation.match_score}%
          </Badge>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <h4 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {recommendation.product_name}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {recommendation.explanation}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs rounded-full mt-1"
            onClick={(e) => {
              e.stopPropagation();
              if (recommendation.product_id) onNavigate(recommendation.product_id);
            }}
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

const ErrorView: React.FC<{
  message: string;
  onRetry: () => void;
  onClose: () => void;
}> = ({ message, onRetry, onClose }) => (
  <div className="flex flex-col items-center text-center space-y-4 py-6">
    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
      <AlertCircle className="h-8 w-8 text-destructive" />
    </div>
    <div className="space-y-1">
      <p className="font-semibold">Something went wrong</p>
      <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
    </div>
    <div className="flex gap-3">
      <Button variant="outline" onClick={onClose} className="rounded-full">
        Close
      </Button>
      <Button onClick={onRetry} className="rounded-full gap-2">
        <RotateCcw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  </div>
);
