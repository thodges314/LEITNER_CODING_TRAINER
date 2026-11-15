import React from 'react';

export interface DecisionTreeNode {
  label: string;
  edgeLabel?: string;
  state?: 'root' | 'branch' | 'solution' | 'deadend';
  children?: DecisionTreeNode[];
}

export interface DecisionTreeStep {
  label: string;
  detail: string;
}

export interface DecisionTreeData {
  title?: string;
  caption?: string;
  root: DecisionTreeNode;
  steps?: DecisionTreeStep[];
}

interface PositionedNode {
  node: DecisionTreeNode;
  x: number;
  y: number;
  parentX?: number;
  parentY?: number;
}

const SLOT_WIDTH = 86;
const LEVEL_HEIGHT = 68;
const NODE_W = 54;
const NODE_H = 28;
const PAD_X = 16;
const PAD_Y = 14;

const NODE_COLORS: Record<
  NonNullable<DecisionTreeNode['state']>,
  { fill: string; stroke: string; text: string; dash?: string }
> = {
  root: {
    fill: 'rgba(148, 163, 184, 0.14)',
    stroke: 'rgba(148, 163, 184, 0.5)',
    text: '#e2e8f0',
  },
  branch: {
    fill: 'rgba(56, 189, 248, 0.15)',
    stroke: '#38bdf8',
    text: '#7dd3fc',
  },
  solution: {
    fill: 'rgba(34, 197, 94, 0.18)',
    stroke: '#22c55e',
    text: '#86efac',
  },
  deadend: {
    fill: 'rgba(245, 158, 11, 0.12)',
    stroke: '#f59e0b',
    text: '#fcd34d',
    dash: '4 3',
  },
};

function layoutTree(root: DecisionTreeNode): {
  nodes: PositionedNode[];
  width: number;
  height: number;
} {
  let nextSlot = 0;
  let maxDepth = 0;
  const nodes: PositionedNode[] = [];

  const place = (
    node: DecisionTreeNode,
    depth: number,
    parent?: { x: number; y: number }
  ): { x: number; y: number } => {
    maxDepth = Math.max(maxDepth, depth);
    const y = PAD_Y + depth * LEVEL_HEIGHT + NODE_H / 2;
    let x: number;

    if (!node.children || node.children.length === 0) {
      x = PAD_X + nextSlot * SLOT_WIDTH + SLOT_WIDTH / 2;
      nextSlot++;
    } else {
      const childCoords = node.children.map((child) => place(child, depth + 1, undefined));
      x = (childCoords[0].x + childCoords[childCoords.length - 1].x) / 2;
      // Record parent coordinates for each child after parent x is known
      for (let i = 0; i < node.children.length; i++) {
        const target = nodes.find(
          (p) => p.node === node.children![i] && p.x === childCoords[i].x && p.y === childCoords[i].y
        );
        if (target) {
          target.parentX = x;
          target.parentY = y;
        }
      }
    }

    nodes.push({ node, x, y, parentX: parent?.x, parentY: parent?.y });
    return { x, y };
  };

  place(root, 0);
  const width = Math.max(nextSlot * SLOT_WIDTH + PAD_X * 2, NODE_W + PAD_X * 2);
  const height = PAD_Y * 2 + maxDepth * LEVEL_HEIGHT + NODE_H;
  return { nodes, width, height };
}

/**
 * Renders a compact decision-tree SVG diagram (for backtracking / recursion walkthroughs)
 * from a `decision-tree` fenced markdown block.
 */
export const DecisionTreeBlock: React.FC<{ data: DecisionTreeData }> = ({ data }) => {
  const { nodes, width, height } = layoutTree(data.root);

  return (
    <div
      className="decision-tree-block"
      style={{
        margin: '6px 0 8px 0',
        padding: '12px 14px',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-editor, rgba(15, 23, 42, 0.55))',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        overflowX: 'auto',
      }}
    >
      {data.title && (
        <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {data.title}
        </div>
      )}
      {data.caption && (
        <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          {data.caption}
        </div>
      )}

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
        role="img"
        aria-label={data.title || 'Backtracking decision tree'}
      >
        {nodes.map((item, idx) => {
          if (item.parentX === undefined || item.parentY === undefined) return null;
          const x1 = item.parentX;
          const y1 = item.parentY + NODE_H / 2;
          const x2 = item.x;
          const y2 = item.y - NODE_H / 2;
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;

          return (
            <g key={`edge-${idx}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(148, 163, 184, 0.45)"
                strokeWidth={1.5}
              />
              {item.node.edgeLabel && (
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x={-16}
                    y={-9}
                    width={32}
                    height={16}
                    rx={4}
                    fill="#0f172a"
                    stroke="rgba(148, 163, 184, 0.3)"
                    strokeWidth={1}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    y={-1}
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="var(--font-mono, monospace)"
                    fontWeight={600}
                  >
                    {item.node.edgeLabel}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {nodes.map((item, idx) => {
          const style = NODE_COLORS[item.node.state ?? 'branch'];
          return (
            <g key={`node-${idx}`} transform={`translate(${item.x}, ${item.y})`}>
              <rect
                x={-NODE_W / 2}
                y={-NODE_H / 2}
                width={NODE_W}
                height={NODE_H}
                rx={6}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={1.5}
                strokeDasharray={style.dash}
              />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fill={style.text}
                fontSize="12"
                fontFamily="var(--font-mono, monospace)"
                fontWeight={700}
              >
                {item.node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {data.steps && data.steps.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '8px',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          }}
        >
          {data.steps.map((step, sIdx) => (
            <div
              key={sIdx}
              style={{
                padding: '7px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(148, 163, 184, 0.06)',
                border: '1px solid rgba(148, 163, 184, 0.16)',
                fontSize: '12px',
                lineHeight: 1.4,
                color: 'var(--text-secondary)',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--accent-cyan, #38bdf8)', marginBottom: '2px' }}>
                {sIdx + 1}. {step.label}
              </div>
              <div>{step.detail}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

