import React, { memo, useMemo } from "react";

interface RichTextRendererProps {
  content: string;
  className?: string;
  truncate?: number;
}

// Regex patterns for links and hashtags
const URL_REGEX = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
const HASHTAG_REGEX = /#(\w+)/g;

export const RichTextRenderer = memo(({ content, className = "", truncate }: RichTextRendererProps) => {
  const renderedContent = useMemo(() => {
    let textToRender = content;
    
    // Truncate if needed
    if (truncate && content.length > truncate) {
      textToRender = content.substring(0, truncate) + "...";
    }
    
    // Split content by URLs and hashtags
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Combined regex for both URLs and hashtags
    const combinedRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])|(#\w+)/g;
    
    let match;
    while ((match = combinedRegex.exec(textToRender)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(textToRender.substring(lastIndex, match.index));
      }
      
      const matchedText = match[0];
      
      if (matchedText.startsWith('http')) {
        // It's a URL
        parts.push(
          <a
            key={`link-${match.index}`}
            href={matchedText}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-primary hover:underline font-medium break-all"
          >
            {matchedText}
          </a>
        );
      } else if (matchedText.startsWith('#')) {
        // It's a hashtag
        parts.push(
          <span
            key={`hashtag-${match.index}`}
            className="text-primary font-medium cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              // Could navigate to hashtag search in the future
            }}
          >
            {matchedText}
          </span>
        );
      }
      
      lastIndex = match.index + matchedText.length;
    }
    
    // Add remaining text
    if (lastIndex < textToRender.length) {
      parts.push(textToRender.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : textToRender;
  }, [content, truncate]);

  return <span className={className}>{renderedContent}</span>;
});

RichTextRenderer.displayName = "RichTextRenderer";
