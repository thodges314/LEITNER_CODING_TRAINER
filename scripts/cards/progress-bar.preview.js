function Demo() {
  const [val, setVal] = useState(45);
  const [indeterminate, setIndeterminate] = useState(false);
  const logger = log('progress');

  const update = (next) => {
    setVal(next);
    logger({ value: next });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '6px' }}>
      <style>{`
        [role="progressbar"] {
          position: relative;
          width: 100%;
          height: 24px;
          background-color: rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #ffffff;
        }
        [role="progressbar"] [data-fill] {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background: linear-gradient(90deg, #06b6d4, #3b82f6);
          transition: width 0.2s ease;
          border-radius: 12px;
        }
        [role="progressbar"][data-indeterminate="true"] [data-fill] {
          width: 35% !important;
          animation: leitner-indeterminate-slide 1.4s infinite ease-in-out;
        }
        [role="progressbar"] span {
          position: relative;
          z-index: 1;
          text-shadow: 0 1px 2px rgba(0,0,0,0.6);
        }
        @keyframes leitner-indeterminate-slide {
          0% { left: -35%; }
          100% { left: 100%; }
        }
      `}</style>
      <div>
        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
          Accessible Progress Bar (Interactive Preview):
        </div>
        <ProgressBar value={indeterminate ? undefined : val} max={100} label="Upload Progress" />
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => update(Math.max(0, val - 10))}
          style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer' }}
        >
          -10%
        </button>
        <button
          type="button"
          onClick={() => update(Math.min(100, val + 10))}
          style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer' }}
        >
          +10%
        </button>
        <button
          type="button"
          onClick={() => {
            const next = !indeterminate;
            setIndeterminate(next);
            logger({ indeterminate: next });
          }}
          style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer' }}
        >
          {indeterminate ? 'Set Determinate' : 'Set Indeterminate'}
        </button>
        <button
          type="button"
          onClick={() => update(100)}
          style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer' }}
        >
          100%
        </button>
        <button
          type="button"
          onClick={() => update(0)}
          style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

<Demo />
