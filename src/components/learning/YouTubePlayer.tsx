import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { buildYouTubeEmbedUrl, extractYouTubeStartTime } from '@/lib/videoUtils';
import { cn } from '@/lib/utils';

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  originalUrl?: string; // Original URL to extract start time if present
  className?: string;
  onReady?: () => void;
}

export const YouTubePlayer = ({
  videoId,
  title = 'Video',
  originalUrl,
  className,
  onReady,
}: YouTubePlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Extract start time from original URL if present
  const startTime = originalUrl ? extractYouTubeStartTime(originalUrl) : null;

  // Build the embed URL with privacy-enhanced mode
  const embedUrl = buildYouTubeEmbedUrl(videoId, {
    startTime: startTime || undefined,
    modestbranding: true,
    rel: false,
  });

  const handleLoad = () => {
    setIsLoading(false);
    onReady?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={cn('relative rounded-lg overflow-hidden bg-muted', className)}>
        <AspectRatio ratio={16 / 9}>
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-destructive/10 to-destructive/5">
            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-8 w-8 text-destructive"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Video Unavailable
              </h3>
              <p className="text-sm text-muted-foreground">
                This video could not be loaded. It may be private or no longer available.
              </p>
            </div>
          </div>
        </AspectRatio>
      </div>
    );
  }

  return (
    <div className={cn('relative rounded-lg overflow-hidden bg-black', className)}>
      <AspectRatio ratio={16 / 9}>
        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 z-10">
            <Skeleton className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                <svg
                  className="h-8 w-8 text-primary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* YouTube iframe */}
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
        />
      </AspectRatio>
    </div>
  );
};
