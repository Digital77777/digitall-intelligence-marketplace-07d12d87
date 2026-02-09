import { supabase } from '@/integrations/supabase/client';

/**
 * Generate a thumbnail image from a video file or URL
 * @param videoSource - Video file or URL
 * @param timeInSeconds - Time position to capture (default: 1 second)
 * @returns Data URL of the thumbnail image
 */
export const generateVideoThumbnail = (
  videoSource: File | string,
  timeInSeconds: number = 1
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    // Handle video load
    video.addEventListener('loadedmetadata', () => {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Seek to the desired time
      video.currentTime = Math.min(timeInSeconds, video.duration);
    });

    // Capture frame when seeked
    video.addEventListener('seeked', () => {
      try {
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // Clean up
        video.remove();
        canvas.remove();
        
        resolve(thumbnailDataUrl);
      } catch (error) {
        reject(error);
      }
    });

    video.addEventListener('error', (e) => {
      reject(new Error('Error loading video'));
    });

    // Set video source
    if (videoSource instanceof File) {
      video.src = URL.createObjectURL(videoSource);
    } else {
      video.src = videoSource;
      video.crossOrigin = 'anonymous'; // For CORS if loading external videos
    }

    // Fallback timeout
    setTimeout(() => {
      reject(new Error('Video thumbnail generation timeout'));
    }, 10000);
  });
};

/**
 * Upload video thumbnail to Supabase storage
 * @param thumbnailDataUrl - Data URL of the thumbnail
 * @param path - Storage path for the thumbnail
 * @returns Public URL of the uploaded thumbnail
 */
export const uploadVideoThumbnail = async (
  thumbnailDataUrl: string,
  path: string
): Promise<string> => {
  // supabase is imported at the top of the file
  
  // Convert data URL to blob
  const response = await fetch(thumbnailDataUrl);
  const blob = await response.blob();
  
  // Upload to storage
  const { data, error } = await supabase.storage
    .from('freelancer-profiles') // Using existing bucket
    .upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('freelancer-profiles')
    .getPublicUrl(data.path);

  return publicUrl;
};
