import React from 'react';
import { renderInlineMarkdown, parseParagraphLines, type MarkdownListItem } from '../lib/markdown';
import { ArrayTraceBlock, type ArrayTraceData } from './ArrayTraceBlock';
import { LinkedListBlock, type LinkedListData } from './LinkedListBlock';
import { GridBoardBlock, type GridBoardData } from './GridBoardBlock';
import { DecisionTreeBlock, type DecisionTreeData } from './DecisionTreeBlock';

interface TypeDeclItem {
  kind: 'interface' | 'type';
  name: string;
  code: string;
}

/**
 * Splits a `ts` / `typescript` code block into individual top-level `interface` or `type`
 * declarations when the block contains only type definitions. Returns `null` for regular code.
 */
function parseTypeDefinitionColumns(tsCode: string): TypeDeclItem[] | null {
  const trimmed = tsCode.trim();
  if (!trimmed) return null;

  const chunks: string[] = [];
  let current: string[] = [];
  let depth = 0;

  for (const line of trimmed.split('\n')) {
    const lineTrimmed = line.trim();
    if (
      depth === 0 &&
      current.length > 0 &&
      /^(?:export\s+)?(?:interface|type)\s+[A-Za-z_$]/.test(lineTrimmed)
    ) {
      chunks.push(current.join('\n').trim());
      current = [];
    }
    current.push(line);
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '{' || line[i] === '(') depth++;
      else if (line[i] === '}' || line[i] === ')') depth--;
    }
  }
  if (current.length > 0) chunks.push(current.join('\n').trim());
  if (chunks.length === 0) return null;

  const items: TypeDeclItem[] = [];
  for (const chunk of chunks) {
    const m = chunk.match(/^(?:export\s+)?(interface|type)\s+([A-Za-z0-9_$]+)/);
    if (!m) return null;
    items.push({ kind: m[1] as 'interface' | 'type', name: m[2], code: chunk });
  }
  return items;
}

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
          if (raw.startsWith('array-trace\n')) {
            try {
              const data = JSON.parse(raw.slice('array-trace\n'.length)) as ArrayTraceData;
              if (data && Array.isArray(data.rows)) {
                return <ArrayTraceBlock key={bIdx} data={data} />;
              }
            } catch {
              // Fall back to regular code block if JSON is invalid
            }
          }
          if (raw.startsWith('linked-list\n')) {
            try {
              const data = JSON.parse(raw.slice('linked-list\n'.length)) as LinkedListData;
              if (data && Array.isArray(data.rows)) {
                return <LinkedListBlock key={bIdx} data={data} />;
              }
            } catch {
              // Fall back to regular code block if JSON is invalid
            }
          }
          if (raw.startsWith('grid-board\n')) {
            try {
              const data = JSON.parse(raw.slice('grid-board\n'.length)) as GridBoardData;
              if (data && Array.isArray(data.boards)) {
                return <GridBoardBlock key={bIdx} data={data} />;
              }
            } catch {
              // Fall back to regular code block if JSON is invalid
            }
          }
          if (raw.startsWith('decision-tree\n')) {
            try {
              const data = JSON.parse(raw.slice('decision-tree\n'.length)) as DecisionTreeData;
              if (data && data.root) {
                return <DecisionTreeBlock key={bIdx} data={data} />;
              }
            } catch {
              // Fall back to regular code block if JSON is invalid
            }
          }
          // Strip leading language tag if present (e.g. ```javascript\n)
          const langMatch = raw.match(/^([a-zA-Z0-9_-]+)\n/);
          const lang = langMatch?.[1]?.toLowerCase() ?? '';
          const code = langMatch ? raw.slice(langMatch[0].length) : raw;
          if (lang === 'ts' || lang === 'typescript') {
            const typeDecls = parseTypeDefinitionColumns(code);
            if (typeDecls) {
              return (
                <div
                  key={bIdx}
                  className="ts-type-columns"
                  style={{
                    margin: '6px 0',
                    display: 'grid',
                    gridTemplateColumns:
                      typeDecls.length > 1 ? 'repeat(auto-fit, minmax(220px, 1fr))' : '1fr',
                    gap: '10px',
                    alignItems: 'stretch',
                  }}
                >
                  {typeDecls.map((decl, dIdx) => (
                    <div
                      key={dIdx}
                      className="ts-type-column-card"
                      style={{
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-editor, rgba(15, 23, 42, 0.9))',
                        border: '1px solid var(--border-subtle, rgba(56, 189, 248, 0.22))',
                        borderTop: '2px solid var(--accent-cyan, #38bdf8)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div
                        style={{
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 600,
                          color: 'var(--accent-cyan, #38bdf8)',
                          backgroundColor: 'rgba(56, 189, 248, 0.08)',
                          borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                        }}
                      >
                        {decl.kind} {decl.name}
                      </div>
                      <pre
                        style={{
                          margin: 0,
                          padding: '10px 12px',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontSize: '12.5px',
                          overflowX: 'auto',
                          color: 'var(--text-primary)',
                          lineHeight: 1.5,
                        }}
                      >
                        <code>{decl.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              );
            }
          }
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

              if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
                return (
                  <hr
                    key={pIdx}
                    style={{
                      border: 'none',
                      borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                      margin: '10px 0 4px 0',
                    }}
                  />
                );
              }

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
                        margin: gIdx === 0 ? '0 0 2px 0' : '18px 0 2px 0',
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
                        const prevWasHeading = gIdx > 0 && groups[gIdx - 1].type === 'heading';
                        const showDivider = !(bIdx === 0 && pIdx === 0 && gIdx === 0) && !prevWasHeading;
                        return (
                          <React.Fragment key={gIdx}>
                            {showDivider && (
                              <hr
                                style={{
                                  border: 'none',
                                  borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                                  margin: '12px 0 6px 0',
                                }}
                              />
                            )}
                            <h4
                              style={{
                                ...headingStyles,
                                fontSize: '15px',
                                fontWeight: 700,
                                borderLeft: '3px solid var(--accent-cyan, #38bdf8)',
                                paddingLeft: '10px',
                              }}
                            >
                              {renderInlineMarkdown(group.text)}
                            </h4>
                          </React.Fragment>
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

                    if (group.type === 'table') {
                      return (
                        <div
                          key={gIdx}
                          className="markdown-table-wrapper"
                          style={{
                            overflowX: 'auto',
                            margin: '8px 0',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                          }}
                        >
                          <table
                            className="markdown-table"
                            style={{
                              width: '100%',
                              borderCollapse: 'collapse',
                              fontSize: '12px',
                              lineHeight: 1.5,
                              textAlign: 'left',
                            }}
                          >
                            <thead>
                              <tr
                                style={{
                                  background: 'var(--bg-surface-elevated, rgba(255, 255, 255, 0.05))',
                                  borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.15))',
                                }}
                              >
                                {group.headers.map((h, hIdx) => (
                                  <th
                                    key={hIdx}
                                    style={{
                                      padding: '8px 12px',
                                      fontWeight: 600,
                                      color: 'var(--text-primary)',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {renderInlineMarkdown(h)}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {group.rows.map((row, rIdx) => (
                                <tr
                                  key={rIdx}
                                  style={{
                                    borderBottom:
                                      rIdx < group.rows.length - 1
                                        ? '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))'
                                        : 'none',
                                    background: rIdx % 2 === 1 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                                  }}
                                >
                                  {row.map((cell, cIdx) => (
                                    <td
                                      key={cIdx}
                                      style={{
                                        padding: '8px 12px',
                                        verticalAlign: 'top',
                                        color: 'var(--text-primary)',
                                      }}
                                    >
                                      {renderInlineMarkdown(cell)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }

                    if (group.type === 'blockquote') {
                      const alertColors: Record<string, { border: string; bg: string }> = {
                        note: { border: 'var(--accent)', bg: 'rgba(56, 189, 248, 0.08)' },
                        tip: { border: 'var(--accent-emerald)', bg: 'rgba(16, 185, 129, 0.08)' },
                        important: { border: 'var(--accent-purple)', bg: 'rgba(168, 85, 247, 0.08)' },
                        warning: { border: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.08)' },
                        caution: { border: 'var(--accent-danger)', bg: 'rgba(239, 68, 68, 0.08)' },
                      };

                      const styleConfig = group.alertType
                        ? alertColors[group.alertType] ?? alertColors.note
                        : { border: 'var(--accent)', bg: 'rgba(56, 189, 248, 0.06)' };

                      return (
                        <div
                          key={gIdx}
                          className={`markdown-blockquote ${group.alertType ? `markdown-alert markdown-alert-${group.alertType}` : ''}`}
                          style={{
                            margin: '6px 0',
                            padding: '8px 12px',
                            borderLeft: `3px solid ${styleConfig.border}`,
                            backgroundColor: styleConfig.bg,
                            borderRadius: '0 6px 6px 0',
                            fontSize: '13px',
                            lineHeight: 1.55,
                          }}
                        >
                          {group.alertTitle && (
                            <div
                              style={{
                                fontWeight: 600,
                                color: styleConfig.border,
                                marginBottom: group.lines.length > 0 ? '4px' : '0',
                                fontSize: '13px',
                              }}
                            >
                              {group.alertTitle}
                            </div>
                          )}
                          {group.lines.map((bLine, lIdx) => (
                            <div key={lIdx} style={{ color: 'var(--text-primary)' }}>
                              {renderInlineMarkdown(bLine)}
                            </div>
                          ))}
                        </div>
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
