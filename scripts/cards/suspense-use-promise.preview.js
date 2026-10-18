function Demo() {
  const [promise, setPromise] = useState(() => Promise.resolve({ name: 'Ada Lovelace', role: 'Algorithm Pioneer' }));

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <button
        type="button"
        style={{
          padding: '6px 12px',
          borderRadius: 6,
          border: '1px solid #334155',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          cursor: 'pointer',
          marginBottom: 12,
        }}
        onClick={() => {
          log('fetch', 'fetching next user with 800ms delay');
          setPromise(
            new Promise((resolve) =>
              setTimeout(() => resolve({ name: 'Grace Hopper', role: 'Compiler Pioneer' }), 800)
            )
          );
        }}
      >
        Load With Delay (Triggers Suspense Fallback)
      </button>
      <UserBadge userPromise={promise} />
    </div>
  );
}

<Demo />
