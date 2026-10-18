const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function calculateWinner(squares) {
  for (const [a, b, c] of LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
  }
  return null;
}

function isBoardFull(squares) {
  return squares.every((square) => square !== null);
}

function getStatus(squares, xIsNext) {
  const winner = calculateWinner(squares);
  if (winner) return 'Winner: ' + winner;
  if (isBoardFull(squares)) return 'Draw';
  return 'Next player: ' + (xIsNext ? 'X' : 'O');
}
