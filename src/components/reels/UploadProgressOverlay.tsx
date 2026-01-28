import { Loader2, Check, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UploadProgressOverlayProps {
  isVisible: boolean;
  progress: number;
  status: 'preparing' | 'uploading' | 'processing' | 'complete' | 'error';
  thumbnail?: string;
  title?: string;
  errorMessage?: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export const UploadProgressOverlay = ({
  isVisible,
  progress,
  status,
  thumbnail,
  title,
  errorMessage,
  onDismiss,
  onRetry,
}: UploadProgressOverlayProps) => {
  if (!isVisible) return null;

  const getStatusText = () => {
    switch (status) {
      case 'preparing': return 'Preparing upload...';
      case 'uploading': return `Uploading... ${progress}%`;
      case 'processing': return 'Processing video...';
      case 'complete': return 'Upload complete!';
      case 'error': return 'Upload failed';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'preparing':
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-8 h-8 text-primary animate-spin" />;
      case 'complete':
        return <Check className="w-8 h-8 text-success" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-destructive" />;
    }
  };

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm transition-all",
      "animate-fade-in"
    )}>
      <div className="w-full max-w-sm mx-4 p-6 rounded-2xl bg-card border shadow-2xl">
        {/* Thumbnail and status */}
        <div className="flex items-center gap-4 mb-6">
          {thumbnail ? (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <img 
                src={thumbnail} 
                alt="Video thumbnail" 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              {getStatusIcon()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <p className="font-medium truncate mb-1">{title}</p>
            )}
            <p className={cn(
              "text-sm",
              status === 'error' ? "text-destructive" : "text-muted-foreground"
            )}>
              {getStatusText()}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {(status === 'uploading' || status === 'processing') && (
          <div className="mb-6">
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Success animation */}
        {status === 'complete' && (
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center animate-scale-in">
              <Check className="w-10 h-10 text-success animate-bounce" />
            </div>
          </div>
        )}

        {/* Error message */}
        {status === 'error' && errorMessage && (
          <p className="text-sm text-destructive mb-4 text-center">
            {errorMessage}
          </p>
        )}

        {/* Continue browsing message */}
        {(status === 'uploading' || status === 'processing') && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              You can continue browsing while we upload your reel.
            </p>
            <Button 
              variant="outline" 
              onClick={onDismiss}
              className="w-full"
            >
              Continue Browsing
            </Button>
          </div>
        )}

        {/* Actions for complete/error states */}
        {status === 'complete' && (
          <Button 
            onClick={onDismiss}
            className="w-full"
          >
            Done
          </Button>
        )}

        {status === 'error' && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onDismiss}
              className="flex-1"
            >
              Cancel
            </Button>
            {onRetry && (
              <Button 
                onClick={onRetry}
                className="flex-1"
              >
                Retry
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
