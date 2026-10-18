function BadChild({ bomb }) {
  if (bomb) throw new Error('Explosion');
  return <div style={{ color: '#34d399', fontSize: '13px' }}>Safe child rendering normally.</div>;
}

function Demo() {
  const [bomb, setBomb] = useState(false);

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <button
        type="button"
        onClick={() => {
          setBomb(true);
          log('triggerError')(true);
        }}
        style={{ padding: '4px 8px', width: 'fit-content', fontSize: '12px' }}
      >
        Trigger Error
      </button>
      <SimpleErrorBoundary
        fallback={<div style={{ color: '#f87171', padding: '8px', background: 'rgba(239, 68, 68, 0.1)' }}>Something went wrong.</div>}
        onError={log('onError')}
      >
        <BadChild bomb={bomb} />
      </SimpleErrorBoundary>
    </div>
  );
}

<Demo />
