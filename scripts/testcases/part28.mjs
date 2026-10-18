import { c } from './part1.mjs';
const r = (d, i, e) => c(d, i, e, { v: false, note: 'covered by the DOM harness' });

// react-components, batch 6 (A): common "build this small widget" screens.
export default {
  'tic-tac-toe': [
    r('Renders an empty labelled board with 9 cells and "Next player: X"', '<TicTacToe />', "group 'Tic-tac-toe board'; cells Cell 1..9 all empty; status 'Next player: X'"),
    r('Players alternate: X then O', 'click Cell 1, then Cell 5', "Cell 1 = X, Cell 5 = O; status 'Next player: X'"),
    r('Clicking an occupied cell does nothing', 'click Cell 1 twice', "Cell 1 stays X; status 'Next player: O'"),
    r('X completing the top row wins and onGameEnd("X") fires once', 'clicks: 1, 4, 2, 5, 3', "status 'Winner: X'; board XXX/OO-/---; onGameEnd called once with 'X'"),
    r('O completing the middle column wins', 'clicks: 1, 2, 3, 5, 4, 8', "status 'Winner: O'; onGameEnd('O')"),
    r('No more moves are accepted after the game is won', 'clicks: 1, 4, 2, 5, 3, then Cell 9', "Cell 9 stays empty; status 'Winner: X'; onGameEnd called once"),
    r('A full board with no line is a draw and calls onGameEnd("draw")', 'clicks: 1, 2, 3, 5, 4, 6, 8, 7, 9', "board XOX/XOO/OXX; status 'Draw'; onGameEnd('draw')"),
    r('Restart clears the board, X starts again, and onGameEnd is not called again', 'win the top row, click Restart, click Cell 9', "board empty and 'Next player: X' after Restart; Cell 9 = X; onGameEnd called once in total"),
  ],
  'stopwatch': [
    r('Starts stopped at 00:00.00 with Start enabled and Lap disabled', '<Stopwatch />', "timer 'Elapsed time' = '00:00.00'; buttons Start (enabled), Lap (disabled), Reset"),
    r('Start begins counting: the button becomes Pause and 1234 ms reads 00:01.23', 'click Start; Date.now advances by 1234', "button 'Pause'; timer '00:01.23'"),
    r('Pause freezes the time and resuming does not count the paused interval', 'Start; +1234 ms; Pause; +5000 ms; Start; +1000 ms', "frozen at '00:01.23' while paused; then '00:02.23'"),
    r('Minutes roll over: 61050 ms reads 01:01.05', 'Start; +61050 ms', "'01:01.05'"),
    r('Lap appends the current time to an ordered list', 'Start; +1234; Lap; +1766; Lap', "<li>Lap 1 00:01.23</li>, <li>Lap 2 00:03.00</li>"),
    r('Reset stops the watch, zeroes the time and clears the laps', 'Start; +1234; Lap; Reset; +500', "'00:00.00'; no laps; button 'Start'"),
    r('The interval is cleared on Pause and on unmount (no leaked timers)', 'count live setInterval ids: Start, Pause, Start, unmount', 'live intervals: 1 while running, 0 after Pause, 0 after unmount'),
  ],
  'progress-bar': [
    r('50 of 100 exposes the ARIA values, a 50% fill and the text "50%"', '<ProgressBar value={50} />', "aria-valuenow='50', aria-valuemin='0', aria-valuemax='100'; [data-fill] width '50%'; text '50%'"),
    r('A custom max is honoured: 3 of 4 is 75%', '<ProgressBar value={3} max={4} />', "aria-valuemax='4', aria-valuenow='3'; width '75%'; text '75%'"),
    r('Values are clamped into [0, max]: -10 -> 0%, 150 -> 100%', 'value=-10; value=150', "aria-valuenow '0' / width '0%' / '0%'; aria-valuenow '100' / width '100%' / '100%'"),
    r('The fill width is exact while the text is rounded: 1 of 3 -> width ~33.33%, text "33%"', '<ProgressBar value={1} max={3} />', 'width = 33.333...%; text "33%"'),
    r('aria-label defaults to "Progress" and can be overridden', '<ProgressBar value={10} /> and label="Upload"', "aria-label 'Progress'; then 'Upload'"),
    r('No value means indeterminate: no aria-valuenow, data-indeterminate="true", no percentage text', '<ProgressBar />', "no aria-valuenow attribute; data-indeterminate='true'; no text"),
    r('Re-rendering with a new value updates the fill and the text', 'value 50, then re-render with 80', "width '80%'; text '80%'"),
  ],
};
