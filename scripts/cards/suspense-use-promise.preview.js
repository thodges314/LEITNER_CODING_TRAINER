function Demo() {
  const {
    delayMs = 800,
    name = 'Ada Lovelace',
    role = 'Algorithm Pioneer',
  } = usePreviewProps({
    delayMs: 800,
    name: 'Ada Lovelace',
    role: 'Algorithm Pioneer',
  });

  const [promise, setPromise] = useState(() => Promise.resolve({ name, role }));

  useEffect(() => {
    setPromise(Promise.resolve({ name, role }));
  }, [name, role]);

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
          log('fetch', `fetching with ${delayMs}ms delay`);
          setPromise(
            new Promise((resolve) =>
              setTimeout(() => resolve({ name, role }), Number(delayMs) || 800)
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
