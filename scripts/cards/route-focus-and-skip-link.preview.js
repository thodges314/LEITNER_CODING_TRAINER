function Demo() {
  const {
    path = '/dashboard',
    title = 'Dashboard',
    children = 'On route change, focus moves to the h1 heading for screen readers. A skip-link is available above.',
  } = usePreviewProps({
    path: '/dashboard',
    title: 'Dashboard',
    children: 'On route change, focus moves to the h1 heading for screen readers. A skip-link is available above.',
  });

  const [currentRoute, setCurrentRoute] = useState({ path, title });
  useEffect(() => {
    setCurrentRoute({ path: path || '/dashboard', title: title || 'Dashboard' });
  }, [path, title]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <nav style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          type="button"
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #334155',
            backgroundColor: currentRoute.path === '/dashboard' ? '#1e293b' : '#0f172a',
            color: '#f8fafc',
            cursor: 'pointer',
          }}
          onClick={() => {
            setCurrentRoute({ path: '/dashboard', title: 'Dashboard' });
            log('navigate', '/dashboard');
          }}
        >
          Dashboard
        </button>
        <button
          type="button"
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #334155',
            backgroundColor: currentRoute.path === '/settings' ? '#1e293b' : '#0f172a',
            color: '#f8fafc',
            cursor: 'pointer',
          }}
          onClick={() => {
            setCurrentRoute({ path: '/settings', title: 'Settings' });
            log('navigate', '/settings');
          }}
        >
          Settings
        </button>
      </nav>
      <Layout path={currentRoute.path} title={currentRoute.title}>
        <p style={{ color: '#cbd5e1' }}>{children}</p>
      </Layout>
    </div>
  );
}

<Demo />
