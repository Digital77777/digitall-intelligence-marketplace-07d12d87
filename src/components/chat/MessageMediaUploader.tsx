import React, { useRef, useState, useCallback } from 'react';
import { Image, Video, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MessageMediaUploaderProps {
  onMediaSelected: (mediaUrl: string, mediaType: 'image' | 'video') => void;
  onClear: () => void;
  selectedMedia: { url: string; type: 'image' | 'video' } | null;
  disabled?: boolean;
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export const MessageMediaUploader: React.FC<MessageMediaUploaderProps> = ({
  onMediaSelected,
  onClear,
  selectedMedia,
  disabled = false,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Determine media type
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image (JPEG, PNG, WebP, GIF) or video (MP4, WebM).',
        variant: 'destructive',
      });
      return;
    }

    // Check file size
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: `Maximum size is ${isImage ? '10MB' : '50MB'}.`,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate unique filename
      const ext = file.name.split('.').pop()?.toLowerCase() || (isImage ? 'jpg' : 'mp4');
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      // Upload to storage
      const { data, error } = await supabase.storage
        .from('message-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('message-media')
        .getPublicUrl(data.path);

      onMediaSelected(publicUrl, isImage ? 'image' : 'video');
      setUploadProgress(100);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload media. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [onMediaSelected, toast]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
      />

      {/* Media Button */}
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={openFilePicker}
        disabled={disabled || isUploading || !!selectedMedia}
        className="h-11 w-11 rounded-xl hover:bg-accent"
      >
        {isUploading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Image className="h-5 w-5" />
        )}
      </Button>

      {/* Preview */}
      {selectedMedia && (
        <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-card border border-border rounded-xl shadow-lg">
          <div className="relative inline-block">
            {selectedMedia.type === 'image' ? (
              <img
                src={selectedMedia.url}
                alt="Selected media"
                className="max-h-32 max-w-[200px] rounded-lg object-cover"
              />
            ) : (
              <div className="relative">
                <video
                  src={selectedMedia.url}
                  className="max-h-32 max-w-[200px] rounded-lg object-cover"
                  muted
                  playsInline
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                  <Video className="h-6 w-6 text-white" />
                </div>
              </div>
            )}
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={onClear}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {selectedMedia.type === 'image' ? '📷 Photo' : '🎬 Video'} ready to send
          </p>
        </div>
      )}
    </>
  );
};
