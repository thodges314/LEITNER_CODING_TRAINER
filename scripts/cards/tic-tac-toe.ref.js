const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

function calcWinner(cells) {
  for (const [a, b, c] of LINES) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) return cells[a];
  }
  return null;
}

function TicTacToe({ onGameEnd }) {
  const [cells, setCells] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState('X');
  const winner = calcWinner(cells);
  const draw = !winner && cells.every(Boolean);

  const play = (i) => {
    if (cells[i] || winner) return;
    const next = cells.slice();
    next[i] = turn;
    setCells(next);
    setTurn(turn === 'X' ? 'O' : 'X');
    const w = calcWinner(next);
    if (w) onGameEnd && onGameEnd(w);
    else if (next.every(Boolean)) onGameEnd && onGameEnd('draw');
  };

  const restart = () => {
    setCells(Array(9).fill(null));
    setTurn('X');
  };

  const status = winner ? `Winner: ${winner}` : draw ? 'Draw' : `Next player: ${turn}`;

  return (
    <div>
      <p role="status">{status}</p>
      <div role="group" aria-label="Tic-tac-toe board" className="grid-3x3">
        {cells.map((value, i) => (
          <button key={i} type="button" aria-label={`Cell ${i + 1}`} className="grid-cell" onClick={() => play(i)}>
            {value}
          </button>
        ))}
      </div>
      <button type="button" onClick={restart}>Restart</button>
    </div>
  );
}
