type Player = 'X' | 'O';
type CellValue = Player | null;
type GameResult = Player | 'draw';

interface TicTacToeProps {
  onGameEnd?: (result: GameResult) => void;
}

const LINES: readonly [number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function calcWinner(cells: readonly CellValue[]): Player | null {
  for (const [a, b, c] of LINES) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) return cells[a];
  }
  return null;
}

function TicTacToe({ onGameEnd }: TicTacToeProps): JSX.Element {
  const [cells, setCells] = useState<CellValue[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<Player>('X');
  const winner = calcWinner(cells);
  const draw = !winner && cells.every(Boolean);

  const play = (i: number) => {
    if (cells[i] || winner) return;
    const next = cells.slice();
    next[i] = turn;
    setCells(next);
    setTurn(turn === 'X' ? 'O' : 'X');
    const w = calcWinner(next);
    if (w) {
      if (onGameEnd) onGameEnd(w);
    } else if (next.every(Boolean)) {
      if (onGameEnd) onGameEnd('draw');
    }
  };

  const restart = () => {
    setCells(Array(9).fill(null));
    setTurn('X');
  };

  const status = winner ? `Winner: ${winner}` : draw ? 'Draw' : `Next player: ${turn}`;

  return (
    <div>
      <p role="status">{status}</p>
      <div role="group" aria-label="Tic-tac-toe board">
        {cells.map((value, i) => (
          <button key={i} type="button" aria-label={`Cell ${i + 1}`} onClick={() => play(i)}>
            {value}
          </button>
        ))}
      </div>
      <button type="button" onClick={restart}>Restart</button>
    </div>
  );
}
