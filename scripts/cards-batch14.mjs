// One-off: writes the hand-authored batch-14 "ladder hole" starter cards (d1/d2 rungs) into scripts/cards/,
// scripts/difficulty.json and scripts/complexity-cache.json. Cases are in scripts/testcases/part14.mjs.
// Run: node scripts/cards-batch14.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(here, 'cards');
const diffFile = path.join(here, 'difficulty.json');
const cacheFile = path.join(here, 'complexity-cache.json');
const ladder = JSON.parse(fs.readFileSync(diffFile, 'utf8'));
const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
const R = String.raw;

const cards = [
  {
    id: 'insertion-sort-basic', track: 'algorithms', title: 'Sorting: Insertion Sort, Selection Sort, isSorted',
    tags: ['sorting', 'array', 'basics'], difficulty: 1, concept: 'sorting',
    cx: ['O(n²)', 'O(1)', 'Insertion sort shifts elements within nested loops over n items and selection sort scans the unsorted rest n times, both using constant extra space apart from the output copy.'],
    prompt: 'Write insertionSort(arr) that sorts an array of numbers ascending IN PLACE and returns the same array object, selectionSort(arr) that returns a NEW sorted array and leaves the input untouched, and isSorted(arr) that returns true when the array is in ascending (non-decreasing) order (empty and one-element arrays are sorted). Do not use Array.prototype.sort.',
    ref: R`function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const value = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > value) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = value;
  }
  return arr;
}

function selectionSort(arr) {
  const out = arr.slice();
  for (let i = 0; i < out.length - 1; i++) {
    let min = i;
    for (let j = i + 1; j < out.length; j++) {
      if (out[j] < out[min]) min = j;
    }
    [out[i], out[min]] = [out[min], out[i]];
  }
  return out;
}

function isSorted(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] > arr[i]) return false;
  }
  return true;
}`,
  },
  {
    id: 'heap-array-basics', track: 'algorithms', title: 'Heap Basics: Index Math, isMinHeap, siftUp',
    tags: ['heap', 'array', 'basics'], difficulty: 2, concept: 'heap',
    cx: ['O(n)', 'O(1)', 'Index helpers are O(1), isMinHeap checks each parent once and siftUp climbs at most the tree height (log n) using constant extra space.'],
    prompt: 'A binary heap is stored in an array: the children of index i are 2i+1 and 2i+2. Write parentIndex(i), leftIndex(i), rightIndex(i), isMinHeap(arr) (true when every parent is <= both of its children; empty and one-element arrays are heaps) and siftUp(arr, i) which moves the element at index i up while it is smaller than its parent, in place, and returns the array.',
    ref: R`function parentIndex(i) {
  return Math.floor((i - 1) / 2);
}

function leftIndex(i) {
  return 2 * i + 1;
}

function rightIndex(i) {
  return 2 * i + 2;
}

function isMinHeap(arr) {
  for (let i = 0; i < arr.length; i++) {
    const l = leftIndex(i);
    const r = rightIndex(i);
    if (l < arr.length && arr[i] > arr[l]) return false;
    if (r < arr.length && arr[i] > arr[r]) return false;
  }
  return true;
}

function siftUp(arr, i) {
  while (i > 0) {
    const p = parentIndex(i);
    if (arr[p] <= arr[i]) break;
    [arr[p], arr[i]] = [arr[i], arr[p]];
    i = p;
  }
  return arr;
}`,
  },
  {
    id: 'trie-nested-object', track: 'algorithms', title: 'Trie From Nested Objects',
    tags: ['trie', 'string', 'basics'], difficulty: 2, concept: 'trie',
    cx: ['O(total characters)', 'O(total characters)', 'Building visits every character of every word once and creates at most one nested object per character; lookups cost one step per character.'],
    prompt: "Write buildTrie(words) returning a trie made of plain nested objects: one key per character, and the key '$' set to true on the node where a word ends (buildTrie(['a', 'ab']) is { a: { $: true, b: { $: true } } }; no words gives {}). Write hasWord(trie, word) (true only for complete words) and hasPrefix(trie, prefix) (true when some word starts with prefix; the empty prefix is true for any non-empty trie).",
    ref: R`function buildTrie(words) {
  const root = {};
  for (const word of words) {
    let node = root;
    for (const ch of word) {
      if (!node[ch]) node[ch] = {};
      node = node[ch];
    }
    node.$ = true;
  }
  return root;
}

function walk(trie, text) {
  let node = trie;
  for (const ch of text) {
    node = node[ch];
    if (!node) return null;
  }
  return node;
}

function hasWord(trie, word) {
  const node = walk(trie, word);
  return !!node && node.$ === true;
}

function hasPrefix(trie, prefix) {
  const node = walk(trie, prefix);
  return !!node && Object.keys(node).length > 0;
}`,
  },
  {
    id: 'binary-strings-combinations', track: 'algorithms', title: 'Backtracking: Binary Strings and Combinations',
    tags: ['backtracking', 'recursion', 'basics'], difficulty: 2, concept: 'backtracking',
    cx: ['O(n · 2ⁿ) / O(k · C(n,k))', 'O(n)', 'Output size dominates (2ⁿ strings or C(n,k) combinations) while the recursion depth and current path stay at most n long.'],
    prompt: "Write binaryStrings(n) returning every binary string of length n in ascending order (binaryStrings(2) is ['00', '01', '10', '11']; binaryStrings(0) is ['']) and combine(n, k) returning every combination of k numbers chosen from 1..n as arrays, each ascending, in lexicographic order (combine(4, 2) starts [1, 2], [1, 3]; combine(3, 0) is [[]]; combine(2, 3) is []).",
    ref: R`function binaryStrings(n) {
  const out = [];
  const go = (s) => {
    if (s.length === n) {
      out.push(s);
      return;
    }
    go(s + '0');
    go(s + '1');
  };
  go('');
  return out;
}

function combine(n, k) {
  const out = [];
  const path = [];
  const go = (start) => {
    if (path.length === k) {
      out.push([...path]);
      return;
    }
    for (let i = start; i <= n; i++) {
      path.push(i);
      go(i + 1);
      path.pop();
    }
  };
  go(1);
  return out;
}`,
  },
  {
    id: 'matrix-basics', track: 'algorithms', title: 'Matrix Basics: Create, Sum, Diagonal',
    tags: ['matrix', '2d-array', 'basics'], difficulty: 1, concept: 'matrix',
    cx: ['O(rows × cols)', 'O(rows × cols)', 'Creating or summing touches every cell once; diagonalSum is O(n) and createMatrix allocates the full grid.'],
    prompt: 'Write createMatrix(rows, cols, fill = 0) returning a rows x cols array of arrays where every row is its OWN array (changing one cell must not change others), matrixSum(matrix) returning the sum of every cell (0 for an empty matrix), and diagonalSum(matrix) for a square matrix returning the sum of both diagonals, counting the centre cell of an odd-sized matrix only once.',
    ref: R`function createMatrix(rows, cols, fill = 0) {
  return Array.from({ length: rows }, () => new Array(cols).fill(fill));
}

function matrixSum(matrix) {
  let total = 0;
  for (const row of matrix) {
    for (const value of row) total += value;
  }
  return total;
}

function diagonalSum(matrix) {
  const n = matrix.length;
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += matrix[i][i];
    if (i !== n - 1 - i) total += matrix[i][n - 1 - i];
  }
  return total;
}`,
  },
  {
    id: 'graph-adjacency-bfs', track: 'algorithms', title: 'Graph Basics: Adjacency List and BFS Path',
    tags: ['graph', 'bfs', 'basics'], difficulty: 2, concept: 'graphs',
    cx: ['O(V + E)', 'O(V + E)', 'Building the adjacency list and the breadth-first search each touch every vertex and edge once, storing the lists and a visited set.'],
    prompt: 'An undirected graph is given as an array of [a, b] edges. Write buildGraph(edges) returning an object that maps each node to an array of its neighbours in the order the edges appear (buildGraph([[1, 2], [1, 3]]) is { 1: [2, 3], 2: [1], 3: [1] }), hasPath(edges, start, end) returning true when end can be reached from start (a node always reaches itself), and shortestPathLength(edges, start, end) using breadth-first search that returns the minimum number of edges, or -1 when unreachable.',
    ref: R`function buildGraph(edges) {
  const graph = {};
  for (const [a, b] of edges) {
    if (!graph[a]) graph[a] = [];
    if (!graph[b]) graph[b] = [];
    graph[a].push(b);
    graph[b].push(a);
  }
  return graph;
}

function shortestPathLength(edges, start, end) {
  if (start === end) return 0;
  const graph = buildGraph(edges);
  const seen = new Set([start]);
  const queue = [[start, 0]];
  while (queue.length) {
    const [node, dist] = queue.shift();
    for (const next of graph[node] || []) {
      if (next === end) return dist + 1;
      if (!seen.has(next)) {
        seen.add(next);
        queue.push([next, dist + 1]);
      }
    }
  }
  return -1;
}

function hasPath(edges, start, end) {
  return shortestPathLength(edges, start, end) !== -1;
}`,
  },
  {
    id: 'event-loop-order', track: 'async-js', title: 'Event Loop: Sync, Microtask, Timeout Order',
    tags: ['event-loop', 'microtask', 'promise', 'basics'], difficulty: 2, concept: 'event-loop',
    cx: ['O(1)', 'O(1)', 'A fixed number of scheduled callbacks and log entries regardless of input.'],
    prompt: "Write orderOfEvents() that returns a Promise resolving to the array of labels in the order they happen. Do, in this order: push 'start' synchronously; schedule setTimeout(..., 0) pushing 'timeout'; schedule Promise.resolve().then(...) pushing 'promise'; push 'end' synchronously; resolve (with the array) once the timeout has fired. Also write asyncOrder(): an async function f(log) pushes 'f1', awaits null, then pushes 'f2'; asyncOrder pushes 'before', calls f, pushes 'after', waits for f to finish and returns the log array.",
    ref: R`function orderOfEvents() {
  const log = [];
  return new Promise((resolve) => {
    log.push('start');
    setTimeout(() => {
      log.push('timeout');
      resolve(log);
    }, 0);
    Promise.resolve().then(() => log.push('promise'));
    log.push('end');
  });
}

async function asyncOrder() {
  const log = [];
  async function f(log) {
    log.push('f1');
    await null;
    log.push('f2');
  }
  log.push('before');
  const p = f(log);
  log.push('after');
  await p;
  return log;
}`,
  },
  {
    id: 'promise-all-by-hand', track: 'async-web-plumbing', title: 'Promise.all By Hand (Counter)',
    tags: ['promise', 'combinators', 'basics'], difficulty: 2, concept: 'promise-combinators',
    cx: ['O(n)', 'O(n)', 'Each input is subscribed to once and the results array holds one slot per input.'],
    prompt: 'Without using Promise.all, write myAll(items) that takes an array of values and/or promises and returns a promise that resolves to an array of the results in the SAME ORDER as the input (not completion order). Use a counter of how many have finished. It rejects as soon as any input rejects (with that reason), and myAll([]) resolves to [].',
    ref: R`function myAll(items) {
  return new Promise((resolve, reject) => {
    const results = new Array(items.length);
    let remaining = items.length;
    if (remaining === 0) {
      resolve(results);
      return;
    }
    items.forEach((item, index) => {
      Promise.resolve(item).then((value) => {
        results[index] = value;
        remaining--;
        if (remaining === 0) resolve(results);
      }, reject);
    });
  });
}`,
  },
  {
    id: 'iterable-range-class', track: 'js-language', title: 'Iterators: Iterable Range Class and take()',
    tags: ['iterator', 'symbol', 'class', 'basics'], difficulty: 1, concept: 'iterators',
    cx: ['O(n)', 'O(1)', 'Iteration yields one value per step using only a counter; take() stops after n items.'],
    prompt: "Write class Range with constructor(start, end, step = 1) that is iterable through [Symbol.iterator]: it yields start, start + step, ... while the value is before end (end is exclusive; a negative step counts down while the value is greater than end). It must be re-iterable (a second loop starts over), and a step of 0 throws a RangeError whose message contains 'step'. Also write take(iterable, n) returning an array of the first n values of any iterable (fewer if it ends sooner) without consuming the rest — it must work on infinite generators.",
    ref: R`class Range {
  constructor(start, end, step = 1) {
    if (step === 0) throw new RangeError('step must not be 0');
    this.start = start;
    this.end = end;
    this.step = step;
  }
  [Symbol.iterator]() {
    let current = this.start;
    const { end, step } = this;
    return {
      next() {
        const inRange = step > 0 ? current < end : current > end;
        if (!inRange) return { value: undefined, done: true };
        const value = current;
        current += step;
        return { value, done: false };
      },
    };
  }
}

function take(iterable, n) {
  const out = [];
  if (n <= 0) return out;
  for (const value of iterable) {
    out.push(value);
    if (out.length >= n) break;
  }
  return out;
}`,
  },
  {
    id: 'compose-middleware', track: 'async-web-plumbing', title: 'Middleware: compose(fns) With next()',
    tags: ['middleware', 'compose', 'async', 'basics'], difficulty: 2, concept: 'middleware',
    cx: ['O(n)', 'O(n)', 'Each middleware runs at most once per call and the chain of pending next() promises is as deep as the number of middleware.'],
    prompt: 'Write compose(fns) where each element is a function (ctx, next) that may be async. compose returns a function run(ctx) that returns a promise: it calls fns[0](ctx, next) where next() runs the following function and returns its promise (after the last function next() resolves immediately). A function that does not call next() stops the chain. Code after `await next()` runs on the way back (onion model). A throw or rejection in any function rejects the promise returned by run. compose([]) resolves immediately.',
    ref: R`function compose(fns) {
  return function run(ctx) {
    const dispatch = (i) => {
      const fn = fns[i];
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(ctx, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    };
    return dispatch(0);
  };
}`,
  },
  {
    id: 'simple-stringify', track: 'js-language', title: 'Serialization: simpleStringify (Primitives and Arrays)',
    tags: ['json', 'serialization', 'recursion', 'basics'], difficulty: 1, concept: 'serialization',
    cx: ['O(n)', 'O(n)', 'Every element and character is visited once, building an output string proportional to the input.'],
    prompt: 'Write simpleStringify(value) that mimics JSON.stringify for primitives and arrays only: null -> "null", booleans -> "true"/"false", finite numbers via String, NaN/Infinity -> "null", strings wrapped in double quotes with \\, " and newline escaped as \\\\, \\" and \\n, arrays as [a,b,c] with no spaces (nested arrays recurse; an undefined element becomes null). A top-level undefined returns undefined. You do not need to handle objects. Do not call JSON.stringify.',
    ref: R`function simpleStringify(value) {
  if (value === undefined) return undefined;
  if (value === null) return 'null';
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'null';
  if (typeof value === 'string') {
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return '"' + escaped + '"';
  }
  if (Array.isArray(value)) {
    const parts = value.map((item) => {
      const s = simpleStringify(item);
      return s === undefined ? 'null' : s;
    });
    return '[' + parts.join(',') + ']';
  }
  return undefined;
}`,
  },
  {
    id: 'ts-identity-first-generics', track: 'typescript-patterns', title: 'TS Generics: identity, first, Box<T>',
    tags: ['typescript', 'generics', 'basics'], difficulty: 1, concept: 'ts-generics',
    cx: ['O(1)', 'O(1)', 'Each function does constant work; the generics only exist at compile time.'],
    prompt: 'Write the generic function identity<T>(value: T): T, first<T>(items: T[]): T | undefined (undefined for an empty array), the generic interface Box<T> { value: T }, makeBox<T>(value: T): Box<T> and mapBox<T, U>(box: Box<T>, fn: (value: T) => U): Box<U>. Use real type parameters (no any) so the compiler infers and checks the result types.',
    ref: R`function identity<T>(value: T): T {
  return value;
}

function first<T>(items: T[]): T | undefined {
  return items[0];
}

interface Box<T> {
  value: T;
}

function makeBox<T>(value: T): Box<T> {
  return { value };
}

function mapBox<T, U>(box: Box<T>, fn: (value: T) => U): Box<U> {
  return { value: fn(box.value) };
}`,
    extra: R`const compileChecksG1 = () => {
  const n: number = identity(5);
  const s: string = identity('a');
  // @ts-expect-error — identity('a') is a string, not a number
  const bad: number = identity('a');
  // @ts-expect-error — first of a number[] is number | undefined, never a string
  const bad2: string = first([1, 2]);
  const box: Box<number> = makeBox(3);
  const mapped: Box<string> = mapBox(box, (v) => String(v));
  // @ts-expect-error — mapping to a string gives Box<string>, not Box<number>
  const bad3: Box<number> = mapBox(box, (v) => String(v));
  return [n, s, bad, bad2, mapped, bad3];
};
$test.check('Compile time: generic results are inferred and checked', typeof compileChecksG1 === 'function');`,
  },
  {
    id: 'ts-narrowing-typeof-in', track: 'typescript-patterns', title: 'TS Unions: Narrowing With typeof and in',
    tags: ['typescript', 'unions', 'narrowing', 'basics'], difficulty: 1, concept: 'ts-unions',
    cx: ['O(1)', 'O(1)', 'Each function performs a constant number of type checks; narrowing is a compile-time feature.'],
    prompt: "Write describe(value: string | number | string[]): string returning 'string:<length>' for a string, 'number:<value with one decimal, via toFixed(1)>' for a number and 'list:<length>' for an array, narrowing with typeof / Array.isArray. Define type Shape = { radius: number } | { width: number; height: number } and write area(shape: Shape): number which uses the `in` operator to narrow: a circle returns Math.PI * radius ** 2 rounded to 2 decimals, a rectangle returns width * height.",
    ref: R`function describe(value: string | number | string[]): string {
  if (typeof value === 'string') return 'string:' + value.length;
  if (typeof value === 'number') return 'number:' + value.toFixed(1);
  return 'list:' + value.length;
}

type Shape = { radius: number } | { width: number; height: number };

function area(shape: Shape): number {
  if ('radius' in shape) {
    return Math.round(Math.PI * shape.radius ** 2 * 100) / 100;
  }
  return shape.width * shape.height;
}`,
    extra: R`const compileChecksU1 = () => {
  // @ts-expect-error — a boolean is not part of the accepted union
  describe(true);
  // @ts-expect-error — a shape needs radius or width and height
  area({ side: 2 });
  // @ts-expect-error — the rectangle variant requires height too
  area({ width: 2 });
};
$test.check('Compile time: values outside the union are rejected', typeof compileChecksU1 === 'function');`,
  },
  {
    id: 'ts-reimplement-utility-types', track: 'typescript-patterns', title: 'TS Types: Rebuild Partial, Readonly, Pick, Record',
    tags: ['typescript', 'mapped-types', 'utility-types', 'basics'], difficulty: 1, concept: 'ts-types',
    cx: ['O(1)', 'O(1)', 'Pure compile-time mapped types; there is no runtime work.'],
    prompt: 'Without using the built-in utility types, define the mapped types MyPartial<T> (every property optional), MyReadonly<T> (every property readonly), MyPick<T, K extends keyof T> (only the keys K) and MyRecord<K extends keyof any, V> (an object with keys K, all of type V). Use `[P in ...]` mapped-type syntax and keyof.',
    ref: R`type MyPartial<T> = { [P in keyof T]?: T[P] };

type MyReadonly<T> = { readonly [P in keyof T]: T[P] };

type MyPick<T, K extends keyof T> = { [P in K]: T[P] };

type MyRecord<K extends keyof any, V> = { [P in K]: V };`,
    extra: R`type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const assertType = <T extends true>(): void => {};

type User = { id: number; name: string };
assertType<Equal<MyPartial<User>, { id?: number; name?: string }>>();
assertType<Equal<MyReadonly<User>, { readonly id: number; readonly name: string }>>();
assertType<Equal<MyPick<User, 'id'>, { id: number }>>();
assertType<Equal<MyRecord<'a' | 'b', number>, { a: number; b: number }>>();

const compileChecksT1 = () => {
  const ro: MyReadonly<User> = { id: 1, name: 'a' };
  // @ts-expect-error — properties of MyReadonly cannot be assigned
  ro.id = 2;
  // @ts-expect-error — name is not part of MyPick<User, 'id'>
  const picked: MyPick<User, 'id'> = { id: 1, name: 'x' };
  return [ro, picked];
};
$test.check('Compile time: the rebuilt utility types have the right shapes', typeof compileChecksT1 === 'function');`,
  },
];

for (const c of cards) {
  fs.writeFileSync(path.join(dir, `${c.id}.meta.json`), JSON.stringify({ track: c.track, title: c.title, tags: c.tags }, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, `${c.id}.prompt.txt`), c.prompt + '\n');
  fs.writeFileSync(path.join(dir, `${c.id}.ref.js`), c.ref + '\n');
  if (c.extra) fs.writeFileSync(path.join(dir, `${c.id}.extra.js`), c.extra + '\n');
  ladder[c.id] = { difficulty: c.difficulty, concept: c.concept };
  cache[c.id] = { targetTime: c.cx[0], targetSpace: c.cx[1], complexityExplanation: c.cx[2] };
}
fs.writeFileSync(diffFile, JSON.stringify(ladder, null, 1) + '\n');
fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
console.log(`wrote ${cards.length} cards`);
