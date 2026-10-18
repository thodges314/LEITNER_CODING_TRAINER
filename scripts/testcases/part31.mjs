import { c } from './part1.mjs';

// Intro rungs (batch 2): tree-ui, tag-input, virtualization.
const TREE = `const tree = [
  { id: 'src', label: 'src', children: [
    { id: 'app', label: 'app.js' },
    { id: 'lib', label: 'lib', children: [{ id: 'util', label: 'util.js' }] },
  ] },
  { id: 'readme', label: 'README.md' },
];
`;
const brief = `const brief = (rows) => rows.map((r) => r.depth + ':' + r.id);
`;
export default {
  'flatten-visible-tree': [
    c('Everything collapsed: only the top level, with its flags', TREE + `flattenVisible(tree, new Set())`, "[{ id: 'src', label: 'src', depth: 0, hasChildren: true, expanded: false }, { id: 'readme', label: 'README.md', depth: 0, hasChildren: false, expanded: false }]"),
    c('Expanding a folder shows its children one level deeper, in order', TREE + brief + `brief(flattenVisible(tree, new Set(['src'])))`, "['0:src', '1:app', '1:lib', '0:readme']"),
    c('Nested expansion shows grandchildren at depth 2', TREE + brief + `brief(flattenVisible(tree, new Set(['src', 'lib'])))`, "['0:src', '1:app', '1:lib', '2:util', '0:readme']"),
    c('A collapsed parent hides its whole subtree, even if a descendant is in the Set', TREE + brief + `brief(flattenVisible(tree, new Set(['lib'])))`, "['0:src', '0:readme']"),
    c('expanded is true only for folders that are open; a leaf id in the Set is not expanded', TREE + `flattenVisible(tree, new Set(['src', 'app'])).slice(0, 3).map((r) => [r.id, r.hasChildren, r.expanded])`, "[['src', true, true], ['app', false, false], ['lib', true, false]]"),
    c('An empty tree has no rows', `flattenVisible([], new Set(['x']))`, '[]'),
    c('A node with an empty children array is a leaf', `flattenVisible([{ id: 'a', label: 'A', children: [] }], new Set(['a']))`, "[{ id: 'a', label: 'A', depth: 0, hasChildren: false, expanded: false }]"),
    c('toggleExpanded adds, then removes, and returns a new Set each time', `const a = new Set(['x']);
const b = toggleExpanded(a, 'y');
const c2 = toggleExpanded(b, 'x');
[[...a], [...b], [...c2], a === b]`, "[['x'], ['x', 'y'], ['y'], false]"),
  ],
  'add-tag-rules': [
    c('A tag is trimmed and added at the end', `addTag(['a'], '  b  ')`, "['a', 'b']"),
    c('Empty and whitespace-only input are ignored', `[addTag(['a'], ''), addTag(['a'], '   ')]`, "[['a'], ['a']]"),
    c('Duplicates are ignored regardless of case, and the first spelling stays', `[addTag(['React'], 'react'), addTag(['React'], ' REACT ')]`, "[['React'], ['React']]"),
    c('A different tag is still added when others exist', `addTag(['react'], 'redux')`, "['react', 'redux']"),
    c('max: nothing is added once the list is full, but the last free slot works', `[addTag(['a'], 'b', { max: 2 }), addTag(['a', 'b'], 'c', { max: 2 })]`, "[['a', 'b'], ['a', 'b']]"),
    c('addTag always returns a new array, even when nothing is added', `const tags = ['a'];
const same = addTag(tags, '');
const more = addTag(tags, 'b');
[same === tags, more === tags, tags]`, "[false, false, ['a']]"),
    c('removeTag removes by index and leaves the original alone', `const tags = ['a', 'b', 'c'];
[removeTag(tags, 1), tags]`, "[['a', 'c'], ['a', 'b', 'c']]"),
    c('removeTag with an index that does not exist changes nothing', `[removeTag(['a', 'b'], 5), removeTag(['a', 'b'], -1)]`, "[['a', 'b'], ['a', 'b']]"),
    c('parseTags splits on commas and line breaks, trims, and drops blanks and repeats', `parseTags('a, b,\\n A ,,C')`, "['a', 'b', 'C']"),
    c('parseTags of empty or separator-only text is an empty list', `[parseTags(''), parseTags(' , \\n ,')]`, '[[], []]'),
  ],
  'visible-window-range': [
    c('At the top: rows that fit the viewport', `getVisibleRange({ scrollTop: 0, itemHeight: 20, viewportHeight: 100, itemCount: 1000 })`, '{ start: 0, end: 5, offsetTop: 0, totalHeight: 20000 }'),
    c('Partly visible rows at both edges count as visible', `getVisibleRange({ scrollTop: 250, itemHeight: 20, viewportHeight: 100, itemCount: 1000 })`, '{ start: 12, end: 18, offsetTop: 240, totalHeight: 20000 }'),
    c('Exactly aligned rows: no extra row at the bottom', `getVisibleRange({ scrollTop: 240, itemHeight: 20, viewportHeight: 100, itemCount: 1000 })`, '{ start: 12, end: 17, offsetTop: 240, totalHeight: 20000 }'),
    c('overscan adds rows above and below', `getVisibleRange({ scrollTop: 250, itemHeight: 20, viewportHeight: 100, itemCount: 1000, overscan: 3 })`, '{ start: 9, end: 21, offsetTop: 180, totalHeight: 20000 }'),
    c('overscan never goes above row 0', `getVisibleRange({ scrollTop: 20, itemHeight: 20, viewportHeight: 100, itemCount: 1000, overscan: 5 })`, '{ start: 0, end: 11, offsetTop: 0, totalHeight: 20000 }'),
    c('At the bottom the range ends at itemCount, with and without overscan', `const base = { scrollTop: 19900, itemHeight: 20, viewportHeight: 100, itemCount: 1000 };
[getVisibleRange(base), getVisibleRange({ ...base, overscan: 5 })]`, '[{ start: 995, end: 1000, offsetTop: 19900, totalHeight: 20000 }, { start: 990, end: 1000, offsetTop: 19800, totalHeight: 20000 }]'),
    c('scrollTop is limited to the scroll range (below 0 and past the end)', `const base = { itemHeight: 20, viewportHeight: 100, itemCount: 1000 };
[getVisibleRange({ ...base, scrollTop: -50 }).start, getVisibleRange({ ...base, scrollTop: 99999 }).start]`, '[0, 995]'),
    c('Fewer rows than the viewport: all of them, and no scrolling', `getVisibleRange({ scrollTop: 500, itemHeight: 20, viewportHeight: 100, itemCount: 3 })`, '{ start: 0, end: 3, offsetTop: 0, totalHeight: 60 }'),
    c('Content shorter than the viewport never scrolls, whatever the row height', `getVisibleRange({ scrollTop: 5, itemHeight: 1, viewportHeight: 10, itemCount: 3 })`, '{ start: 0, end: 3, offsetTop: 0, totalHeight: 3 }'),
    c('No items', `getVisibleRange({ scrollTop: 0, itemHeight: 20, viewportHeight: 100, itemCount: 0, overscan: 2 })`, '{ start: 0, end: 0, offsetTop: 0, totalHeight: 0 }'),
  ],
};
