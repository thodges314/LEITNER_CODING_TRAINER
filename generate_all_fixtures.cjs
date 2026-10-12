// generate_all_fixtures.cjs
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src/data/topics.json");
if (!fs.existsSync(filePath)) {
  console.error("Error: src/data/topics.json not found.");
  process.exit(1);
}

const topics = JSON.parse(fs.readFileSync(filePath, "utf8"));

const fixtureRegistry = {
  // --- ASYNC & WEB ---
  "async-fetch-error-handling": {
    starterCode: `async function fetchData(url) {\n  const response = await fetch(url);\n  if (!response.ok) {\n    throw new Error(\`HTTP error! status: \${response.status}\`);\n  }\n  return await response.json();\n}`,
    testHarness: `try {\n  const res = await fetchData('https://jsonplaceholder.typicode.com/todos/1');\n  console.log('Test 1 (Valid 200):', res.id === 1 ? 'PASS' : 'FAIL', res);\n} catch (e) {\n  console.error('Test 1 Error:', e.message);\n}\n\ntry {\n  await fetchData('https://jsonplaceholder.typicode.com/invalid-path-404');\n  console.error('Test 2: FAIL (Expected 404 to throw)');\n} catch (e) {\n  console.log('Test 2 (404 Threw): PASS ->', e.message);\n}`,
  },
  "promise-chaining-syntax": {
    starterCode: `function getUserData(url) {\n  return fetch(url)\n    .then(res => {\n      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);\n      return res.json();\n    })\n    .catch(err => {\n      console.error('Caught in chain:', err.message);\n      throw err;\n    })\n    .finally(() => {\n      console.log('Cleanup: fetch attempt completed');\n    });\n}`,
    testHarness: `let cleanedUp = false;\ngetUserData('https://jsonplaceholder.typicode.com/users/1')\n  .then(data => console.log('Test 1 (User ID === 1):', data.id === 1 ? 'PASS' : 'FAIL'))\n  .catch(err => console.error('Test 1 FAILED:', err.message));`,
  },
  "promise-all-vs-settled": {
    starterCode: `async function fetchAllUsers(urls) {\n  const results = await Promise.allSettled(urls.map(url => fetch(url).then(r => r.json())));\n  return results\n    .filter(r => r.status === 'fulfilled')\n    .map(r => r.value);\n}`,
    testHarness: `const urls = [\n  'https://jsonplaceholder.typicode.com/todos/1',\n  'https://invalid-non-existent-url-domain.org',\n  'https://jsonplaceholder.typicode.com/todos/2'\n];\nconst payloads = await fetchAllUsers(urls);\nconsole.log('Test 1 (Settled payloads length === 2):', payloads.length === 2 ? 'PASS' : 'FAIL', payloads);`,
  },
  "fetch-abort-controller": {
    starterCode: `async function fetchWithTimeout(url, timeoutMs) {\n  const controller = new AbortController();\n  const timer = setTimeout(() => controller.abort(), timeoutMs);\n  try {\n    const res = await fetch(url, { signal: controller.signal });\n    clearTimeout(timer);\n    return await res.json();\n  } catch (err) {\n    clearTimeout(timer);\n    throw err;\n  }\n}`,
    testHarness: `try {\n  await fetchWithTimeout('https://jsonplaceholder.typicode.com/photos', 1);\n  console.error('Test 1: FAIL (Expected abort on 1ms timeout)');\n} catch (err) {\n  console.log('Test 1 (Abort timeout caught): PASS ->', err.name === 'AbortError' || err.message.includes('abort') ? 'PASS' : err.message);\n}`,
  },
  "debounce-implementation": {
    starterCode: `function debounce(fn, delay) {\n  let timer = null;\n  return function (...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  };\n}`,
    testHarness: `let count = 0;\nconst debounced = debounce(() => count++, 50);\ndebounced(); debounced(); debounced();\nsetTimeout(() => {\n  console.log('Debounce fires once (count === 1):', count === 1 ? 'PASS' : \`FAIL (\${count})\`);\n}, 100);`,
  },
  "throttle-implementation": {
    starterCode: `function throttle(fn, limit) {\n  let inThrottle = false;\n  return function (...args) {\n    if (!inThrottle) {\n      fn.apply(this, args);\n      inThrottle = true;\n      setTimeout(() => inThrottle = false, limit);\n    }\n  };\n}`,
    testHarness: `let runs = 0;\nconst throttled = throttle(() => runs++, 60);\nthrottled(); throttled(); throttled();\nconsole.log('Immediate run (runs === 1):', runs === 1 ? 'PASS' : 'FAIL');\nsetTimeout(() => {\n  throttled();\n  console.log('After window run (runs === 2):', runs === 2 ? 'PASS' : 'FAIL');\n}, 80);`,
  },
  "event-loop-microtasks": {
    starterCode: `function getExecutionOrder() {\n  // Return array representing order of execution:\n  // 1: Synchronous script\n  // 2: Microtasks (Promise.then, queueMicrotask)\n  // 3: Macrotasks (setTimeout, setInterval)\n  return ['sync', 'microtask', 'macrotask'];\n}`,
    testHarness: `const order = getExecutionOrder();\nconsole.log('Event loop sequence:', JSON.stringify(order) === '["sync","microtask","macrotask"]' ? 'PASS' : 'FAIL', order);`,
  },
  debounce: {
    starterCode: `function debounce(fn, wait) {\n  let timer = null;\n  let lastArgs = null;\n  let lastThis = null;\n  function debounced(...args) {\n    lastArgs = args;\n    lastThis = this;\n    clearTimeout(timer);\n    timer = setTimeout(() => {\n      fn.apply(lastThis, lastArgs);\n      timer = null;\n    }, wait);\n  }\n  debounced.cancel = () => { clearTimeout(timer); timer = null; };\n  debounced.flush = () => {\n    if (timer) {\n      clearTimeout(timer);\n      fn.apply(lastThis, lastArgs);\n      timer = null;\n    }\n  };\n  return debounced;\n}`,
    testHarness: `let val = 0;\nconst d = debounce((n) => { val = n; }, 50);\nd(5); d.flush();\nconsole.log('Flush executed immediately (val === 5):', val === 5 ? 'PASS' : 'FAIL');\nd(10); d.cancel();\nsetTimeout(() => {\n  console.log('Cancel prevented run (val === 5):', val === 5 ? 'PASS' : 'FAIL');\n}, 70);`,
  },
  throttle: {
    starterCode: `function throttle(fn, wait, options = { leading: true, trailing: true }) {\n  let timeout = null;\n  let previous = 0;\n  let lastArgs, lastThis;\n  return function (...args) {\n    const now = Date.now();\n    if (!previous && options.leading === false) previous = now;\n    const remaining = wait - (now - previous);\n    lastArgs = args; lastThis = this;\n    if (remaining <= 0 || remaining > wait) {\n      if (timeout) { clearTimeout(timeout); timeout = null; }\n      previous = now;\n      fn.apply(lastThis, lastArgs);\n    } else if (!timeout && options.trailing !== false) {\n      timeout = setTimeout(() => {\n        previous = options.leading === false ? 0 : Date.now();\n        timeout = null;\n        fn.apply(lastThis, lastArgs);\n      }, remaining);\n    }\n  };\n}`,
    testHarness: `let c = 0;\nconst t = throttle(() => c++, 50, { leading: true, trailing: true });\nt(); t();\nconsole.log('Leading fired (c === 1):', c === 1 ? 'PASS' : 'FAIL');\nsetTimeout(() => {\n  console.log('Trailing fired (c === 2):', c === 2 ? 'PASS' : 'FAIL');\n}, 70);`,
  },
  memoize: {
    starterCode: `function memoize(fn, resolver) {\n  const cache = new Map();\n  return function (...args) {\n    const key = resolver ? resolver.apply(this, args) : args[0];\n    if (cache.has(key)) return cache.get(key);\n    const result = fn.apply(this, args);\n    cache.set(key, result);\n    return result;\n  };\n}`,
    testHarness: `let calls = 0;\nconst sq = memoize(x => { calls++; return x * x; });\nsq(4); sq(4);\nconsole.log('Memoized duplicate call (calls === 1):', calls === 1 ? 'PASS' : 'FAIL');\nconsole.log('Correct return value (16):', sq(4) === 16 ? 'PASS' : 'FAIL');`,
  },
  "bind-call-apply": {
    starterCode: `Function.prototype.myBind = function (context, ...boundArgs) {\n  const fn = this;\n  return function bound(...args) {\n    if (this instanceof bound) {\n      return new fn(...boundArgs, ...args);\n    }\n    return fn.apply(context, [...boundArgs, ...args]);\n  };\n};`,
    testHarness: `function greet(greeting, punctuation) { return \`\${greeting}, \${this.name}\${punctuation}\`; }\nconst bound = greet.myBind({ name: 'Alice' }, 'Hello');\nconsole.log('Bound context (Hello, Alice!):', bound('!') === 'Hello, Alice!' ? 'PASS' : 'FAIL');`,
  },
  "deep-clone": {
    starterCode: `function deepClone(value, map = new WeakMap()) {\n  if (value === null || typeof value !== 'object') return value;\n  if (value instanceof Date) return new Date(value);\n  if (map.has(value)) return map.get(value);\n  const copy = Array.isArray(value) ? [] : {};\n  map.set(value, copy);\n  for (const key of Object.keys(value)) {\n    copy[key] = deepClone(value[key], map);\n  }\n  return copy;\n}`,
    testHarness: `const obj = { a: 1, nested: { b: 2 } };\nobj.self = obj; // cycle\nconst clone = deepClone(obj);\nconsole.log('Cycle preserved:', clone.self === clone ? 'PASS' : 'FAIL');\nconsole.log('Nested cloned:', clone.nested !== obj.nested && clone.nested.b === 2 ? 'PASS' : 'FAIL');`,
  },
  "event-emitter": {
    starterCode: `class EventEmitter {\n  constructor() { this.events = new Map(); }\n  on(name, listener) {\n    if (!this.events.has(name)) this.events.set(name, []);\n    this.events.get(name).push(listener);\n  }\n  off(name, listener) {\n    if (!this.events.has(name)) return;\n    this.events.set(name, this.events.get(name).filter(l => l !== listener));\n  }\n  emit(name, ...args) {\n    if (!this.events.has(name)) return;\n    [...this.events.get(name)].forEach(fn => fn(...args));\n  }\n}`,
    testHarness: `const ee = new EventEmitter();\nlet count = 0;\nconst handler = (x) => count += x;\nee.on('inc', handler);\nee.emit('inc', 5);\nee.off('inc', handler);\nee.emit('inc', 5);\nconsole.log('Emitter fired and unsubscribed (count === 5):', count === 5 ? 'PASS' : 'FAIL');`,
  },
  "curry-compose": {
    starterCode: `function curry(fn) {\n  return function curried(...args) {\n    if (args.length >= fn.length) return fn.apply(this, args);\n    return (...nextArgs) => curried.apply(this, [...args, ...nextArgs]);\n  };\n}\nfunction pipe(...fns) {\n  return (x) => fns.reduce((v, f) => f(v), x);\n}`,
    testHarness: `const add = (a, b, c) => a + b + c;\nconst cAdd = curry(add);\nconsole.log('Curry 3 args:', cAdd(1)(2)(3) === 6 ? 'PASS' : 'FAIL');\nconst pipeline = pipe(x => x + 1, x => x * 2);\nconsole.log('Pipe result ((2+1)*2 === 6):', pipeline(2) === 6 ? 'PASS' : 'FAIL');`,
  },
  "promise-all-polyfill": {
    starterCode: `function promiseAll(iterable) {\n  return new Promise((resolve, reject) => {\n    const items = Array.from(iterable);\n    if (items.length === 0) return resolve([]);\n    const results = new Array(items.length);\n    let completed = 0;\n    items.forEach((item, i) => {\n      Promise.resolve(item).then(val => {\n        results[i] = val;\n        if (++completed === items.length) resolve(results);\n      }, reject);\n    });\n  });\n}`,
    testHarness: `const p = await promiseAll([Promise.resolve(1), 2, Promise.resolve(3)]);\nconsole.log('Promise.all polyfill [1,2,3]:', JSON.stringify(p) === '[1,2,3]' ? 'PASS' : 'FAIL', p);`,
  },
  "promise-pool": {
    starterCode: `async function pool(tasks, limit) {\n  const results = [];\n  let index = 0;\n  async function worker() {\n    while (index < tasks.length) {\n      const currentIndex = index++;\n      results[currentIndex] = await tasks[currentIndex]();\n    }\n  }\n  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));\n  return results;\n}`,
    testHarness: `const tasks = [() => Promise.resolve('a'), () => Promise.resolve('b'), () => Promise.resolve('c')];\nconst out = await pool(tasks, 2);\nconsole.log('Pool executed in order:', JSON.stringify(out) === '["a","b","c"]' ? 'PASS' : 'FAIL', out);`,
  },
  "retry-with-backoff": {
    starterCode: `async function retry(fn, { retries = 3, baseDelay = 20, factor = 2, signal }) {\n  let attempt = 0;\n  while (true) {\n    if (signal?.aborted) throw new Error('Aborted');\n    try {\n      return await fn();\n    } catch (err) {\n      if (attempt++ >= retries) throw err;\n      await new Promise(r => setTimeout(r, baseDelay * Math.pow(factor, attempt)));\n    }\n  }\n}`,
    testHarness: `let fails = 0;\nconst flaky = async () => { if (++fails < 2) throw new Error('fail'); return 'success'; };\nconst res = await retry(flaky, { retries: 3, baseDelay: 10 });\nconsole.log('Retried to success:', res === 'success' ? 'PASS' : 'FAIL');`,
  },
  "fetch-timeout-dedupe": {
    starterCode: `const inFlight = new Map();\nfunction dedupeFetch(key, fn) {\n  if (inFlight.has(key)) return inFlight.get(key);\n  const promise = fn().finally(() => inFlight.delete(key));\n  inFlight.set(key, promise);\n  return promise;\n}`,
    testHarness: `let networkCalls = 0;\nconst mockReq = () => new Promise(r => setTimeout(() => { networkCalls++; r('data'); }, 30));\nconst [a, b] = await Promise.all([\n  dedupeFetch('item-1', mockReq),\n  dedupeFetch('item-1', mockReq)\n]);\nconsole.log('Deduplicated network calls (calls === 1):', networkCalls === 1 ? 'PASS' : 'FAIL');`,
  },
  "async-queue-scheduler": {
    starterCode: `class AsyncQueue {\n  constructor() { this.queue = Promise.resolve(); }\n  add(task) {\n    return new Promise((resolve, reject) => {\n      this.queue = this.queue.then(() => task().then(resolve, reject));\n    });\n  }\n}`,
    testHarness: `const q = new AsyncQueue();\nconst order = [];\nq.add(async () => { order.push(1); });\nq.add(async () => { order.push(2); });\nawait q.add(async () => { order.push(3); });\nconsole.log('Sequential async order:', JSON.stringify(order) === '[1,2,3]' ? 'PASS' : 'FAIL');`,
  },
  "express-middleware-chain": {
    starterCode: `class MiddlewarePipeline {\n  constructor() { this.stack = []; }\n  use(fn) { this.stack.push(fn); }\n  handle(req, res) {\n    let idx = 0;\n    const next = (err) => {\n      const layer = this.stack[idx++];\n      if (!layer) return;\n      try { layer(req, res, next); } catch(e) { next(e); }\n    };\n    next();\n  }\n}`,
    testHarness: `const app = new MiddlewarePipeline();\nconst trail = [];\napp.use((req, res, next) => { trail.push('A'); next(); });\napp.use((req, res, next) => { trail.push('B'); next(); });\napp.handle({}, {});\nconsole.log('Middleware executed in order:', JSON.stringify(trail) === '["A","B"]' ? 'PASS' : 'FAIL');`,
  },
  "rate-limiter-middleware": {
    starterCode: `class TokenBucket {\n  constructor(capacity, fillRatePerSec) {\n    this.capacity = capacity;\n    this.tokens = capacity;\n    this.fillRate = fillRatePerSec;\n    this.last = Date.now();\n  }\n  allow() {\n    const now = Date.now();\n    this.tokens = Math.min(this.capacity, this.tokens + ((now - this.last) / 1000) * this.fillRate);\n    this.last = now;\n    if (this.tokens >= 1) { this.tokens -= 1; return true; }\n    return false;\n  }\n}`,
    testHarness: `const tb = new TokenBucket(2, 1);\nconsole.log('Token 1 allowed:', tb.allow() === true ? 'PASS' : 'FAIL');\nconsole.log('Token 2 allowed:', tb.allow() === true ? 'PASS' : 'FAIL');\nconsole.log('Token 3 blocked:', tb.allow() === false ? 'PASS' : 'FAIL');`,
  },
  "lru-cache-ttl": {
    starterCode: `class LRUCacheTTL {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n  get(key) {\n    if (!this.cache.has(key)) return -1;\n    const entry = this.cache.get(key);\n    if (entry.expiry && Date.now() > entry.expiry) { this.cache.delete(key); return -1; }\n    this.cache.delete(key); this.cache.set(key, entry);\n    return entry.value;\n  }\n  set(key, value, ttl = 0) {\n    this.cache.delete(key);\n    if (this.cache.size >= this.capacity) this.cache.delete(this.cache.keys().next().value);\n    this.cache.set(key, { value, expiry: ttl ? Date.now() + ttl : 0 });\n  }\n}`,
    testHarness: `const l = new LRUCacheTTL(2);\nl.set('a', 10, 50);\nconsole.log('Valid get (10):', l.get('a') === 10 ? 'PASS' : 'FAIL');\nsetTimeout(() => {\n  console.log('Expired get (-1):', l.get('a') === -1 ? 'PASS' : 'FAIL');\n}, 70);`,
  },

  // --- DATA STRUCTURES & COLLECTIONS ---
  "map-frequency-counter": {
    starterCode: `function countFrequencies(arr) {\n  const map = new Map();\n  for (const item of arr) {\n    map.set(item, (map.get(item) || 0) + 1);\n  }\n  return map;\n}`,
    testHarness: `const m = countFrequencies(['a', 'b', 'a', 'c', 'b', 'a']);\nconsole.log('Frequency of a === 3:', m.get('a') === 3 ? 'PASS' : 'FAIL');\nconsole.log('Frequency of b === 2:', m.get('b') === 2 ? 'PASS' : 'FAIL');`,
  },
  "set-unique-operations": {
    starterCode: `function arrayIntersection(a, b) {\n  const setA = new Set(a);\n  const intersection = new Set();\n  for (const item of b) {\n    if (setA.has(item)) intersection.add(item);\n  }\n  return Array.from(intersection);\n}`,
    testHarness: `const r = arrayIntersection([1, 2, 2, 1], [2, 2]);\nconsole.log('Intersection ([2]):', JSON.stringify(r) === '[2]' ? 'PASS' : 'FAIL');`,
  },
  "array-flatten-recursive": {
    starterCode: `function flatten(arr) {\n  let res = [];\n  for (const item of arr) {\n    if (Array.isArray(item)) res = res.concat(flatten(item));\n    else res.push(item);\n  }\n  return res;\n}`,
    testHarness: `const res = flatten([1, [2, [3, 4], 5]]);\nconsole.log('Flattened deep array [1,2,3,4,5]:', JSON.stringify(res) === '[1,2,3,4,5]' ? 'PASS' : 'FAIL');`,
  },
  "custom-array-reduce": {
    starterCode: `function myReduce(arr, callback, initialValue) {\n  let hasInitial = arguments.length >= 3;\n  if (arr.length === 0 && !hasInitial) throw new TypeError('Reduce of empty array with no initial value');\n  let acc = hasInitial ? initialValue : arr[0];\n  let start = hasInitial ? 0 : 1;\n  for (let i = start; i < arr.length; i++) {\n    if (i in arr) acc = callback(acc, arr[i], i, arr);\n  }\n  return acc;\n}`,
    testHarness: `const sum = myReduce([1, 2, 3, 4], (a, b) => a + b, 0);\nconsole.log('Reduce sum (10):', sum === 10 ? 'PASS' : 'FAIL');`,
  },
  "object-deep-clone": {
    starterCode: `function deepClone(value) {\n  if (value === null || typeof value !== 'object') return value;\n  const copy = Array.isArray(value) ? [] : {};\n  for (const k of Object.keys(value)) copy[k] = deepClone(value[k]);\n  return copy;\n}`,
    testHarness: `const o = { x: [1, 2], y: { z: 3 } };\nconst c = deepClone(o);\nc.x.push(3);\nconsole.log('Deep clone isolated original:', o.x.length === 2 && c.x.length === 3 ? 'PASS' : 'FAIL');`,
  },
  "lru-cache-implementation": {
    starterCode: `class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.map = new Map();\n  }\n  get(key) {\n    if (!this.map.has(key)) return -1;\n    const val = this.map.get(key);\n    this.map.delete(key);\n    this.map.set(key, val);\n    return val;\n  }\n  put(key, val) {\n    this.map.delete(key);\n    if (this.map.size >= this.capacity) this.map.delete(this.map.keys().next().value);\n    this.map.set(key, val);\n  }\n}`,
    testHarness: `const lru = new LRUCache(2);\nlru.put(1, 1); lru.put(2, 2);\nconsole.log('Get 1:', lru.get(1) === 1 ? 'PASS' : 'FAIL');\nlru.put(3, 3); // evicts 2\nconsole.log('Key 2 evicted:', lru.get(2) === -1 ? 'PASS' : 'FAIL');`,
  },
  "currying-function": {
    starterCode: `function curry(fn) {\n  return function curried(...args) {\n    if (args.length >= fn.length) return fn.apply(this, args);\n    return (...next) => curried.apply(this, [...args, ...next]);\n  };\n}`,
    testHarness: `const mult = (a, b, c) => a * b * c;\nconst cMult = curry(mult);\nconsole.log('Curried multiply (24):', cMult(2)(3)(4) === 24 ? 'PASS' : 'FAIL');`,
  },
  "flatten-array-object": {
    starterCode: `function flattenObject(obj, prefix = '') {\n  const res = {};\n  for (const [k, v] of Object.entries(obj)) {\n    const newKey = prefix ? \`\${prefix}.\${k}\` : k;\n    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(res, flattenObject(v, newKey));\n    else res[newKey] = v;\n  }\n  return res;\n}`,
    testHarness: `const nested = { a: 1, b: { c: 2, d: { e: 3 } } };\nconst flat = flattenObject(nested);\nconsole.log('Dot path flattened:', flat['b.c'] === 2 && flat['b.d.e'] === 3 ? 'PASS' : 'FAIL', flat);`,
  },
  "group-by-count-by": {
    starterCode: `function groupBy(items, keyFnOrProp) {\n  const fn = typeof keyFnOrProp === 'function' ? keyFnOrProp : (x) => x[keyFnOrProp];\n  return items.reduce((acc, item, idx) => {\n    const key = fn(item, idx);\n    if (!acc[key]) acc[key] = [];\n    acc[key].push(item);\n    return acc;\n  }, {});\n}`,
    testHarness: `const data = [{ role: 'admin', name: 'A' }, { role: 'user', name: 'B' }, { role: 'admin', name: 'C' }];\nconst g = groupBy(data, 'role');\nconsole.log('Grouped admins (length === 2):', g.admin?.length === 2 ? 'PASS' : 'FAIL', g);`,
  },
  "array-method-polyfills": {
    starterCode: `Array.prototype.myMap = function (callback, thisArg) {\n  const res = new Array(this.length);\n  for (let i = 0; i < this.length; i++) {\n    if (i in this) res[i] = callback.call(thisArg, this[i], i, this);\n  }\n  return res;\n};`,
    testHarness: `const doubled = [1, 2, 3].myMap(x => x * 2);\nconsole.log('myMap doubled [2,4,6]:', JSON.stringify(doubled) === '[2,4,6]' ? 'PASS' : 'FAIL');`,
  },
  "get-set-path": {
    starterCode: `function get(obj, path, defaultValue) {\n  const keys = path.replace(/\\[(\\d+)\\]/g, '.$1').split('.');\n  let curr = obj;\n  for (const k of keys) {\n    if (curr == null) return defaultValue;\n    curr = curr[k];\n  }\n  return curr === undefined ? defaultValue : curr;\n}`,
    testHarness: `const o = { a: [{ b: { c: 99 } }] };\nconsole.log('get path (99):', get(o, 'a[0].b.c') === 99 ? 'PASS' : 'FAIL');\nconsole.log('get missing with default (0):', get(o, 'a[0].b.missing', 0) === 0 ? 'PASS' : 'FAIL');`,
  },
  "deep-equal": {
    starterCode: `function deepEqual(a, b) {\n  if (a === b) return true;\n  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;\n  const keysA = Object.keys(a);\n  const keysB = Object.keys(b);\n  if (keysA.length !== keysB.length) return false;\n  for (const k of keysA) {\n    if (!keysB.includes(k) || !deepEqual(a[k], b[k])) return false;\n  }\n  return true;\n}`,
    testHarness: `console.log('Equal objects match:', deepEqual({ a: [1, 2] }, { a: [1, 2] }) === true ? 'PASS' : 'FAIL');\nconsole.log('Unequal objects fail:', deepEqual({ a: 1 }, { a: 2 }) === false ? 'PASS' : 'FAIL');`,
  },
  "unique-sort-dedupe": {
    starterCode: `function dedupeAndSort(records, sortBy = 'id') {\n  const map = new Map();\n  for (const r of records) map.set(r.id, r); // latest wins\n  return Array.from(map.values()).sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : -1));\n}`,
    testHarness: `const recs = [{ id: 1, v: 'old' }, { id: 2, v: 'mid' }, { id: 1, v: 'latest' }];\nconst out = dedupeAndSort(recs);\nconsole.log('Latest won and deduped (length 2):', out.length === 2 && out[0].v === 'latest' ? 'PASS' : 'FAIL', out);`,
  },

  // --- ALGORITHMS ---
  "two-pointer-sorted-sum": {
    starterCode: `function twoSumSorted(numbers, target) {\n  let l = 0, r = numbers.length - 1;\n  while (l < r) {\n    const s = numbers[l] + numbers[r];\n    if (s === target) return [l + 1, r + 1];\n    if (s < target) l++;\n    else r--;\n  }\n  return [];\n}`,
    testHarness: `console.log('twoSumSorted [2,7,11,15], target 9 -> [1,2]:', JSON.stringify(twoSumSorted([2, 7, 11, 15], 9)) === '[1,2]' ? 'PASS' : 'FAIL');\nconsole.log('twoSumSorted [2,3,4], target 6 -> [1,3]:', JSON.stringify(twoSumSorted([2, 3, 4], 6)) === '[1,3]' ? 'PASS' : 'FAIL');`,
  },
  "two-sum-hashmap": {
    starterCode: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
    testHarness: `const res = twoSum([2, 7, 11, 15], 9);\nconsole.log('twoSum hashmap ([0, 1]):', JSON.stringify(res) === '[0,1]' ? 'PASS' : 'FAIL', res);`,
  },
  "sliding-window-dynamic": {
    starterCode: `function lengthOfLongestSubstring(s) {\n  const map = new Map();\n  let maxLen = 0, start = 0;\n  for (let i = 0; i < s.length; i++) {\n    if (map.has(s[i]) && map.get(s[i]) >= start) start = map.get(s[i]) + 1;\n    map.set(s[i], i);\n    maxLen = Math.max(maxLen, i - start + 1);\n  }\n  return maxLen;\n}`,
    testHarness: `console.log('"abcabcbb" (3):', lengthOfLongestSubstring("abcabcbb") === 3 ? 'PASS' : 'FAIL');\nconsole.log('"bbbbb" (1):', lengthOfLongestSubstring("bbbbb") === 1 ? 'PASS' : 'FAIL');\nconsole.log('"pwwkew" (3):', lengthOfLongestSubstring("pwwkew") === 3 ? 'PASS' : 'FAIL');`,
  },
  "sliding-window-fixed": {
    starterCode: `function maxSubarraySum(arr, k) {\n  if (arr.length < k) return null;\n  let max = 0, window = 0;\n  for (let i = 0; i < k; i++) window += arr[i];\n  max = window;\n  for (let i = k; i < arr.length; i++) {\n    window += arr[i] - arr[i - k];\n    max = Math.max(max, window);\n  }\n  return max;\n}`,
    testHarness: `console.log('[2,1,5,1,3,2], k=3 (9):', maxSubarraySum([2, 1, 5, 1, 3, 2], 3) === 9 ? 'PASS' : 'FAIL');\nconsole.log('[2,3,4,1,5], k=2 (7):', maxSubarraySum([2, 3, 4, 1, 5], 2) === 7 ? 'PASS' : 'FAIL');`,
  },
  "valid-parentheses-stack": {
    starterCode: `function isValidParentheses(s) {\n  const stack = [];\n  const pairs = { ')': '(', '}': '{', ']': '[' };\n  for (const char of s) {\n    if (char === '(' || char === '{' || char === '[') stack.push(char);\n    else if (stack.pop() !== pairs[char]) return false;\n  }\n  return stack.length === 0;\n}`,
    testHarness: `console.log('"()[]{}" (true):', isValidParentheses("()[]{}") === true ? 'PASS' : 'FAIL');\nconsole.log('"(]" (false):', isValidParentheses("(]") === false ? 'PASS' : 'FAIL');`,
  },
  "binary-search-exact": {
    starterCode: `function binarySearch(nums, target) {\n  let l = 0, r = nums.length - 1;\n  while (l <= r) {\n    const mid = Math.floor((l + r) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) l = mid + 1;\n    else r = mid - 1;\n  }\n  return -1;\n}`,
    testHarness: `const arr = [-1, 0, 3, 5, 9, 12];\nconsole.log('Target 9 at index 4:', binarySearch(arr, 9) === 4 ? 'PASS' : 'FAIL');\nconsole.log('Target 2 not found (-1):', binarySearch(arr, 2) === -1 ? 'PASS' : 'FAIL');`,
  },
  "tree-level-order-bfs": {
    starterCode: `function levelOrder(root) {\n  if (!root) return [];\n  const res = [];\n  const q = [root];\n  while (q.length) {\n    const size = q.length;\n    const level = [];\n    for (let i = 0; i < size; i++) {\n      const node = q.shift();\n      level.push(node.val);\n      if (node.left) q.push(node.left);\n      if (node.right) q.push(node.right);\n    }\n    res.push(level);\n  }\n  return res;\n}`,
    testHarness: `const tree = { val: 3, left: { val: 9 }, right: { val: 20, left: { val: 15 }, right: { val: 7 } } };\nconst levels = levelOrder(tree);\nconsole.log('BFS Levels [[3],[9,20],[15,7]]:', JSON.stringify(levels) === '[[3],[9,20],[15,7]]' ? 'PASS' : 'FAIL', levels);`,
  },
  "merge-intervals": {
    starterCode: `function mergeIntervals(intervals) {\n  if (!intervals.length) return [];\n  intervals.sort((a, b) => a[0] - b[0]);\n  const res = [intervals[0]];\n  for (let i = 1; i < intervals.length; i++) {\n    const curr = intervals[i];\n    const prev = res[res.length - 1];\n    if (curr[0] <= prev[1]) prev[1] = Math.max(prev[1], curr[1]);\n    else res.push(curr);\n  }\n  return res;\n}`,
    testHarness: `const merged = mergeIntervals([[1,3],[2,6],[8,10],[15,18]]);\nconsole.log('Merged [[1,6],[8,10],[15,18]]:', JSON.stringify(merged) === '[[1,6],[8,10],[15,18]]' ? 'PASS' : 'FAIL', merged);`,
  },
  "interval-merge-sliding-window": {
    starterCode: `function mergeIntervals(intervals) {\n  intervals.sort((a, b) => a[0] - b[0]);\n  const res = [intervals[0]];\n  for (let i = 1; i < intervals.length; i++) {\n    const [s, e] = intervals[i];\n    const last = res[res.length - 1];\n    if (s <= last[1]) last[1] = Math.max(last[1], e);\n    else res.push([s, e]);\n  }\n  return res;\n}`,
    testHarness: `const r = mergeIntervals([[1,4],[4,5]]);\nconsole.log('Touching intervals merged [[1,5]]:', JSON.stringify(r) === '[[1,5]]' ? 'PASS' : 'FAIL');`,
  },
  "tree-traversal-dom": {
    starterCode: `function getElementsByClassName(node, className) {\n  let results = [];\n  if (node.classList && node.classList.contains(className)) results.push(node);\n  for (const child of (node.children || [])) {\n    results = results.concat(getElementsByClassName(child, className));\n  }\n  return results;\n}`,
    testHarness: `const mockDom = { classList: { contains: () => false }, children: [\n  { classList: { contains: (c) => c === 'hit' }, id: 'el-1', children: [] },\n  { classList: { contains: () => false }, children: [{ classList: { contains: (c) => c === 'hit' }, id: 'el-2', children: [] }] }\n]};\nconst hits = getElementsByClassName(mockDom, 'hit');\nconsole.log('Found 2 elements by class name:', hits.length === 2 ? 'PASS' : 'FAIL', hits.map(h => h.id));`,
  },

  // --- REACT HOOKS & COMPONENTS (Contract & Behavior Harnesses) ---
  "hook-fetch-cleanup": {
    starterCode: `// React custom hook signature\nfunction useFetch(url) {\n  // Implement state { data, loading, error }\n  // Use AbortController in useEffect cleanup\n}`,
    testHarness: `console.log('useFetch defined as function:', typeof useFetch === 'function' ? 'PASS' : 'FAIL');`,
  },
  "use-fetch-hook": {
    starterCode: `function useFetch(url) {\n  // Implement state { data, error, loading }\n  // Abort request and guard against setting state on unmount\n}`,
    testHarness: `console.log('useFetch defined as function:', typeof useFetch === 'function' ? 'PASS' : 'FAIL');`,
  },
  "hook-use-debounce": {
    starterCode: `function useDebounce(value, delay) {\n  // Custom hook returning debounced value\n}`,
    testHarness: `console.log('useDebounce defined as function:', typeof useDebounce === 'function' ? 'PASS' : 'FAIL');`,
  },
  "use-debounce-hook": {
    starterCode: `function useDebounce(value, delay) {\n  // Custom hook returning debounced value\n}`,
    testHarness: `console.log('useDebounce defined as function:', typeof useDebounce === 'function' ? 'PASS' : 'FAIL');`,
  },
  "controlled-vs-uncontrolled-input": {
    starterCode: `function SearchForm({ onSearch }) {\n  // Controlled input component with onSubmit\n}`,
    testHarness: `console.log('SearchForm component defined:', typeof SearchForm === 'function' ? 'PASS' : 'FAIL');`,
  },
  "hook-use-previous": {
    starterCode: `function usePrevious(value) {\n  // Return previous render value using useRef & useEffect\n}`,
    testHarness: `console.log('usePrevious defined as function:', typeof usePrevious === 'function' ? 'PASS' : 'FAIL');`,
  },
  "use-previous-latest-ref": {
    starterCode: `function useLatest(value) {\n  // Return ref holding latest value\n}\nfunction useInterval(callback, delay) {\n  // Set up interval with ref to prevent stale closures\n}`,
    testHarness: `console.log('useLatest & useInterval defined:', typeof useLatest === 'function' && typeof useInterval === 'function' ? 'PASS' : 'FAIL');`,
  },
  "use-reducer-todo-list": {
    starterCode: `function todoReducer(state, action) {\n  switch (action.type) {\n    case 'ADD_TODO': return [...state, { id: Date.now(), text: action.payload, done: false }];\n    case 'TOGGLE_TODO': return state.map(t => t.id === action.payload ? { ...t, done: !t.done } : t);\n    case 'REMOVE_TODO': return state.filter(t => t.id !== action.payload);\n    default: return state;\n  }\n}`,
    testHarness: `const s0 = [];\nconst s1 = todoReducer(s0, { type: 'ADD_TODO', payload: 'Practice' });\nconsole.log('Reducer added todo:', s1.length === 1 && s1[0].text === 'Practice' ? 'PASS' : 'FAIL');`,
  },
  "todo-list-reducer": {
    starterCode: `function todoReducer(state, action) {\n  switch (action.type) {\n    case 'ADD': return [...state, action.payload];\n    case 'TOGGLE': return state.map(t => t.id === action.id ? { ...t, done: !t.done } : t);\n    case 'DELETE': return state.filter(t => t.id !== action.id);\n    default: return state;\n  }\n}`,
    testHarness: `const state = todoReducer([{ id: 1, done: false }], { type: 'TOGGLE', id: 1 });\nconsole.log('Reducer toggled done:', state[0].done === true ? 'PASS' : 'FAIL');`,
  },
  "infinite-scroll-observer": {
    starterCode: `function useInfiniteScroll(onLoadMore) {\n  // Attach IntersectionObserver to sentinel ref\n}`,
    testHarness: `console.log('useInfiniteScroll defined:', typeof useInfiniteScroll === 'function' ? 'PASS' : 'FAIL');`,
  },
  "infinite-scroll-list": {
    starterCode: `function InfiniteList({ onLoadMore }) {\n  // Render sentinel div with IntersectionObserver\n}`,
    testHarness: `console.log('InfiniteList defined:', typeof InfiniteList === 'function' ? 'PASS' : 'FAIL');`,
  },
  "context-provider-consumer": {
    starterCode: `function createThemeContext() {\n  // ThemeContext with useTheme hook\n}`,
    testHarness: `console.log('createThemeContext defined:', typeof createThemeContext === 'function' ? 'PASS' : 'FAIL');`,
  },
  "typeahead-autocomplete": {
    starterCode: `function Typeahead({ onSelect, fetchSuggestions }) {\n  // Debounced input with keyboard navigation\n}`,
    testHarness: `console.log('Typeahead defined:', typeof Typeahead === 'function' ? 'PASS' : 'FAIL');`,
  },
  "modal-portal-focus": {
    starterCode: `function Modal({ isOpen, onClose, children }) {\n  // Render via createPortal with Escape key and focus trap\n}`,
    testHarness: `console.log('Modal component defined:', typeof Modal === 'function' ? 'PASS' : 'FAIL');`,
  },
  "tabs-accordion-compound": {
    starterCode: `function Tabs({ children, defaultValue }) {\n  // Context-backed compound tabs container\n}`,
    testHarness: `console.log('Tabs component defined:', typeof Tabs === 'function' ? 'PASS' : 'FAIL');`,
  },
};

let populatedCount = 0;
const enrichedTopics = topics.map((topic) => {
  const fixture = fixtureRegistry[topic.id];
  if (fixture) {
    populatedCount++;
    return {
      ...topic,
      starterCode: fixture.starterCode,
      testHarness: fixture.testHarness,
    };
  }

  // Safe fallback for any unmatched key
  const funcName = topic.id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  return {
    ...topic,
    starterCode:
      topic.starterCode || `function ${funcName}() {\n  // Implementation\n}`,
    testHarness:
      topic.testHarness ||
      `console.log('${topic.title} loaded:', typeof ${funcName} === 'function' ? 'PASS' : 'FAIL');`,
  };
});

fs.writeFileSync(filePath, JSON.stringify(enrichedTopics, null, 2));
console.log(
  `Enriched ${populatedCount} exact fixtures. Total deck size: ${enrichedTopics.length} topics saved to ${filePath}`,
);
