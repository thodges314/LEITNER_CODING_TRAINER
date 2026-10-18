function AnnounceControls() {
  const announce = useAnnounce();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
        Screen reader live regions (polite and assertive status announcements).
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #0284c7',
            backgroundColor: '#0369a1',
            color: '#ffffff',
            cursor: 'pointer',
          }}
          onClick={() => {
            announce('Changes saved successfully.', { politeness: 'polite' });
            log('announce', 'polite: Changes saved successfully.');
          }}
        >
          Announce Polite
        </button>
        <button
          type="button"
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #e11d48',
            backgroundColor: '#be123c',
            color: '#ffffff',
            cursor: 'pointer',
          }}
          onClick={() => {
            announce('Connection lost! Check network.', { politeness: 'assertive' });
            log('announce', 'assertive: Connection lost! Check network.');
          }}
        >
          Announce Assertive
        </button>
      </div>
    </div>
  );
}

function Demo() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <AnnouncerProvider>
        <AnnounceControls />
      </AnnouncerProvider>
    </div>
  );
}

<Demo />
