import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UploadTask {
  id: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  createdAt: Date;
  thumbnail?: string;
}

interface BackgroundUploadContextType {
  uploads: UploadTask[];
  uploadReel: (params: {
    userId: string;
    videoFile: File;
    title: string;
    description?: string;
    thumbnail?: string;
  }) => Promise<void>;
  dismissUpload: (id: string) => void;
  retryUpload: (id: string) => void;
  hasActiveUploads: boolean;
}

const BackgroundUploadContext = createContext<BackgroundUploadContextType | undefined>(undefined);

// Store pending retry data
const pendingRetries = new Map<string, {
  userId: string;
  videoFile: File;
  title: string;
  description?: string;
  thumbnail?: string;
}>();

export const BackgroundUploadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uploads, setUploads] = useState<UploadTask[]>([]);
  const { toast } = useToast();
  const uploadCounter = useRef(0);

  const updateUpload = useCallback((id: string, updates: Partial<UploadTask>) => {
    setUploads(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, []);

  const uploadReel = useCallback(async ({
    userId,
    videoFile,
    title,
    description,
    thumbnail,
  }: {
    userId: string;
    videoFile: File;
    title: string;
    description?: string;
    thumbnail?: string;
  }) => {
    const uploadId = `upload-${Date.now()}-${++uploadCounter.current}`;
    
    // Store retry data
    pendingRetries.set(uploadId, { userId, videoFile, title, description, thumbnail });

    // Create upload task
    const newUpload: UploadTask = {
      id: uploadId,
      fileName: title || videoFile.name,
      progress: 0,
      status: 'pending',
      createdAt: new Date(),
      thumbnail,
    };

    setUploads(prev => [newUpload, ...prev]);

    // Start upload in background (don't await)
    performUpload(uploadId, userId, videoFile, title, description);
  }, []);

  const performUpload = async (
    uploadId: string,
    userId: string,
    videoFile: File,
    title: string,
    description?: string
  ) => {
    try {
      updateUpload(uploadId, { status: 'uploading', progress: 5 });

      // Create insight first
      updateUpload(uploadId, { progress: 10 });
      const { data: insight, error: insightError } = await supabase
        .from("community_insights")
        .insert({
          user_id: userId,
          title: title.trim(),
          content: description?.trim() || title.trim(),
          category: "reel",
          is_published: true,
        })
        .select()
        .single();

      if (insightError) throw insightError;
      updateUpload(uploadId, { progress: 25 });

      // Upload video to storage
      const fileExt = videoFile.name.split(".").pop() || "webm";
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      updateUpload(uploadId, { progress: 30, status: 'uploading' });

      // Get auth token first
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      // Use XMLHttpRequest for progress tracking
      const uploadPromise = new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 50) + 30; // 30-80%
            updateUpload(uploadId, { progress: Math.min(percentComplete, 80) });
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            // Get public URL after successful upload
            const { data: { publicUrl } } = supabase.storage
              .from("reels")
              .getPublicUrl(fileName);
            resolve(publicUrl);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

        xhr.open('POST', `${supabaseUrl}/storage/v1/object/reels/${fileName}`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('x-upsert', 'false');
        xhr.send(videoFile);
      });

      const publicUrl = await uploadPromise;
      updateUpload(uploadId, { progress: 85, status: 'processing' });

      // Create reel record
      const { error: reelError } = await supabase
        .from("community_reels")
        .insert({
          user_id: userId,
          insight_id: insight.id,
          video_url: publicUrl,
          title: title.trim(),
        });

      if (reelError) throw reelError;

      updateUpload(uploadId, { progress: 100, status: 'complete' });
      
      toast({
        title: "Reel uploaded!",
        description: "Your reel has been published successfully.",
      });

      // Clean up retry data
      pendingRetries.delete(uploadId);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setUploads(prev => prev.filter(u => u.id !== uploadId));
      }, 5000);

    } catch (error: any) {
      console.error("Background upload error:", error);
      updateUpload(uploadId, { 
        status: 'error', 
        error: error.message || 'Upload failed' 
      });
      
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload reel. Tap to retry.",
        variant: "destructive",
      });
    }
  };

  const dismissUpload = useCallback((id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id));
    pendingRetries.delete(id);
  }, []);

  const retryUpload = useCallback((id: string) => {
    const retryData = pendingRetries.get(id);
    if (retryData) {
      updateUpload(id, { status: 'pending', progress: 0, error: undefined });
      performUpload(id, retryData.userId, retryData.videoFile, retryData.title, retryData.description);
    }
  }, [updateUpload]);

  const hasActiveUploads = uploads.some(u => u.status === 'uploading' || u.status === 'processing' || u.status === 'pending');

  return (
    <BackgroundUploadContext.Provider value={{
      uploads,
      uploadReel,
      dismissUpload,
      retryUpload,
      hasActiveUploads,
    }}>
      {children}
    </BackgroundUploadContext.Provider>
  );
};

export const useBackgroundUpload = () => {
  const context = useContext(BackgroundUploadContext);
  if (!context) {
    throw new Error('useBackgroundUpload must be used within BackgroundUploadProvider');
  }
  return context;
};
