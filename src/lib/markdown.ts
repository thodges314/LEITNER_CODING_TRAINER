import React from 'react';

export const renderInlineMarkdown = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  // Match `inline code`, **bold**, *italic*, _italic_
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        React.createElement(
          'code',
          {
            key: match.index,
            className: 'markdown-inline-code',
            style: {
              fontFamily: 'var(--font-mono, monospace)',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: 'var(--accent, #38bdf8)',
              padding: '1px 5px',
              borderRadius: '4px',
              fontSize: '0.9em',
              wordBreak: 'break-word',
            },
          },
          token.slice(1, -1)
        )
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        React.createElement(
          'strong',
          {
            key: match.index,
            style: { fontWeight: 600, color: 'var(--text-primary)' },
          },
          token.slice(2, -2)
        )
      );
    } else if (
      (token.startsWith('*') && token.endsWith('*')) ||
      (token.startsWith('_') && token.endsWith('_'))
    ) {
      parts.push(
        React.createElement(
          'em',
          {
            key: match.index,
            style: { fontStyle: 'italic', color: 'var(--text-primary)' },
          },
          token.slice(1, -1)
        )
      );
    }
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }

  return parts;
};

export type LineGroup =
  | { type: 'heading'; level: number; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'text'; lines: string[] };

export const parseParagraphLines = (para: string): LineGroup[] => {
  const lines = para.split('\n');
  const groups: LineGroup[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Heading (#, ##, ###)
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      groups.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
      continue;
    }

    // Bullet item (- or *)
    const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.type === 'ul') {
        lastGroup.items.push(bulletMatch[1]);
      } else {
        groups.push({ type: 'ul', items: [bulletMatch[1]] });
      }
      continue;
    }

    // Numbered item (1. 2. etc.)
    const numberMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (numberMatch) {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.type === 'ol') {
        lastGroup.items.push(numberMatch[1]);
      } else {
        groups.push({ type: 'ol', items: [numberMatch[1]] });
      }
      continue;
    }

    // Normal text line
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.type === 'text') {
      lastGroup.lines.push(line);
    } else {
      groups.push({ type: 'text', lines: [line] });
    }
  }

  return groups;
};
