function BadChild({ bomb }) {
  if (bomb) throw new Error('Simulated render error');
  return <div style={{ color: '#34d399', fontSize: '13px' }}>Safe child rendering normally.</div>;
}

function Demo() {
  const [bomb, setBomb] = useState(false);
  const {
    fallback = 'Something went wrong.',
    onError = log('onError'),
  } = usePreviewProps({
    fallback: 'Something went wrong.',
    onError: log('onError'),
  });

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <button
        type="button"
        onClick={() => {
          setBomb(!bomb);
          log('triggerError')(!bomb);
        }}
        style={{
          padding: '6px 14px',
          width: 'fit-content',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          borderRadius: '6px',
          border: '1px solid #475569',
          background: '#1e293b',
          color: '#f8fafc',
        }}
      >
        {bomb ? 'Reset' : 'Trigger Error'}
      </button>

      <SimpleErrorBoundary
        key={String(bomb)}
        fallback={
          <div
            style={{
              color: '#f87171',
              padding: '10px 14px',
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
        <BadChild bomb={bomb} />
      </SimpleErrorBoundary>
    </div>
  );
}

<Demo />
