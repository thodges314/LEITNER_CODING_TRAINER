import { c } from './part1.mjs';

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
  ],
};
