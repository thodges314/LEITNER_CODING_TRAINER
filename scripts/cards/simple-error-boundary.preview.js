function ChildWidget({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error('Simulated render error in descendant');
  }
  return (
    <div
      style={{
        color: '#34d399',
        fontSize: '13px',
        padding: '12px 16px',
        background: 'rgba(52, 211, 153, 0.08)',
        border: '1px solid rgba(52, 211, 153, 0.25)',
        borderRadius: '6px',
      }}
    >
      Safe child rendering normally.
    </div>
  );
}

function Demo() {
  const {
    fallback = 'Something went wrong.',
    onError = log('onError'),
    shouldThrow = false,
  } = usePreviewProps({
    fallback: 'Something went wrong.',
    onError: log('onError'),
    shouldThrow: false,
  });

  return (
    <div key={String(shouldThrow)} style={{ padding: '16px' }}>
      <SimpleErrorBoundary
        fallback={
          <div
            style={{
              color: '#f87171',
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '6px',
              fontSize: '13px',
            }}
          >
            {fallback}
          </div>
        }
        onError={onError}
      >
        <ChildWidget shouldThrow={shouldThrow} />
      </SimpleErrorBoundary>
    </div>
  );
}

<Demo />
