import { c } from './part1.mjs';

// Hand-written cases for batch 26: Realistic React interview patterns.
export default {
  'use-is-mounted': [
    c(
      'returns true while the component is mounted',
      `const { renderHook } = $dom;\nconst h = renderHook(() => useIsMounted());\nh.result.current()`,
      `true`
    ),
    c(
      'maintains stable callback reference identity across rerenders',
      `const { renderHook } = $dom;\nconst h = renderHook(() => useIsMounted());\nconst first = h.result.current;\nh.rerender();\nfirst === h.result.current`,
      `true`
    ),
    c(
      'returns false after component unmounts',
      `const { renderHook } = $dom;\nconst h = renderHook(() => useIsMounted());\nconst isMounted = h.result.current;\nh.unmount();\nisMounted()`,
      `false`
    ),
    c(`Still true after a re-render, not only right after the first mount`, `const { renderHook } = $dom;
const h = renderHook(() => useIsMounted());
h.rerender();
h.rerender();
h.result.current()`, `true`),
    c(`Each hook instance tracks its own component`, `const { renderHook } = $dom;
const a = renderHook(() => useIsMounted());
const b = renderHook(() => useIsMounted());
const isA = a.result.current;
const isB = b.result.current;
a.unmount();
const out = [isA(), isB()];
b.unmount();
out`, `[false, true]`),
  ],

  'use-media-query': [
    c(
      'initializes with matching media query status',
      `const realMatchMedia = window.matchMedia;\nlet cur = true;\nwindow.matchMedia = (q) => ({ matches: cur, media: q, addEventListener() {}, removeEventListener() {} });\nconst { renderHook } = $dom;\nconst h = renderHook(() => useMediaQuery('(min-width: 768px)'));\nconst out = h.result.current;\nwindow.matchMedia = realMatchMedia;\nout`,
      `true`
    ),
    c(
      'updates matches state when media query change listener triggers',
      `const realMatchMedia = window.matchMedia;\nlet cur = false;\nlet listener = null;\nwindow.matchMedia = (q) => ({\n  matches: cur,\n  media: q,\n  addEventListener(type, cb) { listener = cb; },\n  removeEventListener() {}\n});\nconst { renderHook, act } = $dom;\nconst h = renderHook(() => useMediaQuery('(prefers-color-scheme: dark)'));\nconst before = h.result.current;\nact(() => { listener({ matches: true }); });\nconst out = [before, h.result.current];\nwindow.matchMedia = realMatchMedia;\nout`,
      `[false, true]`
    ),
    c(
      'cleans up change listener on component unmount',
      `const realMatchMedia = window.matchMedia;\nlet removed = false;\nwindow.matchMedia = (q) => ({\n  matches: false,\n  media: q,\n  addEventListener() {},\n  removeEventListener() { removed = true; }\n});\nconst { renderHook } = $dom;\nconst h = renderHook(() => useMediaQuery('(max-width: 600px)'));\nh.unmount();\nwindow.matchMedia = realMatchMedia;\nremoved`,
      `true`
    ),
    c(`Returns false when matchMedia is not available`, `const realMatchMedia = window.matchMedia;
window.matchMedia = undefined;
const { renderHook } = $dom;
const h = renderHook(() => useMediaQuery('(min-width: 768px)'));
const out = h.result.current;
h.unmount();
window.matchMedia = realMatchMedia;
out`, `false`),
    c(`Falls back to addListener/removeListener on legacy browsers`, `const realMatchMedia = window.matchMedia;
let listener = null;
let removed = false;
window.matchMedia = (q) => ({
  matches: false,
  media: q,
  addListener(cb) { listener = cb; },
  removeListener() { removed = true; }
});
const { renderHook, act } = $dom;
const h = renderHook(() => useMediaQuery('(max-width: 600px)'));
const before = h.result.current;
act(() => { listener({ matches: true }); });
const after = h.result.current;
h.unmount();
window.matchMedia = realMatchMedia;
[before, after, removed]`, `[false, true, true]`),
  ],

  'breadcrumbs-router': [
    c(
      'generates root breadcrumb with isCurrent true for home path',
      `generateBreadcrumbs('/')`,
      `[{ path: '/', label: 'Home', isCurrent: true }]`
    ),
    c(
      'generates hierarchical breadcrumbs with capitalized default labels',
      `generateBreadcrumbs('/products/shoes/sneakers')`,
      `[{ path: '/', label: 'Home', isCurrent: false }, { path: '/products', label: 'Products', isCurrent: false }, { path: '/products/shoes', label: 'Shoes', isCurrent: false }, { path: '/products/shoes/sneakers', label: 'Sneakers', isCurrent: true }]`
    ),
    c(
      'applies custom label overrides for matching subpaths',
      `generateBreadcrumbs('/users/123/edit', { '/users/123': 'Alice', '/users/123/edit': 'Profile Settings' })`,
      `[{ path: '/', label: 'Home', isCurrent: false }, { path: '/users', label: 'Users', isCurrent: false }, { path: '/users/123', label: 'Alice', isCurrent: false }, { path: '/users/123/edit', label: 'Profile Settings', isCurrent: true }]`
    ),
    c(
      'normalizes multiple and trailing slashes in route paths',
      `generateBreadcrumbs('//dashboard//analytics/')`,
      `[{ path: '/', label: 'Home', isCurrent: false }, { path: '/dashboard', label: 'Dashboard', isCurrent: false }, { path: '/dashboard/analytics', label: 'Analytics', isCurrent: true }]`
    ),
    c(
      'Breadcrumbs component renders accessible navigation with active label',
      `const { render } = $dom;\nconst r = render(React.createElement(Breadcrumbs, { pathname: '/account' }));\n[r.container.querySelector('nav').getAttribute('aria-label'), r.container.querySelector('span').textContent]`,
      `['Breadcrumb', 'Account']`
    ),
  ],

  'transfer-list': [
    c(
      'initializes left and right lists with initial items',
      `const { renderHook } = $dom;\nconst h = renderHook(() => useTransferList({ initialLeft: ['A', 'B'], initialRight: ['C'] }));\n[h.result.current.left, h.result.current.right]`,
      `[['A', 'B'], ['C']]`
    ),
    c(
      'toggles selection of items in left column',
      `const { renderHook, act } = $dom;\nconst h = renderHook(() => useTransferList({ initialLeft: ['A', 'B'] }));\nact(() => h.result.current.toggleLeft('A'));\nh.result.current.leftSelected`,
      `['A']`
    ),
    c(
      'moves selected items from left to right and clears selection',
      `const { renderHook, act } = $dom;\nconst h = renderHook(() => useTransferList({ initialLeft: ['A', 'B'], initialRight: ['C'] }));\nact(() => h.result.current.toggleLeft('A'));\nact(() => h.result.current.moveRight());\n[h.result.current.left, h.result.current.right, h.result.current.leftSelected]`,
      `[['B'], ['C', 'A'], []]`
    ),
    c(
      'moves selected items from right to left and clears selection',
      `const { renderHook, act } = $dom;\nconst h = renderHook(() => useTransferList({ initialLeft: ['A'], initialRight: ['B', 'C'] }));\nact(() => h.result.current.toggleRight('B'));\nact(() => h.result.current.moveLeft());\n[h.result.current.left, h.result.current.right]`,
      `[['A', 'B'], ['C']]`
    ),
    c(
      'moves all items from left to right',
      `const { renderHook, act } = $dom;\nconst h = renderHook(() => useTransferList({ initialLeft: ['A', 'B'], initialRight: ['C'] }));\nact(() => h.result.current.moveAllRight());\n[h.result.current.left, h.result.current.right]`,
      `[[], ['C', 'A', 'B']]`
    ),
    c(
      'moves all items from right to left',
      `const { renderHook, act } = $dom;\nconst h = renderHook(() => useTransferList({ initialLeft: ['A'], initialRight: ['B', 'C'] }));\nact(() => h.result.current.moveAllLeft());\n[h.result.current.left, h.result.current.right]`,
      `[['A', 'B', 'C'], []]`
    ),
  ],

  'nested-checkbox-tree': [
    c(
      'defaults all nodes to unchecked when initial checked list is empty',
      `const { renderHook } = $dom;\nconst tree = [{ id: 'parent', label: 'P', children: [{ id: 'c1', label: 'C1' }, { id: 'c2', label: 'C2' }] }];\nconst h = renderHook(() => useCheckboxTree(tree, []));\n[h.result.current.getStatus('parent'), h.result.current.getStatus('c1')]`,
      `['unchecked', 'unchecked']`
    ),
    c(
      'evaluates parent as indeterminate when only some children are checked',
      `const { renderHook } = $dom;\nconst tree = [{ id: 'parent', label: 'P', children: [{ id: 'c1', label: 'C1' }, { id: 'c2', label: 'C2' }] }];\nconst h = renderHook(() => useCheckboxTree(tree, ['c1']));\n[h.result.current.getStatus('parent'), h.result.current.getStatus('c1'), h.result.current.getStatus('c2')]`,
      `['indeterminate', 'checked', 'unchecked']`
    ),
    c(
      'evaluates parent as checked when all children are checked',
      `const { renderHook } = $dom;\nconst tree = [{ id: 'parent', label: 'P', children: [{ id: 'c1', label: 'C1' }, { id: 'c2', label: 'C2' }] }];\nconst h = renderHook(() => useCheckboxTree(tree, ['c1', 'c2']));\nh.result.current.getStatus('parent')`,
      `'checked'`
    ),
    c(
      'toggling an unchecked parent checks all of its descendants',
      `const { renderHook, act } = $dom;\nconst tree = [{ id: 'parent', label: 'P', children: [{ id: 'c1', label: 'C1' }, { id: 'c2', label: 'C2' }] }];\nconst h = renderHook(() => useCheckboxTree(tree, []));\nact(() => h.result.current.toggle('parent'));\n[h.result.current.getStatus('parent'), h.result.current.getStatus('c1'), h.result.current.getStatus('c2')]`,
      `['checked', 'checked', 'checked']`
    ),
    c(
      'toggling a checked parent unchecks all of its descendants',
      `const { renderHook, act } = $dom;\nconst tree = [{ id: 'parent', label: 'P', children: [{ id: 'c1', label: 'C1' }, { id: 'c2', label: 'C2' }] }];\nconst h = renderHook(() => useCheckboxTree(tree, ['c1', 'c2']));\nact(() => h.result.current.toggle('parent'));\n[h.result.current.getStatus('parent'), h.result.current.getStatus('c1'), h.result.current.getStatus('c2')]`,
      `['unchecked', 'unchecked', 'unchecked']`
    ),
  ],
};
