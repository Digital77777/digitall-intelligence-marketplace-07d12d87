import React, { useState } from 'react';
import { Pencil, Trash2, MoreVertical, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MessageActionsProps {
  messageId: string;
  content: string;
  canModify: boolean;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string) => void;
  isEditing: boolean;
  isPending: boolean;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  messageId,
  content,
  canModify,
  onEdit,
  onDelete,
  isEditing,
  isPending,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(content);

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== content) {
      onEdit(messageId, editContent.trim());
    }
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    setEditContent(content);
    setEditMode(false);
  };

  const handleDelete = () => {
    onDelete(messageId);
    setShowDeleteDialog(false);
  };

  if (!canModify) {
    return null;
  }

  if (editMode) {
    return (
      <div className="flex items-center gap-1 mt-2">
        <Input
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="h-7 text-xs"
          maxLength={2000}
          disabled={isPending}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleSaveEdit}
          disabled={isPending || !editContent.trim()}
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleCancelEdit}
          disabled={isPending}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditMode(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The message will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
