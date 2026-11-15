import React from 'react';

export interface ArrayTraceItem {
  value: string | number;
  index: number;
  state?: 'active' | 'mid' | 'removed' | 'found';
}

export interface ArrayTraceRow {
  caption?: string;
  offset?: number;
  items: ArrayTraceItem[];
}

export interface ArrayTraceData {
  title?: string;
  rows: ArrayTraceRow[];
}

const BOX_WIDTH = 36;
const BOX_GAP = 6;

const STATE_STYLES: Record<NonNullable<ArrayTraceItem['state']>, React.CSSProperties> = {
  active: {
    border: '1px solid var(--border-medium, rgba(148, 163, 184, 0.35))',
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
    color: 'var(--text-primary)',
    fontWeight: 600,
  },
  mid: {
    border: '1.5px solid var(--accent-cyan, #38bdf8)',
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    color: 'var(--accent-cyan, #38bdf8)',
    fontWeight: 700,
  },
  found: {
    border: '1.5px solid #22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
    color: '#4ade80',
    fontWeight: 700,
  },
  removed: {
    border: '1px dashed var(--border-subtle, rgba(148, 163, 184, 0.25))',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    color: 'var(--text-muted, #64748b)',
    opacity: 0.45,
    textDecoration: 'line-through',
  },
};

/**
 * Renders a step-by-step array box visualization from an `array-trace` fenced block.
 */
export const ArrayTraceBlock: React.FC<{ data: ArrayTraceData }> = ({ data }) => {
  return (
    <div
      className="array-trace-block"
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
      {data.rows.map((row, rIdx) => {
        const offsetPx = (row.offset ?? 0) * (BOX_WIDTH + BOX_GAP);
        return (
          <div key={rIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {row.caption && (
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {row.caption}
              </div>
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: `${BOX_GAP}px`,
                paddingLeft: `${offsetPx}px`,
              }}
            >
              {row.items.map((item) => {
                const state = item.state ?? 'active';
                return (
                  <div
                    key={item.index}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '3px',
                      width: `${BOX_WIDTH}px`,
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: `${BOX_WIDTH}px`,
                        height: '30px',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '12.5px',
                        ...STATE_STYLES[state],
                      }}
                    >
                      {item.value}
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '10px',
                        color: state === 'removed' ? 'var(--text-dim, #475569)' : 'var(--text-muted, #94a3b8)',
                        opacity: state === 'removed' ? 0.5 : 1,
                        lineHeight: 1,
                      }}
                    >
                      {item.index}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

