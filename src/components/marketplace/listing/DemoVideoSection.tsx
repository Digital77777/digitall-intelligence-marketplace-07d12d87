import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Play, ExternalLink, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DemoVideoSectionProps {
  videos: string[];
  title: string;
  creationLink?: string | null;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export const DemoVideoSection: React.FC<DemoVideoSectionProps> = ({
  videos,
  title,
  creationLink,
}) => {
  const [activeVideo, setActiveVideo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const youtubeVideos = videos
    .map((url) => ({ url, id: extractYouTubeId(url) }))
    .filter((v): v is { url: string; id: string } => v.id !== null);

  if (youtubeVideos.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
          Demo & Overview
        </h2>
        <div className="bg-muted/50 rounded-2xl border border-border/50 p-8 text-center">
          <Film className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground mb-4">No demo video available yet</p>
          {creationLink && (
            <Button variant="outline" asChild className="gap-2">
              <a href={creationLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Visit {title} Website
              </a>
            </Button>
          )}
        </div>
      </div>
    );
  }

  const currentVideo = youtubeVideos[activeVideo];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
        Demo & Overview
      </h2>

      {/* Video Player */}
      <div className="relative rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 border border-border/50">
        {isPlaying ? (
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${currentVideo.id}?autoplay=1&rel=0&modestbranding=1`}
              title={`${title} Demo Video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="w-full h-full"
            />
          </div>
        ) : (
          <button
            onClick={() => setIsPlaying(true)}
            className="relative w-full aspect-video group cursor-pointer"
          >
            <img
              src={`https://img.youtube.com/vi/${currentVideo.id}/maxresdefault.jpg`}
              alt={`${title} demo thumbnail`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${currentVideo.id}/hqdefault.jpg`;
              }}
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="w-20 h-20 bg-primary/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-primary-foreground ml-1" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-lg">
              Watch Demo
            </div>
          </button>
        )}
      </div>

      {/* Video Selector (multiple videos) */}
      {youtubeVideos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {youtubeVideos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => {
                setActiveVideo(index);
                setIsPlaying(false);
              }}
              className={cn(
                'flex-shrink-0 relative w-32 h-20 rounded-xl overflow-hidden border-2 transition-all',
                index === activeVideo
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border/50 hover:border-primary/50 opacity-70 hover:opacity-100'
              )}
            >
              <img
                src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                alt={`Demo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
