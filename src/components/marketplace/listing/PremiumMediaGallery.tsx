import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Image as ImageIcon,
  Film,
  ZoomIn
} from 'lucide-react';
import { EnhancedImage } from '@/components/media/EnhancedImage';

interface PremiumMediaGalleryProps {
  images: string[];
  videos: string[];
  title: string;
  className?: string;
}

export const PremiumMediaGallery: React.FC<PremiumMediaGalleryProps> = ({
  images,
  videos,
  title,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [thumbnailStart, setThumbnailStart] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null);
  
  const allMedia = [...images, ...videos];
  const totalCount = allMedia.length;
  const isCurrentVideo = currentIndex >= images.length;
  const currentMedia = allMedia[currentIndex];
  
  const visibleThumbnails = 5;
  
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

  // Auto-scroll thumbnails
  useEffect(() => {
    if (currentIndex < thumbnailStart) {
      setThumbnailStart(currentIndex);
    } else if (currentIndex >= thumbnailStart + visibleThumbnails) {
      setThumbnailStart(currentIndex - visibleThumbnails + 1);
    }
  }, [currentIndex, thumbnailStart]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
    if (fullscreenVideoRef.current) {
      fullscreenVideoRef.current.muted = !isMuted;
    }
  };

  if (totalCount === 0) {
    return (
      <div className={cn(
        "aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center",
        className
      )}>
        <div className="text-center text-muted-foreground">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No media available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Media Type Badges */}
      <div className="flex gap-2">
        {images.length > 0 && (
          <Badge className="bg-primary/10 text-primary border-primary/20 gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" />
            {images.length} Photo{images.length !== 1 ? 's' : ''}
          </Badge>
        )}
        {videos.length > 0 && (
          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 gap-1.5">
            <Film className="w-3.5 h-3.5" />
            {videos.length} Video{videos.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Main Display */}
      <div className="relative group">
        {/* Gradient overlay for visual depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 rounded-2xl pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Main Media */}
        <div className="relative aspect-[16/10] md:aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-muted/50">
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
              
              {/* Video Controls Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={handleVideoPlay}
                  className="w-20 h-20 bg-background/50 backdrop-blur-sm rounded-full flex items-center justify-center text-foreground transition-all hover:bg-background/70 hover:scale-110"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </button>
              </div>

              {/* Video Controls Bar */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
                <button
                  onClick={toggleMute}
                  className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div 
              className="relative w-full h-full cursor-pointer"
              onClick={() => setIsFullscreen(true)}
            >
              <EnhancedImage
                src={currentMedia}
                alt={`${title} - Image ${currentIndex + 1}`}
                className="w-full h-full object-contain"
                priority={currentIndex === 0}
              />
              
              {/* Zoom hint */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black/50 backdrop-blur-sm rounded-full p-4 text-white">
                  <ZoomIn className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Arrows */}
          {totalCount > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-20"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-20"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Progress Indicator */}
          {totalCount > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {allMedia.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentIndex 
                      ? "bg-white w-6" 
                      : "bg-white/50 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {totalCount > 1 && (
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {allMedia.map((media, index) => {
              const isVideo = index >= images.length;
              const isActive = index === currentIndex;
              
              return (
                <button
                  key={index}
                  onClick={() => goToIndex(index)}
                  className={cn(
                    "relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden transition-all duration-300",
                    isActive 
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105" 
                      : "hover:ring-2 hover:ring-muted-foreground/30 opacity-70 hover:opacity-100"
                  )}
                >
                  {isVideo ? (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-purple-600/30 flex items-center justify-center">
                      <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 text-purple-600 ml-0.5" />
                      </div>
                    </div>
                  ) : (
                    <EnhancedImage
                      src={media}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute inset-0 border-2 border-primary rounded-xl" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fullscreen Gallery Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/98 border-none">
          <div className="relative w-full h-full flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent z-20">
              <div className="text-white">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-white/70">
                  {currentIndex + 1} of {totalCount}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4">
              {isCurrentVideo ? (
                <video
                  ref={fullscreenVideoRef}
                  src={currentMedia}
                  controls
                  autoPlay
                  muted={isMuted}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
              ) : (
                <EnhancedImage
                  src={currentMedia}
                  alt={`${title} - Image ${currentIndex + 1}`}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
              )}

              {/* Navigation */}
              {totalCount > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Bar */}
            {totalCount > 1 && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex gap-2 justify-center overflow-x-auto">
                  {allMedia.map((media, index) => {
                    const isVideo = index >= images.length;
                    const isActive = index === currentIndex;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => goToIndex(index)}
                        className={cn(
                          "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200",
                          isActive 
                            ? "ring-2 ring-primary scale-110" 
                            : "opacity-60 hover:opacity-100"
                        )}
                      >
                        {isVideo ? (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        ) : (
                          <EnhancedImage
                            src={media}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
