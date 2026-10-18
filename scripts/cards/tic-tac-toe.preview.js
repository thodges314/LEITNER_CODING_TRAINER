<div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
  <TicTacToe
    onGameEnd={(result) => {
      log('onGameEnd', result);
    }}
  />
</div>
