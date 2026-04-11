import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  ChevronLeft, ChevronRight, X, Play, Pause,
  Volume2, VolumeX, Maximize2, Image as ImageIcon, Film, ZoomIn
} from 'lucide-react';
import { EnhancedImage } from '@/components/media/EnhancedImage';

interface PremiumMediaGalleryProps {
  images: string[];
  videos: string[];
  title: string;
  className?: string;
}

export const PremiumMediaGallery: React.FC<PremiumMediaGalleryProps> = ({
  images, videos, title, className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null);
  
  const allMedia = [...images, ...videos];
  const totalCount = allMedia.length;
  const isCurrentVideo = currentIndex >= images.length;
  const currentMedia = allMedia[currentIndex];

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalCount);
    setIsPlaying(false);
  }, [totalCount]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalCount) % totalCount);
    setIsPlaying(false);
  }, [totalCount]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goToNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goToPrevious(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) videoRef.current.muted = !isMuted;
    if (fullscreenVideoRef.current) fullscreenVideoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (totalCount === 0) {
    return (
      <div className={cn("aspect-square bg-muted/30 rounded-lg flex items-center justify-center border", className)}>
        <div className="text-center text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No media available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col md:flex-row gap-2", className)}>
      {/* Vertical Thumbnail Strip — Desktop */}
      {totalCount > 1 && (
        <div className="hidden md:flex flex-col gap-1.5 w-[72px] flex-shrink-0 max-h-[480px] overflow-y-auto scrollbar-hide">
          {allMedia.map((media, index) => {
            const isVideo = index >= images.length;
            const isActive = index === currentIndex;
            return (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                onMouseEnter={() => goToIndex(index)}
                className={cn(
                  "relative flex-shrink-0 w-[68px] h-[68px] rounded border-2 overflow-hidden transition-all",
                  isActive
                    ? "border-primary shadow-sm"
                    : "border-border/50 hover:border-primary/50 opacity-70 hover:opacity-100"
                )}
              >
                {isVideo ? (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Play className="w-5 h-5 text-muted-foreground" />
                  </div>
                ) : (
                  <EnhancedImage src={media} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Display */}
      <div className="flex-1 relative group">
        <div className="relative aspect-square md:aspect-[4/3] rounded-lg overflow-hidden bg-muted/20 border">
          {isCurrentVideo ? (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                src={currentMedia}
                muted={isMuted}
                loop
                playsInline
                className="w-full h-full object-contain bg-black"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button onClick={handleVideoPlay}
                  className="w-16 h-16 bg-background/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background/80 transition-all">
                  {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
                </button>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex justify-between z-20">
                <button onClick={toggleMute} className="p-1.5 bg-black/50 rounded-full text-white">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsFullscreen(true)} className="p-1.5 bg-black/50 rounded-full text-white">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full cursor-pointer" onClick={() => setIsFullscreen(true)}>
              <EnhancedImage
                src={currentMedia}
                alt={`${title} - Image ${currentIndex + 1}`}
                className="w-full h-full object-contain"
                priority={currentIndex === 0}
              />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/50 backdrop-blur-sm rounded-full p-2 text-white">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>
              {/* Hover-to-zoom hint */}
              <div className="absolute bottom-3 left-3 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Roll over image to zoom in
              </div>
            </div>
          )}

          {/* Nav Arrows */}
          {totalCount > 1 && (
            <>
              <button onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-black/70 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-all z-20">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-black/70 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-all z-20">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Counter badge */}
          {totalCount > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded z-20">
              {currentIndex + 1}/{totalCount}
            </div>
          )}
        </div>

        {/* Horizontal Thumbnail Strip — Mobile */}
        {totalCount > 1 && (
          <div className="md:hidden flex gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-hide">
            {allMedia.map((media, index) => {
              const isVideo = index >= images.length;
              const isActive = index === currentIndex;
              return (
                <button
                  key={index}
                  onClick={() => goToIndex(index)}
                  className={cn(
                    "relative flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all",
                    isActive ? "border-primary" : "border-border/50 opacity-70"
                  )}
                >
                  {isVideo ? (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Play className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ) : (
                    <EnhancedImage src={media} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/98 border-none">
          <div className="relative w-full h-full flex flex-col">
            <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent z-20">
              <div className="text-white">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-white/70">{currentIndex + 1} of {totalCount}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(false)} className="text-white hover:bg-white/20">
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              {isCurrentVideo ? (
                <video ref={fullscreenVideoRef} src={currentMedia} controls autoPlay muted={isMuted}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg" />
              ) : (
                <EnhancedImage src={currentMedia} alt={`${title} - ${currentIndex + 1}`}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg" />
              )}
              {totalCount > 1 && (
                <>
                  <button onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20">
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20">
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
