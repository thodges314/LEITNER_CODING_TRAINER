function TransferListInner({ initialLeft, initialRight }) {
  const {
    left,
    right,
    leftSelected,
    rightSelected,
    toggleLeft,
    toggleRight,
    moveRight,
    moveLeft,
    moveAllRight,
    moveAllLeft,
  } = useTransferList({
    initialLeft,
    initialRight,
  });

  return (
    <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '10px', minWidth: '120px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Available</div>
        {left.map((item) => (
          <label key={item} style={{ display: 'block', fontSize: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={leftSelected.includes(item)}
              onChange={() => {
                toggleLeft(item);
                log('toggleLeft', item);
              }}
            />{' '}
            {item}
          </label>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button type="button" onClick={() => { moveRight(); log('moveRight'); }} style={{ fontSize: '11px', padding: '3px 8px' }}>&gt;</button>
        <button type="button" onClick={() => { moveLeft(); log('moveLeft'); }} style={{ fontSize: '11px', padding: '3px 8px' }}>&lt;</button>
        <button type="button" onClick={() => { moveAllRight(); log('moveAllRight'); }} style={{ fontSize: '11px', padding: '3px 8px' }}>&gt;&gt;</button>
        <button type="button" onClick={() => { moveAllLeft(); log('moveAllLeft'); }} style={{ fontSize: '11px', padding: '3px 8px' }}>&lt;&lt;</button>
      </div>

      <div style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '10px', minWidth: '120px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Selected</div>
        {right.map((item) => (
          <label key={item} style={{ display: 'block', fontSize: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={rightSelected.includes(item)}
              onChange={() => {
                toggleRight(item);
                log('toggleRight', item);
              }}
            />{' '}
            {item}
          </label>
        ))}
      </div>
    </div>
  );
}

function Demo() {
  const {
    initialLeft = ['HTML', 'CSS', 'JavaScript'],
    initialRight = ['React', 'TypeScript'],
  } = usePreviewProps({
    initialLeft: ['HTML', 'CSS', 'JavaScript'],
    initialRight: ['React', 'TypeScript'],
  });

  const parsedLeft = Array.isArray(initialLeft) ? initialLeft : ['HTML', 'CSS', 'JavaScript'];
  const parsedRight = Array.isArray(initialRight) ? initialRight : ['React', 'TypeScript'];

  return (
    <TransferListInner
      key={`${JSON.stringify(parsedLeft)}-${JSON.stringify(parsedRight)}`}
      initialLeft={parsedLeft}
      initialRight={parsedRight}
    />
  );
}

<Demo />
