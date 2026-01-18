import React, { useState } from 'react';
import { X, Check, AlertCircle, Upload, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import { useBackgroundUpload, UploadTask } from '@/contexts/BackgroundUploadContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const UploadItem: React.FC<{
  upload: UploadTask;
  onDismiss: () => void;
  onRetry: () => void;
}> = ({ upload, onDismiss, onRetry }) => {
  const isActive = upload.status === 'uploading' || upload.status === 'processing' || upload.status === 'pending';
  const isComplete = upload.status === 'complete';
  const isError = upload.status === 'error';

  return (
    <div className="flex items-center gap-3 p-3 bg-background/95 backdrop-blur-sm border-b border-border/50 last:border-b-0">
      {/* Thumbnail or icon */}
      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        {upload.thumbnail ? (
          <img src={upload.thumbnail} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Upload className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        {/* Circular progress overlay */}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <svg className="w-8 h-8 -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="3"
              />
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeDasharray={`${upload.progress * 0.75} 100`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{upload.fileName}</p>
        <p className="text-xs text-muted-foreground">
          {upload.status === 'pending' && 'Preparing...'}
          {upload.status === 'uploading' && `Uploading ${upload.progress}%`}
          {upload.status === 'processing' && 'Processing...'}
          {upload.status === 'complete' && 'Uploaded'}
          {upload.status === 'error' && (upload.error || 'Failed')}
        </p>
      </div>

      {/* Status icon / actions */}
      <div className="flex-shrink-0">
        {isComplete && (
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-green-500" />
          </div>
        )}
        {isError && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onRetry}
            >
              <RefreshCw className="w-4 h-4 text-destructive" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        {isActive && (
          <div className="w-8 h-8 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export const FloatingUploadIndicator: React.FC = () => {
  const { uploads, dismissUpload, retryUpload, hasActiveUploads } = useBackgroundUpload();
  const [isExpanded, setIsExpanded] = useState(true);

  if (uploads.length === 0) return null;

  const activeCount = uploads.filter(u => 
    u.status === 'uploading' || u.status === 'processing' || u.status === 'pending'
  ).length;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[100] animate-in slide-in-from-bottom-4">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-4 py-3",
          "bg-card border border-border shadow-lg",
          isExpanded ? "rounded-t-xl" : "rounded-xl"
        )}
      >
        <div className="flex items-center gap-2">
          {hasActiveUploads ? (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check className="w-5 h-5 text-green-500" />
          )}
          <span className="text-sm font-medium">
            {activeCount > 0 
              ? `Uploading ${activeCount} video${activeCount > 1 ? 's' : ''}...`
              : 'Uploads complete'
            }
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Upload list */}
      {isExpanded && (
        <div className="bg-card border border-t-0 border-border rounded-b-xl shadow-lg max-h-60 overflow-y-auto">
          {uploads.map(upload => (
            <UploadItem
              key={upload.id}
              upload={upload}
              onDismiss={() => dismissUpload(upload.id)}
              onRetry={() => retryUpload(upload.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
