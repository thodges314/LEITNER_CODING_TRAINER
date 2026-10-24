import React from 'react';
import { renderInlineMarkdown, parseParagraphLines, type MarkdownListItem } from '../lib/markdown';

export interface MarkdownContentProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

const renderUnorderedList = (
  items: MarkdownListItem[],
  depth = 0,
  key?: React.Key
): React.ReactElement => {
  const listStyleType = depth === 0 ? 'disc' : depth === 1 ? 'circle' : 'square';
  return (
    <ul
      key={key}
      style={{
        margin: depth === 0 ? '2px 0' : '4px 0 2px 0',
        paddingLeft: depth === 0 ? '22px' : '20px',
        listStyleType,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      {items.map((rawItem, iIdx) => {
        const item = typeof rawItem === 'string' ? { text: rawItem } : rawItem;
        return (
          <li key={iIdx} style={{ lineHeight: 1.55 }}>
            {renderInlineMarkdown(item.text)}
            {item.children && item.children.length > 0 && renderUnorderedList(item.children, depth + 1)}
          </li>
        );
      })}
    </ul>
  );
};

const renderOrderedList = (
  items: MarkdownListItem[],
  depth = 0,
  key?: React.Key
): React.ReactElement => {
  const listStyleType = depth === 0 ? 'decimal' : depth === 1 ? 'lower-alpha' : 'lower-roman';
  return (
    <ol
      key={key}
      style={{
        margin: depth === 0 ? '2px 0' : '4px 0 2px 0',
        paddingLeft: depth === 0 ? '22px' : '20px',
        listStyleType,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      {items.map((rawItem, iIdx) => {
        const item = typeof rawItem === 'string' ? { text: rawItem } : rawItem;
        return (
          <li key={iIdx} style={{ lineHeight: 1.55 }}>
            {renderInlineMarkdown(item.text)}
            {item.children && item.children.length > 0 && renderUnorderedList(item.children, depth + 1)}
          </li>
        );
      })}
    </ol>
  );
};

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  text,
  className,
  style,
}) => {
  if (!text) return null;

  // 1. Separate code blocks (```...```) from markdown prose
  const blocks = text.split(/(```[\s\S]*?```)/g);

  return (
    <div
      className={className ? `markdown-content ${className}` : 'markdown-content'}
      style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }}
    >
      {blocks.map((block, bIdx) => {
        if (!block) return null;

        if (block.startsWith('```') && block.endsWith('```')) {
          const raw = block.slice(3, -3);
          // Strip leading language tag if present (e.g. ```javascript\n)
          const code = raw.replace(/^[a-zA-Z0-9_-]+\n/, '');
          return (
            <pre
              key={bIdx}
              className="markdown-code-block"
              style={{
                margin: '6px 0',
                padding: '10px 14px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-editor, rgba(15, 23, 42, 0.9))',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '13px',
                overflowX: 'auto',
                color: 'var(--text-primary)',
                lineHeight: 1.5,
              }}
            >
              <code>{code}</code>
            </pre>
          );
        }

        // Split regular text into paragraphs by blank lines (\n\n)
        const paragraphs = block.split(/\n{2,}/);

        return (
          <React.Fragment key={bIdx}>
            {paragraphs.map((para, pIdx) => {
              const trimmed = para.trim();
              if (!trimmed) return null;

              const groups = parseParagraphLines(trimmed);

              return (
                <div
                  key={pIdx}
                  style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
                >
                  {groups.map((group, gIdx) => {
                    if (group.type === 'heading') {
                      const headingStyles = {
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        margin: '4px 0 2px 0',
                        lineHeight: 1.3,
                      };
                      if (group.level === 1) {
                        return (
                          <h2
                            key={gIdx}
                            style={{ ...headingStyles, fontSize: '17px' }}
                          >
                            {renderInlineMarkdown(group.text)}
                          </h2>
                        );
                      }
                      if (group.level === 2) {
                        return (
                          <h3
                            key={gIdx}
                            style={{ ...headingStyles, fontSize: '15px' }}
                          >
                            {renderInlineMarkdown(group.text)}
                          </h3>
                        );
                      }
                      if (group.level === 3) {
                        return (
                          <h4
                            key={gIdx}
                            style={{ ...headingStyles, fontSize: '14px' }}
                          >
                            {renderInlineMarkdown(group.text)}
                          </h4>
                        );
                      }
                      if (group.level === 4) {
                        return (
                          <h5
                            key={gIdx}
                            style={{ ...headingStyles, fontSize: '13px' }}
                          >
                            {renderInlineMarkdown(group.text)}
                          </h5>
                        );
                      }
                      return (
                        <h6
                          key={gIdx}
                          style={{ ...headingStyles, fontSize: '12px' }}
                        >
                          {renderInlineMarkdown(group.text)}
                        </h6>
                      );
                    }

                    if (group.type === 'ul') {
                      return renderUnorderedList(group.items, 0, gIdx);
                    }

                    if (group.type === 'ol') {
                      return renderOrderedList(group.items, 0, gIdx);
                    }

                    return (
                      <div key={gIdx} style={{ lineHeight: 1.62 }}>
                        {group.lines.map((line, lIdx) => (
                          <React.Fragment key={lIdx}>
                            {lIdx > 0 && <br />}
                            {renderInlineMarkdown(line)}
                          </React.Fragment>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};
