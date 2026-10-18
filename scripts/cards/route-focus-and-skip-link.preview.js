function Demo() {
  const [route, setRoute] = useState({ path: '/dashboard', title: 'Dashboard' });

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <nav style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          type="button"
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #334155',
            backgroundColor: route.path === '/dashboard' ? '#1e293b' : '#0f172a',
            color: '#f8fafc',
            cursor: 'pointer',
          }}
          onClick={() => {
            setRoute({ path: '/dashboard', title: 'Dashboard' });
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
            backgroundColor: route.path === '/settings' ? '#1e293b' : '#0f172a',
            color: '#f8fafc',
            cursor: 'pointer',
          }}
          onClick={() => {
            setRoute({ path: '/settings', title: 'Settings' });
            log('navigate', '/settings');
          }}
        >
          Settings
        </button>
      </nav>
      <Layout path={route.path} title={route.title}>
        <p style={{ color: '#cbd5e1' }}>
          On route change, focus moves to the h1 heading for screen readers. A skip-link is available above.
        </p>
      </Layout>
    </div>
  );
}

<Demo />
