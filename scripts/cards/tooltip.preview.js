function Demo() {
  const { content = 'Additional details appear on hover or keyboard focus' } = usePreviewProps({
    content: 'Additional details appear on hover or keyboard focus',
  });

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <Tooltip content={content}>
        <button
          type="button"
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid #334155',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            cursor: 'pointer',
          }}
          onClick={() => log('click', 'Button clicked')}
        >
          Hover or Focus Me
        </button>
      </Tooltip>
    </div>
  );
}

<Demo />
