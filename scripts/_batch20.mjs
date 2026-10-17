import { writeCards, R } from './_author.mjs';
const LNODE = 'List nodes are { val, next } (null ends the list).';
const HEAP = R`class Heap {
  constructor(compare = (a, b) => a - b) {
    this.items = [];
    this.compare = compare;
  }
  size() {
    return this.items.length;
  }
  peek() {
    return this.items[0];
  }
  push(value) {
    const a = this.items;
    a.push(value);
    let i = a.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.compare(a[i], a[parent]) >= 0) break;
      [a[i], a[parent]] = [a[parent], a[i]];
      i = parent;
    }
  }
  pop() {
    const a = this.items;
    if (!a.length) return undefined;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && this.compare(a[l], a[m]) < 0) m = l;
        if (r < a.length && this.compare(a[r], a[m]) < 0) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top;
  }
}
`;
writeCards([
  { id: 'heap-kth-largest', title: 'Heaps: Kth Largest, Streaming Kth Largest, Last Stone Weight', tags: ['heap', 'priority-queue', 'top-k'],
    difficulty: 2, concept: 'heap',
    cx: ['O(n log k)', 'O(k)', 'A min-heap capped at size k costs O(log k) per element; last stone weight uses a max-heap of all n stones.'],
    prompt: 'There is no built-in heap, so write your own binary heap inside your solution (array-backed, sift up and down, any helper name you like). Write findKthLargest(nums, k): the k-th largest value (duplicates count separately) using a min-heap of size k. Write class KthLargest with constructor(k, nums) and add(val), which inserts a value and returns the current k-th largest. Write lastStoneWeight(stones): repeatedly take the two heaviest stones; equal stones both vanish, otherwise the difference goes back; return the final weight or 0 when none remain.',
    ref: HEAP + R`
function findKthLargest(nums, k) {
  const heap = new Heap();
  for (const n of nums) {
    heap.push(n);
    if (heap.size() > k) heap.pop();
  }
  return heap.peek();
}

class KthLargest {
  constructor(k, nums) {
    this.k = k;
    this.heap = new Heap();
    for (const n of nums) this.add(n);
  }
  add(val) {
    this.heap.push(val);
    if (this.heap.size() > this.k) this.heap.pop();
    return this.heap.peek();
  }
}

function lastStoneWeight(stones) {
  const heap = new Heap((a, b) => b - a);
  for (const s of stones) heap.push(s);
  while (heap.size() > 1) {
    const a = heap.pop();
    const b = heap.pop();
    if (a !== b) heap.push(a - b);
  }
  return heap.size() ? heap.peek() : 0;
}` },
  { id: 'heap-merge-k-lists', title: 'Heaps: Merge K Sorted Lists and Arrays, K Closest Points', tags: ['heap', 'merge', 'k-way'],
    difficulty: 3, concept: 'heap',
    cx: ['O(N log k)', 'O(k)', 'The heap holds one candidate per input (k), and each of the N output items costs one push and pop.'],
    prompt: `Write your own binary heap inside your solution. ${LNODE} Write mergeKLists(lists): merge k sorted linked lists (entries may be null) into one sorted list using a heap of the current heads; return null when everything is empty. Write mergeKSortedArrays(arrays): the same idea for sorted arrays, returning one sorted array (empty arrays allowed). Write kClosest(points, k): the k points [x, y] closest to the origin as a list sorted by distance ascending (equal distances keep input order), using a max-heap capped at size k ([] when k is 0).`,
    ref: HEAP + R`
function mergeKLists(lists) {
  const heap = new Heap((a, b) => a.val - b.val);
  for (const node of lists) if (node) heap.push(node);
  const dummy = { val: 0, next: null };
  let tail = dummy;
  while (heap.size()) {
    const node = heap.pop();
    tail.next = node;
    tail = node;
    if (node.next) heap.push(node.next);
  }
  return dummy.next;
}

function mergeKSortedArrays(arrays) {
  const heap = new Heap((a, b) => a.val - b.val);
  arrays.forEach((arr, row) => {
    if (arr.length) heap.push({ val: arr[0], row, col: 0 });
  });
  const out = [];
  while (heap.size()) {
    const { val, row, col } = heap.pop();
    out.push(val);
    if (col + 1 < arrays[row].length) heap.push({ val: arrays[row][col + 1], row, col: col + 1 });
  }
  return out;
}

function kClosest(points, k) {
  const heap = new Heap((a, b) => b.d - a.d || b.i - a.i);
  points.forEach((p, i) => {
    heap.push({ d: p[0] * p[0] + p[1] * p[1], i, p });
    if (heap.size() > k) heap.pop();
  });
  const kept = [];
  while (heap.size()) kept.push(heap.pop());
  return kept.sort((a, b) => a.d - b.d || a.i - b.i).map((item) => item.p);
}` },
  { id: 'heap-median-stream', title: 'Heaps: Median from a Data Stream and Task Scheduler', tags: ['heap', 'two-heaps', 'median', 'greedy'],
    difficulty: 4, concept: 'heap',
    cx: ['O(log n) per add, O(1) median', 'O(n)', 'Two balanced heaps keep the lower and upper halves; the median is read from their tops.'],
    prompt: 'Write your own binary heap inside your solution. Write class MedianFinder with addNum(num) and findMedian(): the median of all numbers added so far (the mean of the two middle values when the count is even; undefined when empty). Use a max-heap for the lower half and a min-heap for the upper half, keeping their sizes within one. Write leastInterval(tasks, n): given an array of task letters and a cooldown n (the same task needs n other slots between runs), return the minimum number of time slots to finish all tasks, idling when needed.',
    ref: HEAP + R`
class MedianFinder {
  constructor() {
    this.low = new Heap((a, b) => b - a);
    this.high = new Heap();
  }
  addNum(num) {
    this.low.push(num);
    this.high.push(this.low.pop());
    if (this.high.size() > this.low.size()) this.low.push(this.high.pop());
  }
  findMedian() {
    if (!this.low.size()) return undefined;
    if (this.low.size() > this.high.size()) return this.low.peek();
    return (this.low.peek() + this.high.peek()) / 2;
  }
}

function leastInterval(tasks, n) {
  const counts = {};
  for (const t of tasks) counts[t] = (counts[t] || 0) + 1;
  const max = Math.max(0, ...Object.values(counts));
  const withMax = Object.values(counts).filter((c) => c === max).length;
  return Math.max(tasks.length, (max - 1) * (n + 1) + withMax);
}` },
  { id: 'graph-components-paths', title: 'Graphs: Connected Components, Valid Path, Star Center', tags: ['graph', 'bfs', 'dfs', 'adjacency-list'],
    difficulty: 2, concept: 'graphs',
    cx: ['O(V + E)', 'O(V + E)', 'Building the adjacency list and visiting every vertex and edge once.'],
    prompt: 'Graphs here are undirected and given as n vertices (0 to n - 1) plus an edge list like [[0, 1], [1, 2]]. Write countComponents(n, edges): the number of connected components (isolated vertices count). Write validPath(n, edges, source, destination): true when a path exists (a vertex always reaches itself). Write findCenter(edges): the edges form a star graph; return the center vertex (the one in every edge) in O(1).',
    ref: R`function buildAdjacency(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  return adj;
}

function countComponents(n, edges) {
  const adj = buildAdjacency(n, edges);
  const seen = new Array(n).fill(false);
  let components = 0;
  for (let start = 0; start < n; start++) {
    if (seen[start]) continue;
    components++;
    const stack = [start];
    seen[start] = true;
    while (stack.length) {
      const v = stack.pop();
      for (const w of adj[v]) {
        if (!seen[w]) {
          seen[w] = true;
          stack.push(w);
        }
      }
    }
  }
  return components;
}

function validPath(n, edges, source, destination) {
  const adj = buildAdjacency(n, edges);
  const seen = new Set([source]);
  const queue = [source];
  while (queue.length) {
    const v = queue.shift();
    if (v === destination) return true;
    for (const w of adj[v]) {
      if (!seen.has(w)) {
        seen.add(w);
        queue.push(w);
      }
    }
  }
  return false;
}

function findCenter(edges) {
  const [a, b] = edges[0];
  return edges[1].includes(a) ? a : b;
}` },
  { id: 'graph-clone-bipartite', title: 'Graphs: Clone Graph, Bipartite Check, Valid Tree', tags: ['graph', 'bfs', 'union-find', 'coloring'],
    difficulty: 3, concept: 'graphs',
    cx: ['O(V + E)', 'O(V)', 'Each vertex is mapped, colored or unioned once and every edge is examined a constant number of times.'],
    prompt: 'Write cloneGraph(node): deep-copy a connected undirected graph whose nodes are { val, neighbors: [] } (neighbors reference other nodes, so cycles exist) and return the clone of the given node (null stays null); no clone may share a node with the original, neighbor order is preserved. Write isBipartite(graph): graph is an adjacency list (graph[i] lists the neighbors of i, possibly several components); true when the vertices can be 2-colored so every edge joins different colors. Write validTree(n, edges): true when the n vertices (0..n-1) and undirected edges form one tree (connected, no cycles).',
    ref: R`function cloneGraph(node) {
  if (!node) return null;
  const copies = new Map();
  function copy(original) {
    if (copies.has(original)) return copies.get(original);
    const clone = { val: original.val, neighbors: [] };
    copies.set(original, clone);
    for (const next of original.neighbors) clone.neighbors.push(copy(next));
    return clone;
  }
  return copy(node);
}

function isBipartite(graph) {
  const color = new Array(graph.length).fill(-1);
  for (let start = 0; start < graph.length; start++) {
    if (color[start] !== -1) continue;
    color[start] = 0;
    const queue = [start];
    while (queue.length) {
      const v = queue.shift();
      for (const w of graph[v]) {
        if (color[w] === -1) {
          color[w] = 1 - color[v];
          queue.push(w);
        } else if (color[w] === color[v]) {
          return false;
        }
      }
    }
  }
  return true;
}

function validTree(n, edges) {
  if (edges.length !== n - 1) return false;
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  for (const [a, b] of edges) {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) return false;
    parent[ra] = rb;
  }
  return true;
}` },
  { id: 'graph-grid-bfs', title: 'Graphs: Rotting Oranges, Binary Matrix Path, 01 Matrix (Multi-Source BFS)', tags: ['graph', 'bfs', 'grid', 'multi-source'],
    difficulty: 3, concept: 'graphs',
    cx: ['O(r * c)', 'O(r * c)', 'Each cell is enqueued at most once, and each visit checks a constant number of neighbors.'],
    prompt: 'Grids are arrays of rows. Write orangesRotting(grid): cells are 0 empty, 1 fresh, 2 rotten; every minute fresh oranges next to a rotten one (4 directions) rot; return the minutes until none are fresh, 0 if there were none, or -1 if some can never rot (start BFS from all rotten oranges at once). Write shortestPathBinaryMatrix(grid): 0 is open, 1 blocked; moving in 8 directions from the top-left to the bottom-right, return the number of cells on the shortest path or -1 (also -1 if either end is blocked). Write updateMatrix(mat): a 0/1 matrix; return a new matrix where each cell is the distance (4 directions) to the nearest 0.',
    ref: R`function orangesRotting(grid) {
  const rows = grid.length;
  const cols = rows ? grid[0].length : 0;
  const cells = grid.map((row) => [...row]);
  let queue = [];
  let fresh = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells[r][c] === 2) queue.push([r, c]);
      else if (cells[r][c] === 1) fresh++;
    }
  }
  let minutes = 0;
  while (queue.length && fresh > 0) {
    const next = [];
    for (const [r, c] of queue) {
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && cells[nr][nc] === 1) {
          cells[nr][nc] = 2;
          fresh--;
          next.push([nr, nc]);
        }
      }
    }
    queue = next;
    minutes++;
  }
  return fresh === 0 ? minutes : -1;
}

function shortestPathBinaryMatrix(grid) {
  const n = grid.length;
  if (!n || grid[0][0] === 1 || grid[n - 1][n - 1] === 1) return -1;
  const seen = grid.map((row) => row.map(() => false));
  let queue = [[0, 0]];
  seen[0][0] = true;
  let length = 1;
  while (queue.length) {
    const next = [];
    for (const [r, c] of queue) {
      if (r === n - 1 && c === n - 1) return length;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] === 0 && !seen[nr][nc]) {
            seen[nr][nc] = true;
            next.push([nr, nc]);
          }
        }
      }
    }
    queue = next;
    length++;
  }
  return -1;
}

function updateMatrix(mat) {
  const rows = mat.length;
  const cols = rows ? mat[0].length : 0;
  const dist = mat.map((row) => row.map((v) => (v === 0 ? 0 : Infinity)));
  const queue = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) if (mat[r][c] === 0) queue.push([r, c]);
  }
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head];
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && dist[nr][nc] > dist[r][c] + 1) {
        dist[nr][nc] = dist[r][c] + 1;
        queue.push([nr, nc]);
      }
    }
  }
  return dist;
}` },
  { id: 'graph-word-ladder', title: 'Graphs: Word Ladder, Minimum Gene Mutation, Open the Lock', tags: ['graph', 'bfs', 'implicit-graph', 'strings'],
    difficulty: 4, concept: 'graphs',
    cx: ['O(N * L * 26)', 'O(N * L)', 'BFS over implicit graphs: each of N states tries L positions times the alphabet to find its neighbors.'],
    prompt: "These are shortest-path problems on implicit graphs: states are strings and edges change one character. Write ladderLength(beginWord, endWord, wordList): the number of words on the shortest sequence from beginWord to endWord where each step changes one letter (lowercase) and every word after the first must be in wordList; beginWord need not be in the list; return 0 if endWord is not in the list or is unreachable. Write minMutation(start, end, bank): genes are strings over A, C, G, T; each step changes one character and must land in bank; return the fewest steps or -1 (0 when start equals end). Write openLock(deadends, target): a 4-wheel lock starts at '0000'; each move turns one wheel one step (9 wraps to 0 and 0 to 9); states in deadends are forbidden; return the fewest moves to reach target or -1 (-1 also when '0000' is a dead end).",
    ref: R`function ladderLength(beginWord, endWord, wordList) {
  const words = new Set(wordList);
  if (!words.has(endWord)) return 0;
  let queue = [beginWord];
  const seen = new Set([beginWord]);
  let steps = 1;
  while (queue.length) {
    const next = [];
    for (const word of queue) {
      if (word === endWord) return steps;
      for (let i = 0; i < word.length; i++) {
        for (let code = 97; code <= 122; code++) {
          const candidate = word.slice(0, i) + String.fromCharCode(code) + word.slice(i + 1);
          if (words.has(candidate) && !seen.has(candidate)) {
            seen.add(candidate);
            next.push(candidate);
          }
        }
      }
    }
    queue = next;
    steps++;
  }
  return 0;
}

function minMutation(start, end, bank) {
  const valid = new Set(bank);
  if (start === end) return 0;
  if (!valid.has(end)) return -1;
  let queue = [start];
  const seen = new Set([start]);
  let steps = 0;
  while (queue.length) {
    const next = [];
    steps++;
    for (const gene of queue) {
      for (let i = 0; i < gene.length; i++) {
        for (const ch of 'ACGT') {
          const candidate = gene.slice(0, i) + ch + gene.slice(i + 1);
          if (!valid.has(candidate) || seen.has(candidate)) continue;
          if (candidate === end) return steps;
          seen.add(candidate);
          next.push(candidate);
        }
      }
    }
    queue = next;
  }
  return -1;
}

function openLock(deadends, target) {
  const dead = new Set(deadends);
  if (dead.has('0000')) return -1;
  if (target === '0000') return 0;
  let queue = ['0000'];
  const seen = new Set(['0000']);
  let moves = 0;
  while (queue.length) {
    const next = [];
    moves++;
    for (const state of queue) {
      for (let i = 0; i < 4; i++) {
        const digit = Number(state[i]);
        for (const delta of [1, 9]) {
          const candidate = state.slice(0, i) + ((digit + delta) % 10) + state.slice(i + 1);
          if (dead.has(candidate) || seen.has(candidate)) continue;
          if (candidate === target) return moves;
          seen.add(candidate);
          next.push(candidate);
        }
      }
    }
    queue = next;
  }
  return -1;
}` },
]);
