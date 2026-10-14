import { c } from './part1.mjs';

const CLICK = "new MouseEvent('click', { bubbles: true })";
const MEM = `const memory = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, v); }, removeItem: (k) => { m.delete(k); }, key: (i) => [...m.keys()][i] ?? null, get length() { return m.size; }, raw: m }; };`;

// Cases for new cards, batch 2: DOM and browser.
export default {
  'event-delegation': [
    c('Fires for a click on a matching element', `const root = document.createElement('div');
root.innerHTML = '<button class="b">One</button>';
const got = [];
delegate(root, '.b', 'click', (e, el) => got.push(el.textContent));
root.querySelector('.b').dispatchEvent(${CLICK});
got`, "['One']"),
    c('A click on a child of the match still counts (closest)', `const root = document.createElement('div');
root.innerHTML = '<button class="b"><span>One</span></button>';
const got = [];
delegate(root, '.b', 'click', (e, el) => got.push(el.tagName));
root.querySelector('span').dispatchEvent(${CLICK});
got`, "['BUTTON']"),
    c('Non-matching targets are ignored', `const root = document.createElement('div');
root.innerHTML = '<button class="b">One</button><p>text</p>';
const got = [];
delegate(root, '.b', 'click', () => got.push('hit'));
root.querySelector('p').dispatchEvent(${CLICK});
got`, '[]'),
    c('Elements added after delegate() are handled', `const root = document.createElement('div');
const got = [];
delegate(root, '.b', 'click', (e, el) => got.push(el.id));
const late = document.createElement('button');
late.className = 'b';
late.id = 'late';
root.append(late);
late.dispatchEvent(${CLICK});
got`, "['late']"),
    c('The returned function removes the listener', `const root = document.createElement('div');
root.innerHTML = '<button class="b">One</button>';
const got = [];
const off = delegate(root, '.b', 'click', () => got.push('hit'));
off();
root.querySelector('.b').dispatchEvent(${CLICK});
got`, '[]'),
    c('Matches outside the root are ignored', `const outer = document.createElement('div');
outer.className = 'b';
const root = document.createElement('div');
root.innerHTML = '<p>inside</p>';
outer.append(root);
const got = [];
delegate(root, '.b', 'click', () => got.push('hit'));
root.querySelector('p').dispatchEvent(${CLICK});
got`, '[]'),
    c('Nested matches: the nearest one is used, once', `const root = document.createElement('div');
root.innerHTML = '<div class="item" id="outer"><div class="item" id="inner"><i>x</i></div></div>';
const got = [];
delegate(root, '.item', 'click', (e, el) => got.push(el.id));
root.querySelector('i').dispatchEvent(${CLICK});
got`, "['inner']"),
    c('`this` is the matched element too', `const root = document.createElement('div');
root.innerHTML = '<button class="b" id="x">One</button>';
let seen;
delegate(root, '.b', 'click', function () { seen = this.id; });
root.querySelector('.b').dispatchEvent(${CLICK});
seen`, "'x'"),
  ],
  'vnode-to-dom': [
    c('Element with class, id and text', `createDom({ type: 'div', props: { className: 'box', id: 'a' }, children: ['hi'] }).outerHTML`, `'<div class="box" id="a">hi</div>'`),
    c('Nested children, numbers become text', `createDom({ type: 'ul', children: [{ type: 'li', children: ['a'] }, { type: 'li', children: [1] }] }).outerHTML`, `'<ul><li>a</li><li>1</li></ul>'`),
    c('Style objects are applied', `createDom({ type: 'p', props: { style: { color: 'red' } }, children: ['x'] }).outerHTML`, `'<p style="color: red;">x</p>'`),
    c('onClick becomes a click listener', `let n = 0;
const el = createDom({ type: 'button', props: { onClick: () => n++ }, children: ['go'] });
el.click();
el.click();
n`, '2'),
    c('Boolean and null props', `createDom({ type: 'input', props: { disabled: true, hidden: false, value: 'v', placeholder: null } }).outerHTML`, `'<input disabled="" value="v">'`),
    c('Nested arrays, null and booleans in children', `createDom({ type: 'div', children: [null, ['a', ['b']], false, 'c', undefined] }).outerHTML`, `'<div>abc</div>'`),
    c('Text is never parsed as HTML', `createDom({ type: 'p', children: ['<b>x</b>'] }).innerHTML`, `'&lt;b&gt;x&lt;/b&gt;'`),
    c('render replaces the container content', `const container = document.createElement('div');
container.innerHTML = '<p>old</p>';
render({ type: 'span', children: ['new'] }, container);
container.innerHTML`, `'<span>new</span>'`),
  ],
  'client-side-router': [
    c('matchRoute: captures params', `matchRoute('/users/:id', '/users/42')`, "{ id: '42' }"),
    c('matchRoute: too few or too many segments do not match', `[matchRoute('/users/:id', '/users'), matchRoute('/a/b', '/a/b/c')]`, '[null, null]'),
    c('matchRoute: static segments must be equal; trailing slash ignored', `[matchRoute('/about', '/about/'), matchRoute('/about', '/contact')]`, '[{}, null]'),
    c('matchRoute: params are URL-decoded', `matchRoute('/tag/:name', '/tag/a%20b')`, "{ name: 'a b' }"),
    c('matchRoute: wildcard captures the rest', `matchRoute('/files/*', '/files/a/b.txt')`, "{ '*': 'a/b.txt' }"),
    c('router: starts at the initial path', `const r = createRouter([{ pattern: '/', name: 'home' }]);
r.current()`, "{ path: '/', name: 'home', params: {}, query: {} }"),
    c('router: navigate resolves params and the query string', `const r = createRouter([{ pattern: '/', name: 'home' }, { pattern: '/users/:id', name: 'user' }]);
r.navigate('/users/7?tab=posts&x=1');
r.current()`, "{ path: '/users/7', name: 'user', params: { id: '7' }, query: { tab: 'posts', x: '1' } }"),
    c('router: unmatched paths give name null', `const r = createRouter([{ pattern: '/', name: 'home' }]);
r.navigate('/nope');
r.current().name`, 'null'),
    c('router: back and forward walk the history', `const r = createRouter([{ pattern: '/:p', name: 'p' }], '/a');
r.navigate('/b'); r.navigate('/c');
const trail = [r.current().path];
r.back(); trail.push(r.current().path);
r.back(); trail.push(r.current().path);
r.back(); trail.push(r.current().path);
r.forward(); trail.push(r.current().path);
trail`, "['/c', '/b', '/a', '/a', '/b']"),
    c('router: navigating after back discards the forward entries', `const r = createRouter([{ pattern: '/:p', name: 'p' }], '/a');
r.navigate('/b');
r.back();
r.navigate('/c');
r.forward();
r.current().path`, "'/c'"),
    c('router: subscribers are called with the new state until unsubscribed', `const r = createRouter([{ pattern: '/:p', name: 'p' }], '/a');
const seen = [];
const off = r.subscribe((s) => seen.push(s.path));
r.navigate('/b');
off();
r.navigate('/c');
seen`, "['/b']"),
  ],
  'storage-ttl-wrapper': [
    c('set then get returns the JSON value', `${MEM}
const store = createStorage(memory());
store.set('user', { name: 'Ada', tags: ['x'] });
store.get('user')`, "{ name: 'Ada', tags: ['x'] }"),
    c('Missing key returns the fallback', `${MEM}
const store = createStorage(memory());
[store.get('nope'), store.get('nope', 'dflt')]`, "[null, 'dflt']"),
    c('An entry is available until its TTL, then it expires and is removed', `${MEM}
let t = 1000;
const backend = memory();
const store = createStorage(backend, { now: () => t });
store.set('k', 'v', { ttlMs: 500 });
const fresh = store.get('k');
t = 1600;
[fresh, store.get('k', 'gone'), backend.length]`, "['v', 'gone', 0]"),
    c('Keys are namespaced with the prefix', `${MEM}
const backend = memory();
const store = createStorage(backend, { prefix: 'a:' });
store.set('x', 1);
[...backend.raw.keys()]`, "['a:x']"),
    c('keys() lists only this namespace, clear() removes only it', `${MEM}
const backend = memory();
backend.setItem('other:keep', '1');
const store = createStorage(backend, { prefix: 'a:' });
store.set('x', 1); store.set('y', 2);
const before = store.keys().sort();
store.clear();
[before, store.keys(), backend.getItem('other:keep')]`, "[['x', 'y'], [], '1']"),
    c('Corrupt JSON returns the fallback and is cleaned up', `${MEM}
const backend = memory();
backend.setItem('app:bad', '{not json');
const store = createStorage(backend);
[store.get('bad', 'fallback'), backend.getItem('app:bad')]`, "['fallback', null]"),
    c('set returns false when the backend throws (quota exceeded)', `const store = createStorage({ getItem: () => null, setItem: () => { throw new Error('QuotaExceededError'); }, removeItem() {}, key: () => null, length: 0 });
store.set('k', 'v')`, 'false'),
    c('remove deletes a key', `${MEM}
const store = createStorage(memory());
store.set('k', 1);
store.remove('k');
store.get('k')`, 'null'),
    c('Falsy values are stored faithfully', `${MEM}
const store = createStorage(memory());
store.set('zero', 0); store.set('empty', ''); store.set('no', false);
[store.get('zero', 'd'), store.get('empty', 'd'), store.get('no', 'd')]`, "[0, '', false]"),
  ],
};
