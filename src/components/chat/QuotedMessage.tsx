import React from 'react';
import { FormattedMessageText } from './FormattedMessageText';

interface QuotedMessageProps {
  content: string;
  senderName?: string;
  isCurrentUserSender: boolean;
  isSentByMe: boolean;
}

export const QuotedMessage: React.FC<QuotedMessageProps> = ({
  content,
  senderName,
  isCurrentUserSender,
  isSentByMe,
}) => {
  // Truncate content for preview
  const truncatedContent = content.length > 100 ? content.substring(0, 100) + '...' : content;
  
  return (
    <div
      className={`mb-2 px-2 py-1 rounded border-l-2 ${
        isSentByMe
          ? 'bg-primary-foreground/10 border-primary-foreground/50'
          : 'bg-muted/50 border-primary/50'
      }`}
    >
      <p className={`text-xs font-medium ${isSentByMe ? 'text-primary-foreground/80' : 'text-primary/80'}`}>
        {isCurrentUserSender ? 'You' : senderName || 'User'}
      </p>
      <div className={`text-xs truncate ${isSentByMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
        <FormattedMessageText content={truncatedContent} className="text-xs" />
      </div>
    </div>
  );
};
