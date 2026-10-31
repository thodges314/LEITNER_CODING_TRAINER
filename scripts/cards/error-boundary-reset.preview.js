function BuggyWidget({ shouldExplode, message }) {
  if (shouldExplode) throw new Error(message || 'Crashed in BuggyWidget');
  return <div style={{ color: '#34d399', fontSize: '13px' }}>Widget running normally.</div>;
}

function Demo() {
  const {
    errorMessage = 'Crashed in BuggyWidget',
    resetKey = 0,
    onError,
  } = usePreviewProps({
    errorMessage: 'Crashed in BuggyWidget',
    resetKey: 0,
  });

  const [explode, setExplode] = useState(false);
  const [internalKey, setInternalKey] = useState(Number(resetKey) || 0);

  useEffect(() => {
    setInternalKey(Number(resetKey) || 0);
  }, [resetKey]);

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={() => {
            setExplode(true);
            log('triggerError', true);
          }}
          style={{ padding: '4px 8px', fontSize: '12px' }}
        >
          Trigger Error
        </button>
        <button
          type="button"
          onClick={() => {
            setExplode(false);
            setInternalKey((k) => k + 1);
            log('resetKeys', internalKey + 1);
          }}
          style={{ padding: '4px 8px', fontSize: '12px' }}
        >
          Reset Key
        </button>
      </div>
      <ErrorBoundary
        resetKeys={[internalKey]}
        onError={(err, info) => {
          if (onError) onError(err, info);
          log('onError', err?.message || err);
        }}
        fallback={(err, reset) => (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px' }}>
            <div style={{ color: '#f87171', fontWeight: 600, fontSize: '12.5px' }}>Error Caught: {err.message}</div>
            <button
              type="button"
              onClick={() => {
                setExplode(false);
                reset();
              }}
              style={{ marginTop: '8px', padding: '4px 8px', fontSize: '11.5px' }}
            >
              Try Again
            </button>
          </div>
        )}
      >
        <BuggyWidget shouldExplode={explode} message={errorMessage} />
      </ErrorBoundary>
    </div>
  );
}

<Demo />
