import React from 'react';
import { Check, X, RefreshCw } from 'lucide-react';
import { useBackgroundUpload } from '@/contexts/BackgroundUploadContext';

export const FloatingUploadIndicator: React.FC = () => {
  const { uploads, dismissUpload, retryUpload } = useBackgroundUpload();

  // Get the most recent active upload or the last completed one
  const activeUpload = uploads.find(u => 
    u.status === 'uploading' || u.status === 'processing' || u.status === 'pending'
  ) || uploads[uploads.length - 1];

  const isActive = activeUpload?.status === 'uploading' || activeUpload?.status === 'processing' || activeUpload?.status === 'pending';
  const isComplete = activeUpload?.status === 'complete';
  const isError = activeUpload?.status === 'error';
  const progress = activeUpload?.progress || 0;

  // Auto-dismiss completed uploads after 3 seconds
  React.useEffect(() => {
    if (isComplete && activeUpload) {
      const timer = setTimeout(() => {
        dismissUpload(activeUpload.id);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, activeUpload?.id, dismissUpload]);

  if (uploads.length === 0 || !activeUpload) return null;

  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed bottom-24 right-4 z-[100] animate-in slide-in-from-bottom-2 fade-in duration-200">
      <div className="flex items-center gap-2 bg-card/95 backdrop-blur-sm border border-border shadow-lg rounded-full px-3 py-2">
        {/* Progress ring with thumbnail */}
        <div className="relative w-10 h-10 flex-shrink-0">
          {/* Thumbnail */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
            {activeUpload.thumbnail ? (
              <img src={activeUpload.thumbnail} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/20" />
            )}
          </div>
          
          {/* Progress ring overlay */}
          {isActive && (
            <svg className="absolute inset-0 w-10 h-10 -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="3"
              />
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
          )}

          {/* Complete checkmark */}
          {isComplete && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary rounded-full">
              <Check className="w-5 h-5 text-primary-foreground" />
            </div>
          )}

          {/* Error icon */}
          {isError && (
            <div className="absolute inset-0 flex items-center justify-center bg-destructive rounded-full">
              <X className="w-5 h-5 text-destructive-foreground" />
            </div>
          )}
        </div>

        {/* Status text */}
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-xs font-medium text-foreground truncate max-w-[120px]">
            {isActive && 'Uploading...'}
            {isComplete && 'Uploaded!'}
            {isError && 'Failed'}
          </p>
        </div>

        {/* Retry button for errors */}
        {isError && (
          <button
            onClick={() => retryUpload(activeUpload.id)}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
            aria-label="Retry upload"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
};
