import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InlineTrimTimelineProps {
  duration: number;
  maxDuration: number;
  startTime: number;
  endTime: number;
  currentTime: number;
  onStartChange: (time: number) => void;
  onEndChange: (time: number) => void;
  onSeek: (time: number) => void;
  thumbnails?: string[];
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const InlineTrimTimeline = ({
  duration,
  maxDuration,
  startTime,
  endTime,
  currentTime,
  onStartChange,
  onEndChange,
  onSeek,
  thumbnails = [],
}: InlineTrimTimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'playhead' | null>(null);

  const trimDuration = endTime - startTime;
  const isWithinLimit = trimDuration <= maxDuration;
  const progressPercent = ((currentTime - startTime) / trimDuration) * 100;

  const getTimeFromPosition = useCallback((clientX: number): number => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return percentage * duration;
  }, [duration]);

  const handleMouseDown = useCallback((type: 'start' | 'end' | 'playhead') => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(type);
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    
    const time = getTimeFromPosition(clientX);
    
    if (isDragging === 'start') {
      const newStart = Math.max(0, Math.min(time, endTime - 1));
      onStartChange(newStart);
    } else if (isDragging === 'end') {
      const newEnd = Math.min(duration, Math.max(time, startTime + 1));
      onEndChange(newEnd);
    } else if (isDragging === 'playhead') {
      const newTime = Math.max(startTime, Math.min(time, endTime));
      onSeek(newTime);
    }
  }, [isDragging, getTimeFromPosition, endTime, startTime, duration, onStartChange, onEndChange, onSeek]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX);
  }, [handleMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  }, [handleMove]);

  const handleEnd = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove, handleEnd]);

  const presetDurations = [15, 30, 60].filter(d => d <= duration);

  const applyPreset = (seconds: number) => {
    onStartChange(0);
    onEndChange(Math.min(seconds, duration));
  };

  const startPercent = (startTime / duration) * 100;
  const endPercent = (endTime / duration) * 100;

  return (
    <div className="space-y-3">
      {/* Duration indicator */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Selected duration</span>
        <span className={cn(
          "font-bold text-lg transition-colors",
          isWithinLimit ? "text-success" : "text-destructive"
        )}>
          {formatTime(trimDuration)}
          <span className="text-xs text-muted-foreground font-normal ml-1">
            / {maxDuration}s max
          </span>
        </span>
      </div>

      {/* Timeline */}
      <div 
        ref={timelineRef}
        className="relative h-14 bg-muted rounded-lg overflow-hidden cursor-pointer touch-none select-none"
        onClick={(e) => {
          if (!isDragging) {
            const time = getTimeFromPosition(e.clientX);
            if (time >= startTime && time <= endTime) {
              onSeek(time);
            }
          }
        }}
      >
        {/* Thumbnail track */}
        <div className="absolute inset-0 flex">
          {thumbnails.length > 0 ? (
            thumbnails.map((thumb, i) => (
              <div 
                key={i}
                className="flex-1 h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${thumb})` }}
              />
            ))
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20" />
          )}
        </div>

        {/* Dimmed regions outside trim */}
        <div 
          className="absolute inset-y-0 left-0 bg-black/60 transition-all"
          style={{ width: `${startPercent}%` }}
        />
        <div 
          className="absolute inset-y-0 right-0 bg-black/60 transition-all"
          style={{ width: `${100 - endPercent}%` }}
        />

        {/* Selected region border */}
        <div 
          className={cn(
            "absolute inset-y-0 border-y-2 transition-all",
            isWithinLimit ? "border-primary" : "border-destructive"
          )}
          style={{ 
            left: `${startPercent}%`, 
            width: `${endPercent - startPercent}%` 
          }}
        />

        {/* Start handle */}
        <div
          className={cn(
            "absolute inset-y-0 w-4 cursor-ew-resize z-10 flex items-center justify-center transition-all",
            isWithinLimit ? "bg-primary" : "bg-destructive",
            isDragging === 'start' && "scale-110"
          )}
          style={{ left: `calc(${startPercent}% - 8px)` }}
          onMouseDown={handleMouseDown('start')}
          onTouchStart={handleMouseDown('start')}
        >
          <div className="w-0.5 h-6 bg-primary-foreground rounded-full" />
        </div>

        {/* End handle */}
        <div
          className={cn(
            "absolute inset-y-0 w-4 cursor-ew-resize z-10 flex items-center justify-center transition-all",
            isWithinLimit ? "bg-primary" : "bg-destructive",
            isDragging === 'end' && "scale-110"
          )}
          style={{ left: `calc(${endPercent}% - 8px)` }}
          onMouseDown={handleMouseDown('end')}
          onTouchStart={handleMouseDown('end')}
        >
          <div className="w-0.5 h-6 bg-primary-foreground rounded-full" />
        </div>

        {/* Playhead */}
        <div
          className={cn(
            "absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-20 cursor-ew-resize",
            isDragging === 'playhead' && "w-1"
          )}
          style={{ 
            left: `${((currentTime / duration) * 100)}%`,
            transform: 'translateX(-50%)'
          }}
          onMouseDown={handleMouseDown('playhead')}
          onTouchStart={handleMouseDown('playhead')}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md" />
        </div>
      </div>

      {/* Time labels */}
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>{formatTime(startTime)}</span>
        <span>{formatTime(endTime)}</span>
      </div>

      {/* Quick presets */}
      {presetDurations.length > 0 && (
        <div className="flex gap-2">
          <span className="text-xs text-muted-foreground self-center">Quick trim:</span>
          {presetDurations.map((sec) => (
            <Button
              key={sec}
              type="button"
              variant={trimDuration === sec ? "default" : "outline"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => applyPreset(sec)}
            >
              {sec}s
            </Button>
          ))}
          {duration > 60 && (
            <Button
              type="button"
              variant={startTime === 0 && endTime === duration ? "default" : "outline"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => {
                onStartChange(0);
                onEndChange(duration);
              }}
            >
              Full
            </Button>
          )}
        </div>
      )}

      {/* Warning if over limit */}
      {!isWithinLimit && (
        <p className="text-xs text-destructive animate-fade-in">
          Video exceeds {maxDuration}s limit. Adjust the trim handles.
        </p>
      )}
    </div>
  );
};
