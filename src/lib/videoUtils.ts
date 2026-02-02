// Video source types
export type VideoSourceType = 'youtube' | 'cloudinary' | 'direct' | 'none';

export interface YouTubeEmbedOptions {
  autoplay?: boolean;
  mute?: boolean;
  startTime?: number;
  modestbranding?: boolean;
  rel?: boolean;
}

/**
 * Extract YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/watch?v=VIDEO_ID&t=123
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube.com/shorts/VIDEO_ID
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  // YouTube standard watch URL
  const watchMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([a-zA-Z0-9_-]{11})/
  );
  if (watchMatch) return watchMatch[1];

  // YouTube short URL (youtu.be)
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // YouTube embed URL
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  // YouTube Shorts URL
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  // YouTube nocookie embed URL
  const nocookieMatch = url.match(/youtube-nocookie\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (nocookieMatch) return nocookieMatch[1];

  return null;
}

/**
 * Extract start time from YouTube URL (if present)
 * Supports: ?t=123 or &t=123 (seconds)
 */
export function extractYouTubeStartTime(url: string): number | null {
  if (!url) return null;

  const timeMatch = url.match(/[?&]t=(\d+)/);
  return timeMatch ? parseInt(timeMatch[1], 10) : null;
}

/**
 * Check if URL is a Cloudinary video URL
 */
function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com') && url.includes('/video/');
}

/**
 * Check if URL is a YouTube URL
 */
function isYouTubeUrl(url: string): boolean {
  return (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('youtube-nocookie.com')
  );
}

/**
 * Determine the video source type from a URL
 */
export function getVideoSourceType(url: string | undefined): VideoSourceType {
  if (!url || url.trim() === '') return 'none';

  if (isCloudinaryUrl(url)) return 'cloudinary';
  if (isYouTubeUrl(url)) return 'youtube';

  // Check if it's a valid video URL (has common video extensions or is an HTTP URL)
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.endsWith('.mp4') ||
    url.endsWith('.webm') ||
    url.endsWith('.m3u8')
  ) {
    return 'direct';
  }

  // Assume it might be a Cloudinary public ID if it doesn't look like a URL
  if (!url.startsWith('http')) {
    return 'cloudinary';
  }

  return 'direct';
}

/**
 * Build YouTube embed URL with privacy-enhanced mode
 */
export function buildYouTubeEmbedUrl(
  videoId: string,
  options: YouTubeEmbedOptions = {}
): string {
  const {
    autoplay = false,
    mute = false,
    startTime,
    modestbranding = true,
    rel = false,
  } = options;

  const params = new URLSearchParams();

  // Core parameters
  params.set('rel', rel ? '1' : '0'); // Don't show related videos from other channels
  params.set('modestbranding', modestbranding ? '1' : '0'); // Minimal YouTube branding
  params.set('enablejsapi', '1'); // Enable JavaScript API for future progress tracking

  // Optional parameters
  if (autoplay) params.set('autoplay', '1');
  if (mute) params.set('mute', '1');
  if (startTime && startTime > 0) params.set('start', startTime.toString());

  // Use origin for security
  if (typeof window !== 'undefined') {
    params.set('origin', window.location.origin);
  }

  // Use youtube-nocookie.com for enhanced privacy (no cookies until play)
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}
