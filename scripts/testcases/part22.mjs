import { c } from './part1.mjs';

// Hand-written cases for batch 22: language depth remaining (hoisting/TDZ, this context, tagged templates, Symbol.asyncIterator, coroutines).
export default {
  'hoisting-tdz-scope': [
    c('hoistingBehavior shows hoisted var and hoisted function declaration', `hoistingBehavior()`, '{ varBefore: undefined, fnResult: "hoisted" }'),
    c('checkTDZ catches ReferenceError when accessing let before initialization', `checkTDZ(() => { let a = b; let b = 1; return a; })`, "'ReferenceError'"),
    c('checkTDZ returns ok when access is valid', `checkTDZ(() => { let a = 1; let b = a; return b; })`, "'ok'"),
    c('makeLoopCallbacksVar captures the shared final i', `const fns = makeLoopCallbacksVar(3);\n[fns[0](), fns[1](), fns[2]()]`, '[3, 3, 3]'),
    c('makeLoopCallbacksLet captures each iteration binding', `const fns = makeLoopCallbacksLet(3);\n[fns[0](), fns[1](), fns[2]()]`, '[0, 1, 2]'),
    c('makeLoopCallbacks with 0 callbacks', `[makeLoopCallbacksVar(0).length, makeLoopCallbacksLet(0).length]`, '[0, 0]'),
  ],
  'this-context-binding': [
    c('createGreeter: method call uses receiver', `const g = createGreeter('Alice');\ng.greet()`, "'Hello, Alice'"),
    c('createGreeter: getBoundGreet stays bound when detached', `const g = createGreeter('Bob');\nconst f = g.getBoundGreet();\nf()`, "'Hello, Bob'"),
    c('invokeWithContext calls target function with specified receiver', `const ctx = { multiplier: 3 };\nfunction calc(a, b) { return (a + b) * this.multiplier; }\ninvokeWithContext(calc, ctx, 2, 4)`, '18'),
    c('invokeWithContext works with methods and multiple arguments', `const user = { first: 'John', last: 'Doe' };\nfunction full(prefix) { return prefix + ' ' + this.first + ' ' + this.last; }\ninvokeWithContext(full, user, 'Mr.')`, "'Mr. John Doe'"),
    c('isConstructorCall returns true for classes and constructors', `class Foo {}\nfunction Bar() {}\n[isConstructorCall(Foo), isConstructorCall(Bar)]`, '[true, true]'),
    c('isConstructorCall returns false for arrow functions and non-constructors', `const arrow = () => {};\n[isConstructorCall(arrow), isConstructorCall(Math.max)]`, '[false, false]'),
  ],
  'tagged-template-literals': [
    c('safeHtml escapes special characters in interpolated values', "safeHtml`<div>Hello, ${'<script>alert(1)</script> & \"user\"'}</div>`", "'<div>Hello, &lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;user&quot;</div>'"),
    c('safeHtml handles null and undefined values as empty strings', "safeHtml`Val: ${null}, Name: ${undefined}!`", "'Val: , Name: !'"),
    c('safeHtml leaves numbers and safe strings unaltered', "safeHtml`Score: ${100} for ${'Alice'}`", "'Score: 100 for Alice'"),
    c('highlight wraps values in mark tags', "highlight`Welcome ${'Alice'}, you have ${3} messages.`", "'Welcome <mark>Alice</mark>, you have <mark>3</mark> messages.'"),
    c('getRawString preserves escape sequences without interpreting them', "getRawString`hello\\tworld`", "String.raw`hello\\tworld`"),
  ],
  'symbol-async-iterator': [
    c('createAsyncRange yields numbers sequentially with for-await-of', `const range = createAsyncRange(1, 4);\nawait collectAsync(range)`, '[1, 2, 3]'),
    c('createAsyncRange with start >= end returns empty', `const range = createAsyncRange(5, 5);\nawait collectAsync(range)`, '[]'),
    c('collectAsync consumes an async iterable into an array', `const range = createAsyncRange(10, 13);\nawait collectAsync(range)`, '[10, 11, 12]'),
    c('mapAsyncIterable transforms yielded values asynchronously', `const range = createAsyncRange(1, 4);\nconst doubled = mapAsyncIterable(range, async (x) => x * 2);\nawait collectAsync(doubled)`, '[2, 4, 6]'),
  ],
  'generators-coroutines': [
    c('createEchoGenerator yields ready then pairs input with its type', `const g = createEchoGenerator();\nconst r0 = g.next().value;\nconst r1 = g.next(42).value;\nconst r2 = g.next('hello').value;\nconst r3 = g.next(true).value;\n[r0, r1, r2, r3]`, "['ready', [42, 'number'], ['hello', 'string'], [true, 'boolean']]"),
    c('runCoroutine executes generator yielding resolved promises', `const g = function* () { const a = yield Promise.resolve(10); const b = yield Promise.resolve(20); return a + b; };\nawait runCoroutine(g)`, '30'),
    c('runCoroutine handles plain non-promise values', `const g = function* () { const x = yield 5; const y = yield 7; return x * y; };\nawait runCoroutine(g)`, '35'),
    c('runCoroutine catches rejection inside generator with try/catch', `const g = function* () { let caught = null; try { yield Promise.reject(new Error('fail')); } catch (err) { caught = err.message; } return caught; };\nawait runCoroutine(g)`, "'fail'"),
    c('runCoroutine propagates unhandled rejection', `const g = function* () { yield Promise.reject(new Error('unhandled')); };\nawait runCoroutine(g)`, '', { t: 'unhandled', x: 'Rejection with Error: unhandled' }),
  ],
};
