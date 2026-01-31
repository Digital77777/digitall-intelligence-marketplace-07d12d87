import { useState } from 'react';
import { Plus, Trash2, Clock, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLessonNotes } from '@/hooks/useLessonNotes';
import { formatTimestamp } from '@/hooks/useLessonBookmarks';
import { cn } from '@/lib/utils';

interface LessonNotesProps {
  lessonId: string;
  currentTime?: number;
}

export const LessonNotes = ({ lessonId, currentTime = 0 }: LessonNotesProps) => {
  const { notes, isLoading, createNote, updateNote, deleteNote, isCreating } = useLessonNotes(lessonId);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleCreateNote = () => {
    if (!newNoteContent.trim()) return;
    
    createNote({
      lessonId,
      content: newNoteContent.trim(),
      timestampSeconds: Math.floor(currentTime),
    });
    
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  const handleUpdateNote = (noteId: string) => {
    if (!editContent.trim()) return;
    
    updateNote({ noteId, content: editContent.trim() });
    setEditingNoteId(null);
    setEditContent('');
  };

  const startEditing = (noteId: string, content: string) => {
    setEditingNoteId(noteId);
    setEditContent(content);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-2" />
            <div className="h-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Note Button/Form */}
      {isAddingNote ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>at {formatTimestamp(Math.floor(currentTime))}</span>
          </div>
          <Textarea
            placeholder="Write your note..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            className="min-h-[80px] resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCreateNote}
              disabled={!newNoteContent.trim() || isCreating}
            >
              {isCreating ? 'Saving...' : 'Save Note'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAddingNote(false);
                setNewNoteContent('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setIsAddingNote(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Note at {formatTimestamp(Math.floor(currentTime))}
        </Button>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className={cn(
              "border rounded-lg p-3 space-y-2",
              editingNoteId === note.id && "border-primary"
            )}
          >
            {/* Timestamp */}
            {note.timestamp_seconds !== null && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatTimestamp(note.timestamp_seconds)}</span>
              </div>
            )}

            {/* Content */}
            {editingNoteId === note.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[80px] resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdateNote(note.id)}
                    disabled={!editContent.trim()}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelEditing}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                
                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => startEditing(note.id, note.content)}
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteNote(note.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}

        {notes.length === 0 && !isAddingNote && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No notes yet</p>
            <p className="text-xs mt-1">Click the button above to add your first note</p>
          </div>
        )}
      </div>
    </div>
  );
};
