function Demo() {
  const {
    placeholder = 'Type here...',
    defaultValue = 'Hello World',
  } = usePreviewProps({
    placeholder: 'Type here...',
    defaultValue: 'Hello World',
  });

  const fancyRef = useRef(null);

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label style={{ fontSize: '13px', color: '#94a3b8' }}>Fancy input with imperative handle:</label>
      <FancyInput
        key={`${placeholder}-${defaultValue}`}
        ref={fancyRef}
        placeholder={placeholder || 'Type here...'}
        defaultValue={defaultValue || ''}
      />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={() => {
            fancyRef.current?.focus();
            log('focus');
          }}
          style={{ padding: '4px 8px', fontSize: '12px' }}
        >
          Focus
        </button>
        <button
          type="button"
          onClick={() => {
            const val = fancyRef.current?.getValue();
            log('getValue', val);
          }}
          style={{ padding: '4px 8px', fontSize: '12px' }}
        >
          Get Value
        </button>
        <button
          type="button"
          onClick={() => {
            fancyRef.current?.clear();
            log('clear');
          }}
          style={{ padding: '4px 8px', fontSize: '12px' }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

<Demo />
