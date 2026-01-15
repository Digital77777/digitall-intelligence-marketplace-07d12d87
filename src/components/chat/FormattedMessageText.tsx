import React, { useMemo, memo } from 'react';

interface FormattedMessageTextProps {
  content: string;
  className?: string;
}

/**
 * Renders message text with WhatsApp-style formatting:
 * - *bold* → bold text
 * - _italic_ → italic text  
 * - ~strikethrough~ → strikethrough text
 * - ```code``` → monospace code
 * - Preserves paragraph breaks (double newlines)
 * - Links are clickable
 */
export const FormattedMessageText = memo(({ content, className = '' }: FormattedMessageTextProps) => {
  const formattedContent = useMemo(() => {
    if (!content) return null;

    // Split content into paragraphs (double newlines or more)
    const paragraphs = content.split(/\n\n+/);

    return paragraphs.map((paragraph, pIndex) => {
      // Split paragraph by single newlines for line breaks within paragraph
      const lines = paragraph.split('\n');
      
      const formattedParagraph = lines.map((line, lIndex) => {
        const formattedLine = formatLine(line);
        return (
          <React.Fragment key={`line-${pIndex}-${lIndex}`}>
            {formattedLine}
            {lIndex < lines.length - 1 && <br />}
          </React.Fragment>
        );
      });

      return (
        <p key={`p-${pIndex}`} className={pIndex > 0 ? 'mt-3' : ''}>
          {formattedParagraph}
        </p>
      );
    });
  }, [content]);

  return <div className={`text-sm whitespace-pre-wrap break-words ${className}`}>{formattedContent}</div>;
});

FormattedMessageText.displayName = 'FormattedMessageText';

/**
 * Format a single line of text with WhatsApp-style markers
 */
function formatLine(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // Combined regex for all formatting patterns
  // Order matters: longer patterns first, then check for URLs, then formatting
  const patterns = [
    // Code blocks ```code```
    { regex: /```([^`]+)```/g, render: (match: string, content: string, key: string) => (
      <code key={key} className="bg-muted/50 px-1.5 py-0.5 rounded text-xs font-mono">
        {content}
      </code>
    )},
    // Bold *text*
    { regex: /\*([^*]+)\*/g, render: (match: string, content: string, key: string) => (
      <strong key={key} className="font-bold">
        {content}
      </strong>
    )},
    // Italic _text_
    { regex: /_([^_]+)_/g, render: (match: string, content: string, key: string) => (
      <em key={key} className="italic">
        {content}
      </em>
    )},
    // Strikethrough ~text~
    { regex: /~([^~]+)~/g, render: (match: string, content: string, key: string) => (
      <span key={key} className="line-through">
        {content}
      </span>
    )},
    // URLs
    { regex: /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g, render: (match: string, content: string, key: string) => (
      <a
        key={key}
        href={match}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-primary hover:underline font-medium break-all"
      >
        {match}
      </a>
    )},
  ];

  // Find all matches with their positions
  interface MatchInfo {
    start: number;
    end: number;
    fullMatch: string;
    content: string;
    patternIndex: number;
  }
  
  const allMatches: MatchInfo[] = [];
  
  patterns.forEach((pattern, patternIndex) => {
    const regex = new RegExp(pattern.regex.source, 'g');
    let match;
    while ((match = regex.exec(text)) !== null) {
      allMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        fullMatch: match[0],
        content: match[1] || match[0],
        patternIndex,
      });
    }
  });

  // Sort by position and remove overlapping matches (keep first)
  allMatches.sort((a, b) => a.start - b.start);
  
  const nonOverlappingMatches: MatchInfo[] = [];
  let lastEnd = 0;
  
  for (const match of allMatches) {
    if (match.start >= lastEnd) {
      nonOverlappingMatches.push(match);
      lastEnd = match.end;
    }
  }

  // Build result
  for (const match of nonOverlappingMatches) {
    // Add text before this match
    if (match.start > lastIndex) {
      parts.push(text.substring(lastIndex, match.start));
    }
    
    // Add the formatted match
    const pattern = patterns[match.patternIndex];
    parts.push(pattern.render(match.fullMatch, match.content, `match-${match.start}`));
    
    lastIndex = match.end;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export default FormattedMessageText;
