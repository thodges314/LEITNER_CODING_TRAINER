function BuggyChild({ shouldThrow: propShouldThrow }) {
  const [localCrash, setLocalCrash] = useState(false);

  if (propShouldThrow || localCrash) {
    throw new Error('Simulated render error in descendant component!');
  }

  return (
    <div
      style={{
        padding: '16px 20px',
        borderRadius: '8px',
        border: '1px solid rgba(52, 211, 153, 0.3)',
        background: 'rgba(52, 211, 153, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#34d399',
              background: 'rgba(52, 211, 153, 0.16)',
              padding: '3px 8px',
              borderRadius: '4px',
            }}
          >
            Wrapped Child
          </span>
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#e2e8f0' }}>
            Descendant is healthy
          </span>
        </div>
        <span style={{ fontSize: '12px', color: '#34d399' }}>● Active</span>
      </div>

      <p style={{ margin: 0, fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.5 }}>
        This child component is wrapped inside <code>&lt;SimpleErrorBoundary&gt;</code>. Click the button below or toggle <code>shouldThrow</code> in the Props panel to trigger an uncaught render error.
      </p>

      <button
        type="button"
        onClick={() => {
          log('childAction')('Triggered render crash in child');
          setLocalCrash(true);
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          alignSelf: 'flex-start',
          padding: '8px 16px',
          fontSize: '12.5px',
          fontWeight: 600,
          color: '#ffffff',
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '6px',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)',
        }}
      >
        <span>💥</span> Simulate Crash in Child
      </button>
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

  const [remountCount, setRemountCount] = useState(0);

  return (
    <div
      style={{
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: '560px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '10px',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '16px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            paddingBottom: '10px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px' }}>🛡️</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8' }}>
              &lt;SimpleErrorBoundary&gt;
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              log('boundary')('Reset / remounted boundary');
              setRemountCount((c) => c + 1);
            }}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 500,
              color: '#94a3b8',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            title="Remount boundary to test again"
          >
            ↺ Reset Boundary
          </button>
        </div>

        <SimpleErrorBoundary
          key={`${remountCount}-${String(shouldThrow)}`}
          fallback={
            <div
              style={{
                padding: '16px 20px',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                background: 'rgba(239, 68, 68, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#f87171',
                    background: 'rgba(239, 68, 68, 0.2)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                  }}
                >
                  Fallback Active
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#fca5a5' }}>
                  {fallback}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                The error was caught by the boundary and <code>onError</code> was dispatched. Click <strong>↺ Reset Boundary</strong> above to restore the healthy child.
              </p>
            </div>
          }
          onError={onError}
        >
          <BuggyChild shouldThrow={shouldThrow} />
        </SimpleErrorBoundary>
      </div>
    </div>
  );
}

<Demo />
