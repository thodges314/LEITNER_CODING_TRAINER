type Player = 'X' | 'O';
type Square = Player | string | null;

const LINES: readonly [number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function calculateWinner(squares: readonly Square[]): 'X' | 'O' | null {
  for (const [a, b, c] of LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a] as 'X' | 'O';
    }
  }
  return null;
}

function isBoardFull(squares: readonly Square[]): boolean {
  return squares.every((square) => square !== null);
}

function getStatus(squares: readonly Square[], xIsNext: boolean): string {
  const winner = calculateWinner(squares);
  if (winner) return 'Winner: ' + winner;
  if (isBoardFull(squares)) return 'Draw';
  return 'Next player: ' + (xIsNext ? 'X' : 'O');
}
