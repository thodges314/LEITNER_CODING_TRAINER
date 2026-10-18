import { c } from './part1.mjs';

// Browser APIs, batch 4: focus trap (Tab handling), a tiny history.pushState router.
const TRAP = `const doc = { activeElement: null };
const log = [];
const mk = (id) => ({ id, focus() { doc.activeElement = this; log.push('focus:' + id); } });
const a = mk('a'), b = mk('b'), c3 = mk('c');
const key = (k, shiftKey = false) => ({ key: k, shiftKey, prevented: false, preventDefault() { this.prevented = true; } });`;

const WIN = `const pushes = [];
const replaces = [];
const listeners = {};
const win = {
  location: { pathname: '/' },
  history: {
    pushState(state, title, url) { pushes.push(url); win.location.pathname = url; },
    replaceState(state, title, url) { replaces.push(url); win.location.pathname = url; },
  },
  addEventListener(type, fn) { listeners[type] = (listeners[type] || []).concat(fn); },
  removeEventListener(type, fn) { listeners[type] = (listeners[type] || []).filter((f) => f !== fn); },
};
// the browser's back/forward button: the location changes, then popstate fires
const back = (path) => { win.location.pathname = path; (listeners.popstate || []).forEach((fn) => fn({})); };
const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'users', path: '/users' },
  { name: 'user', path: '/users/:id' },
  { name: 'post', path: '/users/:id/posts/:postId' },
];
const seen = [];`;

export default {
  'focus-trap-keydown': [
    c('Tab on the last element wraps to the first and cancels the default', `${TRAP}
const handle = createFocusTrap(() => [a, b, c3], doc);
doc.activeElement = c3;
const e = key('Tab');
handle(e);
[e.prevented, log]`, "[true, ['focus:a']]"),
    c('Shift+Tab on the first element wraps to the last and cancels the default', `${TRAP}
const handle = createFocusTrap(() => [a, b, c3], doc);
doc.activeElement = a;
const e = key('Tab', true);
handle(e);
[e.prevented, log]`, "[true, ['focus:c']]"),
    c('Tab in the middle is left to the browser', `${TRAP}
const handle = createFocusTrap(() => [a, b, c3], doc);
doc.activeElement = b;
const e = key('Tab');
handle(e);
[e.prevented, log]`, '[false, []]'),
    c('Tab on the first and Shift+Tab on the last are left to the browser', `${TRAP}
const handle = createFocusTrap(() => [a, b, c3], doc);
doc.activeElement = a;
const forward = key('Tab');
handle(forward);
doc.activeElement = c3;
const backward = key('Tab', true);
handle(backward);
[forward.prevented, backward.prevented, log]`, '[false, false, []]'),
    c('Other keys are ignored, even on the last element', `${TRAP}
const handle = createFocusTrap(() => [a, b, c3], doc);
doc.activeElement = c3;
const e = key('Enter');
handle(e);
[e.prevented, log]`, '[false, []]'),
    c('Focus outside the dialog: Tab goes to the first element', `${TRAP}
const handle = createFocusTrap(() => [a, b, c3], doc);
doc.activeElement = { id: 'outside' };
const e = key('Tab');
handle(e);
[e.prevented, log]`, "[true, ['focus:a']]"),
    c('Focus outside the dialog: Shift+Tab goes to the last element', `${TRAP}
const handle = createFocusTrap(() => [a, b, c3], doc);
doc.activeElement = null;
const e = key('Tab', true);
handle(e);
[e.prevented, log]`, "[true, ['focus:c']]"),
    c('With nothing focusable inside, Tab is cancelled and nothing is focused', `${TRAP}
const handle = createFocusTrap(() => [], doc);
const e = key('Tab');
handle(e);
[e.prevented, log]`, '[true, []]'),
    c('A single element keeps focus in both directions', `${TRAP}
const handle = createFocusTrap(() => [b], doc);
doc.activeElement = b;
const forward = key('Tab');
const backward = key('Tab', true);
handle(forward);
handle(backward);
[forward.prevented, backward.prevented, log]`, "[true, true, ['focus:b', 'focus:b']]"),
    c('The list of focusable elements is read on every keydown', `${TRAP}
let items = [a, b];
const handle = createFocusTrap(() => items, doc);
doc.activeElement = b;
handle(key('Tab'));
items = [a, b, c3];
doc.activeElement = b;
const e = key('Tab');
handle(e);
[e.prevented, log]`, "[false, ['focus:a']]"),
  ],
  'mini-history-router': [
    c('The first route comes from the current location, with its decoded params', `${WIN}
win.location.pathname = '/users/42';
const router = createRouter(ROUTES, win);
router.current()`, "{ name: 'user', params: { id: '42' }, path: '/users/42' }"),
    c('The root path matches the "/" route', `${WIN}
createRouter(ROUTES, win).current()`, "{ name: 'home', params: {}, path: '/' }"),
    c('Several parameters are captured', `${WIN}
win.location.pathname = '/users/7/posts/99';
createRouter(ROUTES, win).current()`, "{ name: 'post', params: { id: '7', postId: '99' }, path: '/users/7/posts/99' }"),
    c('A path with no match resolves to name null', `${WIN}
win.location.pathname = '/nope';
createRouter(ROUTES, win).current()`, "{ name: null, params: {}, path: '/nope' }"),
    c('The number of segments must match, and static segments must match exactly', `${WIN}
const router = createRouter(ROUTES, win);
const names = [];
['/users/42/extra', '/user/42', '/users/42/posts'].forEach((p) => { win.location.pathname = p; back(p); names.push(router.current().name); });
names`, '[null, null, null]'),
    c('Parameters are decoded', `${WIN}
win.location.pathname = '/users/a%20b';
createRouter(ROUTES, win).current().params`, "{ id: 'a b' }"),
    c('A trailing slash is ignored when matching', `${WIN}
win.location.pathname = '/users/';
createRouter(ROUTES, win).current().name`, "'users'"),
    c('The first matching route wins', `${WIN}
win.location.pathname = '/x/new';
createRouter([{ name: 'a', path: '/x/:id' }, { name: 'b', path: '/x/new' }], win).current().name`, "'a'"),
    c('navigate pushes a history entry, updates the route and notifies once', `${WIN}
const router = createRouter(ROUTES, win);
router.subscribe((r) => seen.push(r.name));
router.navigate('/users/5');
[pushes, router.current(), seen]`, "[['/users/5'], { name: 'user', params: { id: '5' }, path: '/users/5' }, ['user']]"),
    c('navigate to the current path does nothing (no entry, no notification)', `${WIN}
const router = createRouter(ROUTES, win);
router.subscribe((r) => seen.push(r.name));
router.navigate('/');
[pushes, seen]`, '[[], []]'),
    c('replace uses replaceState, not pushState, and notifies', `${WIN}
const router = createRouter(ROUTES, win);
router.subscribe((r) => seen.push(r.name));
router.replace('/users');
[pushes, replaces, router.current().name, seen]`, "[[], ['/users'], 'users', ['users']]"),
    c('The back button (popstate) re-resolves from the location and notifies, without pushing', `${WIN}
const router = createRouter(ROUTES, win);
router.subscribe((r) => seen.push(r.name));
router.navigate('/users');
back('/');
[pushes, router.current().name, seen]`, "[['/users'], 'home', ['users', 'home']]"),
    c('Unsubscribing stops the notifications', `${WIN}
const router = createRouter(ROUTES, win);
const off = router.subscribe((r) => seen.push(r.name));
router.navigate('/users');
off();
router.navigate('/users/1');
seen`, "['users']"),
    c('destroy removes the popstate listener and the subscribers', `${WIN}
const router = createRouter(ROUTES, win);
router.subscribe((r) => seen.push(r.name));
const before = listeners.popstate.length;
router.destroy();
back('/users');
[before, listeners.popstate.length, seen]`, '[1, 0, []]'),
  ],
};
