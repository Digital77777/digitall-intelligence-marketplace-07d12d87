/**
 * Video Compression Utility
 * Compresses videos before upload to reduce file sizes and improve upload speeds.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  videoBitrate?: number;  // bits per second
  audioBitrate?: number;  // bits per second
  frameRate?: number;
  quality?: 'low' | 'medium' | 'high' | 'auto';
  onProgress?: (progress: number) => void;
}

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
}

// Quality presets for different use cases
const QUALITY_PRESETS = {
  low: {
    maxWidth: 480,
    maxHeight: 854,
    videoBitrate: 1_000_000,  // 1 Mbps
    frameRate: 24,
  },
  medium: {
    maxWidth: 720,
    maxHeight: 1280,
    videoBitrate: 2_500_000,  // 2.5 Mbps
    frameRate: 30,
  },
  high: {
    maxWidth: 1080,
    maxHeight: 1920,
    videoBitrate: 5_000_000,  // 5 Mbps
    frameRate: 30,
  },
};

/**
 * Determines optimal quality based on file size
 */
function getAutoQuality(fileSize: number): 'low' | 'medium' | 'high' {
  const sizeMB = fileSize / (1024 * 1024);
  if (sizeMB > 50) return 'low';
  if (sizeMB > 20) return 'medium';
  return 'high';
}

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = originalWidth;
  let height = originalHeight;
  
  // Scale down if larger than max dimensions
  if (width > maxWidth) {
    width = maxWidth;
    height = Math.round(width / aspectRatio);
  }
  
  if (height > maxHeight) {
    height = maxHeight;
    width = Math.round(height * aspectRatio);
  }
  
  // Ensure dimensions are even (required for video encoding)
  width = Math.floor(width / 2) * 2;
  height = Math.floor(height / 2) * 2;
  
  return { width, height };
}

/**
 * Check if compression is needed based on file size and dimensions
 */
export function shouldCompress(
  fileSize: number,
  videoDuration: number
): boolean {
  const sizeMB = fileSize / (1024 * 1024);
  const targetBitrate = 2_500_000; // 2.5 Mbps target
  const expectedSize = (targetBitrate * videoDuration) / 8 / (1024 * 1024);
  
  // Compress if file is larger than expected at target bitrate
  // or if file is larger than 10MB
  return sizeMB > Math.max(expectedSize * 1.5, 10);
}

/**
 * Compress a video file using Canvas and MediaRecorder
 */
export async function compressVideo(
  videoFile: File | Blob,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    quality = 'auto',
    onProgress,
  } = options;

  const originalSize = videoFile.size;
  
  // Get quality preset
  const preset = quality === 'auto' 
    ? QUALITY_PRESETS[getAutoQuality(originalSize)]
    : QUALITY_PRESETS[quality];
  
  const {
    maxWidth = options.maxWidth ?? preset.maxWidth,
    maxHeight = options.maxHeight ?? preset.maxHeight,
    videoBitrate = options.videoBitrate ?? preset.videoBitrate,
    frameRate = options.frameRate ?? preset.frameRate,
  } = options;

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const videoUrl = URL.createObjectURL(videoFile);
    
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    
    const cleanup = () => {
      URL.revokeObjectURL(videoUrl);
      video.remove();
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Failed to load video for compression'));
    };

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration;
        const originalWidth = video.videoWidth;
        const originalHeight = video.videoHeight;
        
        // Calculate target dimensions
        const { width, height } = calculateDimensions(
          originalWidth,
          originalHeight,
          maxWidth,
          maxHeight
        );
        
        // Check if compression is actually needed
        const sizeMB = originalSize / (1024 * 1024);
        const isSmallEnough = sizeMB < 5;
        const isSmallDimensions = originalWidth <= width && originalHeight <= height;
        
        if (isSmallEnough && isSmallDimensions) {
          cleanup();
          resolve({
            blob: videoFile instanceof File ? videoFile : new Blob([videoFile], { type: videoFile.type }),
            originalSize,
            compressedSize: originalSize,
            compressionRatio: 1,
            width: originalWidth,
            height: originalHeight,
          });
          return;
        }

        // Create canvas for rendering
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          cleanup();
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        canvas.width = width;
        canvas.height = height;

        // Set up video playback
        video.currentTime = 0;
        await new Promise<void>((res) => {
          video.onseeked = () => res();
        });

        // Create stream from canvas
        const stream = canvas.captureStream(frameRate);
        
        // Try to capture audio
        try {
          const audioCtx = new AudioContext();
          const source = audioCtx.createMediaElementSource(video);
          const dest = audioCtx.createMediaStreamDestination();
          source.connect(dest);
          source.connect(audioCtx.destination);
          dest.stream.getAudioTracks().forEach(track => stream.addTrack(track));
        } catch (e) {
          console.log('Audio capture not available during compression');
        }

        // Select best available codec
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
            ? 'video/webm;codecs=vp8'
            : 'video/webm';

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: videoBitrate,
        });

        const chunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        const recordingComplete = new Promise<Blob>((res) => {
          mediaRecorder.onstop = () => {
            res(new Blob(chunks, { type: mimeType }));
          };
        });

        mediaRecorder.start(100);

        // Render frames
        const totalFrames = Math.ceil(duration * frameRate);
        let currentFrame = 0;

        const renderFrame = async () => {
          if (currentFrame > totalFrames) {
            mediaRecorder.stop();
            return;
          }

          const frameTime = currentFrame / frameRate;
          if (frameTime <= duration) {
            video.currentTime = frameTime;
            
            await new Promise<void>((res) => {
              video.onseeked = () => {
                ctx.drawImage(video, 0, 0, width, height);
                res();
              };
            });

            // Report progress
            const progress = Math.round((currentFrame / totalFrames) * 100);
            onProgress?.(progress);
          }

          currentFrame++;
          
          // Use setTimeout for better performance
          setTimeout(renderFrame, 1000 / frameRate);
        };

        await renderFrame();
        
        // Wait for recording to complete
        const compressedBlob = await recordingComplete;
        
        cleanup();
        canvas.remove();

        const compressedSize = compressedBlob.size;
        
        resolve({
          blob: compressedBlob,
          originalSize,
          compressedSize,
          compressionRatio: originalSize / compressedSize,
          width,
          height,
        });
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    video.load();
  });
}

/**
 * Format bytes to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Estimate compression time based on video duration and file size
 */
export function estimateCompressionTime(
  fileSize: number,
  duration: number
): number {
  // Rough estimate: 1-2x real-time for compression
  const baseTime = duration * 1.5;
  const sizeFactor = Math.max(1, fileSize / (50 * 1024 * 1024)); // Increase for files > 50MB
  return Math.ceil(baseTime * sizeFactor);
}
