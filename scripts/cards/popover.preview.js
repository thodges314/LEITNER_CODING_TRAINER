function PopoverDemo() {
  const [placement, setPlacement] = useState('bottom' as any);

  return (
    <div style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', fontFamily: 'sans-serif' }}>
      <style>{`
        [data-action="trigger"] {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }
        [role="dialog"] {
          background: #1e293b;
          color: #f8fafc;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          min-width: 200px;
        }
        [role="dialog"] [data-title] {
          margin: 0 0 8px 0;
          font-size: 13px;
          color: #38bdf8;
        }
        [role="dialog"] [data-action="close"] {
          position: absolute;
          top: 8px;
          right: 8px;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 11px;
          padding: 2px 5px;
        }
        [role="dialog"][data-placement="top"] {
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 8px;
        }
        [role="dialog"][data-placement="bottom"] {
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 8px;
        }
        [role="dialog"][data-placement="left"] {
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-right: 8px;
        }
        [role="dialog"][data-placement="right"] {
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-left: 8px;
        }
      `}</style>
      <div style={{ display: 'flex', gap: '8px' }}>
        {['top', 'bottom', 'left', 'right'].map((p) => (
          <button
            key={p}
            onClick={() => setPlacement(p)}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: placement === p ? 'bold' : 'normal',
              border: placement === p ? '2px solid #38bdf8' : '1px solid #64748b',
              background: placement === p ? 'rgba(56, 189, 248, 0.15)' : '#0f172a',
              color: placement === p ? '#38bdf8' : '#cbd5e1',
              cursor: 'pointer',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <Popover
        placement={placement as any}
        title={`Placement: ${placement}`}
        trigger={<span style={{ display: 'inline-block', padding: '10px 20px', background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', color: '#ffffff', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Toggle Popover</span>}
        content={
          <div style={{ width: '220px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '13px' }}>This popover is anchored to the trigger with placement <strong>{placement}</strong>.</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Press Escape or click outside to dismiss.</p>
          </div>
        }
        onToggle={(isOpen) => log('onToggle')(isOpen ? 'Opened' : 'Closed')}
      />
    </div>
  );
}

<PopoverDemo />
