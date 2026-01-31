import { Trash2, Clock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLessonBookmarks, formatTimestamp } from '@/hooks/useLessonBookmarks';

interface LessonBookmarksProps {
  lessonId: string;
  onSeekTo?: (seconds: number) => void;
}

export const LessonBookmarks = ({ lessonId, onSeekTo }: LessonBookmarksProps) => {
  const { bookmarks, isLoading, deleteBookmark, isDeleting } = useLessonBookmarks(lessonId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-12 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No bookmarks yet</p>
        <p className="text-xs mt-1">
          Click the bookmark icon in the video player to save important moments
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
        >
          {/* Play Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => onSeekTo?.(bookmark.timestamp_seconds)}
          >
            <Play className="h-4 w-4" />
          </Button>

          {/* Bookmark Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{bookmark.title}</p>
            <p className="text-xs text-muted-foreground">
              {formatTimestamp(bookmark.timestamp_seconds)}
            </p>
          </div>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={() => deleteBookmark(bookmark.id)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};
