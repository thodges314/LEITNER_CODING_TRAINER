const { render, fire, q, qa } = $dom;
const cell = (c, n) => q('[aria-label="Cell ' + n + '"]', c);
const status = (c) => q('[role="status"]', c).textContent.trim();
const play = (c, ...ns) => ns.forEach((n) => fire.click(cell(c, n)));
const marks = (c) => Array.from({ length: 9 }, (_, i) => cell(c, i + 1).textContent.trim() || '-').join('');
const restartBtn = (c) => qa('button', c).find((b) => b.textContent.trim() === 'Restart');
{
  const r = render(<TicTacToe />);
  $test.check(
    'Renders an empty labelled board with 9 cells and "Next player: X"',
    q('[role="group"][aria-label="Tic-tac-toe board"]', r.container) !== null && marks(r.container) === '---------' && status(r.container) === 'Next player: X',
    { marks: marks(r.container), status: status(r.container) }
  );
  r.unmount();
}
{
  const r = render(<TicTacToe />);
  play(r.container, 1, 5);
  $test.check('Players alternate: X then O', marks(r.container) === 'X---O----' && status(r.container) === 'Next player: X', { marks: marks(r.container), status: status(r.container) });
  r.unmount();
}
{
  const r = render(<TicTacToe />);
  play(r.container, 1, 1);
  $test.check('Clicking an occupied cell does nothing', marks(r.container) === 'X--------' && status(r.container) === 'Next player: O', { marks: marks(r.container), status: status(r.container) });
  r.unmount();
}
{
  const calls = [];
  const r = render(<TicTacToe onGameEnd={(w) => calls.push(w)} />);
  play(r.container, 1, 4, 2, 5, 3);
  $test.check('X completing the top row wins and onGameEnd("X") fires once', status(r.container) === 'Winner: X' && marks(r.container) === 'XXXOO----' && calls.join() === 'X', { status: status(r.container), marks: marks(r.container), calls });
  r.unmount();
}
{
  const calls = [];
  const r = render(<TicTacToe onGameEnd={(w) => calls.push(w)} />);
  play(r.container, 1, 2, 3, 5, 4, 8);
  $test.check('O completing the middle column wins', status(r.container) === 'Winner: O' && calls.join() === 'O', { status: status(r.container), calls });
  r.unmount();
}
{
  const calls = [];
  const r = render(<TicTacToe onGameEnd={(w) => calls.push(w)} />);
  play(r.container, 1, 4, 2, 5, 3, 9);
  $test.check('No more moves are accepted after the game is won', cell(r.container, 9).textContent.trim() === '' && status(r.container) === 'Winner: X' && calls.length === 1, { cell9: cell(r.container, 9).textContent, calls });
  r.unmount();
}
{
  const calls = [];
  const r = render(<TicTacToe onGameEnd={(w) => calls.push(w)} />);
  play(r.container, 1, 2, 3, 5, 4, 6, 8, 7, 9);
  $test.check('A full board with no line is a draw and calls onGameEnd("draw")', status(r.container) === 'Draw' && marks(r.container) === 'XOXXOOOXX' && calls.join() === 'draw', { status: status(r.container), marks: marks(r.container), calls });
  r.unmount();
}
{
  const calls = [];
  const r = render(<TicTacToe onGameEnd={(w) => calls.push(w)} />);
  play(r.container, 1, 4, 2, 5, 3);
  fire.click(restartBtn(r.container));
  const cleared = marks(r.container) === '---------' && status(r.container) === 'Next player: X';
  play(r.container, 9);
  $test.check('Restart clears the board, X starts again, and onGameEnd is not called again', cleared && cell(r.container, 9).textContent.trim() === 'X' && calls.length === 1, { cleared, calls });
  r.unmount();
}
{
  // click orders: X, O, X, O, X (O only ever has two marks, so only X can win)
  const lines = {
    'top row': [1, 4, 2, 5, 3],
    'middle row': [4, 1, 5, 2, 6],
    'bottom row': [7, 1, 8, 2, 9],
    'left column': [1, 2, 4, 3, 7],
    'middle column': [2, 1, 5, 3, 8],
    'right column': [3, 1, 6, 2, 9],
    'main diagonal': [1, 2, 5, 3, 9],
    'anti-diagonal': [3, 1, 5, 2, 7],
  };
  const results = {};
  for (const [name, clicks] of Object.entries(lines)) {
    const r = render(<TicTacToe />);
    play(r.container, ...clicks);
    results[name] = status(r.container);
    r.unmount();
  }
  const notWon = Object.entries(results).filter(([, s]) => s !== 'Winner: X').map(([n]) => n);
  $test.check('All eight winning lines are detected (3 rows, 3 columns, 2 diagonals)', notWon.length === 0, { notWon, results });
}
{
  const r = render(<TicTacToe />);
  play(r.container, 2, 1, 3);
  $test.check('Two in a row is not a win', status(r.container) === 'Next player: O' && marks(r.container) === 'OXX------', { status: status(r.container), marks: marks(r.container) });
  r.unmount();
}
