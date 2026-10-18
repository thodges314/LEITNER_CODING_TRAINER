import { c } from './part1.mjs';

// Browser APIs, batch 1: keyboard shortcut matcher, cookie parse/serialize, copy to clipboard.
const EV = `const ev = (key, mods = {}) => ({ key, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...mods });`;

export default {
  'keyboard-shortcut-matcher': [
    c('parseShortcut splits the modifiers from the key and lowercases everything', `parseShortcut('Ctrl+Shift+K')`, "{ key: 'k', ctrl: true, meta: false, alt: false, shift: true, mod: false }"),
    c('Spaces around the parts are ignored and "mod" is its own flag', `parseShortcut(' mod + s ')`, "{ key: 's', ctrl: false, meta: false, alt: false, shift: false, mod: true }"),
    c('Aliases: cmd/command = meta, option = alt, control = ctrl, esc = escape, return = enter, space = a space character', `[parseShortcut('Cmd+Option+Esc'), parseShortcut('control+return'), parseShortcut('Space')]`, "[{ key: 'escape', ctrl: false, meta: true, alt: true, shift: false, mod: false }, { key: 'enter', ctrl: true, meta: false, alt: false, shift: false, mod: false }, { key: ' ', ctrl: false, meta: false, alt: false, shift: false, mod: false }]"),
    c('Modifiers must match exactly: a missing modifier and an extra modifier both fail', `${EV}
[matchesShortcut(ev('k', { ctrlKey: true }), 'Ctrl+K'), matchesShortcut(ev('k'), 'Ctrl+K'), matchesShortcut(ev('k', { ctrlKey: true, shiftKey: true }), 'Ctrl+K')]`, '[true, false, false]'),
    c('The key is compared case-insensitively (Shift makes event.key uppercase)', `${EV}
[matchesShortcut(ev('K', { shiftKey: true }), 'Shift+k'), matchesShortcut(ev('Enter', { metaKey: true }), 'Cmd+Enter'), matchesShortcut(ev('j', { ctrlKey: true }), 'Ctrl+K')]`, '[true, true, false]'),
    c('A shortcut without modifiers only matches when no modifier is held', `${EV}
[matchesShortcut(ev('Escape'), 'Escape'), matchesShortcut(ev('Escape', { altKey: true }), 'Escape'), matchesShortcut(ev('Escape', { shiftKey: true }), 'Esc')]`, '[true, false, false]'),
    c('"mod" is Cmd on a Mac and Ctrl everywhere else', `${EV}
[matchesShortcut(ev('s', { ctrlKey: true }), 'Mod+S', false), matchesShortcut(ev('s', { metaKey: true }), 'Mod+S', true), matchesShortcut(ev('s', { ctrlKey: true }), 'Mod+S', true), matchesShortcut(ev('s', { metaKey: true }), 'Mod+S', false)]`, '[true, true, false, false]'),
    c('isMac defaults to false: without it, Mod means Ctrl', `${EV}
[matchesShortcut(ev('s', { ctrlKey: true }), 'Mod+S'), matchesShortcut(ev('s', { metaKey: true }), 'Mod+S')]`, '[true, false]'),
    c('findShortcut returns the name of the binding that matches, or null', `${EV}
const bindings = { save: 'Mod+S', saveAll: 'Mod+Shift+S', help: 'Alt+H' };
[findShortcut(ev('S', { ctrlKey: true, shiftKey: true }), bindings), findShortcut(ev('s', { ctrlKey: true }), bindings), findShortcut(ev('h', { altKey: true }), bindings), findShortcut(ev('x'), bindings)]`, "['saveAll', 'save', 'help', null]"),
    c('findShortcut passes isMac on to the matching', `${EV}
const bindings = { save: 'Mod+S' };
[findShortcut(ev('s', { metaKey: true }), bindings, true), findShortcut(ev('s', { metaKey: true }), bindings)]`, "['save', null]"),
  ],
  'cookie-parse-serialize': [
    c('parseCookies reads name=value pairs separated by semicolons', `parseCookies('a=1; b=two; c=')`, "{ a: '1', b: 'two', c: '' }"),
    c('Names and values are trimmed, empty segments are skipped and the value keeps any "=" after the first one', `parseCookies(' theme = dark ;; token=abc=def== ;')`, "{ theme: 'dark', token: 'abc=def==' }"),
    c('Values are decoded with decodeURIComponent', `parseCookies('q=hello%20world%21; name=Ren%C3%A9')`, "{ q: 'hello world!', name: 'René' }"),
    c('A malformed escape keeps the raw text instead of throwing', `parseCookies('bad=%E0%A4%A; ok=1')`, "{ bad: '%E0%A4%A', ok: '1' }"),
    c('When a name repeats the first value wins; segments without "=" are ignored', `parseCookies('a=1; a=2; flag; b=3')`, "{ a: '1', b: '3' }"),
    c('An empty header gives an empty object', `[parseCookies(''), parseCookies(undefined)]`, '[{}, {}]'),
    c('serializeCookie encodes the value and writes no attributes by default', `serializeCookie('theme', 'dark mode&more')`, "'theme=dark%20mode%26more'"),
    c('Attributes are written in a fixed order: Max-Age, Domain, Path, Secure, HttpOnly, SameSite', `serializeCookie('id', '42', { sameSite: 'lax', httpOnly: true, secure: true, path: '/app', domain: 'example.com', maxAge: 3600 })`, "'id=42; Max-Age=3600; Domain=example.com; Path=/app; Secure; HttpOnly; SameSite=Lax'"),
    c('Max-Age of 0 is still written (it deletes the cookie), and Expires uses the UTC string of the Date', `[serializeCookie('x', '1', { maxAge: 0 }), serializeCookie('y', '2', { expires: new Date(Date.UTC(2030, 0, 2, 3, 4, 5)) })]`, "['x=1; Max-Age=0', 'y=2; Expires=Wed, 02 Jan 2030 03:04:05 GMT']"),
    c('SameSite accepts any case and is normalised; secure:false and httpOnly:false write nothing', `[serializeCookie('a', '1', { sameSite: 'STRICT' }), serializeCookie('b', '2', { sameSite: 'none', secure: false, httpOnly: false })]`, "['a=1; SameSite=Strict', 'b=2; SameSite=None']"),
    c('An invalid cookie name throws a TypeError', `serializeCookie('bad name', 'x')`, '', { t: 'Invalid cookie name', x: 'Throws TypeError \u2014 message contains "Invalid cookie name"' }),
    c('An unknown SameSite value throws a TypeError', `serializeCookie('a', '1', { sameSite: 'sometimes' })`, '', { t: 'Invalid SameSite value', x: 'Throws TypeError \u2014 message contains "Invalid SameSite value"' }),
  ],
  'copy-to-clipboard': [
    c('Uses navigator.clipboard.writeText when it exists and never touches the DOM', `${'const log = [];'}
const doc = { body: { appendChild() { log.push('append'); }, removeChild() {} }, createElement() { log.push('create'); } };
const nav = { clipboard: { writeText: async (t) => { log.push('write:' + t); } } };
(async () => [await copyToClipboard('hello', { navigator: nav, document: doc }), log])()`, "[true, ['write:hello']]"),
    c('Without the Clipboard API it falls back to a hidden textarea and execCommand("copy")', `const log = [];
const doc = {
  body: { appendChild(el) { log.push('append'); }, removeChild(el) { log.push('remove'); } },
  createElement(tag) { log.push('create:' + tag); return { value: '', style: {}, attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, select() { log.push('select'); } }; },
  execCommand(cmd) { log.push('exec:' + cmd); return true; },
};
(async () => [await copyToClipboard('hi', { navigator: {}, document: doc }), log])()`, "[true, ['create:textarea', 'append', 'select', 'exec:copy', 'remove']]"),
    c('The textarea holds the text, is readonly and is positioned off screen', `let area;
const doc = {
  body: { appendChild() {}, removeChild() {} },
  createElement() { area = { value: '', style: {}, attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, select() {} }; return area; },
  execCommand() { return true; },
};
(async () => { await copyToClipboard('some text', { navigator: {}, document: doc }); return [area.value, 'readonly' in area.attrs, area.style.position, area.style.left]; })()`, "['some text', true, 'fixed', '-9999px']"),
    c('If writeText rejects (permission denied) the fallback is used', `const log = [];
const doc = {
  body: { appendChild() {}, removeChild() { log.push('remove'); } },
  createElement() { return { value: '', style: {}, setAttribute() {}, select() {} }; },
  execCommand() { log.push('exec'); return true; },
};
const nav = { clipboard: { writeText: () => Promise.reject(new Error('denied')) } };
(async () => [await copyToClipboard('x', { navigator: nav, document: doc }), log])()`, "[true, ['exec', 'remove']]"),
    c('Resolves false when execCommand reports failure, and still removes the textarea', `const log = [];
const doc = {
  body: { appendChild() {}, removeChild() { log.push('remove'); } },
  createElement() { return { value: '', style: {}, setAttribute() {}, select() {} }; },
  execCommand() { return false; },
};
(async () => [await copyToClipboard('x', { navigator: {}, document: doc }), log])()`, "[false, ['remove']]"),
    c('Resolves false (and cleans up) when execCommand throws', `const log = [];
const doc = {
  body: { appendChild() {}, removeChild() { log.push('remove'); } },
  createElement() { return { value: '', style: {}, setAttribute() {}, select() {} }; },
  execCommand() { throw new Error('not allowed'); },
};
(async () => [await copyToClipboard('x', { navigator: {}, document: doc }), log])()`, "[false, ['remove']]"),
    c('Resolves false when there is no clipboard and no document', `copyToClipboard('x', { navigator: {}, document: null })`, 'false'),
  ],
};
