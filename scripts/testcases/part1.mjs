// Hand-written input/output pairs, cards 0-21.
// c(description, input, expected, opts)
//   input    : display code. Last line is the expression whose value is the result.
//              `sleep(ms)` and top-level `await` are available.
//   expected : display text of the expected output (also evaluated as JS for verification unless opts.ev is given).
// opts: ev (JS expression to verify against), t (regex source: input must reject and message must match),
//       x (display text for t cases), logs (compare captured console.log lines), v:false (not machine-verified), note.
export const c = (d, i, e, o = {}) => ({ d, i, e, ...o });

const TODO1 = "{ userId: 1, id: 1, title: 'delectus aut autem', completed: false }";
const TODO2 = "{ userId: 1, id: 2, title: 'quis ut nam facilis et officia qui', completed: false }";
const U = 'https://jsonplaceholder.typicode.com';

export default {
  'async-fetch-error-handling': [
    c('200 OK resolves with the parsed JSON body', `fetchData('${U}/todos/1')`, TODO1),
    c('Non-2xx response rejects with an Error that includes the status code', `fetchData('${U}/invalid-path-404')`, '', {
      t: '404',
      x: 'Rejects with Error — message contains "404"',
    }),
    c('Network failure is not swallowed', `fetchData('https://invalid-non-existent-url-domain.org')`, '', {
      t: 'TypeError: Failed to fetch',
      x: 'Rejects with the network error (TypeError: Failed to fetch)',
    }),
    c(`Another 200 endpoint resolves with its own JSON body`, `fetchData('https://jsonplaceholder.typicode.com/todos/2')`, `{ userId: 1, id: 2, title: 'quis ut nam facilis et officia qui', completed: false }`),
  ],
  'promise-chaining-syntax': [
    c('Resolves with parsed JSON (no async/await)', `(await getUserData('${U}/users/1')).name`, "'Leanne Graham'"),
    c('HTTP error still rejects after the .catch() log (error is rethrown)', `getUserData('${U}/invalid-path-404')`, '', {
      t: '404',
      x: 'Rejects with Error — message contains "404"',
    }),
    c(
      'Cleanup log runs in .finally() on success AND on failure',
      `getUserData('${U}/users/1')   // then getUserData('${U}/invalid-path-404')`,
      'console.log called once per call from .finally(), after the result/rejection is settled; the failing call still rejects',
      { v: false, note: 'console side effects are not machine-checked' }
    ),
  ],
  'promise-all-vs-settled': [
    c(
      'Fulfilled payloads only; the failing URL is dropped',
      `fetchAllUsers(['${U}/todos/1', 'https://invalid-non-existent-url-domain.org', '${U}/todos/2'])`,
      `[${TODO1}, ${TODO2}]`
    ),
    c('Empty input', 'fetchAllUsers([])', '[]'),
    c('All requests fail', `fetchAllUsers(['https://invalid-non-existent-url-domain.org'])`, '[]'),
    c(`The surviving results keep the order of the URLs`, `(await fetchAllUsers(['https://jsonplaceholder.typicode.com/todos/2', 'https://invalid-non-existent-url-domain.org', 'https://jsonplaceholder.typicode.com/todos/1'])).map((t) => t.id)`, `[2, 1]`),
  ],
  'fetch-abort-controller': [
    c(
      'Request slower than timeoutMs is aborted',
      `fetchWithTimeout('${U}/photos', 1)`,
      '',
      { t: 'abort', x: "Rejects with AbortError (err.name === 'AbortError')" }
    ),
    c('Fast request resolves with its JSON and the timer is cleared', `fetchWithTimeout('${U}/todos/1', 5000)`, TODO1),
    c(
      'Timer cleanup',
      `fetchWithTimeout('${U}/todos/1', 5000)  // then wait past 5000 ms`,
      'No abort fires after the response arrived (clearTimeout was called)',
      { v: false, note: 'needs fake timers' }
    ),
  ],
  'debounce-implementation': [
    c(
      'Three rapid calls collapse to one invocation',
      'let count = 0;\nconst d = debounce(() => count++, 50);\nd(); d(); d();\nawait sleep(100);\ncount',
      '1'
    ),
    c('Not invoked before the delay has elapsed', 'let count = 0;\nconst d = debounce(() => count++, 50);\nd();\nawait sleep(20);\ncount', '0'),
    c(
      'Last call wins: forwards the latest arguments',
      'const got = [];\nconst d = debounce((...a) => got.push(a), 50);\nd(1); d(2); d(3);\nawait sleep(100);\ngot',
      '[[3]]'
    ),
    c(
      'Preserves the calling `this`',
      'let seen;\nconst o = { n: 7, f: debounce(function () { seen = this.n; }, 20) };\no.f();\nawait sleep(60);\nseen',
      '7'
    ),
  ],
  'throttle-implementation': [
    c('Burst of 3 calls runs fn once immediately', 'let runs = 0;\nconst t = throttle(() => runs++, 60);\nt(); t(); t();\nruns', '1'),
    c(
      'Runs again once the window has passed',
      'let runs = 0;\nconst t = throttle(() => runs++, 60);\nt(); t(); t();\nawait sleep(80);\nt();\nruns',
      '2'
    ),
    c('Forwards arguments of the call that ran', "const got = [];\nconst t = throttle((x) => got.push(x), 50);\nt('a'); t('b');\ngot", "['a']"),
    c(`Each window allows one run: three spaced-out calls run three times`, `let runs = 0;
const t = throttle(() => runs++, 50);
t();
await sleep(90);
t();
await sleep(90);
t();
runs`, `3`),
    c(`Calls inside the window are dropped, not queued for later`, `const got = [];
const t = throttle((x) => got.push(x), 50);
t('a'); t('b');
await sleep(100);
got`, `['a']`),
  ],
  'map-frequency-counter': [
    c(
      'Counts repeated items',
      "countFrequencies(['a', 'b', 'a', 'c', 'b', 'a'])",
      "Map(3) { 'a' => 3, 'b' => 2, 'c' => 1 }",
      { ev: "new Map([['a', 3], ['b', 2], ['c', 1]])" }
    ),
    c('Empty array', 'countFrequencies([])', 'Map(0) {}', { ev: 'new Map()' }),
    c('1 and "1" are different keys', "countFrequencies([1, '1', 1])", "Map(2) { 1 => 2, '1' => 1 }", { ev: "new Map([[1, 2], ['1', 1]])" }),
    c(`The result is a Map that keeps first-seen order and has no entry for unseen items`, `const m = countFrequencies(['x', 'y', 'x']);
[m instanceof Map, [...m.keys()], m.get('x'), m.get('z')]`, `[true, ['x', 'y'], 2, undefined]`),
    c(`NaN is counted as a single key (Map uses SameValueZero)`, `countFrequencies([NaN, NaN, 1]).get(NaN)`, `2`),
  ],
  'set-unique-operations': [
    c('Duplicates collapse to a single value', 'arrayIntersection([1, 2, 2, 1], [2, 2])', '[2]'),
    c('No common elements', 'arrayIntersection([1, 2], [3, 4])', '[]'),
    c('Either side empty', 'arrayIntersection([], [1, 2])', '[]'),
    c('Order of first appearance in the second array', 'arrayIntersection([4, 9, 5], [9, 4, 9, 8, 4])', '[9, 4]'),
  ],
  'array-flatten-recursive': [
    c('Mixed nesting', 'flatten([1, [2, [3, 4], 5]])', '[1, 2, 3, 4, 5]'),
    c('Deeply nested single value', 'flatten([[[[1]]]])', '[1]'),
    c('Empty arrays at any depth vanish', 'flatten([[], [[]]])', '[]'),
    c('Already flat', 'flatten([1, 2, 3])', '[1, 2, 3]'),
  ],
  'custom-array-reduce': [
    c('With initialValue', 'myReduce([1, 2, 3, 4], (a, b) => a + b, 0)', '10'),
    c('Without initialValue the first element is the accumulator', 'myReduce([1, 2, 3, 4], (a, b) => a + b)', '10'),
    c('Callback receives (acc, value, index)', "myReduce(['a', 'b'], (acc, v, i) => acc + i + v, '')", "'0a1b'"),
    c('Empty array WITH initialValue returns it', "myReduce([], (a, b) => a + b, 'x')", "'x'"),
    c('Empty array WITHOUT initialValue throws', 'myReduce([], (a, b) => a + b)', '', {
      t: 'empty array',
      x: 'Throws TypeError: Reduce of empty array with no initial value',
    }),
  ],
  'object-deep-clone': [
    c(
      'Changing the clone does not change the original',
      'const o = { x: [1, 2], y: { z: 3 } };\nconst c = deepClone(o);\nc.x.push(3);\n[o.x.length, c.x.length]',
      '[2, 3]'
    ),
    c('Structure is copied exactly', 'deepClone({ a: 1, b: { c: [1, { d: 2 }] } })', '{ a: 1, b: { c: [1, { d: 2 }] } }'),
    c('Nested objects are new references', 'const o = { n: { v: 1 } };\nconst c = deepClone(o);\nc.n === o.n', 'false'),
    c('Primitives and null pass through', '[deepClone(5), deepClone(null), deepClone("s")]', "[5, null, 's']"),
  ],
  'lru-cache-implementation': [
    c('get returns a stored value', 'const lru = new LRUCache(2);\nlru.put(1, 1); lru.put(2, 2);\nlru.get(1)', '1'),
    c(
      'Least recently used key is evicted (key 1 was just read, so 2 goes)',
      'const lru = new LRUCache(2);\nlru.put(1, 1); lru.put(2, 2);\nlru.get(1);\nlru.put(3, 3);\nlru.get(2)',
      '-1'
    ),
    c(
      'Recently read key survives eviction',
      'const lru = new LRUCache(2);\nlru.put(1, 1); lru.put(2, 2);\nlru.get(1);\nlru.put(3, 3);\n[lru.get(1), lru.get(3)]',
      '[1, 3]'
    ),
    c(
      'Updating an existing key refreshes it and overwrites its value',
      'const lru = new LRUCache(2);\nlru.put(1, 1); lru.put(2, 2);\nlru.put(1, 10);\nlru.put(3, 3);\n[lru.get(1), lru.get(2)]',
      '[10, -1]'
    ),
    c('Missing key', 'new LRUCache(1).get(9)', '-1'),
  ],
  'controlled-vs-uncontrolled-input': [
    c('Input mirrors state (controlled)', "type 'react' into the input", "input.value === 'react' after each keystroke (value + onChange, never defaultValue)", { v: false, note: 'needs a React renderer' }),
    c('Submit trims whitespace', "type '  react hooks  ', submit the form", "onSearch called once with 'react hooks'", { v: false }),
    c('Submit does not reload the page', 'submit the form', 'event.preventDefault() was called', { v: false }),
    c('Submit passes the query string only', "type 'a', submit", "onSearch.mock.calls → [['a']]", { v: false }),
  ],
  'hook-use-previous': [
    c('Value from the previous render', 'renders with value 1, then 2, then 3 → read usePrevious(value) each time', '[undefined, 1, 2]', { v: false, note: 'needs a React renderer' }),
    c('Re-render with the same value', 'renders with value 5, then 5 again', '[undefined, 5]', { v: false }),
    c('Works with objects (reference, not copy)', 'renders with a = {id:1}, then b = {id:2}', 'second render returns the exact object a (=== a)', { v: false }),
  ],
  'use-reducer-todo-list': [
    c(
      'ADD_TODO appends an item with done: false (generated id ignored here)',
      "todoReducer([], { type: 'ADD_TODO', payload: 'Practice' }).map(({ text, done }) => ({ text, done }))",
      "[{ text: 'Practice', done: false }]"
    ),
    c(
      'TOGGLE_TODO flips only the matching item',
      "todoReducer([{ id: 1, text: 'A', done: false }, { id: 2, text: 'B', done: true }], { type: 'TOGGLE_TODO', payload: 1 })",
      "[{ id: 1, text: 'A', done: true }, { id: 2, text: 'B', done: true }]"
    ),
    c(
      'REMOVE_TODO removes the matching item',
      "todoReducer([{ id: 1, text: 'A', done: false }, { id: 2, text: 'B', done: true }], { type: 'REMOVE_TODO', payload: 2 })",
      "[{ id: 1, text: 'A', done: false }]"
    ),
    c(
      'Unknown action returns the same state object',
      "const s = [{ id: 1, text: 'A', done: false }];\ntodoReducer(s, { type: 'NOOP' }) === s",
      'true'
    ),
  ],
  'context-provider-consumer': [
    c('Default theme inside the provider', 'useTheme() inside <ThemeProvider>', "theme === 'light'", { v: false, note: 'needs a React renderer' }),
    c('Toggling', 'call toggle once, then twice', "theme === 'dark', then 'light'", { v: false }),
    c('Used outside the provider', 'useTheme() with no <ThemeProvider> ancestor', "Throws Error with a helpful message, e.g. 'useTheme must be used within a ThemeProvider'", { v: false }),
  ],
  'two-pointer-sorted-sum': [
    c('Pair at the ends', 'twoSumSorted([2, 7, 11, 15], 9)', '[1, 2]'),
    c('1-indexed result', 'twoSumSorted([2, 3, 4], 6)', '[1, 3]'),
    c('Negative numbers', 'twoSumSorted([-1, 0], -1)', '[1, 2]'),
    c('Duplicate values', 'twoSumSorted([3, 3], 6)', '[1, 2]'),
    c('No pair sums to target (empty array)', 'twoSumSorted([1, 2, 3], 7)', '[]'),
    c(`The same element cannot be used twice`, `twoSumSorted([1, 2, 4], 4)`, `[]`),
    c(`Both pointers move inward until they meet the pair`, `twoSumSorted([1, 3, 4, 6, 9], 15)`, `[4, 5]`),
  ],
};
