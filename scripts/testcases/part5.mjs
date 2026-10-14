import { c } from './part1.mjs';

// Cases for new cards, batch 1: JS language, async and utilities.
export default {
  'promise-class-scratch': [
    c('then callbacks run asynchronously, after the synchronous code', `const log = [];
new MyPromise((resolve) => resolve(1)).then(() => log.push('then'));
log.push('sync');
await sleep(0);
log`, "['sync', 'then']"),
    c('Chaining passes each return value along', `await new MyPromise((resolve) => resolve(1)).then((v) => v + 1).then((v) => v * 10)`, '20'),
    c('A rejection skips then() and reaches catch()', `await new MyPromise((_, reject) => reject(new Error('x'))).then(() => 'skipped').catch((e) => e.message)`, "'x'"),
    c('A throw inside a handler rejects the derived promise', `await MyPromise.resolve(1).then(() => { throw new Error('boom'); }).catch((e) => e.message)`, "'boom'"),
    c('Returning a MyPromise from then() adopts its eventual value', `await MyPromise.resolve(1).then((v) => new MyPromise((resolve) => setTimeout(() => resolve(v + 1), 10)))`, '2'),
    c('Returning a native promise (any thenable) is adopted too', `await MyPromise.resolve(1).then((v) => Promise.resolve(v + 5))`, '6'),
    c('Only the first resolve/reject call counts', `await new MyPromise((resolve, reject) => { resolve('a'); reject(new Error('b')); resolve('c'); })`, "'a'"),
    c('An executor that throws rejects the promise', `await new MyPromise(() => { throw new Error('exec'); }).catch((e) => e.message)`, "'exec'"),
    c('Missing handlers pass the value through', `await MyPromise.resolve(7).then().then(undefined, () => 0)`, '7'),
    c('Several then() calls on one promise run in registration order', `const log = [];
const p = MyPromise.resolve(1);
p.then(() => log.push('a'));
p.then(() => log.push('b'));
await p.then(() => log.push('c'));
log`, "['a', 'b', 'c']"),
    c('finally() runs on both outcomes and passes the result through', `const log = [];
const a = await MyPromise.resolve(1).finally(() => log.push('f'));
const b = await MyPromise.reject(new Error('e')).finally(() => log.push('f')).catch((e) => e.message);
[a, b, log.length]`, "[1, 'e', 2]"),
    c('Resolving a promise with itself rejects with a TypeError', `const p = MyPromise.resolve(1).then(() => p);
await p.catch((e) => e instanceof TypeError)`, 'true'),
  ],
  'promisify-callback': [
    c('Resolves with the callback result', `const readLater = (name, cb) => setTimeout(() => cb(null, name.toUpperCase()), 5);
await promisify(readLater)('abc')`, "'ABC'"),
    c('Rejects with the callback error', `const failing = (cb) => setTimeout(() => cb(new Error('disk full')), 5);
await promisify(failing)().catch((e) => e.message)`, "'disk full'"),
    c('Forwards every argument', `const add = (a, b, cb) => cb(null, a + b);
await promisify(add)(2, 3)`, '5'),
    c('Preserves this', `const obj = { n: 10, plus(x, cb) { cb(null, this.n + x); } };
obj.plusAsync = promisify(obj.plus);
await obj.plusAsync(5)`, '15'),
    c('A synchronous throw becomes a rejection', `const bad = () => { throw new Error('sync'); };
await promisify(bad)().catch((e) => e.message)`, "'sync'"),
    c('A falsy error means success', `await promisify((cb) => cb(null, 0))()`, '0'),
  ],
  'iterators-generators': [
    c('range: end is exclusive', `[...range(0, 5)]`, '[0, 1, 2, 3, 4]'),
    c('range with a positive step', `[...range(0, 10, 3)]`, '[0, 3, 6, 9]'),
    c('range with a negative step', `[...range(5, 0, -2)]`, '[5, 3, 1]'),
    c('take is lazy: works on an infinite generator', `function* naturals() { let i = 0; while (true) yield i++; }
[...take(naturals(), 3)]`, '[0, 1, 2]'),
    c('take does not consume an extra item', `let pulled = 0;
function* source() { while (true) { pulled++; yield pulled; } }
[...take(source(), 2)];
pulled`, '2'),
    c('take closes the source iterator (runs finally)', `let closed = false;
function* source() { try { yield 1; yield 2; yield 3; } finally { closed = true; } }
[...take(source(), 2)];
closed`, 'true'),
    c('mapIter is lazy and composes with take and range', `[...take(mapIter(range(0, Infinity), (x) => x * x), 4)]`, '[0, 1, 4, 9]'),
    c('zip pairs items and stops at the shortest input', `[...zip([1, 2, 3], 'ab')]`, "[[1, 'a'], [2, 'b']]"),
    c('Countdown is iterable', `[...new Countdown(3)]`, '[3, 2, 1]'),
    c('Countdown can be iterated more than once', `const c = new Countdown(2);
[[...c], [...c]]`, '[[2, 1], [2, 1]]'),
  ],
  'new-instanceof-create': [
    c('myNew links the prototype and runs the constructor on the new object', `function P(x) { this.x = x; }
P.prototype.get = function () { return this.x; };
const p = myNew(P, 5);
[p.x, p.get(), p instanceof P]`, '[5, 5, true]'),
    c('A constructor returning an object replaces the result', `function F() { this.a = 1; return { b: 2 }; }
myNew(F)`, '{ b: 2 }'),
    c('A constructor returning a primitive is ignored', `function G() { this.a = 1; return 5; }
Object.keys(myNew(G))`, "['a']"),
    c('myInstanceOf walks the prototype chain', `class A {}
class B extends A {}
[myInstanceOf(new B(), A), myInstanceOf(new A(), B), myInstanceOf({}, Object)]`, '[true, false, true]'),
    c('Primitives and null are never instances', `[myInstanceOf(null, Object), myInstanceOf(5, Number), myInstanceOf('s', String)]`, '[false, false, false]'),
    c('objectCreate links the prototype', `const proto = { greet() { return 'hi ' + this.n; } };
const o = objectCreate(proto);
o.n = 'x';
[o.greet(), Object.getPrototypeOf(o) === proto]`, "['hi x', true]"),
    c('objectCreate(null) has no prototype', `Object.getPrototypeOf(objectCreate(null))`, 'null'),
    c('objectCreate applies a propertiesObject', `const o = objectCreate({}, { a: { value: 1, enumerable: true } });
o.a`, '1'),
    c('objectCreate rejects primitive prototypes', `objectCreate(5)`, '', { t: 'TypeError', x: 'Throws TypeError: Object prototype may only be an Object or null' }),
  ],
  'closures-private-state': [
    c('createCounter counts with its step', `const c = createCounter({ start: 5, step: 2 });
c.increment(); c.increment(); c.decrement();
c.value()`, '7'),
    c('reset returns to the start value', `const c = createCounter({ start: 5, step: 2 });
c.increment(); c.increment();
c.reset();
c.value()`, '5'),
    c('Defaults: start 0, step 1', `const c = createCounter();
c.increment();
c.value()`, '1'),
    c('The count is private: only the four methods are exposed', `Object.keys(createCounter({})).sort()`, "['decrement', 'increment', 'reset', 'value']"),
    c('Counters are independent', `const a = createCounter({});
const b = createCounter({});
a.increment();
[a.value(), b.value()]`, '[1, 0]'),
    c('once calls fn a single time and caches the first result', `let n = 0;
const f = once(() => ++n);
[f(), f(), f(), n]`, '[1, 1, 1, 1]'),
    c('once forwards the arguments of the first call', `const f = once((a, b) => a + b);
[f(2, 3), f(10, 10)]`, '[5, 5]'),
    c('makeAdders gives each function its own i', `makeAdders(3).map((add) => add(10))`, '[10, 11, 12]'),
  ],
  'json-stringify-polyfill': [
    c('Objects, arrays, strings, booleans and null', `stringify({ a: 1, b: [true, null, 'x'], c: { d: 'y' } })`, String.raw`'{"a":1,"b":[true,null,"x"],"c":{"d":"y"}}'`),
    c('Quotes and backslashes are escaped', String.raw`stringify('say "hi" \\ bye')`, String.raw`'"say \\"hi\\" \\\\ bye"'`),
    c('Control characters are escaped', String.raw`stringify('a\nb\tc\u0001')`, String.raw`'"a\\nb\\tc\\u0001"'`),
    c('Non-finite numbers become null; -0 becomes 0', `stringify([1, NaN, Infinity, -0, 1.5e3])`, `'[1,null,null,0,1500]'`),
    c('Object properties holding undefined, functions or symbols are skipped', `stringify({ a: undefined, b: () => 1, c: Symbol('s'), d: 1 })`, String.raw`'{"d":1}'`),
    c('Array items that are undefined or functions become null', `stringify([undefined, () => 1, 2])`, `'[null,null,2]'`),
    c('A top-level undefined or function gives undefined', `[stringify(undefined), stringify(() => 1)]`, '[undefined, undefined]'),
    c('Date and toJSON() are honored', `[stringify({ d: new Date(0) }), stringify({ toJSON() { return { x: 1 }; } })]`, String.raw`['{"d":"1970-01-01T00:00:00.000Z"}', '{"x":1}']`),
    c('Empty containers and nesting', `stringify([{}, [], [[1]]])`, `'[{},[],[[1]]]'`),
    c('A circular reference throws TypeError', `const a = {};
a.self = a;
stringify(a)`, '', { t: 'TypeError', x: 'Throws TypeError (circular structure)' }),
    c('Shared (non-circular) references are fine', `const shared = { v: 1 };
stringify([shared, shared])`, String.raw`'[{"v":1},{"v":1}]'`),
  ],
  'infinite-currying-sum': [
    c('Chained calls end with an empty call', `sum(1)(2)(3)()`, '6'),
    c('Arguments can be grouped any way', `sum(1, 2)(3, 4)()`, '10'),
    c('Coerces to a number with unary plus', `+sum(1)(2)(3)`, '6'),
    c('Coerces to a string', `String(sum(1)(2))`, "'3'"),
    c('Single argument', `sum(5)()`, '5'),
    c('No arguments at all is 0', `sum()()`, '0'),
    c('Branching from an intermediate result does not affect the original', `const a = sum(1);
const b = a(2);
const c = a(3);
[a(), b(), c()]`, '[1, 3, 4]'),
  ],
  'classnames-utility': [
    c('Strings are joined, falsy values skipped', `classNames('a', null, 'b', undefined, false, '')`, "'a b'"),
    c('Object keys with truthy values', `classNames({ a: true, b: false, c: 1, d: '' })`, "'a c'"),
    c('Nested arrays and objects flatten in order', `classNames('x', ['y', { z: true }, [false, 'w']])`, "'x y z w'"),
    c('Numbers: 0 is skipped, others are included', `classNames(0, 1, 2)`, "'1 2'"),
    c('No arguments', `classNames()`, "''"),
    c('Conditional pattern', `const active = true, disabled = false;
classNames('btn', { 'btn-active': active, 'btn-disabled': disabled })`, "'btn btn-active'"),
  ],
  'css-specificity': [
    c('Type selector', `specificity('div')`, '[0, 0, 1]'),
    c('Id, classes and pseudo-classes', `specificity('#nav .item:hover')`, '[1, 2, 0]'),
    c('Descendant chain with a pseudo-element', `specificity('ul li a::before')`, '[0, 0, 4]'),
    c('Attribute selector counts as a class', `specificity('a[href^="http"]')`, '[0, 1, 1]'),
    c('Universal selector adds nothing', `specificity('*')`, '[0, 0, 0]'),
    c('Combinators add nothing', `specificity('div > p + span ~ em')`, '[0, 0, 4]'),
    c(':not() counts its argument, not itself', `specificity(':not(#a)')`, '[1, 0, 0]'),
    c(':not() mixed with other parts', `specificity('li:not(.x):first-child')`, '[0, 2, 1]'),
    c(':where() adds nothing', `specificity(':where(#a) p')`, '[0, 0, 1]'),
    c('compareSpecificity: one id beats many classes', `compareSpecificity('#a', '.b.c.d')`, '1'),
    c('compareSpecificity: the more specific selector loses → -1', `compareSpecificity('.a', '.b span')`, '-1'),
    c('compareSpecificity: ties give 0', `compareSpecificity('p', 'span')`, '0'),
  ],
  'query-string-url': [
    c('parseQuery: basic pairs, optional leading ?', `parseQuery('?a=1&b=two')`, "{ a: '1', b: 'two' }"),
    c('parseQuery: repeated keys become an array', `parseQuery('tag=x&tag=y&tag=z')`, "{ tag: ['x', 'y', 'z'] }"),
    c('parseQuery: percent-escapes and + decode', `parseQuery('q=hello%20world&r=a+b')`, "{ q: 'hello world', r: 'a b' }"),
    c('parseQuery: keys without a value', `parseQuery('flag&x=')`, "{ flag: '', x: '' }"),
    c('parseQuery: empty input', `[parseQuery(''), parseQuery('?')]`, '[{}, {}]'),
    c('parseQuery: a value may contain =', `parseQuery('eq=a=b')`, "{ eq: 'a=b' }"),
    c('stringifyQuery: encodes, repeats arrays, skips null/undefined', `stringifyQuery({ a: 1, b: 'x y', c: ['p', 'q'], d: undefined, e: null })`, "'a=1&b=x%20y&c=p&c=q'"),
    c('stringifyQuery: reserved characters are percent-encoded', `stringifyQuery({ q: 'a&b=c' })`, "'q=a%26b%3Dc'"),
    c('Round trip', `parseQuery(stringifyQuery({ n: '1', list: ['a', 'b'] }))`, "{ n: '1', list: ['a', 'b'] }"),
  ],
  'format-utilities': [
    c('formatNumber: thousands separators and decimals', `formatNumber(1234567.891, 2)`, "'1,234,567.89'"),
    c('formatNumber: small and negative numbers', `[formatNumber(999), formatNumber(-1000), formatNumber(0)]`, "['999', '-1,000', '0']"),
    c('formatBytes: 1024-based units', `[formatBytes(0), formatBytes(500), formatBytes(1536), formatBytes(1048576)]`, "['0 B', '500 B', '1.5 KB', '1 MB']"),
    c('formatBytes: honors decimals', `formatBytes(1234567, 2)`, "'1.18 MB'"),
    c('timeAgo: under a minute is just now', `timeAgo(0, 30000)`, "'just now'"),
    c('timeAgo: minutes, hours, days with plurals', `const now = 1000000000000;
[timeAgo(now - 5 * 60000, now), timeAgo(now - 3600000, now), timeAgo(now - 2 * 86400000, now)]`, "['5 minutes ago', '1 hour ago', '2 days ago']"),
    c('timeAgo: the future', `const now = 1000000000000;
timeAgo(now + 3 * 3600000, now)`, "'in 3 hours'"),
    c('timeAgo: years', `const now = 1000000000000;
timeAgo(now - 400 * 86400000, now)`, "'1 year ago'"),
    c('truncate: adds an ellipsis within the limit', `[truncate('Hello world', 8), truncate('short', 8)]`, "['Hello w…', 'short']"),
  ],
};
