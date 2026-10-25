function Demo() {
  const {
    seconds = 10,
    tickMs = 500,
    onDone = log('onDone'),
  } = usePreviewProps({
    seconds: 10,
    tickMs: 500,
  });

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ fontSize: '13px', color: '#94a3b8' }}>Countdown timer (seconds):</div>
      <Countdown
        key={`${seconds}-${tickMs}`}
        seconds={seconds}
        onDone={onDone}
        tickMs={tickMs}
      />
    </div>
  );
}

<Demo />
