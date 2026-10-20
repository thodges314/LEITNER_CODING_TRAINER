import { c } from './part1.mjs';

// Utilities, batch 5: calendar month grid, deep merge.
export default {
  'calendar-month-grid': [
    c('October 2026 (starts on a Thursday), weeks starting on Sunday', `buildMonthGrid(2026, 9)`,
      `[[null, null, null, null, 1, 2, 3], [4, 5, 6, 7, 8, 9, 10], [11, 12, 13, 14, 15, 16, 17], [18, 19, 20, 21, 22, 23, 24], [25, 26, 27, 28, 29, 30, 31]]`),
    c('The same month with weeks starting on Monday', `buildMonthGrid(2026, 9, 1)`,
      `[[null, null, null, 1, 2, 3, 4], [5, 6, 7, 8, 9, 10, 11], [12, 13, 14, 15, 16, 17, 18], [19, 20, 21, 22, 23, 24, 25], [26, 27, 28, 29, 30, 31, null]]`),
    c('A month that starts on the first weekday has no leading padding: February 2026 is exactly 4 full weeks', `buildMonthGrid(2026, 1)`,
      `[[1, 2, 3, 4, 5, 6, 7], [8, 9, 10, 11, 12, 13, 14], [15, 16, 17, 18, 19, 20, 21], [22, 23, 24, 25, 26, 27, 28]]`),
    c('A leap February (2024) has 29 days and pads the end of the last week', `buildMonthGrid(2024, 1)`,
      `[[null, null, null, null, 1, 2, 3], [4, 5, 6, 7, 8, 9, 10], [11, 12, 13, 14, 15, 16, 17], [18, 19, 20, 21, 22, 23, 24], [25, 26, 27, 28, 29, null, null]]`),
    c('A non-leap February (2023) has 28 days', `buildMonthGrid(2023, 1)`,
      `[[null, null, null, 1, 2, 3, 4], [5, 6, 7, 8, 9, 10, 11], [12, 13, 14, 15, 16, 17, 18], [19, 20, 21, 22, 23, 24, 25], [26, 27, 28, null, null, null, null]]`),
    c('Some months need 6 weeks: August 2026 starts on a Saturday', `buildMonthGrid(2026, 7)`,
      `[[null, null, null, null, null, null, 1], [2, 3, 4, 5, 6, 7, 8], [9, 10, 11, 12, 13, 14, 15], [16, 17, 18, 19, 20, 21, 22], [23, 24, 25, 26, 27, 28, 29], [30, 31, null, null, null, null, null]]`),
    c('The same August with weeks starting on Saturday needs only 5 weeks and no leading padding', `buildMonthGrid(2026, 7, 6)`,
      `[[1, 2, 3, 4, 5, 6, 7], [8, 9, 10, 11, 12, 13, 14], [15, 16, 17, 18, 19, 20, 21], [22, 23, 24, 25, 26, 27, 28], [29, 30, 31, null, null, null, null]]`),
    c('Every week has 7 cells, and the days 1..N appear in order, for all 12 months of 2026', `const rows = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((m) => {
  const grid = buildMonthGrid(2026, m);
  const days = grid.flat().filter((d) => d !== null);
  return [grid.every((week) => week.length === 7), days.length, days.every((d, i) => d === i + 1)];
});
rows`,
      `[[true, 31, true], [true, 28, true], [true, 31, true], [true, 30, true], [true, 31, true], [true, 30, true], [true, 31, true], [true, 31, true], [true, 30, true], [true, 31, true], [true, 30, true], [true, 31, true]]`),
    c('The Gregorian leap rule: 1900 is not a leap year, 2000 is', `[buildMonthGrid(1900, 1).flat().filter((d) => d !== null).length, buildMonthGrid(2000, 1).flat().filter((d) => d !== null).length]`,
      `[28, 29]`),
    c('weekStartsOn defaults to Sunday (0)', `JSON.stringify(buildMonthGrid(2026, 9)) === JSON.stringify(buildMonthGrid(2026, 9, 0))`, `true`),
    c('No empty week is ever returned: the first and the last week each contain a day', `const rows = [[2026, 9, 0], [2026, 9, 1], [2026, 1, 0], [2026, 7, 0], [2026, 7, 6], [2024, 1, 0]].map(([y, m, w]) => {
  const grid = buildMonthGrid(y, m, w);
  return [grid[0].some((d) => d !== null), grid[grid.length - 1].some((d) => d !== null)];
});
rows`,
      `[[true, true], [true, true], [true, true], [true, true], [true, true], [true, true]]`),
  ],
  'deep-merge-objects': [
    c('Nested plain objects are merged key by key', `deepMerge({ a: 1, b: { c: 2, d: 3 } }, { b: { d: 4, e: 5 }, f: 6 })`,
      `{ a: 1, b: { c: 2, d: 4, e: 5 }, f: 6 }`),
    c('Several sources are applied left to right, later ones win', `deepMerge({ a: 1 }, { a: 2, b: 1 }, { b: 3 })`, `{ a: 2, b: 3 }`),
    c('Merging works at any depth and across several sources', `deepMerge({ a: { b: { c: 1, d: 1 } } }, { a: { b: { d: 2 } } }, { a: { b: { e: 3 } } })`,
      `{ a: { b: { c: 1, d: 2, e: 3 } } }`),
    c('Arrays are replaced as a whole, never concatenated or merged by index', `deepMerge({ list: [1, 2, 3], other: [1] }, { list: [9] })`,
      `{ list: [9], other: [1] }`),
    c('null replaces a value, undefined is ignored', `deepMerge({ a: 1, b: 2, c: { d: 3 } }, { a: null, b: undefined, c: null })`,
      `{ a: null, b: 2, c: null }`),
    c('A primitive replaces an object and an object replaces a primitive', `[deepMerge({ a: { x: 1 } }, { a: 5 }), deepMerge({ a: 5 }, { a: { x: 1 } })]`,
      `[{ a: 5 }, { a: { x: 1 } }]`),
    c('null or undefined targets and sources are skipped', `[deepMerge({ a: 1 }, null, undefined, { b: 2 }), deepMerge(null, { a: 1 }), deepMerge(undefined), deepMerge()]`,
      `[{ a: 1, b: 2 }, { a: 1 }, {}, {}]`),
    c('A new object is returned even without sources, and the inputs are not mutated', `const a = { x: 1, n: { y: 2 } };
const b = { n: { z: 3 } };
const before = JSON.stringify([a, b]);
const r = deepMerge(a, b);
[r, r === a, JSON.stringify([a, b]) === before]`,
      `[{ x: 1, n: { y: 2, z: 3 } }, false, true]`),
    c('The result shares no plain object or array with the inputs (including objects inside arrays)', `const src = { n: { v: 1 }, arr: [{ z: 1 }] };
const r = deepMerge({}, src);
r.n.v = 99;
r.arr[0].z = 99;
[src.n.v, src.arr[0].z, r.n === src.n, r.arr === src.arr]`,
      `[1, 1, false, false]`),
    c('Dates and class instances are replaced by reference, not merged', `class Point { constructor() { this.k = 1; } }
const when = new Date(5);
const p = new Point();
const r = deepMerge({ when: new Date(1), a: { k: 0 } }, { when, a: p });
[r.when === when, r.a === p]`,
      `[true, true]`),
    c('Prototype pollution is blocked for "__proto__"', `const r = deepMerge({}, JSON.parse('{"__proto__": {"polluted": true}, "safe": 1}'));
[Object.keys(r), ({}).polluted, r.polluted]`,
      `[['safe'], undefined, undefined]`),
    c('Prototype pollution is blocked for "constructor" and "prototype"', `const r = deepMerge({}, { constructor: { prototype: { polluted: 1 } }, prototype: { polluted: 2 }, ok: true });
[Object.keys(r), ({}).polluted, Object.prototype.polluted]`,
      `[['ok'], undefined, undefined]`),
    c('Objects with a null prototype count as plain objects and are merged', `const a = Object.assign(Object.create(null), { x: { p: 1 } });
const b = Object.assign(Object.create(null), { x: { q: 2 } });
deepMerge(a, b).x`,
      `{ p: 1, q: 2 }`),
  ],
};
