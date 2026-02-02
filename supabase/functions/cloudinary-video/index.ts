import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VideoRequest {
  action: 'get_optimized_url' | 'get_upload_signature';
  publicId?: string;
  options?: {
    quality?: 'auto' | 'auto:low' | 'auto:eco' | 'auto:good' | 'auto:best';
    format?: 'auto' | 'mp4' | 'webm' | 'hls';
    width?: number;
    height?: number;
    startOffset?: number;
    endOffset?: number;
  };
  folder?: string;
}

// Generate SHA-1 signature for Cloudinary
async function generateSignature(params: Record<string, string>, apiSecret: string): Promise<string> {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  const encoder = new TextEncoder();
  const data = encoder.encode(sortedParams + apiSecret);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Build optimized video URL with transformations
function buildOptimizedVideoUrl(
  cloudName: string,
  publicId: string,
  options: VideoRequest['options'] = {}
): { url: string; hlsUrl?: string } {
  const {
    quality = 'auto',
    format = 'auto',
    width,
    height,
    startOffset,
    endOffset,
  } = options;

  const transformations: string[] = [];
  
  // Quality optimization
  transformations.push(`q_${quality}`);
  
  // Responsive sizing
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  
  // Trim if needed
  if (startOffset !== undefined) transformations.push(`so_${startOffset}`);
  if (endOffset !== undefined) transformations.push(`eo_${endOffset}`);
  
  // Video-specific optimizations
  transformations.push('f_auto'); // Auto format (WebM for Chrome, MP4 for Safari)
  transformations.push('vc_auto'); // Auto video codec
  transformations.push('ac_aac'); // AAC audio codec for compatibility
  
  const transformString = transformations.join(',');
  
  // Standard optimized URL
  const url = `https://res.cloudinary.com/${cloudName}/video/upload/${transformString}/${publicId}`;
  
  // HLS streaming URL for adaptive bitrate
  const hlsUrl = `https://res.cloudinary.com/${cloudName}/video/upload/sp_auto/${publicId}.m3u8`;
  
  return { url, hlsUrl };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = Deno.env.get('CLOUDINARY_API_KEY');
    const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET');

    if (!cloudName) {
      throw new Error('CLOUDINARY_CLOUD_NAME is not configured');
    }
    if (!apiKey) {
      throw new Error('CLOUDINARY_API_KEY is not configured');
    }
    if (!apiSecret) {
      throw new Error('CLOUDINARY_API_SECRET is not configured');
    }

    const { action, publicId, options, folder = 'course-videos' }: VideoRequest = await req.json();

    if (action === 'get_optimized_url') {
      if (!publicId) {
        throw new Error('publicId is required for get_optimized_url');
      }

      const urls = buildOptimizedVideoUrl(cloudName, publicId, options);

      return new Response(
        JSON.stringify({
          success: true,
          ...urls,
          poster: `https://res.cloudinary.com/${cloudName}/video/upload/so_0,f_jpg,w_1280/${publicId}.jpg`,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (action === 'get_upload_signature') {
      const timestamp = Math.floor(Date.now() / 1000);
      
      const params: Record<string, string> = {
        folder,
        timestamp: timestamp.toString(),
        upload_preset: 'course_videos',
        eager: 'sp_auto', // Generate HLS on upload
        eager_async: 'true',
        resource_type: 'video',
      };

      const signature = await generateSignature(params, apiSecret);

      return new Response(
        JSON.stringify({
          success: true,
          signature,
          timestamp,
          cloudName,
          apiKey,
          folder,
          uploadPreset: 'course_videos',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error: unknown) {
    console.error('Cloudinary video error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
