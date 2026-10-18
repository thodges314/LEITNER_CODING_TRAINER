function Demo() {
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ fontSize: '13px', color: '#94a3b8' }}>Countdown timer (seconds):</div>
      <Countdown seconds={10} onDone={log('onDone')} tickMs={500} />
    </div>
  );
}

<Demo />
