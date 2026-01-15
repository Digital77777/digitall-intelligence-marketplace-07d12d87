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
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };
    
    video.src = URL.createObjectURL(file);
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
