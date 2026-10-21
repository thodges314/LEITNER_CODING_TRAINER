// Overrides (replace a card's cases) and appends (add cases to a card) applied after part1-3.
// React/DOM cards are verified by their hand-written harness (scripts/cards/<id>.harness.js);
// their case descriptions are identical to the harness labels, and a test enforces that.
import { c } from './part1.mjs';

const U = 'https://jsonplaceholder.typicode.com';

/** Scenario documented as input -> expected; asserted by the card's DOM harness under the same label. */
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by the DOM harness', ...o });

const MK = "const mk = (id, children = [], cls = []) => ({ id, children, classList: { contains: (c) => cls.includes(c) } });";
const TREE = `${MK}\nconst root = mk('root', [mk('A', [mk('A1'), mk('A2')]), mk('B')]);`;
const LIMITER = `let t = 0;\nconst mw = rateLimiter({ limit: 2, windowMs: 1000, now: () => t });\nconst call = (ip) => { const res = { statusCode: 200, headers: {}, setHeader(k, v) { this.headers[k] = v; }, end() {} }; let passed = false; mw({ ip }, res, () => { passed = true; }); return [passed, res.statusCode, res.headers['Retry-After']]; };`;

export const overrides = {
  'promise-chaining-syntax': [
    c('Resolves with parsed JSON (no async/await)', `(await getUserData('${U}/users/1')).name`, "'Leanne Graham'"),
    c('HTTP error still rejects after the .catch() log (error is rethrown)', `getUserData('${U}/invalid-path-404')`, '', {
      t: '404',
      x: 'Rejects with Error — message contains "404"',
    }),
    c(
      'Cleanup log runs in .finally() after a success',
      `const lines = [];\nconst realConsole = console;\nconsole = { log: (...a) => lines.push(a.join(' ')), error() {}, warn() {}, info() {} };\ntry { await getUserData('${U}/users/1'); } finally { console = realConsole; }\nlines.length`,
      '1  (exactly one console.log, from .finally())',
      { ev: '1' }
    ),
    c(
      'Cleanup log runs in .finally() after a failure too',
      `const lines = [];\nconst realConsole = console;\nconsole = { log: (...a) => lines.push(a.join(' ')), error() {}, warn() {}, info() {} };\ntry { await getUserData('${U}/invalid-path-404'); } catch {} finally { console = realConsole; }\nlines.length`,
      '1  (exactly one console.log, from .finally())',
      { ev: '1' }
    ),
  ],
  'fetch-abort-controller': [
    c('Request slower than timeoutMs is aborted', `fetchWithTimeout('${U}/photos', 1)`, '', {
      t: 'abort',
      x: "Rejects with AbortError (err.name === 'AbortError')",
    }),
    c('Fast request resolves with its JSON and the timer is cleared', `fetchWithTimeout('${U}/todos/1', 5000)`, "{ userId: 1, id: 1, title: 'delectus aut autem', completed: false }"),
    c(
      'clearTimeout is called after a successful response',
      `const realClear = globalThis.clearTimeout;\nlet cleared = 0;\nglobalThis.clearTimeout = (id) => { cleared++; return realClear(id); };\ntry { await fetchWithTimeout('${U}/todos/1', 5000); } finally { globalThis.clearTimeout = realClear; }\ncleared >= 1`,
      'true',
    ),
    c(`A network failure rejects with the original error instead of hanging`, `fetchWithTimeout('https://invalid-non-existent-url-domain.org', 5000)`, ``, { t: `TypeError: Failed to fetch`, x: `Rejects with the network error (TypeError: Failed to fetch)` }),
  ],
  'use-reducer-todo-list': [
    c('ADD_TODO appends an unchecked todo with the next id', "todoReducer([], { type: 'ADD_TODO', payload: 'Practice' })", "[{ id: 1, text: 'Practice', done: false }]"),
    c('ADD_TODO uses max id + 1, even after removals', "todoReducer([{ id: 1, text: 'A', done: false }, { id: 3, text: 'C', done: false }], { type: 'ADD_TODO', payload: 'D' })", "[{ id: 1, text: 'A', done: false }, { id: 3, text: 'C', done: false }, { id: 4, text: 'D', done: false }]"),
    c('TOGGLE_TODO flips only the matching item', "todoReducer([{ id: 1, text: 'A', done: false }, { id: 2, text: 'B', done: true }], { type: 'TOGGLE_TODO', payload: 1 })", "[{ id: 1, text: 'A', done: true }, { id: 2, text: 'B', done: true }]"),
    c('REMOVE_TODO removes the matching item', "todoReducer([{ id: 1, text: 'A', done: false }, { id: 2, text: 'B', done: true }], { type: 'REMOVE_TODO', payload: 2 })", "[{ id: 1, text: 'A', done: false }]"),
    c('Unknown action returns the same state object', "const s = [{ id: 1, text: 'A', done: false }];\ntodoReducer(s, { type: 'NOOP' }) === s", 'true'),
    r('Works with useReducer inside a component', "useReducer(todoReducer, []): dispatch ADD_TODO 'Practice', ADD_TODO 'Rest', TOGGLE_TODO 1, REMOVE_TODO 2", "[{ id: 1, text: 'Practice', done: true }]"),
  ],
  'todo-list-reducer': [
    c('ADD appends an unchecked todo', "todoReducer({ todos: [], filter: 'all' }, { type: 'ADD', id: 1, text: 'a' })", "{ todos: [{ id: 1, text: 'a', done: false }], filter: 'all' }"),
    c('TOGGLE flips done for the matching id only', "todoReducer({ todos: [{ id: 1, text: 'a', done: false }, { id: 2, text: 'b', done: false }], filter: 'all' }, { type: 'TOGGLE', id: 2 })", "{ todos: [{ id: 1, text: 'a', done: false }, { id: 2, text: 'b', done: true }], filter: 'all' }"),
    c('EDIT changes the text only', "todoReducer({ todos: [{ id: 1, text: 'a', done: true }], filter: 'all' }, { type: 'EDIT', id: 1, text: 'b' })", "{ todos: [{ id: 1, text: 'b', done: true }], filter: 'all' }"),
    c('DELETE removes by id', "todoReducer({ todos: [{ id: 1, text: 'a', done: false }, { id: 2, text: 'b', done: false }], filter: 'all' }, { type: 'DELETE', id: 1 })", "{ todos: [{ id: 2, text: 'b', done: false }], filter: 'all' }"),
    c('SET_FILTER changes the filter', "todoReducer({ todos: [], filter: 'all' }, { type: 'SET_FILTER', filter: 'done' })", "{ todos: [], filter: 'done' }"),
    c('Unknown action returns the same state object', "const s = { todos: [], filter: 'all' };\ntodoReducer(s, { type: 'NOPE' }) === s", 'true'),
    c('Never mutates the previous state', "const s = { todos: [{ id: 1, text: 'a', done: false }], filter: 'all' };\nconst before = JSON.stringify(s);\ntodoReducer(s, { type: 'TOGGLE', id: 1 });\nJSON.stringify(s) === before", 'true'),
    c('selectVisibleTodos honors the filter', "selectVisibleTodos({ todos: [{ id: 1, text: 'a', done: true }, { id: 2, text: 'b', done: false }], filter: 'done' }).map((t) => t.id)", '[1]'),
    c('selectCounts is derived from the todos', "selectCounts({ todos: [{ id: 1, text: 'a', done: true }, { id: 2, text: 'b', done: false }], filter: 'all' })", '{ total: 2, active: 1, done: 1 }'),
  ],
  'rate-limiter-middleware': [
    c('Allows `limit` requests, then answers 429 with Retry-After and does not call next()', `${LIMITER}\n[call('a'), call('a'), call('a')]`, "[[true, 200, undefined], [true, 200, undefined], [false, 429, '1']]"),
    c('A different client has its own bucket', `${LIMITER}\ncall('a'); call('a'); call('a');\ncall('b')`, '[true, 200, undefined]'),
    c('Tokens refill over time (limit 2 per 1000 ms ⇒ 1 token per 500 ms)', `${LIMITER}\ncall('a'); call('a'); call('a');\nt = 500;\ncall('a')`, '[true, 200, undefined]'),
    c('Retry-After is whole seconds until a token is available', "let t = 0;\nconst mw = rateLimiter({ limit: 1, windowMs: 10000, now: () => t });\nconst res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end() {} };\nmw({ ip: 'a' }, res, () => {});\nmw({ ip: 'a' }, res, () => {});\nres.headers['Retry-After']", "'10'"),
    c('Idle clients are evicted (a and b are gone after a full window)', `${LIMITER}\ncall('a'); call('b');\nt = 2000;\ncall('c');\nmw.size()`, '1'),
  ],
  'retry-with-backoff': [
    c('Succeeds after one failure', "let calls = 0;\nconst flaky = async () => { if (++calls < 2) throw new Error('fail'); return 'success'; };\nawait retry(flaky, { retries: 3, baseDelay: 10 })", "'success'"),
    c('Attempt count is failures + 1', "let calls = 0;\nconst flaky = async () => { if (++calls < 3) throw new Error('fail'); return 'ok'; };\nawait retry(flaky, { retries: 5, baseDelay: 5 });\ncalls", '3'),
    c('Gives up after `retries` retries (1 try + 2 retries = 3 calls)', "let calls = 0;\nawait retry(async () => { calls++; throw new Error('nope'); }, { retries: 2, baseDelay: 5 }).catch(() => {});\ncalls", '3'),
    c('The last error is what rejects', "retry(async () => { throw new Error('nope'); }, { retries: 1, baseDelay: 5 })", '', { t: 'nope', x: 'Rejects with Error: nope' }),
    c('Delay between attempts grows by `factor` (30 ms, then 60 ms)', "const stamps = [];\nawait retry(async () => { stamps.push(Date.now()); throw new Error('x'); }, { retries: 2, baseDelay: 30, factor: 2 }).catch(() => {});\nconst gaps = [stamps[1] - stamps[0], stamps[2] - stamps[1]];\ngaps[0] >= 25 && gaps[0] < 60 && gaps[1] >= 55 && gaps[1] < 120", 'true  (gaps ≈ 30 ms then ≈ 60 ms)', { ev: 'true' }),
    c('Aborting during a backoff wait rejects promptly with the abort reason', "const ac = new AbortController();\nconst p = retry(async () => { throw new Error('fail'); }, { retries: 5, baseDelay: 1000, signal: ac.signal });\nsetTimeout(() => ac.abort(), 20);\nconst t0 = Date.now();\nconst err = await p.catch((e) => e);\n[err.name, Date.now() - t0 < 200]", "['AbortError', true]"),
    c('Already-aborted signal rejects without calling fn', "const ac = new AbortController();\nac.abort();\nlet called = false;\nawait retry(async () => { called = true; }, { signal: ac.signal }).catch(() => {});\ncalled", 'false'),
    c(`Defaults to 3 retries (4 calls in total)`, `let calls = 0;
await retry(async () => { calls++; throw new Error('x'); }).catch(() => {});
calls`, `4`),
    c(`The default delays (20, 40, 80 ms) really are waited`, `const t0 = Date.now();
await retry(async () => { throw new Error('x'); }).catch(() => {});
const elapsed = Date.now() - t0;
elapsed >= 130 && elapsed < 450`, `true  (about 140 ms of waiting in total)`, { ev: `true` }),
  ],
  'tree-traversal-dom': [
    c('dfsRecursive visits in pre-order', `${TREE}\ndfsRecursive(root).map((n) => n.id)`, "['root', 'A', 'A1', 'A2', 'B']"),
    c('dfsIterative gives the same pre-order', `${TREE}\ndfsIterative(root).map((n) => n.id)`, "['root', 'A', 'A1', 'A2', 'B']"),
    c('bfs visits level by level', `${TREE}\nbfs(root).map((n) => n.id)`, "['root', 'A', 'B', 'A1', 'A2']"),
    c('getElementsByClassName returns matches in document order', `${MK}\nconst dom = mk('root', [mk('el-1', [], ['hit']), mk('wrap', [mk('el-2', [], ['hit'])])]);\ngetElementsByClassName(dom, 'hit').map((n) => n.id)`, "['el-1', 'el-2']"),
    c('getElementsByClassName: no match', `${MK}\ngetElementsByClassName(mk('root', [mk('x', [], ['a'])]), 'hit')`, '[]'),
    c('getElementsByClassName: the root itself can match', `${MK}\ngetElementsByClassName(mk('r', [], ['hit']), 'hit').map((n) => n.id)`, "['r']"),
    c('findPath returns the ids from the root to the node', `${TREE}\nfindPath(root, 'A2')`, "['root', 'A', 'A2']"),
    c('findPath returns null for a missing id', `${TREE}\nfindPath(root, 'nope')`, 'null'),
    c('dfsIterative survives a 20,000-node-deep chain (recursion would overflow the stack)', `${MK}\nlet node = mk('n0');\nfor (let i = 1; i < 20000; i++) node = mk('n' + i, [node]);\ndfsIterative(node).length`, '20000'),
  ],

  // ---- React / DOM cards: descriptions match the harness labels exactly ----
  'use-fetch-hook': [
    r('Initial render shows loading', "useFetch('/api/a')  // before the request resolves", '{ data: null, error: null, loading: true }'),
    r('Resolves with data on 200', "useFetch('/api/a')  // server answers 200 with { id: 1 }", '{ data: { id: 1 }, error: null, loading: false }'),
    r('Reports an Error on a failed request', "useFetch('/api/a')  // fetch rejects Error('offline')", "{ data: null, error: Error('offline'), loading: false }"),
    r('Changing url aborts the previous request', "rerender url '/api/a' → '/api/b'", "request 1 signal.aborted === true; request 2 signal.aborted === false"),
    r('A stale response never overwrites newer data', "url '/api/a' → '/api/b'; /api/b answers { id: 'b' }, THEN /api/a answers { id: 'a' } (server ignores abort)", "data stays { id: 'b' }"),
    r('Unmounting aborts the in-flight request', 'unmount() while the request is pending', 'signal.aborted === true'),
  ],
  'use-debounce-hook': [
    r('Returns the initial value immediately', "useDebounce('a', 60)", "'a'"),
    r('Waits for the delay before updating', "rerender 'a' → 'b'; read at t = 25 ms and t = 95 ms", "'a' at 25 ms, 'b' at 95 ms"),
    r('Each change restarts the timer', "'a' → 'b' (t = 0) → 'c' (t = 30); read at t = 70 ms and t = 120 ms", "'a' at 70 ms, 'c' at 120 ms"),
    r('Uses the latest delay value', "useDebounce(value, delay): rerender { v: 'b', d: 30 } after starting with { v: 'a', d: 500 }; read at t = 80 ms", "'b' (the new 30 ms delay is used)"),
    r('Unmounting with a pending update is safe', "rerender 'a' → 'x', then unmount(); wait 80 ms", "no error; last returned value stays 'a'"),
  ],
  'controlled-vs-uncontrolled-input': [
    r('Input mirrors typed text (controlled)', "type 'react' into the input", "input.value === 'react' (value comes from state)"),
    r('Submit trims whitespace and calls onSearch once', "type '  react hooks  ', submit the form", "onSearch called once with 'react hooks'"),
    r('Submit prevents the default page reload', 'submit the form', 'event.defaultPrevented === true'),
    r('Input keeps its text after submit', "after submitting '  react hooks  '", "input.value === '  react hooks  '"),
    r('Blank query does not call onSearch', "type '   ', submit the form", 'onSearch is not called again'),
  ],
  'hook-use-previous': [
    r('First render has no previous value', 'usePrevious(1)  // first render', 'undefined'),
    r('Returns the value from the previous render', 'values 1 → 2 → 3, read after each render', '[undefined, 1, 2]'),
    r('Re-rendering with the same value returns it', 'values 3 → 3', '3'),
    r('Works with objects (same reference)', 'values a = { id: 1 } → b = { id: 2 }', 'second render returns exactly a (=== a)'),
  ],
  'context-provider-consumer': [
    r('Default theme is light inside the provider', 'const { ThemeProvider, useTheme } = createThemeContext();\nuseTheme() inside <ThemeProvider>', "theme === 'light'"),
    r('toggle switches light and dark', 'toggle(), then toggle() again', "'dark', then 'light'"),
    r('Outside the provider useTheme throws a helpful error', 'useTheme() with no <ThemeProvider> above', "throws Error('useTheme must be used within a ThemeProvider')"),
    c("defaultTheme sets the initial theme", "<ThemeProvider defaultTheme=\"dark\">", "theme === 'dark'", { v: false, note: 'covered by the DOM harness' }),
    c("The context value keeps its identity while the theme does not change", "re-render a parent so ThemeProvider re-renders with the same state", "consumers receive the identical value object (memoized)", { v: false, note: 'covered by the DOM harness' }),
  ],
  'typeahead-autocomplete': [
    r('Debounces input into a single fetch', "<Typeahead onSelect={handleSelect} fetchSuggestions={fetchSuggestions} delay={30} />", "fetchSuggestions called once, with 'rea'"),
    r('Renders suggestions with combobox ARIA roles', "fetchSuggestions → ['react', 'read', 'real']", "input role='combobox' aria-expanded='true'; role='listbox' containing 3 role='option' items"),
    r('ArrowDown moves the active option', 'ArrowDown, ArrowDown on the input', "aria-selected of the options: ['false', 'true', 'false']"),
    r('Enter selects the active option', 'ArrowDown, ArrowDown, Enter', "onSelect('read') called once; listbox removed"),
    r('Escape closes the list', "type 'real', wait for results, press Escape", "listbox removed; input aria-expanded='false'"),
    r('Ignores out-of-order responses', "request for 're' resolves AFTER request for 'rea' (['stale'] after ['real'])", "options: ['real']"),
  ],
  'use-previous-latest-ref': [
    r('usePrevious returns the previous value', 'usePrevious over 1 → 2 → 3', '[undefined, 1, 2]'),
    r('useInterval ticks at the given delay and stops on unmount', 'useInterval(cb, 30); wait 110 ms; unmount; wait 70 ms', '2–4 calls, and no more after unmount'),
    r('useInterval always calls the latest callback without resetting the timer', 'useInterval(cbA, 60); at 35 ms rerender with cbB; read at 80 ms', 'cbA called 0 times, cbB called 1 time'),
    r('A null delay pauses the interval', 'useInterval(cb, null); wait 90 ms', 'cb called 0 times'),
    r('Switching from null to a delay resumes', 'rerender delay null → 30; wait 100 ms', 'cb called at least 2 times'),
  ],
  'infinite-scroll-list': [
    r('Renders the items', "<InfiniteList items={['a', 'b']} onLoadMore={handleLoadMore} hasMore={true} loading={false} />", "list items ['a', 'b'] (plus the sentinel)"),
    r('Loads the next page when the sentinel becomes visible', 'observer callback([{ isIntersecting: true }])', 'onLoadMore called 1 time'),
    r('Does not load again while a page is loading', 'rerender loading = true; intersect again', 'onLoadMore still called 1 time'),
    r('Stops loading and disconnects at the last page', 'rerender hasMore = false; intersect again', 'onLoadMore still 1 time; observer.disconnect() called'),
    r('Disconnects the observer on unmount', 'unmount()', 'observer.disconnect() called'),
  ],
  'modal-portal-focus': [
    r('Closed modal renders nothing', '<Modal isOpen={false}><p id="msg">Hi</p></Modal>', "no role='dialog' and no #msg in the document"),
    r('Open modal renders through a portal outside its parent', '<div id="host"><Modal isOpen><p id="msg">Hi</p></Modal></div>', '#msg is in document.body but NOT inside #host'),
    r('Escape calls onClose', "keydown 'Escape' on the dialog", 'onClose called once'),
    r('Clicking the backdrop closes but clicking the content does not', "after the Escape above (1 call): click a button inside the dialog, then click the backdrop (the dialog's parent element)", 'call count stays 1 after the content click, becomes 2 after the backdrop click'),
    r('Tab wraps focus inside the dialog', 'focus the last button, press Tab; then on the first button press Shift+Tab', 'focus moves to the first button (default prevented), then to the last button'),
    r('Body scroll is locked while open', 'open the modal', "document.body.style.overflow === 'hidden'"),
    r('Focus returns to the trigger on close', 'focus #trigger, click it, press Escape in the dialog', 'document.activeElement === #trigger'),
    r('Body scroll is restored after close', 'close the modal', "document.body.style.overflow is no longer 'hidden'"),
  ],
  'tabs-accordion-compound': [
    r('defaultValue shows only its panel', "<Tabs defaultValue='one'><TabList><Tab value='one'>One</Tab><Tab value='two'>Two</Tab></TabList><TabPanel value='one'>Panel one</TabPanel><TabPanel value='two'>Panel two</TabPanel></Tabs>", "only 'Panel one' is rendered"),
    r('Clicking a tab switches the panel', "click tab 'two'", "only 'Panel two' rendered; tab two aria-selected='true', tab one 'false'"),
    r('Tabs and panels are wired with ARIA', 'inspect the selected tab and its panel', "role='tablist'; tab aria-controls === panel.id; panel aria-labelledby === tab.id"),
    r('Arrow keys move focus between tabs (wrapping)', "focus tab one, ArrowRight → tab two; ArrowRight ×2 more → wraps to tab one", 'document.activeElement follows: two, then one'),
    r('Controlled mode calls onChange and waits for the value prop', "<Tabs value='one' onChange={handleChange}>...</Tabs>", "fn('two') called; 'Panel one' stays until the prop changes, then 'Panel two'"),
  ],
};

// Cases added to existing cards (their own cases come from part1-3).
export const appends = {
  'flatten-array-object': [
    c('flattenObject keeps empty objects and arrays as leaves', 'flattenObject({ a: {}, b: { c: [] } })', "{ a: {}, 'b.c': [] }"),
  ],
  'deep-equal': [
    c('Circular references are handled', 'const a = { n: 1 };\na.self = a;\nconst b = { n: 1 };\nb.self = b;\ndeepEqual(a, b)', 'true'),
    c('An array is not equal to an object', 'deepEqual([], {})', 'false'),
  ],
  'express-middleware-chain': [
    c('A rejected promise from an async handler reaches the error handler', "const app = new MiddlewarePipeline();\nconst res = {};\napp.use(async () => { throw new Error('late'); });\napp.use((err, req, res, next) => { res.msg = err.message; });\napp.handle({}, res);\nawait sleep(10);\nres.msg", "'late'"),
    c('An error skips normal middleware', "const app = new MiddlewarePipeline();\nconst trail = [];\napp.use(() => { throw new Error('x'); });\napp.use(() => { trail.push('normal'); });\napp.use((err, req, res, next) => { trail.push('error'); });\napp.handle({}, {});\ntrail", "['error']"),
    c('An unhandled error sets res.statusCode = 500', "const app = new MiddlewarePipeline();\nconst res = {};\napp.use(() => { throw new Error('x'); });\napp.handle({}, res);\nres.statusCode", '500'),
  ],
  'event-emitter': [
    c('off() can remove a once() listener before it fires', "const ee = new EventEmitter();\nlet n = 0;\nconst fn = () => n++;\nee.once('e', fn);\nee.off('e', fn);\nee.emit('e');\nn", '0'),
  ],
};


// ---- prompt/title audit fixes ----
appends['set-unique-operations'] = [
  c('arrayUnion: unique elements of both, a first', 'arrayUnion([1, 2, 2], [2, 3, 1, 4])', '[1, 2, 3, 4]'),
  c('arrayUnion: with an empty side', 'arrayUnion([], [5, 5])', '[5]'),
  c('arrayDifference: elements of a that are not in b', 'arrayDifference([1, 2, 3, 3, 4], [2, 4])', '[1, 3]'),
  c('arrayDifference: nothing removed', "arrayDifference(['x'], [])", "['x']"),
];
appends['bind-call-apply'] = [
  c('myCall sets this and spreads the arguments', 'function f(a, b) { return this.x + a + b; }\nf.myCall({ x: 1 }, 2, 3)', '6'),
  c('myApply takes an array of arguments', 'function f(a, b) { return this.x + a + b; }\nf.myApply({ x: 1 }, [2, 3])', '6'),
  c('myCall leaves no stray property on the context', 'function f() { return this.x; }\nconst ctx = { x: 1 };\nf.myCall(ctx);\nReflect.ownKeys(ctx)', "['x']"),
  c('myBind partial application plus a call-time argument', 'function add(a, b, c) { return a + b + c; }\nadd.myBind(null, 1, 2)(3)', '6'),
];
overrides['ts-generic-api-client'] = [
  c('Resolves typed JSON', `interface Todo { id: number; title: string; completed: boolean; }\n(await apiGet<Todo>('${U}/todos/1')).title`, "'delectus aut autem'"),
  c('Whole payload', `interface Todo { id: number; title: string; completed: boolean; }\nawait apiGet<Todo>('${U}/todos/1')`, "{ userId: 1, id: 1, title: 'delectus aut autem', completed: false }"),
  c('Non-2xx rejects with an ApiError carrying the status', `const err = await apiGet<unknown>('${U}/invalid-path-404').catch((e: unknown) => e);\n[err instanceof ApiError, (err as ApiError).status, err instanceof Error]`, '[true, 404, true]'),
  c('The ApiError message includes the status', `const err = await apiGet<unknown>('${U}/invalid-path-404').catch((e: unknown) => e);\n(err as Error).message.includes('404')`, 'true'),
  c('Compile time: result is typed as T', "const t = await apiGet<Todo>(url);\nt.nope", "TS2339 — Property 'nope' does not exist on type 'Todo'", { v: false, note: 'type-level' }),
];
overrides['use-debounce-hook'] = [
  ...overrides['use-debounce-hook'],
  r('useThrottle returns the initial value immediately', "useThrottle('a', 60)", "'a'"),
  r('useThrottle delivers only the latest value at the end of the interval', "rerender 'a' → 'b' → 'c' → 'd' immediately; read at t = 0 ms and t = 120 ms", "'a' at once, then 'd' (values seen: a, d — never b or c)"),
  r('useThrottle applies a change immediately once the interval has elapsed', "after the interval has passed, rerender → 'e'", "'e' straight away"),
];
overrides['use-previous-latest-ref'] = [
  overrides['use-previous-latest-ref'][0],
  r('useLatest keeps one stable ref holding the newest value', "useLatest('one'), then rerender with 'two'", "same ref object; ref.current === 'two'"),
  ...overrides['use-previous-latest-ref'].slice(1),
];
