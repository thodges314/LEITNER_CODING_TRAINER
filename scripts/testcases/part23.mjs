import { c } from './part1.mjs';

// Hand-written cases for batch 23: async depth (Promise.any, cancelable promises, polling with backoff, async generators, pub/sub).
export default {
  'promise-any-aggregate': [
    c('promiseAny resolves with the fastest fulfilling promise', `const p1 = new Promise((_, r) => setTimeout(() => r('fail1'), 10));\nconst p2 = new Promise((res) => setTimeout(() => res('win'), 20));\nconst p3 = new Promise((res) => setTimeout(() => res('slow'), 50));\nawait promiseAny([p1, p2, p3])`, "'win'"),
    c('promiseAny fulfills immediately if an element is a non-promise value', `await promiseAny([Promise.reject('err'), 42, Promise.resolve(99)])`, '42'),
    c('promiseAny rejects with AggregateError when all promises reject', `let caught = null;\ntry {\n  await promiseAny([Promise.reject('err1'), Promise.reject('err2')]);\n} catch (err) {\n  caught = { name: err.name, message: err.message, errors: err.errors };\n}\ncaught`, "{ name: 'AggregateError', message: 'All promises were rejected', errors: ['err1', 'err2'] }"),
    c('promiseAny with empty iterable rejects with AggregateError', `let caught = null;\ntry {\n  await promiseAny([]);\n} catch (err) {\n  caught = { name: err.name, errors: err.errors };\n}\ncaught`, "{ name: 'AggregateError', errors: [] }"),
  ],
  'cancelable-promise-abort': [
    c('makeCancelable resolves normally if not canceled', `const cp = makeCancelable(Promise.resolve('data'));\nawait cp.promise`, "'data'"),
    c('makeCancelable rejects with isCanceled if cancel() called before settlement', `let caught = null;\nconst cp = makeCancelable(new Promise((r) => setTimeout(() => r('late'), 40)));\ncp.cancel();\ntry {\n  await cp.promise;\n} catch (err) {\n  caught = err;\n}\ncaught`, '{ isCanceled: true }'),
    c('withTimeout resolves if promise settles before timeout', `const p = new Promise((r) => setTimeout(() => r('quick'), 10));\nawait withTimeout(p, 50)`, "'quick'"),
    c('withTimeout rejects if promise exceeds timeout', `let caught = null;\nconst p = new Promise((r) => setTimeout(() => r('too-late'), 50));\ntry {\n  await withTimeout(p, 10, new Error('Timed out'));\n} catch (err) {\n  caught = err.message;\n}\ncaught`, "'Timed out'"),
  ],
  'polling-exponential-backoff': [
    c('pollUntil returns result when predicate matches on initial call', `let calls = 0;\nconst fn = async () => ++calls;\nawait pollUntil(fn, (val) => val === 1, { initialInterval: 5, maxAttempts: 3 })`, '1'),
    c('pollUntil retries until predicate returns true', `let attempts = 0;\nconst fn = async () => {\n  attempts++;\n  return { status: attempts === 3 ? 'ready' : 'pending' };\n};\nconst res = await pollUntil(fn, (r) => r.status === 'ready', { initialInterval: 5, backoffFactor: 1.5, maxAttempts: 5 });\n[res.status, attempts]`, "['ready', 3]"),
    c('pollUntil throws if maxAttempts exceeded without match', `let caught = null;\nconst fn = async () => 'always-pending';\ntry {\n  await pollUntil(fn, (x) => x === 'done', { initialInterval: 5, backoffFactor: 1, maxAttempts: 3 });\n} catch (err) {\n  caught = err.message;\n}\ncaught`, "'Polling timed out'"),
  ],
  'async-generator-pagination': [
    c('paginateAll streams items across multiple cursor-based pages', `const mockApi = async (cursor) => {\n  if (cursor === null) return { items: ['a', 'b'], nextCursor: 'page2' };\n  if (cursor === 'page2') return { items: ['c', 'd'], nextCursor: null };\n  return { items: [], nextCursor: null };\n};\nawait collectGenerator(paginateAll(mockApi))`, "['a', 'b', 'c', 'd']"),
    c('collectGenerator respects limit option', `const mockApi = async (cursor) => ({\n  items: [1, 2, 3],\n  nextCursor: cursor ? null : 'next'\n});\nawait collectGenerator(paginateAll(mockApi), 2)`, '[1, 2]'),
    c('filterAsyncGenerator filters yielded stream items', `async function* numbers() {\n  yield 1; yield 2; yield 3; yield 4; yield 5;\n}\nawait collectGenerator(filterAsyncGenerator(numbers(), async (n) => n % 2 === 1))`, '[1, 3, 5]'),
  ],
  'pub-sub-wildcard-emitter': [
    c('PubSub publishes to exact topic listeners and returns count', `const ps = new PubSub();\nconst log = [];\nps.subscribe('order.created', (data) => log.push(data.id));\nconst count = ps.publish('order.created', { id: 101 });\n[count, log]`, '[1, [101]]'),
    c('PubSub matches wildcard patterns user.* and *', `const ps = new PubSub();\nconst events = [];\nps.subscribe('user.*', (data, topic) => events.push(['wild', topic, data]));\nps.subscribe('*', (data, topic) => events.push(['all', topic, data]));\nps.publish('user.login', 'alice');\nps.publish('system.boot', 1);\nevents`, "[['wild', 'user.login', 'alice'], ['all', 'user.login', 'alice'], ['all', 'system.boot', 1]]"),
    c('PubSub unsubscribe stops handler invocations', `const ps = new PubSub();\nlet count = 0;\nconst unsub = ps.subscribe('ping', () => count++);\nps.publish('ping', null);\nunsub();\nps.publish('ping', null);\ncount`, '1'),
    c('PubSub once fires only on first matching publish', `const ps = new PubSub();\nconst log = [];\nps.once('metric.*', (val, topic) => log.push([topic, val]));\nps.publish('metric.cpu', 80);\nps.publish('metric.ram', 50);\nlog`, "[['metric.cpu', 80]]"),
    c('PubSub clear removes all subscriptions', `const ps = new PubSub();\nlet calls = 0;\nps.subscribe('foo', () => calls++);\nps.clear();\nconst notified = ps.publish('foo', null);\n[notified, calls]`, '[0, 0]'),
  ],
};
