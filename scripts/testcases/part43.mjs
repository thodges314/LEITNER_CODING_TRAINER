import { c } from './part1.mjs';

// Utilities, batch 6: highlight search matches, object diff.
export default {
  'highlight-matches': [
    c('Every occurrence is highlighted, the text in between is not', `highlightMatches('Hello World', 'o')`,
      `[{ text: 'Hell', match: false }, { text: 'o', match: true }, { text: ' W', match: false }, { text: 'o', match: true }, { text: 'rld', match: false }]`),
    c('The search ignores case but every segment keeps the original casing', `highlightMatches('Hello HELLO hello', 'LLo')`,
      `[{ text: 'He', match: false }, { text: 'llo', match: true }, { text: ' HE', match: false }, { text: 'LLO', match: true }, { text: ' he', match: false }, { text: 'llo', match: true }]`),
    c('A match at the very start and at the very end', `[highlightMatches('abc', 'a'), highlightMatches('abc', 'c')]`,
      `[[{ text: 'a', match: true }, { text: 'bc', match: false }], [{ text: 'ab', match: false }, { text: 'c', match: true }]]`),
    c('The whole text can be one match', `highlightMatches('abc', 'ABC')`, `[{ text: 'abc', match: true }]`),
    c('Matches right next to each other stay separate segments', `highlightMatches('Banana', 'AN')`,
      `[{ text: 'B', match: false }, { text: 'an', match: true }, { text: 'an', match: true }, { text: 'a', match: false }]`),
    c('Matches are found left to right and never overlap', `highlightMatches('aaa', 'aa')`, `[{ text: 'aa', match: true }, { text: 'a', match: false }]`),
    c('The query is plain text: "." does not match any character', `[highlightMatches('abc', '.'), highlightMatches('a.b', '.')]`,
      `[[{ text: 'abc', match: false }], [{ text: 'a', match: false }, { text: '.', match: true }, { text: 'b', match: false }]]`),
    c('Special characters are matched literally: ( ) + * ? [ ] $ ^ |', `[highlightMatches('f(x) = 1+1', '(x)'), highlightMatches('a+b', '+'), highlightMatches('what?', '?'), highlightMatches('a[0]', '[0]'), highlightMatches('cost $5 | tax', '$5 |')].map((segments) => segments.filter((s) => s.match).map((s) => s.text))`,
      `[['(x)'], ['+'], ['?'], ['[0]'], ['$5 |']]`),
    c('A query that is only a special character does not throw', `[highlightMatches('a*b', '*'), highlightMatches('^start', '^'), highlightMatches('a|b', '|')].map((segments) => segments.length)`,
      `[3, 2, 3]`),
    c('An empty query returns the whole text as one non-matching segment', `highlightMatches('abc', '')`, `[{ text: 'abc', match: false }]`),
    c('An empty text returns an empty list', `[highlightMatches('', 'a'), highlightMatches('', '')]`, `[[], []]`),
    c('A query that does not occur returns the whole text as one non-matching segment', `highlightMatches('abc', 'xyz')`, `[{ text: 'abc', match: false }]`),
    c('Spaces in the query are matched as typed (not trimmed)', `highlightMatches('a b  c', ' ')`,
      `[{ text: 'a', match: false }, { text: ' ', match: true }, { text: 'b', match: false }, { text: ' ', match: true }, { text: ' ', match: true }, { text: 'c', match: false }]`),
    c('Joining the segment texts gives back the original text, and no segment is empty', `const text = 'The Quick brown fox, the lazy dog. THE end';
const segments = highlightMatches(text, 'the');
[segments.map((s) => s.text).join('') === text, segments.every((s) => s.text !== ''), segments.filter((s) => s.match).length]`,
      `[true, true, 3]`),
  ],
  'object-diff': [
    c('Equal objects give no changes', `[diff({}, {}), diff({ a: 1, b: { c: [1, 2] } }, { a: 1, b: { c: [1, 2] } })]`, `[[], []]`),
    c('A changed primitive', `diff({ a: 1 }, { a: 2 })`, `[{ path: 'a', type: 'changed', from: 1, to: 2 }]`),
    c('A key that only exists in b is added', `diff({ a: 1 }, { a: 1, b: 2 })`, `[{ path: 'b', type: 'added', to: 2 }]`),
    c('A key that only exists in a is removed', `diff({ a: 1, b: 2 }, { a: 1 })`, `[{ path: 'b', type: 'removed', from: 2 }]`),
    c('Nested keys report their full dot-joined path', `diff({ user: { name: 'Ann', address: { city: 'Rome', zip: '1' } } }, { user: { name: 'Ann', address: { city: 'Oslo', zip: '1' } } })`,
      `[{ path: 'user.address.city', type: 'changed', from: 'Rome', to: 'Oslo' }]`),
    c('Order: the keys of a first (removed and changed), then the keys only in b', `diff({ a: 1, b: 2, c: 3 }, { c: 4, a: 1, d: 5, e: 6 })`,
      `[{ path: 'b', type: 'removed', from: 2 }, { path: 'c', type: 'changed', from: 3, to: 4 }, { path: 'd', type: 'added', to: 5 }, { path: 'e', type: 'added', to: 6 }]`),
    c('A subtree that is only in one object is reported once, where it starts', `[diff({ a: { x: 1 } }, { a: { x: 1, y: { z: 2 } } }), diff({ a: { x: 1, y: { z: 2 } } }, { a: { x: 1 } })]`,
      `[[{ path: 'a.y', type: 'added', to: { z: 2 } }], [{ path: 'a.y', type: 'removed', from: { z: 2 } }]]`),
    c('Arrays are compared deeply and reported as a whole, at their own path', `[diff({ tags: ['a', 'b'] }, { tags: ['a', 'b'] }), diff({ tags: ['a', 'b'] }, { tags: ['a', 'c'] }), diff({ tags: ['a'] }, { tags: ['a', 'b'] })]`,
      `[[], [{ path: 'tags', type: 'changed', from: ['a', 'b'], to: ['a', 'c'] }], [{ path: 'tags', type: 'changed', from: ['a'], to: ['a', 'b'] }]]`),
    c('Objects inside arrays are compared deeply too', `[diff({ l: [{ a: 1 }] }, { l: [{ a: 1 }] }), diff({ l: [{ a: 1 }] }, { l: [{ a: 2 }] }).map((c) => [c.path, c.type])]`,
      `[[], [['l', 'changed']]]`),
    c('Dates are compared by their time', `[diff({ d: new Date(1000) }, { d: new Date(1000) }), diff({ d: new Date(1000) }, { d: new Date(2000) }).map((c) => [c.path, c.type, c.from.getTime(), c.to.getTime()])]`,
      `[[], [['d', 'changed', 1000, 2000]]]`),
    c('An object on one side and a primitive, null or array on the other is a change', `[diff({ a: { x: 1 } }, { a: 5 }), diff({ a: 5 }, { a: { x: 1 } }), diff({ a: null }, { a: { x: 1 } }), diff({ a: { x: 1 } }, { a: [1] })]`,
      `[[{ path: 'a', type: 'changed', from: { x: 1 }, to: 5 }], [{ path: 'a', type: 'changed', from: 5, to: { x: 1 } }], [{ path: 'a', type: 'changed', from: null, to: { x: 1 } }], [{ path: 'a', type: 'changed', from: { x: 1 }, to: [1] }]]`),
    c('A key holding undefined still counts as present', `[diff({ a: undefined }, {}), diff({}, { a: undefined }), diff({ a: 1 }, { a: undefined }), diff({ a: undefined }, { a: undefined })]`,
      `[[{ path: 'a', type: 'removed', from: undefined }], [{ path: 'a', type: 'added', to: undefined }], [{ path: 'a', type: 'changed', from: 1, to: undefined }], []]`),
    c('NaN equals NaN, but 0 and -0 differ (Object.is)', `[diff({ n: NaN }, { n: NaN }), diff({ z: 0 }, { z: -0 }).map((c) => c.type)]`, `[[], ['changed']]`),
    c('A Date compared with a non-Date is a change (no error)', `[diff({ d: new Date(1) }, { d: 1 }), diff({ d: 'x' }, { d: new Date(1) }), diff({ d: new Date(1) }, { d: { getTime: 1 } })].map((changes) => changes.map((c) => c.type))`,
      `[['changed'], ['changed'], ['changed']]`),
    c('An array is never equal to an object, even one that looks like an empty array', `[diff({ a: [] }, { a: { length: 0 } }), diff({ a: { length: 0 } }, { a: [] })].map((changes) => changes.map((c) => c.path + ':' + c.type))`,
      `[['a:changed'], ['a:changed']]`),
    c('Several removed (or changed) keys keep the order of the keys in a', `[diff({ a: 1, b: 2, c: 3 }, {}).map((c) => c.path), diff({ a: 1, b: 2, c: 3 }, { a: 9, b: 9, c: 9 }).map((c) => c.path)]`,
      `[['a', 'b', 'c'], ['a', 'b', 'c']]`),
    c('The inputs are not changed', `const a = { x: { y: 1 }, l: [1, 2] };
const b = { x: { y: 2 }, l: [1, 3], n: 1 };
const before = JSON.stringify([a, b]);
diff(a, b);
JSON.stringify([a, b]) === before`, `true`),
  ],
};
