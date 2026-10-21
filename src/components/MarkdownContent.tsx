import React from 'react';
import { renderInlineMarkdown, parseParagraphLines } from '../lib/markdown';

export interface MarkdownContentProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

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
                      return (
                        <h4
                          key={gIdx}
                          style={{ ...headingStyles, fontSize: '14px' }}
                        >
                          {renderInlineMarkdown(group.text)}
                        </h4>
                      );
                    }

                    if (group.type === 'ul') {
                      return (
                        <ul
                          key={gIdx}
                          style={{
                            margin: '2px 0',
                            paddingLeft: '22px',
                            listStyleType: 'disc',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          }}
                        >
                          {group.items.map((item, iIdx) => (
                            <li key={iIdx} style={{ lineHeight: 1.55 }}>
                              {renderInlineMarkdown(item)}
                            </li>
                          ))}
                        </ul>
                      );
                    }

                    if (group.type === 'ol') {
                      return (
                        <ol
                          key={gIdx}
                          style={{
                            margin: '2px 0',
                            paddingLeft: '22px',
                            listStyleType: 'decimal',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          }}
                        >
                          {group.items.map((item, iIdx) => (
                            <li key={iIdx} style={{ lineHeight: 1.55 }}>
                              {renderInlineMarkdown(item)}
                            </li>
                          ))}
                        </ol>
                      );
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
