function TicTacToePreview() {
  const [lastResult, setLastResult] = useState('');

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <TicTacToe
        onGameEnd={(result) => {
          setLastResult(result);
          if (typeof log === 'function') log('onGameEnd', result);
        }}
      />
      {lastResult && (
        <div style={{ marginTop: 12, fontSize: 13, color: '#38bdf8' }}>
          Game finished with: <strong>{lastResult}</strong>
        </div>
      )}
    </div>
  );
}

<TicTacToePreview />
