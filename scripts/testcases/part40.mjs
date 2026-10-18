import { c } from './part1.mjs';

// Browser APIs, batch 3: key sequences (g then i), MutationObserver, ResizeObserver.
const SEQ = `const m = createSequenceMatcher({ 'g i': 'goIssues', 'g p': 'goPulls', '?': 'help' });`;

const MO_SETUP = `const el = (tag, children = [], id = tag) => {
  const node = {
    nodeType: 1, tag, id, children,
    matches: (s) => s === tag,
    querySelectorAll: (s) => {
      const out = [];
      const walk = (n) => n.children.forEach((child) => { if (child.tag === s) out.push(child); walk(child); });
      walk(node);
      return out;
    },
  };
  return node;
};
const text = () => ({ nodeType: 3 });
const observers = [];
class FakeMO {
  constructor(callback) { this.callback = callback; this.disconnected = false; observers.push(this); }
  observe(target, options) { this.target = target; this.options = options; }
  disconnect() { this.disconnected = true; }
}
// like the browser: a disconnected observer delivers nothing
const deliver = (...nodes) => { if (!observers[0].disconnected) observers[0].callback([{ addedNodes: nodes }]); };
const found = [];
const onFound = (e) => found.push(e.id);`;

const RO_SETUP = `const box = { id: 'box' };
const observers = [];
class FakeRO {
  constructor(callback) { this.callback = callback; this.disconnected = false; this.observed = []; observers.push(this); }
  observe(target) { this.observed.push(target); }
  disconnect() { this.disconnected = true; }
}
// like the browser: a disconnected observer delivers nothing
const resize = (width) => { if (!observers[0].disconnected) observers[0].callback([{ contentRect: { width } }]); };
const names = [];
const onChange = (name) => names.push(name);
const BP = { sm: 0, md: 600, lg: 1000 };`;

export default {
  'key-sequence-matcher': [
    c('A single-key binding fires immediately', `${SEQ}
m('?', 0)`, "'help'"),
    c('"g" then "i" completes the sequence', `${SEQ}
const first = m('g', 0);
const second = m('i', 200);
[first, second]`, "[null, 'goIssues']"),
    c('A second binding that starts with the same key', `${SEQ}
[m('g', 0), m('p', 100)]`, "[null, 'goPulls']"),
    c('Too slow: more than the timeout forgets the first key', `${SEQ}
[m('g', 0), m('i', 1500)]`, '[null, null]'),
    c('Exactly the timeout is still in time (default 1000 ms)', `${SEQ}
[m('g', 0), m('i', 1000)]`, "[null, 'goIssues']"),
    c('A custom timeout is respected', `const bindings = { 'g i': 'goIssues' };
const slow = createSequenceMatcher(bindings, 300);
const fast = createSequenceMatcher(bindings, 300);
slow('g', 0);
fast('g', 0);
[slow('i', 400), fast('i', 300)]`, "[null, 'goIssues']"),
    c('A wrong key starts over, and can itself begin a new sequence (g, g, i)', `${SEQ}
[m('g', 0), m('g', 100), m('i', 200)]`, "[null, null, 'goIssues']"),
    c('Unrelated keys reset the sequence (g, x, i does nothing)', `${SEQ}
[m('g', 0), m('x', 100), m('i', 200)]`, '[null, null, null]'),
    c('After a match the matcher starts fresh (a lone "i" does nothing)', `${SEQ}
[m('g', 0), m('i', 100), m('i', 200)]`, "[null, 'goIssues', null]"),
    c('The same sequence, or another, works again right away', `${SEQ}
[m('g', 0), m('i', 10), m('g', 20), m('p', 30)]`, "[null, 'goIssues', null, 'goPulls']"),
    c('The timeout is measured from the previous key, not from the first key', `const m = createSequenceMatcher({ 'g g g': 'top' }, 1000);
[m('g', 0), m('g', 800), m('g', 1600)]`, "[null, null, 'top']"),
    c('With no bindings nothing ever matches', `const m = createSequenceMatcher({});
[m('a', 0), m('?', 10)]`, '[null, null]'),
  ],
  'watch-added-elements': [
    c('Elements already inside root are reported immediately, in document order', `${MO_SETUP}
const root = el('div', [el('button', [], 'b1'), el('p', [el('button', [], 'b2')]), el('span', [], 's1')]);
watchForElements(root, 'button', onFound, FakeMO);
found`, "['b1', 'b2']"),
    c('One observer watches root and its whole subtree for added children', `${MO_SETUP}
const root = el('div');
watchForElements(root, 'button', onFound, FakeMO);
[observers.length, observers[0].target === root, observers[0].options]`, '[1, true, { childList: true, subtree: true }]'),
    c('An element added later is reported', `${MO_SETUP}
watchForElements(el('div'), 'button', onFound, FakeMO);
deliver(el('button', [], 'late'));
found`, "['late']"),
    c('An added matching container is reported before its matching descendants', `${MO_SETUP}
watchForElements(el('div'), 'button', onFound, FakeMO);
deliver(el('button', [el('button', [], 'inner')], 'outer'));
found`, "['outer', 'inner']"),
    c('A non-matching container still has its matching descendants reported', `${MO_SETUP}
watchForElements(el('div'), 'button', onFound, FakeMO);
deliver(el('section', [el('button', [], 'deep')]));
found`, "['deep']"),
    c('Non-matching elements and text nodes are ignored', `${MO_SETUP}
watchForElements(el('div'), 'button', onFound, FakeMO);
deliver(el('p', [], 'p1'), text());
found`, '[]'),
    c('An element is reported only once, even if it is delivered again', `${MO_SETUP}
watchForElements(el('div'), 'button', onFound, FakeMO);
const b = el('button', [], 'x');
deliver(b);
deliver(b);
found`, "['x']"),
    c('An element that was already there is not reported again when a mutation delivers it', `${MO_SETUP}
const b1 = el('button', [], 'b1');
watchForElements(el('div', [b1]), 'button', onFound, FakeMO);
deliver(b1);
found`, "['b1']"),
    c('Every mutation of a batch is handled, in order', `${MO_SETUP}
watchForElements(el('div'), 'button', onFound, FakeMO);
observers[0].callback([
  { addedNodes: [el('button', [], 'one')] },
  { addedNodes: [el('i', [], 'skip'), el('button', [], 'two')] },
]);
found`, "['one', 'two']"),
    c('stop() disconnects the observer, so nothing more is reported', `${MO_SETUP}
const stop = watchForElements(el('div'), 'button', onFound, FakeMO);
deliver(el('button', [], 'before'));
stop();
deliver(el('button', [], 'after'));
[observers[0].disconnected, found]`, "[true, ['before']]"),
    c('MO defaults to the global MutationObserver', `${MO_SETUP}
const run = () => {
  const saved = globalThis.MutationObserver;
  globalThis.MutationObserver = FakeMO;
  try {
    const root = el('div');
    watchForElements(root, 'button', onFound);
    return [observers.length, observers[0].target === root];
  } finally {
    globalThis.MutationObserver = saved;
  }
};
run()`, '[1, true]'),
  ],
  'resize-breakpoints': [
    c('The first measurement is reported', `${RO_SETUP}
observeBreakpoint(box, BP, onChange, FakeRO);
resize(700);
names`, "['md']"),
    c('onChange fires only when the breakpoint changes', `${RO_SETUP}
observeBreakpoint(box, BP, onChange, FakeRO);
resize(700); resize(800); resize(1000);
names`, "['md', 'lg']"),
    c('The largest minimum not above the width wins; a width equal to a minimum belongs to it', `${RO_SETUP}
observeBreakpoint(box, BP, onChange, FakeRO);
[0, 599, 600, 999, 1000].forEach(resize);
names`, "['sm', 'md', 'lg']"),
    c('The order of the keys in the breakpoints object does not matter', `${RO_SETUP}
observeBreakpoint(box, { lg: 1000, sm: 0, md: 600 }, onChange, FakeRO);
resize(650); resize(1200); resize(100);
names`, "['md', 'lg', 'sm']"),
    c('Below every minimum there is no breakpoint (null), and null is reported as the first value', `${RO_SETUP}
observeBreakpoint(box, { md: 600, lg: 1000 }, onChange, FakeRO);
resize(300); resize(400); resize(700);
names`, "[null, 'md']"),
    c('Shrinking reports the smaller breakpoints in turn, including a change to null', `${RO_SETUP}
observeBreakpoint(box, { md: 600, lg: 1000 }, onChange, FakeRO);
resize(1200); resize(700); resize(300);
names`, "['lg', 'md', null]"),
    c('One observer is created and it observes the element', `${RO_SETUP}
observeBreakpoint(box, BP, onChange, FakeRO);
[observers.length, observers[0].observed.length, observers[0].observed[0] === box]`, '[1, 1, true]'),
    c('stop() disconnects the observer, so nothing more is reported', `${RO_SETUP}
const stop = observeBreakpoint(box, BP, onChange, FakeRO);
resize(700);
stop();
resize(1200);
[observers[0].disconnected, names]`, "[true, ['md']]"),
    c('RO defaults to the global ResizeObserver', `${RO_SETUP}
const run = () => {
  const saved = globalThis.ResizeObserver;
  globalThis.ResizeObserver = FakeRO;
  try {
    observeBreakpoint(box, BP, onChange);
    resize(1100);
    return [observers.length, names];
  } finally {
    globalThis.ResizeObserver = saved;
  }
};
run()`, "[1, ['lg']]"),
  ],
};
