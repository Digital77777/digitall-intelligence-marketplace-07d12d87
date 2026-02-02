import { useMemo } from 'react';

interface CloudinaryVideoOptions {
  quality?: 'auto' | 'auto:low' | 'auto:eco' | 'auto:good' | 'auto:best';
  width?: number;
  height?: number;
  format?: 'auto' | 'mp4' | 'webm';
}

interface CloudinaryVideoResult {
  optimizedUrl: string;
  hlsUrl: string;
  posterUrl: string;
  isCloudinary: boolean;
}

// Cloudinary cloud name from environment (public, can be exposed)
const CLOUDINARY_CLOUD_NAME = 'your-cloud-name'; // Will be replaced dynamically

/**
 * Hook to generate optimized Cloudinary video URLs with automatic compression and CDN
 * 
 * Features:
 * - Automatic quality optimization (q_auto)
 * - Automatic format selection (WebM for Chrome, MP4 for Safari)
 * - HLS adaptive bitrate streaming
 * - Auto-generated poster/thumbnail
 * - CDN delivery
 */
export const useCloudinaryVideo = (
  videoUrl: string | undefined,
  options: CloudinaryVideoOptions = {}
): CloudinaryVideoResult => {
  return useMemo(() => {
    // If no URL or not a Cloudinary URL, return original
    if (!videoUrl) {
      return {
        optimizedUrl: '',
        hlsUrl: '',
        posterUrl: '',
        isCloudinary: false,
      };
    }

    // Check if it's already a Cloudinary URL
    const cloudinaryMatch = videoUrl.match(
      /https?:\/\/res\.cloudinary\.com\/([^/]+)\/video\/upload\/(?:([^/]+)\/)?(.+)/
    );

    if (cloudinaryMatch) {
      const [, cloudName, , publicId] = cloudinaryMatch;
      const cleanPublicId = publicId.replace(/\.[^.]+$/, ''); // Remove extension

      return buildCloudinaryUrls(cloudName, cleanPublicId, options);
    }

    // Check if it's a Cloudinary public ID (no URL structure)
    if (!videoUrl.startsWith('http')) {
      // Assume it's a public ID
      return buildCloudinaryUrls(CLOUDINARY_CLOUD_NAME, videoUrl, options);
    }

    // Not a Cloudinary URL - return original
    return {
      optimizedUrl: videoUrl,
      hlsUrl: '',
      posterUrl: '',
      isCloudinary: false,
    };
  }, [videoUrl, options.quality, options.width, options.height, options.format]);
};

function buildCloudinaryUrls(
  cloudName: string,
  publicId: string,
  options: CloudinaryVideoOptions
): CloudinaryVideoResult {
  const {
    quality = 'auto',
    width,
    height,
    format = 'auto',
  } = options;

  const transformations: string[] = [];

  // Quality optimization
  transformations.push(`q_${quality}`);

  // Responsive sizing
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);

  // Auto format and codec
  transformations.push(`f_${format}`);
  transformations.push('vc_auto'); // Auto video codec
  transformations.push('ac_aac'); // AAC audio for compatibility

  const transformString = transformations.join(',');

  return {
    optimizedUrl: `https://res.cloudinary.com/${cloudName}/video/upload/${transformString}/${publicId}`,
    hlsUrl: `https://res.cloudinary.com/${cloudName}/video/upload/sp_auto/${publicId}.m3u8`,
    posterUrl: `https://res.cloudinary.com/${cloudName}/video/upload/so_0,f_jpg,w_1280,q_auto/${publicId}.jpg`,
    isCloudinary: true,
  };
}

/**
 * Utility to extract Cloudinary public ID from a full URL
 */
export const extractCloudinaryPublicId = (url: string): string | null => {
  const match = url.match(
    /https?:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/(?:[^/]+\/)?(.+)/
  );
  return match ? match[1].replace(/\.[^.]+$/, '') : null;
};

/**
 * Build a simple Cloudinary video URL from public ID
 */
export const buildCloudinaryVideoUrl = (
  publicId: string,
  cloudName?: string
): string => {
  const cloud = cloudName || CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloud}/video/upload/q_auto,f_auto,vc_auto/${publicId}`;
};

export default useCloudinaryVideo;
