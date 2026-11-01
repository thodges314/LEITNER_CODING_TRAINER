const DEFAULT_DATA = [
  { label: 'Mon', value: 18 },
  { label: 'Tue', value: 42 },
  { label: 'Wed', value: 31 },
  { label: 'Thu', value: 65 },
  { label: 'Fri', value: 50 },
  { label: 'Sat', value: 24 },
  { label: 'Sun', value: 38 },
];

function Demo() {
  const { width = 420, height = 200 } = usePreviewProps({
    width: 420,
    height: 200,
  });

  return (
    <div style={{ padding: '24px', maxWidth: '540px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        .chart-dashboard {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 20px;
          color: #f8fafc;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        }
        .chart-controls {
          display: flex;
          gap: 8px;
          margin-bottom: 14px;
        }
        .chart-controls button {
          background: #334155;
          border: 1px solid #475569;
          color: #f1f5f9;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .chart-controls button:hover {
          background: #475569;
          border-color: #64748b;
        }
        .chart-controls button[data-action="highlight-max"] {
          background: rgba(56, 189, 248, 0.15);
          border-color: #0284c7;
          color: #38bdf8;
        }
        .chart-controls button[data-action="highlight-max"]:hover {
          background: rgba(56, 189, 248, 0.25);
        }
        [data-testid="status"] {
          font-size: 13px;
          color: #94a3b8;
          margin-bottom: 16px;
          padding: 6px 10px;
          background: #0f172a;
          border-radius: 6px;
          border: 1px solid #1e293b;
        }
        svg {
          display: block;
          overflow: visible;
        }
        rect {
          transition: fill 0.2s ease, opacity 0.2s ease;
        }
        rect:hover {
          opacity: 0.85;
        }
      `}</style>
      <ChartDashboard data={DEFAULT_DATA} width={Number(width) || 420} height={Number(height) || 200} />
    </div>
  );
}

<Demo />
