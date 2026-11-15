import React from 'react';

export interface GridHighlight {
  row: number;
  col: number;
  state?: 'path' | 'start' | 'end' | 'blocked' | 'queen';
  step?: string | number;
}

export interface GridBoardItem {
  caption?: string;
  grid: (string | number)[][];
  highlights?: GridHighlight[];
}

export interface GridBoardData {
  title?: string;
  boards: GridBoardItem[];
}

const CELL_STYLES: Record<NonNullable<GridHighlight['state']> | 'default', React.CSSProperties> = {
  default: {
    border: '1px solid var(--border-medium, rgba(148, 163, 184, 0.3))',
    backgroundColor: 'rgba(148, 163, 184, 0.06)',
    color: 'var(--text-primary)',
    fontWeight: 600,
  },
  path: {
    border: '1.5px solid var(--accent-cyan, #38bdf8)',
    backgroundColor: 'rgba(56, 189, 248, 0.16)',
    color: 'var(--accent-cyan, #38bdf8)',
    fontWeight: 700,
  },
  start: {
    border: '1.5px solid #22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
    color: '#4ade80',
    fontWeight: 700,
  },
  end: {
    border: '1.5px solid #a855f7',
    backgroundColor: 'rgba(168, 85, 247, 0.18)',
    color: '#c084fc',
    fontWeight: 700,
  },
  queen: {
    border: '1.5px solid #f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
    color: '#fbbf24',
    fontWeight: 700,
  },
  blocked: {
    border: '1px dashed var(--border-subtle, rgba(148, 163, 184, 0.25))',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    color: 'var(--text-muted, #64748b)',
    opacity: 0.5,
  },
};

/**
 * Renders one or more 2D grid boards with highlighted cells and optional step badges
 * from a `grid-board` fenced markdown block.
 */
export const GridBoardBlock: React.FC<{ data: GridBoardData }> = ({ data }) => {
  return (
    <div
      className="grid-board-block"
      style={{
        margin: '6px 0 8px 0',
        padding: '12px 14px',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-editor, rgba(15, 23, 42, 0.55))',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        overflowX: 'auto',
      }}
    >
      {data.title && (
        <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {data.title}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'flex-start' }}>
        {data.boards.map((board, bIdx) => {
          const highlightMap = new Map<string, GridHighlight>();
          for (const h of board.highlights ?? []) {
            highlightMap.set(`${h.row},${h.col}`, h);
          }

          return (
            <div key={bIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {board.caption && (
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {board.caption}
                </div>
              )}

              <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px', width: 'max-content' }}>
                {board.grid.map((rowVals, rIdx) => (
                  <div key={rIdx} style={{ display: 'flex', gap: '4px' }}>
                    {rowVals.map((cell, cIdx) => {
                      const hl = highlightMap.get(`${rIdx},${cIdx}`);
                      const cellStyle = CELL_STYLES[hl?.state ?? 'default'];
                      return (
                        <div
                          key={cIdx}
                          style={{
                            position: 'relative',
                            width: '36px',
                            height: '36px',
                            borderRadius: '5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-mono, monospace)',
                            fontSize: '13.5px',
                            flexShrink: 0,
                            ...cellStyle,
                          }}
                        >
                          {cell}
                          {hl?.step !== undefined && (
                            <span
                              style={{
                                position: 'absolute',
                                top: '1px',
                                right: '3px',
                                fontSize: '9px',
                                fontWeight: 700,
                                opacity: 0.85,
                                lineHeight: 1,
                              }}
                            >
                              {hl.step}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

