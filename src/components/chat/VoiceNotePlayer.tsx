import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceNotePlayerProps {
  audioUrl: string;
  isSender: boolean;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({ audioUrl, isSender }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 min-w-[180px]">
      <Button
        size="icon"
        variant="ghost"
        className={`h-8 w-8 rounded-full ${
          isSender 
            ? 'hover:bg-primary-foreground/20' 
            : 'hover:bg-muted-foreground/20'
        }`}
        onClick={togglePlayback}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 ml-0.5" />
        )}
      </Button>
      
      <div className="flex-1 flex flex-col gap-1">
        <div className="h-1 bg-current/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-current rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={`text-[10px] ${isSender ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {formatTime(currentTime)} / {formatTime(duration || 0)}
        </span>
      </div>
    </div>
  );
};
