import React from 'react';

export interface LinkedListNodeItem {
  val: string | number;
  pointers?: string[];
  state?: 'default' | 'active' | 'cycle' | 'done';
}

export interface LinkedListRow {
  caption?: string;
  nodes: LinkedListNodeItem[];
  cycleToIndex?: number;
  nullTerminated?: boolean;
}

export interface LinkedListData {
  title?: string;
  rows: LinkedListRow[];
}

const NODE_VAL_WIDTH = 42;
const NODE_NEXT_WIDTH = 30;
const NODE_WIDTH = NODE_VAL_WIDTH + NODE_NEXT_WIDTH; // 72
const ARROW_WIDTH = 28;
const STEP_WIDTH = NODE_WIDTH + ARROW_WIDTH; // 100

const STATE_BORDER: Record<NonNullable<LinkedListNodeItem['state']>, string> = {
  default: 'var(--border-medium, rgba(148, 163, 184, 0.35))',
  active: 'var(--accent-cyan, #38bdf8)',
  cycle: '#f59e0b',
  done: '#22c55e',
};

const STATE_BG: Record<NonNullable<LinkedListNodeItem['state']>, string> = {
  default: 'rgba(148, 163, 184, 0.08)',
  active: 'rgba(56, 189, 248, 0.14)',
  cycle: 'rgba(245, 158, 11, 0.14)',
  done: 'rgba(34, 197, 94, 0.14)',
};

const STATE_TEXT: Record<NonNullable<LinkedListNodeItem['state']>, string> = {
  default: 'var(--text-primary)',
  active: 'var(--accent-cyan, #38bdf8)',
  cycle: '#fbbf24',
  done: '#4ade80',
};

/**
 * Renders a reusable linked-list diagram (`{ val, next }` node boxes, pointer badges,
 * `→ null` termination, and optional cycle loop-back arrows) from a `linked-list` fenced block.
 */
export const LinkedListBlock: React.FC<{ data: LinkedListData }> = ({ data }) => {
  return (
    <div
      className="linked-list-block"
      style={{
        margin: '6px 0 8px 0',
        padding: '12px 14px',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-editor, rgba(15, 23, 42, 0.55))',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        overflowX: 'auto',
      }}
    >
      {data.title && (
        <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {data.title}
        </div>
      )}

      {data.rows.map((row, rIdx) => {
        const hasPointers = row.nodes.some((n) => n.pointers && n.pointers.length > 0);
        const hasCycle =
          typeof row.cycleToIndex === 'number' &&
          row.cycleToIndex >= 0 &&
          row.cycleToIndex < row.nodes.length;
        const showNull = !hasCycle && row.nullTerminated !== false;

        const rowWidth = Math.max(row.nodes.length * STEP_WIDTH - ARROW_WIDTH, NODE_WIDTH);
        const startX = (row.nodes.length - 1) * STEP_WIDTH + NODE_VAL_WIDTH + NODE_NEXT_WIDTH / 2;
        const targetX = hasCycle ? (row.cycleToIndex as number) * STEP_WIDTH + NODE_WIDTH / 2 : 0;

        return (
          <div key={rIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {row.caption && (
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {row.caption}
              </div>
            )}

            <div style={{ display: 'inline-flex', flexDirection: 'column', width: 'max-content' }}>
              {hasPointers && (
                <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '3px' }}>
                  {row.nodes.map((node, nIdx) => (
                    <React.Fragment key={nIdx}>
                      <div
                        style={{
                          width: `${NODE_WIDTH}px`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        {node.pointers && node.pointers.length > 0 && (
                          <>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                              {node.pointers.map((ptr) => (
                                <span
                                  key={ptr}
                                  style={{
                                    fontFamily: 'var(--font-mono, monospace)',
                                    fontSize: '10.5px',
                                    fontWeight: 700,
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    backgroundColor: 'rgba(56, 189, 248, 0.18)',
                                    color: 'var(--accent-cyan, #38bdf8)',
                                    border: '1px solid rgba(56, 189, 248, 0.45)',
                                  }}
                                >
                                  {ptr}
                                </span>
                              ))}
                            </div>
                            <span
                              aria-hidden="true"
                              style={{
                                fontSize: '10px',
                                lineHeight: 1,
                                color: 'var(--accent-cyan, #38bdf8)',
                              }}
                            >
                              ↓
                            </span>
                          </>
                        )}
                      </div>
                      {nIdx < row.nodes.length - 1 && <div style={{ width: `${ARROW_WIDTH}px` }} />}
                    </React.Fragment>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center' }}>
                {row.nodes.map((node, nIdx) => {
                  const st = node.state ?? 'default';
                  const borderColor = STATE_BORDER[st];
                  return (
                    <React.Fragment key={nIdx}>
                      <div
                        style={{
                          width: `${NODE_WIDTH}px`,
                          height: '34px',
                          display: 'flex',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          border: `1.5px solid ${borderColor}`,
                          backgroundColor: STATE_BG[st],
                          fontFamily: 'var(--font-mono, monospace)',
                          fontSize: '13px',
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: `${NODE_VAL_WIDTH}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: STATE_TEXT[st],
                            borderRight: `1px solid ${borderColor}`,
                          }}
                        >
                          {node.val}
                        </div>
                        <div
                          title="next pointer"
                          style={{
                            width: `${NODE_NEXT_WIDTH}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: 'var(--text-muted, #94a3b8)',
                          }}
                        >
                          •
                        </div>
                      </div>

                      {nIdx < row.nodes.length - 1 && (
                        <div
                          aria-hidden="true"
                          style={{
                            width: `${ARROW_WIDTH}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-secondary)',
                            fontSize: '14px',
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          →
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}

                {showNull && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                      aria-hidden="true"
                      style={{
                        width: `${ARROW_WIDTH}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted, #94a3b8)',
                        fontSize: '14px',
                      }}
                    >
                      →
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '12px',
                        padding: '3px 7px',
                        borderRadius: '4px',
                        border: '1px dashed var(--border-subtle, rgba(148, 163, 184, 0.3))',
                        color: 'var(--text-muted, #94a3b8)',
                      }}
                    >
                      null
                    </span>
                  </div>
                )}
              </div>

              {hasCycle && (
                <svg
                  width={rowWidth}
                  height={28}
                  viewBox={`0 0 ${rowWidth} 28`}
                  style={{ display: 'block', overflow: 'visible' }}
                  aria-label={`Cycle from node ${row.nodes.length - 1} back to node ${row.cycleToIndex}`}
                >
                  <path
                    d={`M ${startX} 0 L ${startX} 20 L ${targetX} 20 L ${targetX} 4`}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={1.75}
                    strokeLinejoin="round"
                  />
                  <polygon points={`${targetX - 4},8 ${targetX + 4},8 ${targetX},2`} fill="#f59e0b" />
                </svg>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

