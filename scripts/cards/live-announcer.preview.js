function AnnounceControls({ message, politeness }) {
  const announce = useAnnounce();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
        Screen reader live regions (polite and assertive status announcements).
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
            const msg = message || 'Changes saved successfully.';
            announce(msg, { politeness: politeness || 'polite' });
            log('announce', `${politeness || 'polite'}: ${msg}`);
          }}
        >
          Announce {politeness === 'assertive' ? 'Assertive' : 'Polite'}
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
          Urgent Alert
        </button>
      </div>
    </div>
  );
}

function Demo() {
  const {
    politeness = 'polite',
    message = 'Changes saved successfully.',
  } = usePreviewProps({
    politeness: 'polite',
    message: 'Changes saved successfully.',
  });

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <AnnouncerProvider>
        <AnnounceControls message={message} politeness={politeness} />
      </AnnouncerProvider>
    </div>
  );
}

<Demo />
