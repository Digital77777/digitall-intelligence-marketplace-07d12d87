import React from 'react';
import { X, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReplyPreviewProps {
  replyToMessage: {
    id: string;
    content: string;
    sender_id: string;
  };
  senderName?: string;
  isCurrentUser: boolean;
  onCancel: () => void;
}

export const ReplyPreview: React.FC<ReplyPreviewProps> = ({
  replyToMessage,
  senderName,
  isCurrentUser,
  onCancel,
}) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-l-2 border-primary">
      <Reply className="h-4 w-4 text-muted-foreground rotate-180" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-primary">
          Replying to {isCurrentUser ? 'yourself' : senderName || 'user'}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {replyToMessage.content}
        </p>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCancel}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
