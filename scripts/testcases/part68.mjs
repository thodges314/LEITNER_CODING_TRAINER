import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by the DOM harness', ...o });

export default {
  'sse-stream-parser': [
    c(
      'Parses a single default message event',
      String.raw`const enc = new TextEncoder();
const stream = new ReadableStream({
  start(ctrl) {
    ctrl.enqueue(enc.encode('data: hello world\n\n'));
    ctrl.close();
  },
});
const out = [];
for await (const ev of parseSseStream(stream)) out.push(ev);
out`,
      "[{ event: 'message', data: 'hello world' }]"
    ),
    c(
      'Reassembles lines and multi-byte UTF-8 characters split across chunks',
      String.raw`const enc = new TextEncoder();
const bytes = enc.encode('event: token\nid: 42\nretry: 1500\ndata: café 🚀\n\n');
const stream = new ReadableStream({
  start(ctrl) {
    ctrl.enqueue(bytes.slice(0, 10));
    ctrl.enqueue(bytes.slice(10, 35));
    ctrl.enqueue(bytes.slice(35));
    ctrl.close();
  },
});
const out = [];
for await (const ev of parseSseStream(stream)) out.push(ev);
out`,
      "[{ event: 'token', data: 'café 🚀', id: '42', retry: 1500 }]"
    ),
    c(
      'Joins multi-line data fields with newline and ignores comment lines',
      String.raw`const enc = new TextEncoder();
const stream = new ReadableStream({
  start(ctrl) {
    ctrl.enqueue(enc.encode(': keepalive\r\ndata: line 1\r\ndata: line 2\r\n\r\n'));
    ctrl.close();
  },
});
const out = [];
for await (const ev of parseSseStream(stream)) out.push(ev);
out`,
      "[{ event: 'message', data: 'line 1\\nline 2' }]"
    ),
    c(
      'Does not dispatch unterminated trailing data at EOF without a blank line',
      String.raw`const enc = new TextEncoder();
const stream = new ReadableStream({
  start(ctrl) {
    ctrl.enqueue(enc.encode('data: complete\n\ndata: incomplete'));
    ctrl.close();
  },
});
const out = [];
for await (const ev of parseSseStream(stream)) out.push(ev);
out`,
      "[{ event: 'message', data: 'complete' }]"
    ),
  ],

  'websocket-heartbeat-monitor': [
    c(
      'Sends PING on interval and clears timeout when PONG arrives',
      `const sent = [];
const listeners = { message: new Set(), close: new Set() };
const sock = {
  send: (d) => sent.push(d),
  close: () => sent.push('CLOSED'),
  addEventListener: (t, fn) => listeners[t].add(fn),
  removeEventListener: (t, fn) => listeners[t].delete(fn),
};
let timedOut = false;
const mon = createHeartbeatMonitor(sock, {
  intervalMs: 15,
  timeoutMs: 25,
  onTimeout: () => { timedOut = true; },
});
mon.start();
await sleep(20);
for (const fn of listeners.message) fn({ data: 'PONG' });
await sleep(20);
const runningBeforeStop = mon.isRunning();
mon.stop();
({ sentCount: sent.filter((x) => x === 'PING').length >= 1, timedOut, runningBeforeStop, runningAfterStop: mon.isRunning() })`,
      '{ sentCount: true, timedOut: false, runningBeforeStop: true, runningAfterStop: false }'
    ),
    c(
      'Closes socket and invokes onTimeout when no PONG arrives before timeoutMs',
      `const events = [];
const listeners = { message: new Set(), close: new Set() };
const sock = {
  send: (d) => events.push('send:' + d),
  close: (code) => events.push('close:' + code),
  addEventListener: (t, fn) => listeners[t].add(fn),
  removeEventListener: (t, fn) => listeners[t].delete(fn),
};
const mon = createHeartbeatMonitor(sock, {
  intervalMs: 10,
  timeoutMs: 20,
  pingPayload: 'HB',
  onTimeout: () => events.push('timeout'),
});
mon.start();
await sleep(55);
({ timedOut: events.includes('timeout'), closed: events.includes('close:4000'), pinged: events.includes('send:HB'), running: mon.isRunning() })`,
      '{ timedOut: true, closed: true, pinged: true, running: false }'
    ),
    c(
      'Stops automatically when socket emits close',
      `const listeners = { message: new Set(), close: new Set() };
const sock = {
  send: () => {},
  close: () => {},
  addEventListener: (t, fn) => listeners[t].add(fn),
  removeEventListener: (t, fn) => listeners[t].delete(fn),
};
const mon = createHeartbeatMonitor(sock, { intervalMs: 20, timeoutMs: 30 });
mon.start();
for (const fn of listeners.close) fn({});
({ running: mon.isRunning(), listenerCount: listeners.message.size + listeners.close.size })`,
      '{ running: false, listenerCount: 0 }'
    ),
    c(
      'Ignores non-pong messages and makes repeated start() calls idempotent',
      `const sent = [];
const listeners = { message: new Set(), close: new Set() };
const sock = {
  send: (d) => sent.push(d),
  close: () => sent.push('CLOSED'),
  addEventListener: (t, fn) => listeners[t].add(fn),
  removeEventListener: (t, fn) => listeners[t].delete(fn),
};
const mon = createHeartbeatMonitor(sock, { intervalMs: 12, timeoutMs: 22 });
mon.start();
mon.start();
await sleep(16);
for (const fn of listeners.message) fn({ data: 'OTHER' });
await sleep(30);
mon.stop();
({ listenerCount: listeners.message.size, closedOnNonPong: sent.includes('CLOSED') })`,
      '{ listenerCount: 0, closedOnNonPong: true }'
    ),
  ],

  'reconnecting-websocket': [
    c(
      'Queues outbound messages while connecting and flushes them in order on open',
      `const sockets = [];
const createSocket = () => {
  const listeners = { open: new Set(), message: new Set(), close: new Set(), error: new Set() };
  const s = {
    readyState: 0,
    sent: [],
    send: (d) => s.sent.push(d),
    close: () => { s.readyState = 3; },
    addEventListener: (t, fn) => listeners[t].add(fn),
    removeEventListener: (t, fn) => listeners[t].delete(fn),
    emit: (t, ev) => { for (const fn of [...listeners[t]]) fn(ev); },
  };
  sockets.push(s);
  return s;
};
const client = createReconnectingWebSocket('wss://example.com', { createSocket });
client.send('a');
client.send('b');
const queuedBefore = client.getQueuedCount();
sockets[0].readyState = 1;
sockets[0].emit('open');
client.send('c');
const result = { queuedBefore, queuedAfter: client.getQueuedCount(), sent: sockets[0].sent };
client.close();
result`,
      "{ queuedBefore: 2, queuedAfter: 0, sent: ['a', 'b', 'c'] }"
    ),
    c(
      'Reconnects with exponential backoff on unexpected close and ignores stale socket events',
      `const sockets = [];
const reconnects = [];
const createSocket = () => {
  const listeners = { open: new Set(), message: new Set(), close: new Set(), error: new Set() };
  const s = {
    readyState: 0,
    send: () => {},
    close: () => { s.readyState = 3; },
    addEventListener: (t, fn) => listeners[t].add(fn),
    removeEventListener: (t, fn) => listeners[t].delete(fn),
    emit: (t, ev) => { for (const fn of [...listeners[t]]) fn(ev); },
  };
  sockets.push(s);
  return s;
};
const client = createReconnectingWebSocket('wss://example.com', {
  createSocket,
  baseDelayMs: 10,
  maxDelayMs: 50,
  maxRetries: 2,
  onReconnect: (attempt, delay) => reconnects.push([attempt, delay]),
});
sockets[0].emit('close', {});
await sleep(20);
sockets[0].emit('close', {});
sockets[1].emit('close', {});
await sleep(30);
client.close();
({ socketCount: sockets.length, reconnects })`,
      '{ socketCount: 3, reconnects: [[1, 10], [2, 20]] }'
    ),
    c(
      'Manual close stops reconnection and clears queued messages',
      `const sockets = [];
const createSocket = () => {
  const listeners = { open: new Set(), message: new Set(), close: new Set(), error: new Set() };
  const s = {
    readyState: 0,
    send: () => {},
    close: () => { s.readyState = 3; for (const fn of [...listeners.close]) fn({}); },
    addEventListener: (t, fn) => listeners[t].add(fn),
    removeEventListener: (t, fn) => listeners[t].delete(fn),
  };
  sockets.push(s);
  return s;
};
const client = createReconnectingWebSocket('wss://example.com', { createSocket, baseDelayMs: 10 });
client.send('pending');
client.close();
await sleep(25);
({ socketCount: sockets.length, readyState: client.getReadyState(), queued: client.getQueuedCount() })`,
      '{ socketCount: 1, readyState: 3, queued: 0 }'
    ),
    c(
      'Resets backoff retry counter after a successful open and stops at maxRetries',
      `const sockets = [];
const delays = [];
const createSocket = () => {
  const listeners = { open: new Set(), message: new Set(), close: new Set(), error: new Set() };
  const s = {
    readyState: 0,
    send: () => {},
    close: () => { s.readyState = 3; },
    addEventListener: (t, fn) => listeners[t].add(fn),
    removeEventListener: (t, fn) => listeners[t].delete(fn),
    emit: (t, ev) => { for (const fn of [...listeners[t]]) fn(ev); },
  };
  sockets.push(s);
  return s;
};
const client = createReconnectingWebSocket('wss://example.com', {
  createSocket,
  baseDelayMs: 10,
  maxRetries: 1,
  onReconnect: (_a, d) => delays.push(d),
});
sockets[0].emit('close', {});
await sleep(20);
sockets[1].readyState = 1;
sockets[1].emit('open');
sockets[1].emit('close', {});
await sleep(20);
sockets[2].emit('close', {});
await sleep(20);
client.close();
({ socketCount: sockets.length, delays })`,
      '{ socketCount: 3, delays: [10, 10] }'
    ),
  ],

  'main-thread-chunking-yield': [
    c(
      'Processes all items in order and yields when slice exceeds budgetMs',
      `let t = 0;
let yields = 0;
const out = await processInChunks([1, 2, 3, 4, 5], (n) => { t += 10; return n * 2; }, { budgetMs: 16, now: () => t, yieldToMain: async () => { yields += 1; } });
({ out, yields })`,
      '{ out: [2, 4, 6, 8, 10], yields: 2 }'
    ),
    c(
      'Does not yield when all work fits inside a single budgetMs slice',
      `let yields = 0;
const out = await processInChunks([10, 20], (n) => n + 1, { budgetMs: 100, now: () => 0, yieldToMain: async () => { yields += 1; } });
({ out, yields })`,
      '{ out: [11, 21], yields: 0 }'
    ),
    c(
      'Rejects when AbortSignal aborts before or during chunked execution',
      `const ac = new AbortController();
let t = 0;
const opts = { budgetMs: 16, now: () => t, signal: ac.signal, yieldToMain: async () => { ac.abort(new Error('Cancelled')); } };
await processInChunks([1, 2, 3], (n) => { t += 20; return n; }, opts)`,
      '',
      { t: 'Cancelled', x: 'Rejects with Error("Cancelled")' }
    ),
    c(
      'Returns empty array without yielding when given no items',
      `let yields = 0;
const out = await processInChunks([], (x) => x, { yieldToMain: async () => { yields += 1; } });
({ out, yields })`,
      '{ out: [], yields: 0 }'
    ),
  ],

  'performance-observer-cls': [
    c(
      'Aggregates shifts within a 1s gap / 5s span session window and ignores hadRecentInput',
      `const tracker = createClsTracker();
tracker.recordEntry({ value: 0.05, startTime: 100, hadRecentInput: false });
tracker.recordEntry({ value: 0.4, startTime: 200, hadRecentInput: true });
tracker.recordEntry({ value: 0.1, startTime: 500, hadRecentInput: false });
Number(tracker.getCls().toFixed(2))`,
      '0.15'
    ),
    c(
      'Starts a new session window after >= 1000ms gap and keeps the maximum window',
      `const tracker = createClsTracker();
tracker.recordEntry({ value: 0.1, startTime: 0, hadRecentInput: false });
tracker.recordEntry({ value: 0.1, startTime: 500, hadRecentInput: false });
tracker.recordEntry({ value: 0.35, startTime: 2000, hadRecentInput: false });
Number(tracker.getCls().toFixed(2))`,
      '0.35'
    ),
    c(
      'Splits session window when total span exceeds 5000ms',
      `const tracker = createClsTracker();
for (let t = 0; t <= 5500; t += 900) {
  tracker.recordEntry({ value: 0.1, startTime: t, hadRecentInput: false });
}
Number(tracker.getCls().toFixed(1))`,
      '0.6'
    ),
    c(
      'Wires up PerformanceObserver via startObserving and disconnects cleanly',
      `let disconnected = false;
let observedOpts = null;
class MockPO {
  constructor(cb) { this.cb = cb; }
  observe(opts) {
    observedOpts = opts;
    this.cb({ getEntries: () => [{ value: 0.12, startTime: 50, hadRecentInput: false }] });
  }
  disconnect() { disconnected = true; }
}
const tracker = createClsTracker();
const stop = tracker.startObserving(MockPO);
const score = tracker.getCls();
stop();
({ score, type: observedOpts?.type, buffered: observedOpts?.buffered, disconnected })`,
      "{ score: 0.12, type: 'layout-shift', buffered: true, disconnected: true }"
    ),
  ],

  'resource-hint-preloader': [
    c(
      'Creates preload and prefetch links with fetchpriority and font crossOrigin',
      `const head = document.createElement('head');
const links = preloadResources([
  { href: '/hero.webp', as: 'image', fetchPriority: 'high' },
  { href: '/inter.woff2', as: 'font' },
  { href: '/next.js', rel: 'prefetch', as: 'script' },
], head);
const summary = links.map((l) => ({ rel: l.rel, href: l.getAttribute('href'), as: l.getAttribute('as'), fp: l.getAttribute('fetchpriority'), co: l.getAttribute('crossorigin') }));
summary`,
      "[ { rel: 'preload', href: '/hero.webp', as: 'image', fp: 'high', co: null }, { rel: 'preload', href: '/inter.woff2', as: 'font', fp: null, co: 'anonymous' }, { rel: 'prefetch', href: '/next.js', as: 'script', fp: null, co: null } ]"
    ),
    c(
      'Deduplicates against existing links in targetHead and duplicate entries in input',
      `const head = document.createElement('head');
const existing = document.createElement('link');
existing.rel = 'preload';
existing.setAttribute('href', '/hero.webp');
head.appendChild(existing);
const created = preloadResources([
  { href: '/hero.webp', as: 'image' },
  { href: '/app.css', as: 'style' },
  { href: '/app.css', as: 'style' },
], head);
({ createdHrefs: created.map((l) => l.getAttribute('href')), totalLinks: head.querySelectorAll('link').length })`,
      "{ createdHrefs: ['/app.css'], totalLinks: 2 }"
    ),
    c(
      'Respects explicit crossOrigin and fetchPriority overrides',
      `const head = document.createElement('head');
const [link] = preloadResources([{ href: '/font.woff2', as: 'font', crossOrigin: 'use-credentials', fetchPriority: 'low' }], head);
({ co: link.crossOrigin, fp: link.getAttribute('fetchpriority') })`,
      "{ co: 'use-credentials', fp: 'low' }"
    ),
    c(
      'Skips empty or invalid resource entries without throwing',
      `const head = document.createElement('head');
const created = preloadResources([{ href: '' }, null], head);
created.length`,
      '0'
    ),
  ],

  'xss-html-sanitizer': [
    c(
      'Preserves safe formatting tags and relative/HTTPS links',
      `sanitizeHtml('<p>Hello <strong>world</strong>! <a href="https://example.com" target="_blank">Docs</a></p>')`,
      `'<p>Hello <strong>world</strong>! <a href="https://example.com" target="_blank" rel="noopener noreferrer">Docs</a></p>'`
    ),
    c(
      'Removes script, iframe, and style elements completely',
      `sanitizeHtml('<div>Safe<script>alert(1)</script><iframe src="https://evil.com"></iframe><style>body{display:none}</style></div>')`,
      `'<div>Safe</div>'`
    ),
    c(
      'Strips inline event handlers and obfuscated javascript: hrefs',
      `sanitizeHtml('<p onclick="steal()">Click</p><a href="java\\nscript:alert(1)">Bad</a>')`,
      `'<p>Click</p><a>Bad</a>'`
    ),
    c(
      'Unwraps non-allowlisted benign tags while preserving text',
      `sanitizeHtml('<custom-tag>Keep <em>text</em></custom-tag>')`,
      `'Keep <em>text</em>'`
    ),
  ],

  'secure-postmessage-bridge': [
    c(
      'Sends channel-scoped messages with pinned targetOrigin',
      `const posted = [];
const listeners = new Set();
const targetWindow = { postMessage: (msg, origin) => posted.push({ msg, origin }) };
const listenWindow = {
  addEventListener: (_t, fn) => listeners.add(fn),
  removeEventListener: (_t, fn) => listeners.delete(fn),
};
const bridge = createSecureBridge({
  targetWindow,
  listenWindow,
  targetOrigin: 'https://app.example.com',
  allowedOrigins: ['https://app.example.com'],
  channel: 'ch-1',
});
bridge.send('READY', { ok: true });
bridge.destroy();
({ posted, listenerCount: listeners.size })`,
      "[{ msg: { __channel: 'ch-1', type: 'READY', payload: { ok: true } }, origin: 'https://app.example.com' }]".replace(/^/, "{ posted: ") + ", listenerCount: 0 }"
    ),
    c(
      'Accepts messages only from allowedOrigins and matching channel',
      `const received = [];
const listeners = new Set();
const targetWindow = { postMessage: () => {} };
const listenWindow = {
  addEventListener: (_t, fn) => listeners.add(fn),
  removeEventListener: (_t, fn) => listeners.delete(fn),
};
const bridge = createSecureBridge({
  targetWindow,
  listenWindow,
  targetOrigin: 'https://trusted.test',
  allowedOrigins: ['https://trusted.test'],
  channel: 'ch-1',
  requireSourceMatch: true,
  onMessage: (type, payload, origin) => received.push({ type, payload, origin }),
});
const emit = (ev) => { for (const fn of listeners) fn(ev); };
emit({ origin: 'https://evil.test', source: targetWindow, data: { __channel: 'ch-1', type: 'PING', payload: 1 } });
emit({ origin: 'https://trusted.test', source: {}, data: { __channel: 'ch-1', type: 'PING', payload: 2 } });
emit({ origin: 'https://trusted.test', source: targetWindow, data: { __channel: 'other', type: 'PING', payload: 3 } });
emit({ origin: 'https://trusted.test', source: targetWindow, data: { __channel: 'ch-1', type: 'PING', payload: 4 } });
bridge.destroy();
received`,
      "[{ type: 'PING', payload: 4, origin: 'https://trusted.test' }]"
    ),
    c(
      'Generates a default channel token and stops delivering messages after destroy()',
      `const received = [];
const listeners = new Set();
const bridge = createSecureBridge({
  targetWindow: { postMessage: () => {} },
  listenWindow: { addEventListener: (_t, fn) => listeners.add(fn), removeEventListener: (_t, fn) => listeners.delete(fn) },
  targetOrigin: 'https://trusted.test',
  allowedOrigins: ['https://trusted.test'],
  onMessage: (type) => received.push(type),
});
const ch = bridge.getChannel();
bridge.destroy();
bridge.send('AFTER_DESTROY', {});
for (const fn of listeners) fn({ origin: 'https://trusted.test', data: { __channel: ch, type: 'LATE' } });
({ hasChannel: typeof ch === 'string' && ch.length > 0, receivedCount: received.length })`,
      '{ hasChannel: true, receivedCount: 0 }'
    ),
    c(
      'Ignores malformed or non-object message payloads',
      `const received = [];
const listeners = new Set();
const bridge = createSecureBridge({
  targetWindow: { postMessage: () => {} },
  listenWindow: { addEventListener: (_t, fn) => listeners.add(fn), removeEventListener: (_t, fn) => listeners.delete(fn) },
  targetOrigin: 'https://trusted.test',
  allowedOrigins: ['https://trusted.test'],
  channel: 'c1',
  onMessage: (type) => received.push(type),
});
for (const fn of listeners) {
  fn({ origin: 'https://trusted.test', data: null });
  fn({ origin: 'https://trusted.test', data: { __channel: 'c1', type: 123 } });
}
bridge.destroy();
received.length`,
      '0'
    ),
  ],

  'worker-message-protocol': [
    c(
      'Correlates concurrent request/response messages by id',
      `const listeners = { message: new Set(), error: new Set() };
const worker = {
  postMessage: (msg) => {
    setTimeout(() => {
      const res = msg.type === 'double' ? { id: msg.id, ok: true, result: msg.payload * 2 } : { id: msg.id, ok: false, error: 'Unknown' };
      for (const fn of listeners.message) fn({ data: res });
    }, msg.payload === 10 ? 15 : 5);
  },
  addEventListener: (t, fn) => listeners[t].add(fn),
  removeEventListener: (t, fn) => listeners[t].delete(fn),
};
const client = createWorkerClient(worker);
const [a, b] = await Promise.all([client.request('double', 10), client.request('double', 3)]);
const pendingAfter = client.pendingCount();
client.dispose();
({ a, b, pendingAfter })`,
      '{ a: 20, b: 6, pendingAfter: 0 }'
    ),
    c(
      'Rejects when worker responds with ok: false or request times out',
      `const listeners = { message: new Set(), error: new Set() };
const worker = {
  postMessage: () => {},
  addEventListener: (t, fn) => listeners[t].add(fn),
  removeEventListener: (t, fn) => listeners[t].delete(fn),
};
const client = createWorkerClient(worker);
await client.request('slow', null, { timeoutMs: 15 })`,
      '',
      { t: 'timed out', x: 'Rejects with Error("Worker request timed out")' }
    ),
    c(
      'Rejects all pending requests and detaches listeners on dispose()',
      `const listeners = { message: new Set(), error: new Set() };
const worker = {
  postMessage: () => {},
  addEventListener: (t, fn) => listeners[t].add(fn),
  removeEventListener: (t, fn) => listeners[t].delete(fn),
};
const client = createWorkerClient(worker);
const p = client.request('work', 1);
client.dispose();
let msg = '';
try { await p; } catch (e) { msg = e.message; }
({ msg, listenersRemaining: listeners.message.size + listeners.error.size })`,
      "{ msg: 'Worker client disposed', listenersRemaining: 0 }"
    ),
    c(
      'Rejects with worker error message when response has ok: false',
      `const listeners = { message: new Set(), error: new Set() };
const worker = {
  postMessage: (msg) => queueMicrotask(() => {
    for (const fn of listeners.message) fn({ data: { id: msg.id, ok: false, error: 'Bad payload' } });
  }),
  addEventListener: (t, fn) => listeners[t].add(fn),
  removeEventListener: (t, fn) => listeners[t].delete(fn),
};
const client = createWorkerClient(worker);
await client.request('parse', {})`,
      '',
      { t: 'Bad payload', x: 'Rejects with Error("Bad payload")' }
    ),
  ],

  'offline-mutation-replay': [
    c(
      'Enqueues mutations in storage and flushes them in FIFO order',
      `const store = new Map();
const storage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, v),
};
const executed = [];
const queue = createOfflineMutationQueue({
  storage,
  storageKey: 'test_muts',
  execute: async (m) => { executed.push(m.type + ':' + m.payload); },
});
queue.enqueue('CREATE', 1);
queue.enqueue('UPDATE', 2);
const before = queue.getPending().length;
const res = await queue.flush();
queue.destroy();
({ before, res, executed, after: queue.getPending().length })`,
      "{ before: 2, res: { succeeded: 2, failed: 0, remaining: 0 }, executed: ['CREATE:1', 'UPDATE:2'], after: 0 }"
    ),
    c(
      'Preserves remaining items if execute throws mid-flush and replays on online event',
      `const store = new Map();
const storage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, v),
};
const onlineListeners = new Set();
const onlineTarget = {
  addEventListener: (_t, fn) => onlineListeners.add(fn),
  removeEventListener: (_t, fn) => onlineListeners.delete(fn),
};
let failSecond = true;
const executed = [];
const queue = createOfflineMutationQueue({
  storage,
  onlineTarget,
  execute: async (m) => {
    if (m.payload === 'b' && failSecond) throw new Error('Offline');
    executed.push(m.payload);
  },
});
queue.enqueue('OP', 'a');
queue.enqueue('OP', 'b');
const firstFlush = await queue.flush();
failSecond = false;
for (const fn of onlineListeners) fn();
await sleep(10);
queue.destroy();
({ firstFlush, executed, remaining: queue.getPending().length, listeners: onlineListeners.size })`,
      "{ firstFlush: { succeeded: 1, failed: 1, remaining: 1 }, executed: ['a', 'b'], remaining: 0, listeners: 0 }"
    ),
    c(
      'Coalesces concurrent flush() calls into a single in-flight replay',
      `const store = new Map();
const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
let calls = 0;
const queue = createOfflineMutationQueue({
  storage,
  execute: async () => { calls += 1; await sleep(15); },
});
queue.enqueue('SAVE', { x: 1 });
const [r1, r2] = await Promise.all([queue.flush(), queue.flush()]);
queue.destroy();
({ calls, sameRef: r1 === r2, succeeded: r1.succeeded })`,
      '{ calls: 1, sameRef: true, succeeded: 1 }'
    ),
    c(
      'Recovers safely when stored JSON is corrupted',
      `const storage = { getItem: () => '{bad json', setItem: () => {} };
const queue = createOfflineMutationQueue({ storage, execute: async () => {} });
const pending = queue.getPending();
queue.destroy();
pending`,
      '[]'
    ),
  ],

  'promisified-indexeddb': [
    c(
      'Opens database, creates missing object stores on upgrade, and supports put/get/getAll/delete',
      `const dbs = new Map();
const mockReq = (run) => {
  const req = { result: undefined, error: null, onsuccess: null, onerror: null, onupgradeneeded: null, onblocked: null };
  queueMicrotask(() => run(req));
  return req;
};
const mockIndexedDb = {
  open: (name, version) => mockReq((req) => {
    let state = dbs.get(name);
    const isNew = !state || state.version < version;
    if (!state) {
      state = { version, stores: new Map() };
      dbs.set(name, state);
    }
    const db = {
      closed: false,
      objectStoreNames: { contains: (s) => state.stores.has(s) },
      createObjectStore: (s, opts) => { state.stores.set(s, { keyPath: opts?.keyPath, data: new Map() }); },
      close: () => { db.closed = true; },
      transaction: (storeName) => ({
        objectStore: () => {
          const st = state.stores.get(storeName);
          return {
            get: (k) => mockReq((r) => { r.result = st.data.get(k); r.onsuccess?.(); }),
            put: (v, k) => mockReq((r) => {
              const key = k ?? v[st.keyPath];
              st.data.set(key, v);
              r.result = key;
              r.onsuccess?.();
            }),
            delete: (k) => mockReq((r) => { st.data.delete(k); r.onsuccess?.(); }),
            getAll: () => mockReq((r) => { r.result = Array.from(st.data.values()); r.onsuccess?.(); }),
          };
        },
      }),
    };
    req.result = db;
    if (isNew) { state.version = version; req.onupgradeneeded?.(); }
    req.onsuccess?.();
  }),
};
const db = await openDatabase({ name: 'app', version: 1, stores: ['notes'], keyPath: 'id', indexedDb: mockIndexedDb });
await db.put('notes', { id: 'n1', text: 'hello' });
await db.put('notes', { id: 'n2', text: 'world' });
const one = await db.get('notes', 'n1');
const allBefore = await db.getAll('notes');
await db.delete('notes', 'n1');
const afterMissing = await db.get('notes', 'n1');
const allAfter = await db.getAll('notes');
db.close();
({ one, countBefore: allBefore.length, afterMissing, countAfter: allAfter.length })`,
      "{ one: { id: 'n1', text: 'hello' }, countBefore: 2, afterMissing: undefined, countAfter: 1 }"
    ),
    c(
      'Supports out-of-line keys and rejects when IndexedDB open fails or is blocked',
      `const mockIndexedDb = {
  open: () => {
    const req = { error: new Error('Blocked by version'), onsuccess: null, onerror: null, onupgradeneeded: null, onblocked: null };
    queueMicrotask(() => req.onerror?.());
    return req;
  },
};
await openDatabase({ name: 'fail', version: 1, stores: ['kv'], indexedDb: mockIndexedDb })`,
      '',
      { t: 'Blocked by version', x: 'Rejects with Error("Blocked by version")' }
    ),
    c(
      'Supports explicit out-of-line keys in put(storeName, value, key)',
      `const store = new Map();
const mockReq = (run) => {
  const req = { result: undefined, error: null, onsuccess: null, onerror: null, onupgradeneeded: null, onblocked: null };
  queueMicrotask(() => run(req));
  return req;
};
const mockIndexedDb = {
  open: () => mockReq((req) => {
    req.result = {
      objectStoreNames: { contains: () => true },
      close: () => {},
      transaction: () => ({
        objectStore: () => ({
          put: (v, k) => mockReq((r) => { store.set(k, v); r.result = k; r.onsuccess?.(); }),
          get: (k) => mockReq((r) => { r.result = store.get(k); r.onsuccess?.(); }),
        }),
      }),
    };
    req.onsuccess?.();
  }),
};
const db = await openDatabase({ name: 'kv', stores: ['items'], indexedDb: mockIndexedDb });
const key = await db.put('items', { count: 9 }, 'custom-key');
const val = await db.get('items', 'custom-key');
db.close();
({ key, val })`,
      "{ key: 'custom-key', val: { count: 9 } }"
    ),
    c(
      'Rejects when database open triggers onblocked',
      `const mockIndexedDb = {
  open: () => {
    const req = { error: null, onsuccess: null, onerror: null, onupgradeneeded: null, onblocked: null };
    queueMicrotask(() => req.onblocked?.());
    return req;
  },
};
await openDatabase({ name: 'blocked', stores: ['kv'], indexedDb: mockIndexedDb })`,
      '',
      { t: 'blocked', x: 'Rejects with Error("IndexedDB open blocked")' }
    ),
  ],

  'react-use-promise': [
    r(
      'Shows default Suspense fallback while pending, then renders resolved user',
      '<UserProfileContainer userPromise={pendingPromise} />',
      'renders "Loading user..." while pending, then "Ada Lovelace" and "Staff Engineer" on resolve'
    ),
    r(
      'Supports a custom fallback prop and swaps to UserProfile on resolve',
      '<UserProfileContainer userPromise={pendingPromise} fallback={<span>Fetching profile</span>} />',
      'renders custom fallback while pending, then UserProfile on resolve'
    ),
    r(
      'Renders resolved user details when passed an already-resolved promise',
      '<UserProfileContainer userPromise={Promise.resolve({ name: "Alan Turing", role: "Researcher" })} />',
      'renders "Alan Turing" and "Researcher"'
    ),
    r(
      'Updates rendered user when userPromise prop changes to a new promise',
      'rerender(<UserProfileContainer userPromise={Promise.resolve({ name: "Katherine Johnson", role: "Mathematician" })} />)',
      'renders "Katherine Johnson" and "Mathematician"'
    ),
  ],
};
