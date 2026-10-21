import { c } from './part1.mjs';

// Browser APIs, batch 2: lazy-load images (IntersectionObserver), drag-and-drop drop index, requestAnimationFrame throttle.
const IO_SETUP = `const created = [];
class FakeIO {
  constructor(callback, options) { this.callback = callback; this.options = options; this.observed = []; this.disconnected = false; created.push(this); }
  observe(el) { this.observed.push(el); }
  unobserve(el) { this.observed = this.observed.filter((e) => e !== el); }
  disconnect() { this.disconnected = true; this.observed = []; }
}
const root = document.createElement('div');
root.innerHTML = '<img data-src="a.png"><img src="b.png"><img data-src="c.png"><p>text</p>';
const [a, b, c] = root.querySelectorAll('img');`;

const RECTS = `const R = [{ top: 0, height: 40 }, { top: 40, height: 40 }, { top: 80, height: 40 }];`;

const RAF = `let queue = [];
let nextId = 1;
const cancelled = [];
const raf = (cb) => { const id = nextId++; queue.push({ id, cb }); return id; };
const caf = (id) => { cancelled.push(id); queue = queue.filter((f) => f.id !== id); };
const flush = () => { const frames = queue; queue = []; frames.forEach((f) => f.cb(16)); };
const calls = [];
const fn = (...args) => calls.push(args);`;

export default {
  'lazy-load-observer': [
    c('Observes only the images that have a data-src attribute', `${IO_SETUP}
lazyLoadImages(root, FakeIO);
[created.length, created[0].observed.map((el) => el.getAttribute('data-src'))]`, "[1, ['a.png', 'c.png']]", {
      callSignature: "const stop = lazyLoadImages(root, IntersectionObserver);",
    }),
    c('The observer is created with rootMargin "200px"', `${IO_SETUP}
lazyLoadImages(root, FakeIO);
created[0].options`, "{ rootMargin: '200px' }", {
      callSignature: "lazyLoadImages(root, IntersectionObserver); // options.rootMargin === '200px'",
    }),
    c('Nothing loads before an image intersects, and non-intersecting entries are ignored', `${IO_SETUP}
lazyLoadImages(root, FakeIO);
const before = [a.getAttribute('src'), c.getAttribute('src')];
created[0].callback([{ target: a, isIntersecting: false }], created[0]);
[before, a.getAttribute('src'), a.getAttribute('data-src')]`, "[[null, null], null, 'a.png']", {
      callSignature: "lazyLoadImages(root, IntersectionObserver); // non-intersecting entry",
    }),
    c('An intersecting image gets its src, loses data-src and is unobserved', `${IO_SETUP}
lazyLoadImages(root, FakeIO);
const io = created[0];
io.callback([{ target: a, isIntersecting: true }], io);
[a.getAttribute('src'), a.hasAttribute('data-src'), io.observed.map((el) => el.getAttribute('data-src'))]`, "['a.png', false, ['c.png']]", {
      callSignature: "lazyLoadImages(root, IntersectionObserver); // intersecting entry loads src and unobserves",
    }),
    c('Only the intersecting entries of a batch load; other images are left alone', `${IO_SETUP}
lazyLoadImages(root, FakeIO);
const io = created[0];
io.callback([{ target: a, isIntersecting: true }, { target: c, isIntersecting: false }], io);
[a.getAttribute('src'), c.getAttribute('src'), b.getAttribute('src')]`, "['a.png', null, 'b.png']", {
      callSignature: "lazyLoadImages(root, IntersectionObserver); // batch with intersecting and non-intersecting entries",
    }),
    c('A stray second entry for an already loaded image does nothing', `${IO_SETUP}
lazyLoadImages(root, FakeIO);
const io = created[0];
io.callback([{ target: a, isIntersecting: true }], io);
io.callback([{ target: a, isIntersecting: true }], io);
a.getAttribute('src')`, "'a.png'", {
      callSignature: "lazyLoadImages(root, IntersectionObserver); // stray duplicate entry ignored",
    }),
    c('The returned function disconnects the observer', `${IO_SETUP}
const stop = lazyLoadImages(root, FakeIO);
const io = created[0];
stop();
[typeof stop, io.disconnected]`, "['function', true]", {
      callSignature: "const stop = lazyLoadImages(root, IntersectionObserver);\nstop();",
    }),
    c('Without IntersectionObserver every image loads immediately and the returned function is harmless', `${IO_SETUP}
const stop = lazyLoadImages(root, null);
stop();
[a.getAttribute('src'), c.getAttribute('src'), a.hasAttribute('data-src'), b.getAttribute('src')]`, "['a.png', 'c.png', false, 'b.png']", {
      callSignature: "const stop = lazyLoadImages(root, null); // fallback when IO unavailable",
    }),
  ],
  'drop-index-from-pointer': [
    c('A pointer above the first midpoint gives index 0', `${RECTS}
[dropIndex(-5, R), dropIndex(10, R), dropIndex(19, R)]`, '[0, 0, 0]'),
    c('Between midpoints the index is the next item whose midpoint is below the pointer', `${RECTS}
[dropIndex(25, R), dropIndex(59, R), dropIndex(70, R), dropIndex(99, R)]`, '[1, 1, 2, 2]'),
    c('A pointer exactly on a midpoint counts as past it', `${RECTS}
[dropIndex(20, R), dropIndex(60, R), dropIndex(100, R)]`, '[1, 2, 3]'),
    c('Below every midpoint gives rects.length; an empty list gives 0', `${RECTS}
[dropIndex(500, R), dropIndex(10, [])]`, '[3, 0]'),
    c('Items of different heights use their own midpoints', `const T = [{ top: 0, height: 100 }, { top: 100, height: 20 }];
[dropIndex(60, T), dropIndex(105, T), dropIndex(110, T)]`, '[1, 1, 2]'),
    c('moveItem moves an item forward into a gap of the original list', `const L = ['a', 'b', 'c', 'd'];
[moveItem(L, 0, 3), moveItem(L, 1, 4)]`, "[['b', 'c', 'a', 'd'], ['a', 'c', 'd', 'b']]"),
    c('moveItem moves an item backward', `const L = ['a', 'b', 'c', 'd'];
[moveItem(L, 3, 0), moveItem(L, 2, 1)]`, "[['d', 'a', 'b', 'c'], ['a', 'c', 'b', 'd']]"),
    c('Dropping an item into its own gap returns an unchanged copy and never mutates the input', `const L = ['a', 'b', 'c'];
const same = moveItem(L, 1, 1);
const same2 = moveItem(L, 1, 2);
[same, same2, same !== L, L]`, "[['a', 'b', 'c'], ['a', 'b', 'c'], true, ['a', 'b', 'c']]"),
    c('reorderOnDrop combines the pointer position with the move', `${RECTS}
const L = ['a', 'b', 'c'];
[reorderOnDrop(L, 0, 70, R), reorderOnDrop(L, 2, 5, R), reorderOnDrop(L, 1, 70, R)]`, "[['b', 'a', 'c'], ['c', 'a', 'b'], ['a', 'b', 'c']]"),
  ],
  'raf-throttle': [
    c('Nothing runs until the animation frame', `${RAF}
const t = rafThrottle(fn, raf, caf);
t(1);
[calls.length, queue.length]`, '[0, 1]', {
      callSignature: "const t = rafThrottle(fn);\nt(1);",
    }),
    c('Many calls in one frame schedule a single frame and run fn once with the latest arguments', `${RAF}
const t = rafThrottle(fn, raf, caf);
t(1); t(2); t(3);
const scheduled = queue.length;
flush();
[scheduled, calls]`, '[1, [[3]]]', {
      callSignature: "const t = rafThrottle(fn);\nt(1); t(2); t(3);\nflush();",
    }),
    c('After a frame has run, the next call schedules a new frame', `${RAF}
const t = rafThrottle(fn, raf, caf);
t('a'); flush();
t('b'); t('c'); flush();
calls`, "[['a'], ['c']]", {
      callSignature: "const t = rafThrottle(fn);\nt('a'); flush();\nt('b'); t('c'); flush();",
    }),
    c('All arguments are passed through', `${RAF}
const t = rafThrottle(fn, raf, caf);
t('x', 2, { y: 3 });
flush();
calls`, "[['x', 2, { y: 3 }]]", {
      callSignature: "const t = rafThrottle(fn);\nt('x', 2, { y: 3 });\nflush();",
    }),
    c('cancel() cancels the pending frame so fn never runs, and later calls work again', `${RAF}
const t = rafThrottle(fn, raf, caf);
t(1);
t.cancel();
flush();
const afterCancel = [calls.length, cancelled];
t(2);
flush();
[afterCancel, calls]`, '[[0, [1]], [[2]]]', {
      callSignature: "const t = rafThrottle(fn);\nt(1);\nt.cancel();\nflush();",
    }),
    c('cancel() with nothing pending does nothing and does not call caf', `${RAF}
const t = rafThrottle(fn, raf, caf);
t.cancel();
t(1);
flush();
t.cancel();
[cancelled, calls]`, '[[], [[1]]]', {
      callSignature: "const t = rafThrottle(fn);\nt.cancel();",
    }),
    c('A call made inside fn schedules the next frame', `${RAF}
const log = [];
let t;
const handler = (n) => { log.push(n); if (n < 3) t(n + 1); };
t = rafThrottle(handler, raf, caf);
t(1);
flush(); flush(); flush(); flush();
[log, queue.length]`, '[[1, 2, 3], 0]', {
      callSignature: "const t = rafThrottle(handler);\nt(1);",
    }),
    c('raf and caf default to the global requestAnimationFrame and cancelAnimationFrame', `const run = () => {
  const saved = [globalThis.requestAnimationFrame, globalThis.cancelAnimationFrame];
  const seen = [];
  globalThis.requestAnimationFrame = (cb) => { seen.push('raf'); cb(0); return 7; };
  globalThis.cancelAnimationFrame = (id) => { seen.push('caf:' + id); };
  try {
    const calls = [];
    const t = rafThrottle((x) => calls.push(x));
    t('go');
    return [calls, seen];
  } finally {
    [globalThis.requestAnimationFrame, globalThis.cancelAnimationFrame] = saved;
  }
};
run()`, "[['go'], ['raf']]", {
      callSignature: "const t = rafThrottle(fn); // uses global requestAnimationFrame",
    }),
  ],
};
