import { c } from './part1.mjs';

// helper for the mini-expect cases: does calling fn throw an Error?
const FAILS = `const fails = (fn) => { try { fn(); return false; } catch (e) { return e instanceof Error; } };`;

// Hand-written cases for batch 25: Testing & Libs (Pure Logic) track.
export default {
  'mock-fn': [
    c(
      'tracks calls and arguments across multiple invocations',
      `const fn = mockFn();\nfn(1, 2);\nfn('hello');\nfn.mock.calls`,
      `[[1, 2], ['hello']]`
    ),
    c(
      'tracks return values in results array',
      `const fn = mockFn((x) => x * 2);\nfn(5);\nfn(10);\nfn.mock.results`,
      `[{ type: 'return', value: 10 }, { type: 'return', value: 20 }]`
    ),
    c(
      'records thrown error objects in results array',
      `const fn = mockFn(() => { throw new Error('boom'); });\nlet caught = null;\ntry { fn(); } catch (e) { caught = e.message; }\n[caught, fn.mock.results[0].type, fn.mock.results[0].value.message]`,
      `['boom', 'throw', 'boom']`
    ),
    c(
      'mockReturnValue updates return value and chains',
      `const fn = mockFn().mockReturnValue(42);\n[fn(), fn('ignored')]`,
      `[42, 42]`
    ),
    c(
      'mockImplementation updates active implementation function',
      `const fn = mockFn();\nfn.mockImplementation((a, b) => a + b);\nfn(3, 4)`,
      `7`
    ),
    c(
      'mockClear resets recorded calls and results',
      `const fn = mockFn((x) => x);\nfn(1);\nfn.mockClear();\n[fn.mock.calls.length, fn.mock.results.length]`,
      `[0, 0]`
    ),
  ],

  'fake-timers': [
    c(
      'now returns initial 0 and advances with advanceTimersByTime',
      `const clock = new FakeTimers();\nconst start = clock.now();\nclock.advanceTimersByTime(250);\n[start, clock.now()]`,
      `[0, 250]`
    ),
    c(
      'delays callback execution until virtual time has elapsed',
      `const clock = new FakeTimers();\nlet called = false;\nclock.setTimeout(() => { called = true; }, 100);\nclock.advanceTimersByTime(50);\nconst before = called;\nclock.advanceTimersByTime(50);\n[before, called]`,
      `[false, true]`
    ),
    c(
      'passes additional arguments to scheduled callback',
      `const clock = new FakeTimers();\nlet received = null;\nclock.setTimeout((a, b) => { received = a + b; }, 50, 10, 20);\nclock.advanceTimersByTime(50);\nreceived`,
      `30`
    ),
    c(
      'clearTimeout cancels pending timer before it runs',
      `const clock = new FakeTimers();\nlet called = false;\nconst id = clock.setTimeout(() => { called = true; }, 100);\nclock.advanceTimersByTime(50);\nclock.clearTimeout(id);\nclock.advanceTimersByTime(100);\ncalled`,
      `false`
    ),
    c(
      'executes multiple timers in strict chronological order',
      `const clock = new FakeTimers();\nconst order = [];\nclock.setTimeout(() => order.push('C'), 300);\nclock.setTimeout(() => order.push('A'), 100);\nclock.setTimeout(() => order.push('B'), 200);\nclock.advanceTimersByTime(350);\norder`,
      `['A', 'B', 'C']`
    ),
    c(
      'executes cascading timers scheduled within current advance window',
      `const clock = new FakeTimers();\nconst log = [];\nclock.setTimeout(() => {\n  log.push('step1');\n  clock.setTimeout(() => log.push('step2'), 50);\n}, 50);\nclock.advanceTimersByTime(120);\nlog`,
      `['step1', 'step2']`
    ),
    c(
      'a timer due exactly at the target time runs, and now() is the target',
      `const clock = new FakeTimers();
const ran = [];
clock.setTimeout(() => ran.push(clock.now()), 100);
clock.advanceTimersByTime(100);
[ran, clock.now()]`,
      `[[100], 100]`
    ),
    c(
      'advanceTimersByTime(1) runs a timer that is due in 1 ms',
      `const clock = new FakeTimers();
let ran = false;
clock.setTimeout(() => { ran = true; }, 1);
clock.advanceTimersByTime(1);
[ran, clock.now()]`,
      `[true, 1]`
    ),
    c(
      'timers due at the same time run in the order they were created',
      `const clock = new FakeTimers();
const order = [];
clock.setTimeout(() => order.push('A'), 100);
clock.setTimeout(() => order.push('B'), 100);
clock.setTimeout(() => order.push('C'), 100);
clock.advanceTimersByTime(100);
order`,
      `['A', 'B', 'C']`
    ),
    c(
      'ties are broken by creation order, but an earlier time always goes first',
      `const clock = new FakeTimers();
const order = [];
clock.setTimeout(() => order.push('X'), 200);
clock.setTimeout(() => order.push('Y'), 100);
clock.setTimeout(() => order.push('Z'), 100);
clock.advanceTimersByTime(200);
order`,
      `['Y', 'Z', 'X']`
    ),
    c(
      'advanceTimersByTime(0) runs timers that are already due (no delay given, or delay 0) without moving the clock',
      `const clock = new FakeTimers();
const order = [];
clock.setTimeout(() => order.push('default'));
clock.setTimeout(() => order.push('zero'), 0);
clock.setTimeout(() => order.push('later'), 10);
clock.advanceTimersByTime(0);
[order, clock.now()]`,
      `[['default', 'zero'], 0]`
    ),
    c(
      'a negative delay counts as 0',
      `const clock = new FakeTimers();
let ran = false;
clock.setTimeout(() => { ran = true; }, -50);
clock.advanceTimersByTime(0);
[ran, clock.now()]`,
      `[true, 0]`
    ),
    c(
      'a timer scheduled with no delay inside a callback runs in the same call',
      `const clock = new FakeTimers();
const log = [];
clock.setTimeout(() => {
  log.push('first');
  clock.setTimeout(() => log.push('second'));
}, 10);
clock.advanceTimersByTime(10);
log`,
      `['first', 'second']`
    ),
    c(
      'now() inside a callback is that timer\'s own scheduled time, and the clock ends at the target',
      `const clock = new FakeTimers();
const seen = [];
clock.setTimeout(() => seen.push(clock.now()), 30);
clock.setTimeout(() => seen.push(clock.now()), 70);
clock.advanceTimersByTime(100);
[seen, clock.now()]`,
      `[[30, 70], 100]`
    ),
    c(
      'a timer scheduled from a callback is relative to that callback\'s time',
      `const clock = new FakeTimers();
const seen = [];
clock.setTimeout(() => {
  clock.setTimeout(() => seen.push(clock.now()), 25);
}, 40);
clock.advanceTimersByTime(64);
const before = seen.slice();
clock.advanceTimersByTime(1);
[before, seen]`,
      `[[], [65]]`
    ),
    c(
      'every setTimeout returns a different number',
      `const clock = new FakeTimers();
const ids = [clock.setTimeout(() => {}, 1), clock.setTimeout(() => {}, 1), clock.setTimeout(() => {}, 1)];
[ids.every((id) => typeof id === 'number'), new Set(ids).size]`,
      `[true, 3]`
    ),
    c(
      'clearTimeout of an unknown or already-run id does nothing, and other timers still run',
      `const clock = new FakeTimers();
const ran = [];
const first = clock.setTimeout(() => ran.push('first'), 10);
clock.setTimeout(() => ran.push('second'), 20);
clock.advanceTimersByTime(10);
clock.clearTimeout(first);
clock.clearTimeout(99999);
clock.advanceTimersByTime(10);
ran`,
      `['first', 'second']`
    ),
  ],

  'mini-expect': [
    c(
      'toBe asserts identity equality and not.toBe asserts inequality',
      `[expect(5).toBe(5).pass, expect(5).not.toBe(10).pass]`,
      `[true, true]`
    ),
    c(
      'toBe throws an Error when assertion fails',
      `let caught = false;\ntry {\n  expect('foo').toBe('bar');\n} catch (e) {\n  caught = true;\n}\ncaught`,
      `true`
    ),
    c(
      'toEqual matches deep objects and array structures',
      `const a = { x: 1, y: [2, 3] };\nconst b = { x: 1, y: [2, 3] };\nexpect(a).toEqual(b).pass`,
      `true`
    ),
    c(
      'not.toEqual passes when object contents differ',
      `expect({ a: 1 }).not.toEqual({ a: 2 }).pass`,
      `true`
    ),
    c(
      'toThrow checks that function throws and matches error message',
      `const boom = () => { throw new Error('invalid state'); };\n[expect(boom).toThrow('invalid').pass, expect(() => {}).not.toThrow().pass]`,
      `[true, true]`
    ),
    c(
      'toThrow throws an Error if target function does not throw',
      `let caught = false;\ntry {\n  expect(() => 42).toThrow();\n} catch (e) {\n  caught = true;\n}\ncaught`,
      `true`
    ),
    c(
      'toBe uses Object.is: NaN is NaN, and +0 is not -0',
      `${FAILS}
[expect(NaN).toBe(NaN).pass, fails(() => expect(0).toBe(-0)), expect(0).not.toBe(-0).pass]`,
      `[true, true, true]`
    ),
    c(
      'toBe compares objects by identity, not by content',
      `${FAILS}
const o = {};
[expect(o).toBe(o).pass, fails(() => expect({}).toBe({})), expect({}).not.toBe({}).pass]`,
      `[true, true, true]`
    ),
    c(
      'not.toBe throws when the values are the same',
      `${FAILS}
[fails(() => expect(5).not.toBe(5)), fails(() => expect('a').not.toBe('a'))]`,
      `[true, true]`
    ),
    c(
      'toEqual: different primitives, null and undefined are not equal',
      `${FAILS}
[fails(() => expect(1).toEqual(2)), fails(() => expect(null).toEqual({})), fails(() => expect({}).toEqual(null)), fails(() => expect(undefined).toEqual(null)), fails(() => expect('1').toEqual({})), fails(() => expect({}).toEqual(1)), expect(null).toEqual(null).pass]`,
      `[true, true, true, true, true, true, true]`
    ),
    c(
      'toEqual compares Dates by time',
      `${FAILS}
[expect(new Date(1000)).toEqual(new Date(1000)).pass, fails(() => expect(new Date(1000)).toEqual(new Date(2000))), fails(() => expect(new Date(1000)).toEqual({}))]`,
      `[true, true, true]`
    ),
    c(
      'toEqual compares RegExps by source and flags',
      `${FAILS}
[expect(/a+/g).toEqual(/a+/g).pass, fails(() => expect(/a+/g).toEqual(/a+/i)), fails(() => expect(/a+/).toEqual(/b+/)), fails(() => expect(/a/).toEqual({}))]`,
      `[true, true, true, true]`
    ),
    c(
      'toEqual: an array is not equal to an object with the same keys',
      `${FAILS}
[fails(() => expect([]).toEqual({})), fails(() => expect({}).toEqual([])), fails(() => expect([1]).toEqual({ 0: 1 }))]`,
      `[true, true, true]`
    ),
    c(
      'toEqual: a different number of keys, or different keys, are not equal',
      `${FAILS}
[fails(() => expect({ a: 1 }).toEqual({ a: 1, b: 2 })), fails(() => expect({ a: 1, b: 2 }).toEqual({ a: 1 })), fails(() => expect({ a: 1 }).toEqual({ b: 1 })), fails(() => expect({ a: undefined }).toEqual({ b: undefined }))]`,
      `[true, true, true, true]`
    ),
    c(
      'toEqual finds differences deep inside nested objects and arrays',
      `${FAILS}
[fails(() => expect({ a: { b: [1, 2, { c: 3 }] } }).toEqual({ a: { b: [1, 2, { c: 4 }] } })), expect({ a: { b: [1, 2, { c: 3 }] } }).toEqual({ a: { b: [1, 2, { c: 3 }] } }).pass, fails(() => expect([1, 2, 3]).toEqual([1, 2]))]`,
      `[true, true, true]`
    ),
    c(
      'toEqual treats NaN as equal to NaN, also inside objects',
      `expect({ n: NaN }).toEqual({ n: NaN }).pass`,
      `true`
    ),
    c(
      'not.toEqual throws when the values are deeply equal',
      `${FAILS}
[fails(() => expect({ a: [1, { b: 2 }] }).not.toEqual({ a: [1, { b: 2 }] })), expect({ a: 1 }).not.toEqual({ a: 2 }).pass]`,
      `[true, true]`
    ),
    c(
      'toThrow fails for a function that does not throw, and not.toThrow() is the reverse',
      `${FAILS}
[fails(() => expect(() => {}).toThrow()), expect(() => {}).not.toThrow().pass, fails(() => expect(() => { throw new Error('x'); }).not.toThrow())]`,
      `[true, true, true]`
    ),
    c(
      'toThrow(string) matches a part of the message and toThrow(RegExp) tests it',
      `${FAILS}
[expect(() => { throw new Error('Boom happened'); }).toThrow('Boom').pass, fails(() => expect(() => { throw new Error('Boom'); }).toThrow('Bang')), expect(() => { throw new Error('code 42'); }).toThrow(/[0-9]+/).pass, fails(() => expect(() => { throw new Error('no digits'); }).toThrow(/[0-9]+/))]`,
      `[true, true, true, true]`
    ),
    c(
      'a thrown value that is not an Error is matched through String(value)',
      `${FAILS}
[expect(() => { throw 'plain text'; }).toThrow('plain').pass, fails(() => expect(() => { throw 'plain text'; }).toThrow('other'))]`,
      `[true, true]`
    ),
    c(
      'toThrow on something that is not a function throws an Error, also with .not',
      `${FAILS}
[fails(() => expect(5).toThrow()), fails(() => expect(5).not.toThrow())]`,
      `[true, true]`
    ),
    c(
      'not.toThrow(expected) passes when the message is different and fails when it matches',
      `${FAILS}
[expect(() => { throw new Error('a'); }).not.toThrow('b').pass, fails(() => expect(() => { throw new Error('abc'); }).not.toThrow('b'))]`,
      `[true, true]`
    ),
    c(
      'every passing matcher returns exactly { pass: true }',
      `[expect(1).toBe(1), expect({}).toEqual({}), expect(() => { throw 1; }).toThrow(), expect(1).not.toBe(2)]`,
      `[{ pass: true }, { pass: true }, { pass: true }, { pass: true }]`
    ),
    c(
      '.not can be chained twice, and does not change the original expectation',
      `${FAILS}
const e = expect(1);
const negated = e.not;
[expect(1).not.not.toBe(1).pass, fails(() => expect(1).not.not.toBe(2)), e.toBe(1).pass, negated.toBe(2).pass]`,
      `[true, true, true, true]`
    ),
    c(
      'toThrow(message) fails when the function does not throw at all, whatever the message pattern',
      `${FAILS}
[fails(() => expect(() => {}).toThrow('null')), fails(() => expect(() => {}).toThrow(/null|undefined/)), expect(() => {}).not.toThrow('null').pass]`,
      `[true, true, true]`
    ),
  ],

  'next-route-matcher': [
    c(
      'matches static routes and rejects non-matching paths',
      `[matchRoute('/about', '/about'), matchRoute('/about', '/contact')]`,
      `[{ params: {} }, null]`
    ),
    c(
      'extracts single dynamic parameter [id]',
      `matchRoute('/posts/[id]', '/posts/hello-world')`,
      `{ params: { id: 'hello-world' } }`
    ),
    c(
      'matches dynamic parameter in the middle of a route',
      `matchRoute('/users/[id]/settings', '/users/usr_99/settings')`,
      `{ params: { id: 'usr_99' } }`
    ),
    c(
      'matches catch-all [...slug] with multiple segments',
      `matchRoute('/docs/[...slug]', '/docs/api/v1/endpoints')`,
      `{ params: { slug: ['api', 'v1', 'endpoints'] } }`
    ),
    c(
      'catch-all [...slug] requires at least one segment',
      `matchRoute('/docs/[...slug]', '/docs')`,
      `null`
    ),
    c(
      'optional catch-all [[...slug]] matches empty path',
      `matchRoute('/shop/[[...slug]]', '/shop')`,
      `{ params: { slug: [] } }`
    ),
    c(
      'optional catch-all [[...slug]] matches multiple segments',
      `matchRoute('/shop/[[...slug]]', '/shop/clothing/shoes')`,
      `{ params: { slug: ['clothing', 'shoes'] } }`
    ),
    c(
      'returns null on route length mismatch or prefix mismatch',
      `[matchRoute('/posts/[id]', '/posts/1/extra'), matchRoute('/a/b', '/a')]`,
      `[null, null]`
    ),
  ],

  'test-runner-lifecycle': [
    c(
      'executes simple test suite and reports pass count',
      `const runner = createTestRunner();\nrunner.describe('Math', () => {\n  runner.it('adds', () => {});\n  runner.it('multiplies', () => {});\n});\nconst res = await runner.run();\n[res.passed, res.failed, res.total]`,
      `[2, 0, 2]`
    ),
    c(
      'failing test records error and allows next test to proceed',
      `const runner = createTestRunner();\nrunner.describe('Validation', () => {\n  runner.it('fails test', () => { throw new Error('Bad input'); });\n  runner.it('passes test', () => {});\n});\nconst res = await runner.run();\n[res.passed, res.failed, res.suites[0].tests[0].error]`,
      `[1, 1, 'Bad input']`
    ),
    c(
      'beforeAll and afterAll execute once per suite',
      `const runner = createTestRunner();\nconst order = [];\nrunner.describe('Lifecycle', () => {\n  runner.beforeAll(() => order.push('beforeAll'));\n  runner.afterAll(() => order.push('afterAll'));\n  runner.it('test1', () => order.push('test1'));\n  runner.it('test2', () => order.push('test2'));\n});\nawait runner.run();\norder`,
      `['beforeAll', 'test1', 'test2', 'afterAll']`
    ),
    c(
      'beforeEach and afterEach execute per test',
      `const runner = createTestRunner();\nconst log = [];\nrunner.describe('EachHooks', () => {\n  runner.beforeEach(() => log.push('before'));\n  runner.afterEach(() => log.push('after'));\n  runner.it('t1', () => log.push('run1'));\n  runner.it('t2', () => log.push('run2'));\n});\nawait runner.run();\nlog`,
      `['before', 'run1', 'after', 'before', 'run2', 'after']`
    ),
    c(
      'nested describe inherits outer beforeEach and unwinds afterEach in reverse order',
      `const runner = createTestRunner();\nconst trace = [];\nrunner.describe('Outer', () => {\n  runner.beforeEach(() => trace.push('outer-before'));\n  runner.afterEach(() => trace.push('outer-after'));\n  runner.describe('Inner', () => {\n    runner.beforeEach(() => trace.push('inner-before'));\n    runner.afterEach(() => trace.push('inner-after'));\n    runner.it('leaf', () => trace.push('test-run'));\n  });\n});\nawait runner.run();\ntrace`,
      `['outer-before', 'inner-before', 'test-run', 'inner-after', 'outer-after']`
    ),
    c(
      'supports async tests returning promises',
      `const runner = createTestRunner();\nlet asyncValue = 0;\nrunner.describe('AsyncSuite', () => {\n  runner.it('resolves async', async () => {\n    await new Promise((r) => setTimeout(r, 10));\n    asyncValue = 42;\n  });\n});\nconst res = await runner.run();\n[res.passed, asyncValue]`,
      `[1, 42]`
    ),
    c(
      'several hooks of the same kind run in the order they were registered',
      `const r = new TestRunner();
const log = [];
r.describe('s', () => {
  r.beforeAll(() => log.push('beforeAll 1'));
  r.beforeAll(() => log.push('beforeAll 2'));
  r.beforeEach(() => log.push('beforeEach 1'));
  r.beforeEach(() => log.push('beforeEach 2'));
  r.afterEach(() => log.push('afterEach 1'));
  r.afterEach(() => log.push('afterEach 2'));
  r.afterAll(() => log.push('afterAll 1'));
  r.afterAll(() => log.push('afterAll 2'));
  r.it('t', () => log.push('test'));
});
await r.run();
log`,
      `['beforeAll 1', 'beforeAll 2', 'beforeEach 1', 'beforeEach 2', 'test', 'afterEach 1', 'afterEach 2', 'afterAll 1', 'afterAll 2']`
    ),
    c(
      'the full nested lifecycle: outer beforeEach first, inner afterEach first, afterAll after the child suites',
      `const r = new TestRunner();
const log = [];
r.describe('outer', () => {
  r.beforeAll(() => log.push('outer:beforeAll'));
  r.afterAll(() => log.push('outer:afterAll'));
  r.beforeEach(() => log.push('outer:beforeEach'));
  r.afterEach(() => log.push('outer:afterEach'));
  r.it('t1', () => log.push('t1'));
  r.describe('inner', () => {
    r.beforeEach(() => log.push('inner:beforeEach'));
    r.afterEach(() => log.push('inner:afterEach'));
    r.it('t2', () => log.push('t2'));
  });
});
await r.run();
log`,
      `['outer:beforeAll', 'outer:beforeEach', 't1', 'outer:afterEach', 'outer:beforeEach', 'inner:beforeEach', 't2', 'inner:afterEach', 'outer:afterEach', 'outer:afterAll']`
    ),
    c(
      'the report lists tests and suites in registration order, with counts for mixed passes and failures',
      `const r = new TestRunner();
r.describe('A', () => {
  r.it('a1', () => {});
  r.it('a2', () => { throw new Error('bad'); });
  r.it('a3', () => {});
  r.describe('A.1', () => { r.it('x', () => {}); });
  r.describe('A.2', () => { r.it('y', () => { throw new Error('no'); }); });
});
r.describe('B', () => { r.it('b1', () => {}); });
const rep = await r.run();
[rep.passed, rep.failed, rep.total, rep.suites.map((s) => s.title), rep.suites[0].tests.map((t) => t.title + ':' + t.status), rep.suites[0].suites.map((s) => s.title)]`,
      `[4, 2, 6, ['A', 'B'], ['a1:pass', 'a2:fail', 'a3:pass'], ['A.1', 'A.2']]`
    ),
    c(
      'a failing test reports its message (or String(value) for a non-Error), and a passing test has no error',
      `const r = new TestRunner();
r.describe('s', () => {
  r.it('throws error', () => { throw new Error('boom'); });
  r.it('throws string', () => { throw 'plain'; });
  r.it('rejects', async () => { await sleep(5); throw new Error('late'); });
  r.it('ok', () => {});
});
const t = (await r.run()).suites[0].tests;
[t.map((x) => [x.status, x.error]), 'error' in t[3]]`,
      `[[['fail', 'boom'], ['fail', 'plain'], ['fail', 'late'], ['pass', undefined]], false]`
    ),
    c(
      'async hooks and tests are awaited, so everything finishes in order before run() resolves',
      `const r = new TestRunner();
const log = [];
r.describe('s', () => {
  // the first hook of each pair is the slow one: if it were not awaited, the next step would log before it
  r.beforeAll(async () => { await sleep(40); log.push('beforeAll'); });
  r.beforeEach(async () => { await sleep(5); log.push('beforeEach'); });
  r.afterEach(async () => { await sleep(40); log.push('afterEach'); });
  r.afterAll(async () => { await sleep(5); log.push('afterAll'); });
  r.it('t', async () => { await sleep(5); log.push('test'); });
});
await r.run();
log`,
      `['beforeAll', 'beforeEach', 'test', 'afterEach', 'afterAll']`
    ),
    c(
      'when beforeEach throws (even asynchronously) the test fails with that error, its body does not run, and afterEach still runs',
      `const r = new TestRunner();
const log = [];
r.describe('s', () => {
  r.beforeEach(async () => { await sleep(5); throw new Error('setup'); });
  r.afterEach(() => log.push('afterEach'));
  r.it('t', () => log.push('test'));
});
const t = (await r.run()).suites[0].tests[0];
[t.status, t.error, log]`,
      `['fail', 'setup', ['afterEach']]`
    ),
    c(
      'an afterEach error fails a passing test but never replaces the test\'s own error',
      `const r = new TestRunner();
r.describe('s', () => {
  r.afterEach(() => { throw new Error('cleanup'); });
  r.it('passes', () => {});
  r.it('fails', () => { throw new Error('own'); });
});
(await r.run()).suites[0].tests.map((t) => [t.status, t.error])`,
      `[['fail', 'cleanup'], ['fail', 'own']]`
    ),
    c(
      'a failing beforeAll fails every test of that suite, in order, without running them',
      `const r = new TestRunner();
const log = [];
r.describe('s', () => {
  r.beforeAll(() => { throw new Error('setup broke'); });
  r.it('one', () => log.push('one'));
  r.it('two', () => log.push('two'));
});
const rep = await r.run();
const ts = rep.suites[0].tests;
[ts.map((t) => t.title + ':' + t.status), ts.every((t) => t.error.includes('setup broke')), log, rep.failed]`,
      `[['one:fail', 'two:fail'], true, [], 2]`
    ),
    c(
      'a beforeAll that throws a non-Error value still reports its text',
      `const r = new TestRunner();
r.describe('s', () => {
  r.beforeAll(() => { throw 'plain failure'; });
  r.it('one', () => {});
});
const t = (await r.run()).suites[0].tests[0];
[t.status, t.error.includes('plain failure')]`,
      `['fail', true]`
    ),
    c(
      'errors thrown by afterAll are ignored and later suites still run',
      `const r = new TestRunner();
r.describe('A', () => {
  r.afterAll(() => { throw new Error('ignored'); });
  r.afterAll(async () => { await sleep(5); throw new Error('also ignored'); });
  r.it('a', () => {});
});
r.describe('B', () => { r.it('b', () => {}); });
const rep = await r.run();
[rep.passed, rep.failed, rep.suites.map((s) => s.title)]`,
      `[2, 0, ['A', 'B']]`
    ),
    c(
      'tests declared outside any describe are reported in one unnamed suite with the describes nested inside it',
      `const r = new TestRunner();
r.it('top', () => {});
r.describe('inner', () => { r.it('deep', () => { throw new Error('x'); }); });
const rep = await r.run();
[rep.suites.length, rep.suites[0].title, rep.suites[0].tests.map((t) => t.title), rep.suites[0].suites.map((s) => s.title), rep.passed, rep.failed]`,
      `[1, '', ['top'], ['inner'], 1, 1]`
    ),
    c(
      'a beforeEach is inherited by child suites but not by sibling suites',
      `const r = new TestRunner();
const log = [];
r.describe('A', () => {
  r.beforeEach(() => log.push('A.beforeEach'));
  r.describe('A1', () => { r.it('x', () => log.push('x')); });
});
r.describe('B', () => { r.it('y', () => log.push('y')); });
await r.run();
log`,
      `['A.beforeEach', 'x', 'y']`
    ),
  ],
};
