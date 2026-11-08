import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MarkdownContent } from './MarkdownContent';

export interface StreamedMarkdownProps {
  text: string;
  isNew?: boolean;
  intervalMs?: number;
  cursorClassName?: string;
  cursorAnimation?: string;
  onScrollToBottom?: () => void;
  onComplete?: () => void;
}

/**
 * Renders Markdown text with an optional typewriter word-streaming reveal effect
 * and a blinking terminal cursor while streaming is in progress.
 */
export const StreamedMarkdown: React.FC<StreamedMarkdownProps> = ({
  text,
  isNew = false,
  intervalMs = 20,
  cursorClassName,
  cursorAnimation = 'followupCursorBlink 0.75s infinite',
  onScrollToBottom,
  onComplete,
}) => {
  const tokens = useMemo(() => {
    return text.match(/(\s+|\S+)/g) || [text];
  }, [text]);

  const [tokenCount, setTokenCount] = useState(() => (isNew ? 1 : tokens.length));
  const [isDone, setIsDone] = useState(!isNew);

  const onCompleteRef = useRef(onComplete);
  const onScrollToBottomRef = useRef(onScrollToBottom);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onScrollToBottomRef.current = onScrollToBottom;
  });

  useEffect(() => {
    if (!isNew) return;

    let current = 1;
    const interval = setInterval(() => {
      current += 2;
      if (current >= tokens.length) {
        setTokenCount(tokens.length);
        setIsDone(true);
        clearInterval(interval);
        onCompleteRef.current?.();
      } else {
        setTokenCount(current);
      }
      onScrollToBottomRef.current?.();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isNew, tokens, intervalMs]);

  const currentText = useMemo(() => {
    if (isDone || !isNew) return text;
    return tokens.slice(0, tokenCount).join('');
  }, [isDone, isNew, text, tokens, tokenCount]);

  return (
    <div style={{ lineHeight: 1.55 }}>
      <MarkdownContent text={currentText} />
      {!isDone && (
        <span
          className={cursorClassName}
          style={{
            display: 'inline-block',
            width: '6px',
            height: '14px',
            backgroundColor: 'var(--accent-cyan)',
            verticalAlign: 'text-bottom',
            marginLeft: '4px',
            animation: cursorAnimation,
          }}
        />
      )}
    </div>
  );
};

