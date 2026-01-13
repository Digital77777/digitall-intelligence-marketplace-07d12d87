import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageMediaProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  isSender: boolean;
}

export const MessageMedia: React.FC<MessageMediaProps> = ({ mediaUrl, mediaType, isSender }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full max-w-[280px] h-40 rounded-xl bg-muted/50 flex items-center justify-center">
        <p className="text-xs text-muted-foreground">Failed to load media</p>
      </div>
    );
  }

  if (mediaType === 'image') {
    return (
      <>
        <div 
          className="relative cursor-pointer rounded-xl overflow-hidden max-w-[280px]"
          onClick={() => setIsFullscreen(true)}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-muted/50 animate-pulse rounded-xl" />
          )}
          <img
            src={mediaUrl}
            alt="Shared image"
            className="w-full h-auto max-h-[300px] object-cover rounded-xl"
            onLoad={() => setIsLoading(false)}
            onError={() => setHasError(true)}
          />
        </div>

        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-black/95">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 text-white hover:bg-white/20 rounded-full"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <img
              src={mediaUrl}
              alt="Shared image fullscreen"
              className="w-full h-full max-h-[90vh] object-contain"
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Video
  return (
    <>
      <div 
        className="relative cursor-pointer rounded-xl overflow-hidden max-w-[280px]"
        onClick={() => setIsFullscreen(true)}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-muted/50 animate-pulse rounded-xl" />
        )}
        <video
          src={mediaUrl}
          className="w-full h-auto max-h-[300px] object-cover rounded-xl"
          onLoadedData={() => setIsLoading(false)}
          onError={() => setHasError(true)}
          muted
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <Play className="h-6 w-6 text-white fill-white" />
          </div>
        </div>
      </div>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-black/95">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 text-white hover:bg-white/20 rounded-full"
            onClick={() => setIsFullscreen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
          <video
            src={mediaUrl}
            className="w-full h-full max-h-[90vh] object-contain"
            controls
            autoPlay
            playsInline
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
