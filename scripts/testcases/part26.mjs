import { c } from './part1.mjs';

// Hand-written cases for batch 26: Realistic React interview patterns.
export default {
  'use-is-mounted': [
    c(
      'returns true while the component is mounted',
      `const { renderHook } = $dom;\nconst h = renderHook(() => useIsMounted());\nh.result.current()`,
      `true`,
      { callSignature: 'const isMounted = useIsMounted(); isMounted()' }
    ),
    c(
      'maintains stable callback reference identity across rerenders',
      `const { renderHook } = $dom;\nconst h = renderHook(() => useIsMounted());\nconst first = h.result.current;\nh.rerender();\nfirst === h.result.current`,
      `true`,
      { callSignature: 'const isMounted = useIsMounted(); rerender(); isMounted() === initialRef' }
    ),
    c(
      'returns false after component unmounts',
      `const { renderHook } = $dom;\nconst h = renderHook(() => useIsMounted());\nconst isMounted = h.result.current;\nh.unmount();\nisMounted()`,
      `false`,
      { callSignature: 'const isMounted = useIsMounted(); unmount(); isMounted()' }
    ),
    c(
      `Still true after a re-render, not only right after the first mount`,
      `const { renderHook } = $dom;\nconst h = renderHook(() => useIsMounted());\nh.rerender();\nh.rerender();\nh.result.current()`,
      `true`,
      { callSignature: 'useIsMounted() across multiple re-renders' }
    ),
    c(
      `Each hook instance tracks its own component`,
      `const { renderHook } = $dom;\nconst a = renderHook(() => useIsMounted());\nconst b = renderHook(() => useIsMounted());\nconst isA = a.result.current;\nconst isB = b.result.current;\na.unmount();\nconst out = [isA(), isB()];\nb.unmount();\nout`,
      `[false, true]`,
      { callSignature: 'useIsMounted() tracking independent component instances' }
    ),
  ],

  'use-media-query': [
    c(
      'initializes with matching media query status',
      `const realMatchMedia = window.matchMedia;\nlet cur = true;\nwindow.matchMedia = (q) => ({ matches: cur, media: q, addEventListener() {}, removeEventListener() {} });\nconst { renderHook } = $dom;\nconst h = renderHook(() => useMediaQuery('(min-width: 768px)'));\nconst out = h.result.current;\nwindow.matchMedia = realMatchMedia;\nout`,
      `true`,
      { callSignature: "useMediaQuery('(min-width: 768px)')" }
    ),
    c(
      'updates matches state when media query change listener triggers',
      `const realMatchMedia = window.matchMedia;\nlet cur = false;\nlet listener = null;\nwindow.matchMedia = (q) => ({\n  matches: cur,\n  media: q,\n  addEventListener(type, cb) { listener = cb; },\n  removeEventListener() {}\n});\nconst { renderHook, act } = $dom;\nconst h = renderHook(() => useMediaQuery('(prefers-color-scheme: dark)'));\nconst before = h.result.current;\nact(() => { listener({ matches: true }); });\nconst out = [before, h.result.current];\nwindow.matchMedia = realMatchMedia;\nout`,
      `[false, true]`,
      { callSignature: "useMediaQuery('(prefers-color-scheme: dark)') on match change" }
    ),
    c(
      'cleans up change listener on component unmount',
      `const realMatchMedia = window.matchMedia;\nlet removed = false;\nwindow.matchMedia = (q) => ({\n  matches: false,\n  media: q,\n  addEventListener() {},\n  removeEventListener() { removed = true; }\n});\nconst { renderHook } = $dom;\nconst h = renderHook(() => useMediaQuery('(max-width: 600px)'));\nh.unmount();\nwindow.matchMedia = realMatchMedia;\nremoved`,
      `true`,
      { callSignature: "useMediaQuery('(max-width: 600px)') on unmount" }
    ),
    c(
      `Returns false when matchMedia is not available`,
      `const realMatchMedia = window.matchMedia;\nwindow.matchMedia = undefined;\nconst { renderHook } = $dom;\nconst h = renderHook(() => useMediaQuery('(min-width: 768px)'));\nconst out = h.result.current;\nh.unmount();\nwindow.matchMedia = realMatchMedia;\nout`,
      `false`,
      { callSignature: "useMediaQuery('(min-width: 768px)') (when matchMedia is unavailable)" }
    ),
    c(
      `Falls back to addListener/removeListener on legacy browsers`,
      `const realMatchMedia = window.matchMedia;\nlet listener = null;\nlet removed = false;\nwindow.matchMedia = (q) => ({\n  matches: false,\n  media: q,\n  addListener(cb) { listener = cb; },\n  removeListener() { removed = true; }\n});\nconst { renderHook, act } = $dom;\nconst h = renderHook(() => useMediaQuery('(max-width: 600px)'));\nconst before = h.result.current;\nact(() => { listener({ matches: true }); });\nconst after = h.result.current;\nh.unmount();\nwindow.matchMedia = realMatchMedia;\n[before, after, removed]`,
      `[false, true, true]`,
      { callSignature: "useMediaQuery('(max-width: 600px)') (legacy addListener fallback)" }
    ),
  ],

  'breadcrumbs-router': [
    c(
      'renders root breadcrumb in accessible navigation for home path',
      `const { render, qa } = $dom;\nconst r = render(<Breadcrumbs pathname="/" />);\n[r.container.querySelector('nav')?.getAttribute('aria-label'), r.container.querySelector('ol')?.className, qa('li', r.container).map((li) => { const a = li.querySelector('a'); const s = li.querySelector('span'); return a ? [a.getAttribute('href'), a.textContent] : [s?.getAttribute('aria-current'), s?.textContent]; })]`,
      `['Breadcrumb', 'breadcrumbs', [['page', 'Home']]]`,
      {
        callSignature: "<Breadcrumbs pathname='/' />",
        x: '<span aria-current="page">Home</span>',
      }
    ),
    c(
      'generates hierarchical crumb links with capitalized default labels',
      `const { render, qa } = $dom;\nconst r = render(<Breadcrumbs pathname="/products/shoes/sneakers" />);\nqa('li', r.container).map((li) => { const a = li.querySelector('a'); const s = li.querySelector('span'); return a ? [a.getAttribute('href'), a.textContent] : [s?.getAttribute('aria-current'), s?.textContent]; })`,
      `[['/', 'Home'], ['/products', 'Products'], ['/products/shoes', 'Shoes'], ['page', 'Sneakers']]`,
      {
        callSignature: "<Breadcrumbs pathname='/products/shoes/sneakers' />",
        x: '<a href="/">Home</a> / <a href="/products">Products</a> / <a href="/products/shoes">Shoes</a> / <span aria-current="page">Sneakers</span>',
      }
    ),
    c(
      'applies custom label overrides for matching subpaths',
      `const { render, qa } = $dom;\nconst r = render(<Breadcrumbs pathname="/users/123/edit" labels={{ '/users/123': 'Alice', '/users/123/edit': 'Profile Settings' }} />);\nqa('li', r.container).map((li) => { const a = li.querySelector('a'); const s = li.querySelector('span'); return a ? [a.getAttribute('href'), a.textContent] : [s?.getAttribute('aria-current'), s?.textContent]; })`,
      `[['/', 'Home'], ['/users', 'Users'], ['/users/123', 'Alice'], ['page', 'Profile Settings']]`,
      {
        callSignature: "<Breadcrumbs pathname='/users/123/edit' labels={{ '/users/123': 'Alice', '/users/123/edit': 'Profile Settings' }} />",
        x: '<a href="/">Home</a> / <a href="/users">Users</a> / <a href="/users/123">Alice</a> / <span aria-current="page">Profile Settings</span>',
      }
    ),
    c(
      'normalizes multiple and trailing slashes in route paths',
      `const { render, qa } = $dom;\nconst r = render(<Breadcrumbs pathname="//dashboard//analytics/" />);\nqa('li', r.container).map((li) => { const a = li.querySelector('a'); const s = li.querySelector('span'); return a ? [a.getAttribute('href'), a.textContent] : [s?.getAttribute('aria-current'), s?.textContent]; })`,
      `[['/', 'Home'], ['/dashboard', 'Dashboard'], ['page', 'Analytics']]`,
      {
        callSignature: "<Breadcrumbs pathname='//dashboard//analytics/' />",
        x: '<a href="/">Home</a> / <a href="/dashboard">Dashboard</a> / <span aria-current="page">Analytics</span>',
      }
    ),
    c(
      'renders single-level subpage with Home link and active crumb',
      `const { render, qa } = $dom;\nconst r = render(<Breadcrumbs pathname="/account" />);\nqa('li', r.container).map((li) => { const a = li.querySelector('a'); const s = li.querySelector('span'); return a ? [a.getAttribute('href'), a.textContent] : [s?.getAttribute('aria-current'), s?.textContent]; })`,
      `[['/', 'Home'], ['page', 'Account']]`,
      {
        callSignature: "<Breadcrumbs pathname='/account' />",
        x: '<a href="/">Home</a> / <span aria-current="page">Account</span>',
      }
    ),
  ],

  'transfer-list': [
    c(
      'initializes left and right lists with initial items',
      `const { renderHook } = $dom;\nconst h = renderHook(() => useTransferList({ initialLeft: ['A', 'B'], initialRight: ['C'] }));\n[h.result.current.left, h.result.current.right]`,
      `[['A', 'B'], ['C']]`,
      { callSignature: "const { left, right } = useTransferList({ initialLeft: ['A', 'B'], initialRight: ['C'] }); [left, right]" }
    ),
    c(
      'toggles selection of items in left column',
      `const { renderHook, act } = $dom;\nconst h = renderHook(() => useTransferList({ initialLeft: ['A', 'B'] }));\nact(() => h.result.current.toggleLeft('A'));\nh.result.current.leftSelected`,
      `['A']`,
      { callSignature: "const { toggleLeft, leftSelected } = useTransferList({ initialLeft: ['A', 'B'] }); toggleLeft('A'); leftSelected" }
    ),
    c(
      'moves selected items from left to right and clears selection',
      `const { renderHook, act } = $dom;\nconst h = renderHook(() => useTransferList({ initialLeft: ['A', 'B'], initialRight: ['C'] }));\nact(() => h.result.current.toggleLeft('A'));\nact(() => h.result.current.moveRight());\n[h.result.current.left, h.result.current.right, h.result.current.leftSelected]`,
      `[['B'], ['C', 'A'], []]`,
      { callSignature: "const { toggleLeft, moveRight, left, right, leftSelected } = useTransferList({ initialLeft: ['A', 'B'], initialRight: ['C'] }); toggleLeft('A'); moveRight(); [left, right, leftSelected]" }
    ),
    c(
      'moves selected items from right to left and clears selection',
      `const { renderHook, act } = $dom;\nconst h = renderHook(() => useTransferList({ initialLeft: ['A'], initialRight: ['B', 'C'] }));\nact(() => h.result.current.toggleRight('B'));\nact(() => h.result.current.moveLeft());\n[h.result.current.left, h.result.current.right]`,
      `[['A', 'B'], ['C']]`,
      { callSignature: "const { toggleRight, moveLeft, left, right } = useTransferList({ initialLeft: ['A'], initialRight: ['B', 'C'] }); toggleRight('B'); moveLeft(); [left, right]" }
    ),
    c(
      'moves all items from left to right',
      `const { renderHook, act } = $dom;\nconst h = renderHook(() => useTransferList({ initialLeft: ['A', 'B'], initialRight: ['C'] }));\nact(() => h.result.current.moveAllRight());\n[h.result.current.left, h.result.current.right]`,
      `[[], ['C', 'A', 'B']]`,
      { callSignature: "const { moveAllRight, left, right } = useTransferList({ initialLeft: ['A', 'B'], initialRight: ['C'] }); moveAllRight(); [left, right]" }
    ),
    c(
      'moves all items from right to left',
      `const { renderHook, act } = $dom;\nconst h = renderHook(() => useTransferList({ initialLeft: ['A'], initialRight: ['B', 'C'] }));\nact(() => h.result.current.moveAllLeft());\n[h.result.current.left, h.result.current.right]`,
      `[['A', 'B', 'C'], []]`,
      { callSignature: "const { moveAllLeft, left, right } = useTransferList({ initialLeft: ['A'], initialRight: ['B', 'C'] }); moveAllLeft(); [left, right]" }
    ),
  ],

  'nested-checkbox-tree': [
    c(
      'defaults all nodes to unchecked when initial checked list is empty',
      `const { renderHook } = $dom;\nconst tree = [{ id: 'parent', label: 'P', children: [{ id: 'c1', label: 'C1' }, { id: 'c2', label: 'C2' }] }];\nconst h = renderHook(() => useCheckboxTree(tree, []));\n[h.result.current.getStatus('parent'), h.result.current.getStatus('c1')]`,
      `['unchecked', 'unchecked']`,
      { callSignature: "const tree = [{ id: 'parent', label: 'P', children: [{ id: 'c1', label: 'C1' }, { id: 'c2', label: 'C2' }] }];\nconst { getStatus } = useCheckboxTree(tree, []);\n[getStatus('parent'), getStatus('c1')]" }
    ),
    c(
      'evaluates parent as indeterminate when only some children are checked',
      `const { renderHook } = $dom;\nconst tree = [{ id: 'parent', label: 'P', children: [{ id: 'c1', label: 'C1' }, { id: 'c2', label: 'C2' }] }];\nconst h = renderHook(() => useCheckboxTree(tree, ['c1']));\n[h.result.current.getStatus('parent'), h.result.current.getStatus('c1'), h.result.current.getStatus('c2')]`,
      `['indeterminate', 'checked', 'unchecked']`,
      { callSignature: "const { getStatus } = useCheckboxTree(tree, ['c1']);\n[getStatus('parent'), getStatus('c1'), getStatus('c2')]" }
    ),
    c(
      'evaluates parent as checked when all children are checked',
      `const { renderHook } = $dom;\nconst tree = [{ id: 'parent', label: 'P', children: [{ id: 'c1', label: 'C1' }, { id: 'c2', label: 'C2' }] }];\nconst h = renderHook(() => useCheckboxTree(tree, ['c1', 'c2']));\nh.result.current.getStatus('parent')`,
      `'checked'`,
      { callSignature: "useCheckboxTree(tree, ['c1', 'c2']).getStatus('parent')" }
    ),
    c(
      'toggling an unchecked parent checks all of its descendants',
      `const { renderHook, act } = $dom;\nconst tree = [{ id: 'parent', label: 'P', children: [{ id: 'c1', label: 'C1' }, { id: 'c2', label: 'C2' }] }];\nconst h = renderHook(() => useCheckboxTree(tree, []));\nact(() => h.result.current.toggle('parent'));\n[h.result.current.getStatus('parent'), h.result.current.getStatus('c1'), h.result.current.getStatus('c2')]`,
      `['checked', 'checked', 'checked']`,
      { callSignature: "const { toggle, getStatus } = useCheckboxTree(tree, []);\ntoggle('parent');\n[getStatus('parent'), getStatus('c1'), getStatus('c2')]" }
    ),
    c(
      'toggling a checked parent unchecks all of its descendants',
      `const { renderHook, act } = $dom;\nconst tree = [{ id: 'parent', label: 'P', children: [{ id: 'c1', label: 'C1' }, { id: 'c2', label: 'C2' }] }];\nconst h = renderHook(() => useCheckboxTree(tree, ['c1', 'c2']));\nact(() => h.result.current.toggle('parent'));\n[h.result.current.getStatus('parent'), h.result.current.getStatus('c1'), h.result.current.getStatus('c2')]`,
      `['unchecked', 'unchecked', 'unchecked']`,
      { callSignature: "const { toggle, getStatus } = useCheckboxTree(tree, ['c1', 'c2']);\ntoggle('parent');\n[getStatus('parent'), getStatus('c1'), getStatus('c2')]" }
    ),
  ],
};
