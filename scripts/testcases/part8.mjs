import { c } from './part1.mjs';

const r = (d, i, e) => c(d, i, e, { v: false, note: 'covered by the DOM harness' });
const MEM = `const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, v); } }; };`;
const T = `const n = (val, left = null, right = null) => ({ val, left, right });`;

// Cases for the easy-rung cards added with the difficulty ladder.
export default {
  'sleep-and-delay': [
    c('sleep resolves with undefined after about ms', `const t = Date.now();
const v = await sleep(40);
[v, Date.now() - t >= 35]`, '[undefined, true]'),
    c('sleep does not resolve early', `let done = false;
sleep(60).then(() => { done = true; });
await sleep(20);
done`, 'false'),
    c('delay resolves with the value', `await delay('hello', 20)`, "'hello'"),
    c('delay keeps non-string values', `await delay({ a: 1 }, 5)`, '{ a: 1 }'),
    c('measure returns elapsed milliseconds', `const ms = await measure(() => sleep(50));
ms >= 45 && ms < 400`, 'true'),
    c('measure waits for the promise returned by fn', `let finished = false;
await measure(async () => { await sleep(20); finished = true; });
finished`, 'true'),
  ],
  'memoize-basics': [
    c('memoizeOne calls fn once per distinct argument', `let calls = 0;
const sq = memoizeOne((n) => { calls++; return n * n; });
[sq(3), sq(3), sq(4), sq(3), calls]`, '[9, 9, 16, 9, 2]'),
    c('memoizeOne caches undefined and falsy results', `let calls = 0;
const f = memoizeOne((x) => { calls++; return x === 'u' ? undefined : 0; });
f('u'); f('u'); f('z'); f('z');
calls`, '2'),
    c('memoizeOne works with object keys by reference', `let calls = 0;
const f = memoizeOne((o) => { calls++; return o.v; });
const a = { v: 1 };
[f(a), f(a), f({ v: 1 }), calls]`, '[1, 1, 1, 2]'),
    c('memoizeLast remembers only the last argument', `let calls = 0;
const f = memoizeLast((n) => { calls++; return n + 1; });
[f(1), f(1), f(2), f(1), calls]`, '[2, 2, 3, 2, 3]'),
    c('memoizeLast treats NaN as equal to NaN', `let calls = 0;
const f = memoizeLast((n) => { calls++; return 'x'; });
f(NaN); f(NaN);
calls`, '1'),
  ],
  'callback-emitter': [
    c('emit calls the listener with the arguments', `const e = createEmitter();
const got = [];
e.on('msg', (a, b) => got.push([a, b]));
e.emit('msg', 1, 2);
got`, '[[1, 2]]'),
    c('Several listeners run in registration order', `const e = createEmitter();
const order = [];
e.on('x', () => order.push('first'));
e.on('x', () => order.push('second'));
e.emit('x');
order`, "['first', 'second']"),
    c('emit returns the number of listeners called', `const e = createEmitter();
e.on('x', () => {});
e.on('x', () => {});
[e.emit('x'), e.emit('nobody')]`, '[2, 0]'),
    c('Events are independent', `const e = createEmitter();
let a = 0, b = 0;
e.on('a', () => a++);
e.on('b', () => b++);
e.emit('a'); e.emit('a'); e.emit('b');
[a, b]`, '[2, 1]'),
    c('Emitting without listeners does not throw', `createEmitter().emit('ghost', 1, 2, 3)`, '0'),
  ],
  'fifo-cache': [
    c('get returns stored values, undefined when missing', `const c = new FifoCache(2);
c.set('a', 1);
[c.get('a'), c.get('zzz')]`, '[1, undefined]'),
    c('The oldest key is evicted past the capacity', `const c = new FifoCache(2);
c.set('a', 1); c.set('b', 2); c.set('c', 3);
[c.get('a'), c.get('b'), c.get('c'), c.size]`, '[undefined, 2, 3, 2]'),
    c('Updating an existing key does not change its age', `const c = new FifoCache(2);
c.set('a', 1); c.set('b', 2);
c.set('a', 10);
c.set('c', 3);
[c.get('a'), c.get('b'), c.get('c')]`, '[undefined, 2, 3]'),
    c('get never changes the eviction order', `const c = new FifoCache(2);
c.set('a', 1); c.set('b', 2);
c.get('a');
c.set('c', 3);
[c.get('a'), c.get('b')]`, '[undefined, 2]'),
    c('Falsy values are stored', `const c = new FifoCache(1);
c.set('z', 0);
[c.get('z'), c.size]`, '[0, 1]'),
  ],
  'shallow-copy-equal': [
    c('shallowCopy copies the container but shares nested values', `const nested = { n: 1 };
const copy = shallowCopy({ a: 1, nested });
[copy.a, copy.nested === nested, copy !== undefined]`, '[1, true, true]'),
    c('shallowCopy of an array is a new array', `const a = [1, 2, 3];
const b = shallowCopy(a);
b.push(4);
[a.length, b.length, Array.isArray(b)]`, '[3, 4, true]'),
    c('shallowCopy returns primitives as they are', `[shallowCopy(5), shallowCopy('s'), shallowCopy(null)]`, "[5, 's', null]"),
    c('shallowEqual: same keys and Object.is values', `[shallowEqual({ a: 1, b: 'x' }, { b: 'x', a: 1 }), shallowEqual({ a: 1 }, { a: 2 })]`, '[true, false]'),
    c('shallowEqual: nested objects compare by reference', `const n = {};
[shallowEqual({ n }, { n }), shallowEqual({ n: {} }, { n: {} })]`, '[true, false]'),
    c('shallowEqual: different key counts, arrays vs objects, NaN', `[shallowEqual({ a: 1 }, { a: 1, b: 2 }), shallowEqual([1], { 0: 1 }), shallowEqual({ x: NaN }, { x: NaN }), shallowEqual([1, 2], [1, 2])]`, '[false, false, true, true]'),
    c('shallowEqual: primitives and null', `[shallowEqual(1, 1), shallowEqual(null, {}), shallowEqual(null, null)]`, '[true, false, true]'),
  ],
  'tree-depth-sum': [
    c('maxDepth of an empty tree is 0', `${T}\n[maxDepth(null), maxDepth(undefined)]`, '[0, 0]'),
    c('maxDepth of a single node is 1', `${T}\nmaxDepth(n(5))`, '1'),
    c('maxDepth follows the longest path', `${T}\nmaxDepth(n(1, n(2, n(4, n(8))), n(3)))`, '4'),
    c('sumTree adds every value', `${T}\nsumTree(n(1, n(2), n(3, n(4), null)))`, '10'),
    c('sumTree of an empty tree', `${T}\nsumTree(null)`, '0'),
    c('countLeaves counts nodes without children', `${T}\n[countLeaves(n(1, n(2), n(3, n(4), n(5)))), countLeaves(n(1)), countLeaves(null)]`, '[3, 1, 0]'),
  ],
  'interval-overlap': [
    c('overlaps: partial overlap and containment', `[overlaps([1, 5], [4, 8]), overlaps([1, 10], [3, 4])]`, '[true, true]'),
    c('overlaps: touching endpoints count (closed intervals)', `overlaps([1, 3], [3, 5])`, 'true'),
    c('overlaps: disjoint intervals', `[overlaps([1, 2], [3, 4]), overlaps([5, 6], [1, 4])]`, '[false, false]'),
    c('intersection returns the shared part', `[intersection([1, 5], [3, 9]), intersection([1, 10], [4, 6])]`, '[[3, 5], [4, 6]]'),
    c('intersection is null when disjoint, a point when touching', `[intersection([1, 2], [3, 4]), intersection([1, 3], [3, 5])]`, '[null, [3, 3]]'),
    c('totalLength counts overlapping parts once', `totalLength([[1, 4], [3, 6], [8, 10]])`, '7'),
    c('totalLength handles unsorted input and empty input', `[totalLength([[8, 10], [1, 4], [2, 3]]), totalLength([])]`, '[5, 0]'),
  ],
  'bind-method-partial': [
    c('bindMethod keeps this when the method is extracted', `const user = { name: 'Ada', hi(greeting) { return greeting + ', ' + this.name; } };
const hi = bindMethod(user, 'hi');
hi('Hello')`, "'Hello, Ada'"),
    c('bindMethod follows later changes to the object', `const o = { n: 1, get() { return this.n; } };
const get = bindMethod(o, 'get');
o.n = 2;
get()`, '2'),
    c('partial prepends preset arguments', `const add3 = (a, b, c) => a + b + c;
partial(add3, 1, 2)(3)`, '6'),
    c('partial can be called many times', `const greet = (greeting, name) => greeting + ' ' + name;
const hello = partial(greet, 'Hello');
[hello('Ada'), hello('Grace')]`, "['Hello Ada', 'Hello Grace']"),
    c('partial with no presets behaves like the original', `partial(Math.max)(3, 9, 4)`, '9'),
  ],
  'safe-json-storage': [
    c('safeParse parses valid JSON', `[safeParse('{"a":[1,2]}', null), safeParse('7', 0), safeParse('"x"', '')]`, "[{ a: [1, 2] }, 7, 'x']"),
    c('safeParse returns the fallback on invalid JSON', `[safeParse('{oops', 'fb'), safeParse('', 'fb'), safeParse(undefined, 'fb'), safeParse(null, 'fb')]`, "['fb', 'fb', 'fb', 'fb']"),
    c('safeSet stores JSON and returns true', `${MEM}\nconst s = mem();\n[safeSet(s, 'k', { a: 1 }), s.getItem('k')]`, `[true, '{"a":1}']`),
    c('safeGet reads it back and falls back when missing', `${MEM}\nconst s = mem();\nsafeSet(s, 'k', [1, 2]);\n[safeGet(s, 'k', null), safeGet(s, 'missing', 'none')]`, "[[1, 2], 'none']"),
    c('safeGet falls back on corrupt stored text', `${MEM}\nconst s = mem();\ns.setItem('bad', '{not json');\nsafeGet(s, 'bad', 'recovered')`, "'recovered'"),
    c('safeSet returns false when the storage throws', `safeSet({ setItem() { throw new Error('QuotaExceededError'); } }, 'k', 1)`, 'false'),
  ],
  'run-in-sequence': [
    c('runSequentially returns the results in order', `await runSequentially([() => 1, async () => 2, () => Promise.resolve(3)])`, '[1, 2, 3]'),
    c('runSequentially starts a task only after the previous finished', `const log = [];
const task = (name, ms) => async () => { log.push('start ' + name); await sleep(ms); log.push('end ' + name); return name; };
await runSequentially([task('a', 30), task('b', 5)]);
log`, "['start a', 'end a', 'start b', 'end b']"),
    c('runSequentially stops at the first failure', `const log = [];
await runSequentially([async () => log.push('one'), async () => { throw new Error('stop'); }, async () => log.push('three')]).catch(() => {});
log`, "['one']"),
    c('runSequentially rejects with the failing error', `await runSequentially([() => 1, () => { throw new Error('boom'); }]).catch((e) => e.message)`, "'boom'"),
    c('runInParallel starts everything at once but keeps result order', `const log = [];
const task = (name, ms) => async () => { log.push('start ' + name); await sleep(ms); return name; };
const out = await runInParallel([task('slow', 30), task('fast', 5)]);
[out, log]`, "[['slow', 'fast'], ['start slow', 'start fast']]"),
    c('Empty task lists resolve to an empty array', `[await runSequentially([]), await runInParallel([])]`, '[[], []]'),
  ],
  'parse-style-string': [
    c('parseStyle reads declarations and camelCases names', `parseStyle('color: red; margin-top: 4px;')`, "{ color: 'red', marginTop: '4px' }"),
    c('parseStyle trims whitespace and ignores empty declarations', `parseStyle('  color :  blue ;; ; padding: 0 ')`, "{ color: 'blue', padding: '0' }"),
    c('parseStyle splits on the first colon only', `parseStyle('background: url(http://x.test/a.png)')`, "{ background: 'url(http://x.test/a.png)' }"),
    c('parseStyle of an empty string', `parseStyle('')`, '{}'),
    c('styleToString converts back to kebab-case', `styleToString({ marginTop: '4px', color: 'red' })`, "'margin-top: 4px; color: red;'"),
    c('Round trip', `styleToString(parseStyle('font-size: 12px; z-index: 3;'))`, "'font-size: 12px; z-index: 3;'"),
  ],
  'parse-path-params': [
    c('Captures named params', `parsePath('/users/:id/posts/:postId', '/users/7/posts/42')`, "{ id: '7', postId: '42' }"),
    c('A static pattern returns an empty object', `parsePath('/about', '/about')`, '{}'),
    c('Different segment counts do not match', `[parsePath('/users/:id', '/users'), parsePath('/users/:id', '/users/1/extra')]`, '[null, null]'),
    c('A different static segment does not match', `parsePath('/users/:id', '/people/3')`, 'null'),
    c('Trailing slash, query and hash are ignored', `parsePath('/users/:id', '/users/9/?tab=posts#top')`, "{ id: '9' }"),
  ],
  'focus-on-mount': [
    r('Renders a labelled input with the placeholder', "<FocusInput label='Name' placeholder='Ada' />", "<label> text 'Name' wrapping an <input placeholder='Ada'>"),
    r('The input is focused after mount', 'mount <FocusInput />', 'document.activeElement is the input'),
    r('Re-rendering does not steal focus again', 'focus another button, then rerender FocusInput with new props', 'the other button keeps focus'),
    r("Focuses the input again when the component is mounted anew", "unmount FocusInput, mount a new one", "the new input is document.activeElement"),
  ],
};
