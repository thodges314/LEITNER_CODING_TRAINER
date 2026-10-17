import { writeCards, R } from './_author.mjs';

writeCards([
  {
    id: 'promise-any-aggregate',
    title: 'Promises: Promise.any and AggregateError Polyfill',
    tags: ['promise', 'promise-combinators', 'aggregate-error', 'async'],
    difficulty: 3,
    concept: 'promise-combinators',
    track: 'async-web-plumbing',
    cx: ['O(n)', 'O(n)', 'Races n promises, resolving on first fulfillment or collecting all n errors.'],
    prompt: "Write promiseAny(promises): takes an iterable of promises (or plain values). Returns a Promise that fulfills as soon as any input promise fulfills, with the first fulfillment value. If all input promises reject (or the iterable is empty), the returned Promise rejects with an AggregateError whose errors property contains all rejection reasons in their original input order, and whose message is 'All promises were rejected'.",
    ref: R`function promiseAny(promises) {
  const items = Array.from(promises);
  if (items.length === 0) {
    const err = typeof AggregateError !== 'undefined'
      ? new AggregateError([], 'All promises were rejected')
      : Object.assign(new Error('All promises were rejected'), { name: 'AggregateError', errors: [] });
    return Promise.reject(err);
  }
  return new Promise((resolve, reject) => {
    const errors = new Array(items.length);
    let rejectedCount = 0;
    items.forEach((p, index) => {
      Promise.resolve(p).then(
        (val) => resolve(val),
        (reason) => {
          errors[index] = reason;
          rejectedCount++;
          if (rejectedCount === items.length) {
            const err = typeof AggregateError !== 'undefined'
              ? new AggregateError(errors, 'All promises were rejected')
              : Object.assign(new Error('All promises were rejected'), { name: 'AggregateError', errors });
            reject(err);
          }
        }
      );
    });
  });
}`
  },
  {
    id: 'cancelable-promise-abort',
    title: 'Async Control: Cancelable Promises and withTimeout Wrapper',
    tags: ['async', 'promise', 'cancellation', 'timeout'],
    difficulty: 3,
    concept: 'async-control',
    track: 'async-js',
    cx: ['O(1)', 'O(1)', 'Wraps target promise with a cancellation flag or timer cleanup.'],
    prompt: "Write makeCancelable(promise): wraps a promise and returns an object { promise: wrappedPromise, cancel() }. If cancel() is called while the promise is still pending, wrappedPromise rejects with an object { isCanceled: true }. If the promise already resolved or rejected before cancel() was called, its result remains unchanged. Write withTimeout(promise, ms, timeoutError = new Error('Timeout')): returns a Promise that settles with the result of promise if it finishes within ms; otherwise rejects with timeoutError. If promise settles before the timer expires, the timer is cleared to avoid leaking handles.",
    ref: R`function makeCancelable(promise) {
  let hasCanceled = false;
  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      (val) => (hasCanceled ? reject({ isCanceled: true }) : resolve(val)),
      (err) => (hasCanceled ? reject({ isCanceled: true }) : reject(err))
    );
  });
  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled = true;
    }
  };
}

function withTimeout(promise, ms, timeoutError = new Error('Timeout')) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(timeoutError), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}`
  },
  {
    id: 'polling-exponential-backoff',
    title: 'Async Control: Polling with Exponential Backoff and Jitter Limit',
    tags: ['async', 'polling', 'backoff', 'retry'],
    difficulty: 3,
    concept: 'async-control',
    track: 'async-js',
    cx: ['O(attempts)', 'O(1)', 'Performs up to maxAttempts polls with exponentially increasing delays.'],
    prompt: "Write pollUntil(fn, predicate, options = {}): repeatedly calls async function fn() until predicate(result) returns true. Options has defaults: { initialInterval: 50, backoffFactor: 2, maxAttempts: 5 }. It calls fn(), checks predicate(result). If true, resolves with result. If false and attempts < maxAttempts, sleeps for the current interval, multiplies interval by backoffFactor, and retries. If attempts reaches maxAttempts and predicate still returns false, rejects with new Error('Polling timed out').",
    ref: R`async function pollUntil(fn, predicate, options = {}) {
  const initialInterval = options.initialInterval ?? 50;
  const backoffFactor = options.backoffFactor ?? 2;
  const maxAttempts = options.maxAttempts ?? 5;

  let currentInterval = initialInterval;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await fn();
    if (predicate(result)) {
      return result;
    }
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, currentInterval));
      currentInterval *= backoffFactor;
    }
  }
  throw new Error('Polling timed out');
}`
  },
  {
    id: 'async-generator-pagination',
    title: 'Async Generators: Paginated Streaming API, Filter and Collect',
    tags: ['async-generator', 'pagination', 'streams', 'iterators'],
    difficulty: 4,
    concept: 'async-control',
    track: 'async-js',
    cx: ['O(N)', 'O(pageSize)', 'Yields items from multiple pages one by one as they are needed.'],
    prompt: "Write async function* paginateAll(fetchPage): fetchPage(cursor) returns a Promise resolving to { items: Array, nextCursor: any | null }. The async generator repeatedly calls fetchPage starting with cursor null, yielding each item from items one by one. It continues fetching subsequent pages using the returned nextCursor until nextCursor is null or undefined. Write async function* filterAsyncGenerator(asyncGen, predicate): yields only items from asyncGen for which await predicate(item) is truthy. Write async function collectGenerator(asyncGen, limit = Infinity): consumes asyncGen and returns an array of up to limit items.",
    ref: R`async function* paginateAll(fetchPage) {
  let cursor = null;
  while (true) {
    const page = await fetchPage(cursor);
    if (page && page.items) {
      for (const item of page.items) {
        yield item;
      }
    }
    if (!page || page.nextCursor === null || page.nextCursor === undefined) {
      break;
    }
    cursor = page.nextCursor;
  }
}

async function* filterAsyncGenerator(asyncGen, predicate) {
  for await (const item of asyncGen) {
    if (await predicate(item)) {
      yield item;
    }
  }
}

async function collectGenerator(asyncGen, limit = Infinity) {
  const result = [];
  for await (const item of asyncGen) {
    result.push(item);
    if (result.length >= limit) break;
  }
  return result;
}`
  },
  {
    id: 'pub-sub-wildcard-emitter',
    title: 'Event Architecture: PubSub with Wildcard Topics and Once Listeners',
    tags: ['pub-sub', 'event-emitter', 'wildcard', 'observer'],
    difficulty: 3,
    concept: 'emitter',
    track: 'async-js',
    cx: ['O(listeners)', 'O(topics)', 'Pattern matching against subscribed exact topics and wildcards.'],
    prompt: "Write class PubSub with methods: subscribe(pattern, handler) registers a callback and returns an unsubscribe function () => void. Patterns can be exact (e.g. 'user.login') or wildcard (e.g. 'user.*' matches any 'user.<word>', or '*' matches everything). publish(topic, data) calls matching listeners with (data, topic) and returns the count of listeners invoked. once(pattern, handler) registers a handler that runs only the first time a matching event is published, then automatically unsubscribes. clear() removes all subscriptions.",
    ref: R`class PubSub {
  constructor() {
    this.subscribers = [];
  }
  _matches(pattern, topic) {
    if (pattern === '*' || pattern === topic) return true;
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      const parts = topic.split('.');
      return parts.length === 2 && parts[0] === prefix;
    }
    return false;
  }
  subscribe(pattern, handler) {
    const sub = { pattern, handler };
    this.subscribers.push(sub);
    return () => {
      const idx = this.subscribers.indexOf(sub);
      if (idx !== -1) this.subscribers.splice(idx, 1);
    };
  }
  once(pattern, handler) {
    const unsub = this.subscribe(pattern, (data, topic) => {
      unsub();
      handler(data, topic);
    });
    return unsub;
  }
  publish(topic, data) {
    const matches = this.subscribers.filter((s) => this._matches(s.pattern, topic));
    for (const sub of matches) {
      sub.handler(data, topic);
    }
    return matches.length;
  }
  clear() {
    this.subscribers = [];
  }
}`
  }
]);
