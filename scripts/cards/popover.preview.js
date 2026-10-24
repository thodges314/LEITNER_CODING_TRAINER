function PopoverDemo() {
  const [placement, setPlacement] = useState('bottom');

  return (
    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {['top', 'bottom', 'left', 'right'].map((p) => (
          <button
            key={p}
            onClick={() => setPlacement(p)}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              fontWeight: placement === p ? 'bold' : 'normal',
              border: placement === p ? '2px solid #38bdf8' : '1px solid #64748b',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <Popover
        placement={placement}
        title={`Placement: ${placement}`}
        trigger={<span style={{ display: 'inline-block', padding: '8px 16px', background: '#38bdf8', color: '#000', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Toggle Popover</span>}
        content={
          <div style={{ padding: '12px', background: '#1e293b', color: '#f8fafc', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', width: '220px' }}>
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
