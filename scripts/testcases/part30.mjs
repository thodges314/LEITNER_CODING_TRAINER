import { c } from './part1.mjs';

// Intro rungs (batch 1): easy first cards for concepts that started at difficulty 3+.
export default {
  'calculate-winner': [
    c('Each of the three rows wins', `const win = (i) => {
  const b = Array(9).fill(null);
  [i, i + 1, i + 2].forEach((k) => { b[k] = 'X'; });
  return calculateWinner(b);
};
[win(0), win(3), win(6)]`, "['X', 'X', 'X']", {
      callSignature: "calculateWinner(['X', 'X', 'X', null, null, null, null, null, null])",
    }),
    c('Each of the three columns wins', `const win = (i) => {
  const b = Array(9).fill(null);
  [i, i + 3, i + 6].forEach((k) => { b[k] = 'O'; });
  return calculateWinner(b);
};
[win(0), win(1), win(2)]`, "['O', 'O', 'O']", {
      callSignature: "calculateWinner(['O', null, null, 'O', null, null, 'O', null, null])",
    }),
    c('Both diagonals win', `const a = Array(9).fill(null);
[0, 4, 8].forEach((k) => { a[k] = 'X'; });
const b = Array(9).fill(null);
[2, 4, 6].forEach((k) => { b[k] = 'O'; });
[calculateWinner(a), calculateWinner(b)]`, "['X', 'O']", {
      callSignature: "calculateWinner(['X', null, null, null, 'X', null, null, null, 'X'])",
    }),
    c('Empty squares are not a win, and neither is a pair', `[calculateWinner(Array(9).fill(null)), calculateWinner(['X', 'X', null, null, 'O', null, null, null, 'O'])]`, '[null, null]', {
      callSignature: "calculateWinner(Array(9).fill(null))",
    }),
    c('Three squares in a line must belong to the same player', `calculateWinner(['X', 'X', 'O', 'O', 'O', 'X', 'X', 'O', 'X'])`, 'null'),
    c('isBoardFull is true only when no square is null', `[isBoardFull(Array(9).fill('X')), isBoardFull(['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', null]), isBoardFull(Array(9).fill(null))]`, '[true, false, false]', {
      callSignature: "isBoardFull(board)",
    }),
    c('getStatus reports the winner, a draw, or whose turn it is', `const won = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
const draw = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
const open = ['X', null, null, null, 'O', null, null, null, null];
[getStatus(won, false), getStatus(draw, true), getStatus(open, true), getStatus(open, false)]`, "['Winner: X', 'Draw', 'Next player: X', 'Next player: O']", {
      callSignature: "getStatus(board, xIsNext)",
    }),
    c('A win on a full board is a win, not a draw', `getStatus(['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'X'], false)`, "'Winner: X'"),
  ],
  'paginate-items': [
    c('First page of 10 items, 3 per page', `paginate([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1, 3)`, '{ items: [1, 2, 3], page: 1, pageSize: 3, totalItems: 10, totalPages: 4, hasPrev: false, hasNext: true }'),
    c('A middle page has both neighbours', `paginate([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2, 3)`, '{ items: [4, 5, 6], page: 2, pageSize: 3, totalItems: 10, totalPages: 4, hasPrev: true, hasNext: true }'),
    c('The last page can be partial', `paginate([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4, 3)`, '{ items: [10], page: 4, pageSize: 3, totalItems: 10, totalPages: 4, hasPrev: true, hasNext: false }'),
    c('An exact multiple has no extra empty page', `paginate([1, 2, 3, 4, 5, 6], 2, 3)`, '{ items: [4, 5, 6], page: 2, pageSize: 3, totalItems: 6, totalPages: 2, hasPrev: true, hasNext: false }'),
    c('A page past the end shows the last page', `paginate([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 99, 3).page`, '4'),
    c('A page below 1 shows the first page', `[paginate([1, 2, 3, 4], 0, 2).items, paginate([1, 2, 3, 4], -5, 2).page]`, '[[1, 2], 1]'),
    c('An empty list has 0 pages and stays on page 1', `paginate([], 3, 5)`, '{ items: [], page: 1, pageSize: 5, totalItems: 0, totalPages: 0, hasPrev: false, hasNext: false }'),
    c('A page size of 1 is valid', `paginate([1, 2, 3], 2, 1)`, '{ items: [2], page: 2, pageSize: 1, totalItems: 3, totalPages: 3, hasPrev: true, hasNext: true }'),
    c('The input array is not changed', `const input = [1, 2, 3];
paginate(input, 1, 2);
input`, '[1, 2, 3]'),
    c('pageSize must be a positive integer', `paginate([1, 2, 3], 1, 0)`, '', { t: 'pageSize', x: 'Throws RangeError: pageSize must be a positive integer' }),
  ],
  'create-store-basic': [
    c('getState returns the initial state', `createStore({ count: 0 }).getState()`, '{ count: 0 }'),
    c('setState shallow-merges and keeps the other keys', `const s = createStore({ a: 1, b: 2 });
s.setState({ b: 3 });
s.getState()`, '{ a: 1, b: 3 }'),
    c('setState creates a new state object and never mutates the old one', `const s = createStore({ n: 1 });
const before = s.getState();
s.setState({ n: 2 });
[before.n, s.getState().n, s.getState() !== before]`, '[1, 2, true]'),
    c('Listeners get the NEW state after every setState', `const s = createStore({ n: 0 });
const seen = [];
s.subscribe((state) => seen.push(state.n));
s.setState({ n: 1 });
s.setState({ n: 2 });
seen`, '[1, 2]'),
    c('Subscribing does not call the listener', `const s = createStore({ n: 0 });
let calls = 0;
s.subscribe(() => { calls += 1; });
calls`, '0'),
    c('Listeners run in subscription order', `const s = createStore({});
const order = [];
s.subscribe(() => order.push('first'));
s.subscribe(() => order.push('second'));
s.setState({ x: 1 });
order`, "['first', 'second']"),
    c('Unsubscribe stops only that listener', `const s = createStore({ n: 0 });
const log = [];
const off = s.subscribe(() => log.push('a'));
s.subscribe(() => log.push('b'));
s.setState({ n: 1 });
off();
s.setState({ n: 2 });
log`, "['a', 'b', 'b']"),
  ],
};
