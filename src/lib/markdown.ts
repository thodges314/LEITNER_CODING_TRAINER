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

export interface MarkdownListItem {
  text: string;
  children?: MarkdownListItem[];
}

export type LineGroup =
  | { type: 'heading'; level: number; text: string }
  | { type: 'ul'; items: MarkdownListItem[] }
  | { type: 'ol'; items: MarkdownListItem[] }
  | { type: 'text'; lines: string[] };

export const parseParagraphLines = (para: string): LineGroup[] => {
  const lines = para.split('\n');
  const groups: LineGroup[] = [];

  let ulStack: { indent: number; item: MarkdownListItem }[] = [];
  let olStack: { indent: number; item: MarkdownListItem }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Heading (#, ##, ###, ####, #####, ######)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      ulStack = [];
      olStack = [];
      groups.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
      continue;
    }

    // Bullet item (- or *)
    const bulletMatch = line.match(/^([ \t]*)[-*]\s+(.*)$/);
    if (bulletMatch) {
      const indent = bulletMatch[1].replace(/\t/g, '  ').length;
      const text = bulletMatch[2];
      const newItem: MarkdownListItem = { text };

      const lastGroup = groups[groups.length - 1];

      // Check if this bullet is a child of an active ordered list item
      if (lastGroup && lastGroup.type === 'ol' && olStack.length > 0 && indent > olStack[olStack.length - 1].indent) {
        while (ulStack.length > 0 && ulStack[ulStack.length - 1].indent >= indent) {
          ulStack.pop();
        }
        if (ulStack.length === 0) {
          const parent = olStack[olStack.length - 1].item;
          if (!parent.children) parent.children = [];
          parent.children.push(newItem);
        } else {
          const parent = ulStack[ulStack.length - 1].item;
          if (!parent.children) parent.children = [];
          parent.children.push(newItem);
        }
        ulStack.push({ indent, item: newItem });
        continue;
      }

      olStack = [];

      if (!lastGroup || lastGroup.type !== 'ul') {
        groups.push({ type: 'ul', items: [newItem] });
        ulStack = [{ indent, item: newItem }];
      } else {
        while (ulStack.length > 0 && ulStack[ulStack.length - 1].indent >= indent) {
          ulStack.pop();
        }

        if (ulStack.length === 0) {
          lastGroup.items.push(newItem);
          ulStack = [{ indent, item: newItem }];
        } else {
          const parent = ulStack[ulStack.length - 1].item;
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(newItem);
          ulStack.push({ indent, item: newItem });
        }
      }
      continue;
    }

    // Numbered item (1. 2. etc.)
    const numberMatch = line.match(/^([ \t]*)\d+\.\s+(.*)$/);
    if (numberMatch) {
      ulStack = [];
      const indent = numberMatch[1].replace(/\t/g, '  ').length;
      const text = numberMatch[2];
      const newItem: MarkdownListItem = { text };

      const lastGroup = groups[groups.length - 1];
      if (!lastGroup || lastGroup.type !== 'ol') {
        groups.push({ type: 'ol', items: [newItem] });
        olStack = [{ indent, item: newItem }];
      } else {
        while (olStack.length > 0 && olStack[olStack.length - 1].indent >= indent) {
          olStack.pop();
        }

        if (olStack.length === 0) {
          lastGroup.items.push(newItem);
          olStack = [{ indent, item: newItem }];
        } else {
          const parent = olStack[olStack.length - 1].item;
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(newItem);
          olStack.push({ indent, item: newItem });
        }
      }
      continue;
    }

    // Normal text line
    ulStack = [];
    olStack = [];
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.type === 'text') {
      lastGroup.lines.push(line);
    } else {
      groups.push({ type: 'text', lines: [line] });
    }
  }

  return groups;
};
