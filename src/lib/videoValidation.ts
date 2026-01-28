/**
 * Maximum allowed video duration in seconds (1 minute)
 */
export const MAX_VIDEO_DURATION_SECONDS = 60;

/**
 * Validates video duration from a File object
 * @param file Video file to validate
 * @returns Promise with duration in seconds, or error message
 */
export const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    // Timeout to prevent infinite loading on problematic videos
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Video loading timed out'));
    }, 10000); // 10 second timeout
    
    const cleanup = () => {
      clearTimeout(timeoutId);
      video.onloadedmetadata = null;
      video.onloadeddata = null;
      video.onerror = null;
      video.oncanplay = null;
      if (video.src) {
        URL.revokeObjectURL(video.src);
      }
    };
    
    const handleSuccess = () => {
      if (video.duration && isFinite(video.duration) && video.duration > 0) {
        cleanup();
        resolve(video.duration);
      }
    };
    
    // Try multiple events since onloadedmetadata doesn't always fire on mobile
    video.onloadedmetadata = handleSuccess;
    video.onloadeddata = handleSuccess;
    video.oncanplay = handleSuccess;
    
    video.onerror = () => {
      cleanup();
      reject(new Error('Failed to load video metadata'));
    };
    
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;
    
    // Force load on some browsers
    video.load();
  });
};

/**
 * Validates that a video file is within the allowed duration
 * @param file Video file to validate
 * @param maxDuration Maximum allowed duration in seconds (default: 60)
 * @returns Promise with validation result
 */
export const validateVideoDuration = async (
  file: File,
  maxDuration: number = MAX_VIDEO_DURATION_SECONDS
): Promise<{ valid: boolean; duration: number; message?: string }> => {
  try {
    const duration = await getVideoDuration(file);
    
    if (duration > maxDuration) {
      return {
        valid: false,
        duration,
        message: `Video is ${formatDuration(duration)} long. Maximum allowed is ${formatDuration(maxDuration)}.`
      };
    }
    
    return { valid: true, duration };
  } catch (error) {
    return {
      valid: false,
      duration: 0,
      message: 'Could not read video duration. Please try a different file.'
    };
  }
};

/**
 * Format duration in seconds to a human-readable string
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  if (mins === 0) {
    return `${secs} second${secs !== 1 ? 's' : ''}`;
  } else if (secs === 0) {
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  }
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
