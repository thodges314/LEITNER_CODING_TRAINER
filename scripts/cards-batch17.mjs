// One-off: writes the hand-authored batch-17 "Algorithms round 2, part B" cards (weighted graphs, Dijkstra,
// union-find, LRU with a doubly linked list) into scripts/cards/, scripts/difficulty.json and
// scripts/complexity-cache.json. Cases are in scripts/testcases/part17.mjs. Run: node scripts/cards-batch17.mjs
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
    id: 'weighted-graph-basics', title: 'Weighted Graph Basics: Adjacency List, Total Weight, Path Cost', tags: ['graph', 'weighted', 'adjacency-list', 'basics'],
    difficulty: 2, concept: 'weighted-graphs',
    cx: ['O(E)', 'O(V + E)', 'Each edge is processed once to build or sum the graph, and the adjacency list stores every edge.'],
    prompt: "A weighted graph is given as an array of [from, to, weight] edges. Write buildWeightedGraph(edges, directed = false) returning an object that maps each node to an array of [neighbour, weight] pairs in edge order (undirected edges are added in both directions; every node that appears gets a key, even if it has no outgoing edges). Write totalWeight(edges) (sum of all weights, 0 for none), cheapestEdge(edges) (the first edge with the smallest weight, or undefined) and pathCost(graph, path): the sum of the edge weights along the node list path (using the first matching edge for each step), 0 for a single node, or null if any step has no edge.",
    ref: R`function buildWeightedGraph(edges, directed = false) {
  const graph = {};
  for (const [a, b, w] of edges) {
    if (!graph[a]) graph[a] = [];
    if (!graph[b]) graph[b] = [];
    graph[a].push([b, w]);
    if (!directed) graph[b].push([a, w]);
  }
  return graph;
}

function totalWeight(edges) {
  let sum = 0;
  for (const edge of edges) sum += edge[2];
  return sum;
}

function cheapestEdge(edges) {
  let best;
  for (const edge of edges) {
    if (!best || edge[2] < best[2]) best = edge;
  }
  return best;
}

function pathCost(graph, path) {
  let cost = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const hop = (graph[path[i]] || []).find(([node]) => node === path[i + 1]);
    if (!hop) return null;
    cost += hop[1];
  }
  return cost;
}`,
  },
  {
    id: 'dijkstra-shortest-path', title: "Dijkstra's Shortest Path on a Weighted Adjacency List", tags: ['graph', 'dijkstra', 'shortest-path', 'priority-queue'],
    difficulty: 3, concept: 'weighted-graphs',
    cx: ['O((V + E) log V)', 'O(V + E)', 'Each edge relaxation may push to a priority queue (log V); a simple linear-scan queue makes it O(V²) with the same O(V) distance storage.'],
    prompt: "A graph is an object mapping each node to an array of [neighbour, weight] pairs with non-negative weights, e.g. { A: [['B', 4], ['C', 1]], C: [['B', 2]], B: [] }; nodes that only appear as neighbours may have no key. Write dijkstra(graph, source) returning an object with the shortest distance from source to EVERY node that appears in the graph (as a key or a neighbour), using Infinity for unreachable nodes. Write shortestPath(graph, source, target) returning { distance, path } with the node list from source to target, or null when target is unreachable. A min-heap or a simple 'pick the closest unvisited node' loop are both accepted.",
    ref: R`function dijkstra(graph, source) {
  const nodes = new Set([source]);
  for (const [node, edges] of Object.entries(graph)) {
    nodes.add(node);
    for (const [next] of edges) nodes.add(next);
  }
  const dist = {};
  for (const node of nodes) dist[node] = Infinity;
  dist[source] = 0;
  const visited = new Set();
  while (true) {
    let current = null;
    for (const node of nodes) {
      if (!visited.has(node) && (current === null || dist[node] < dist[current])) current = node;
    }
    if (current === null || dist[current] === Infinity) break;
    visited.add(current);
    for (const [next, weight] of graph[current] || []) {
      if (dist[current] + weight < dist[next]) dist[next] = dist[current] + weight;
    }
  }
  return dist;
}

function shortestPath(graph, source, target) {
  const dist = { [source]: 0 };
  const prev = {};
  const visited = new Set();
  const queue = [source];
  while (queue.length) {
    let bestIndex = 0;
    for (let i = 1; i < queue.length; i++) {
      if (dist[queue[i]] < dist[queue[bestIndex]]) bestIndex = i;
    }
    const current = queue.splice(bestIndex, 1)[0];
    if (visited.has(current)) continue;
    visited.add(current);
    if (current === target) break;
    for (const [next, weight] of graph[current] || []) {
      const candidate = dist[current] + weight;
      if (dist[next] === undefined || candidate < dist[next]) {
        dist[next] = candidate;
        prev[next] = current;
        queue.push(next);
      }
    }
  }
  if (dist[target] === undefined) return null;
  const path = [];
  for (let node = target; node !== undefined; node = prev[node]) path.unshift(node);
  return { distance: dist[target], path };
}`,
  },
  {
    id: 'union-find-basics', title: 'Union-Find Basics: Simple Disjoint Sets and Connected Components', tags: ['union-find', 'disjoint-set', 'graph', 'basics'],
    difficulty: 2, concept: 'union-find',
    cx: ['O(n) per find worst case', 'O(n)', 'Without compression a find may walk a long chain, and the parent array stores one entry per element.'],
    prompt: "Write class SimpleUnionFind(n) for elements 0..n-1: find(x) follows parent links in a loop until it reaches a root (each element starts as its own root); union(a, b) joins the two sets and returns true, or false if they were already in the same set; connected(a, b) is true when both share a root; count() returns the number of separate sets (n at the start). Also write countComponents(n, edges) for an undirected graph of n nodes and [a, b] edges using SimpleUnionFind.",
    ref: R`class SimpleUnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.sets = n;
  }
  find(x) {
    while (this.parent[x] !== x) x = this.parent[x];
    return x;
  }
  union(a, b) {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA === rootB) return false;
    this.parent[rootB] = rootA;
    this.sets--;
    return true;
  }
  connected(a, b) {
    return this.find(a) === this.find(b);
  }
  count() {
    return this.sets;
  }
}

function countComponents(n, edges) {
  const uf = new SimpleUnionFind(n);
  for (const [a, b] of edges) uf.union(a, b);
  return uf.count();
}`,
  },
  {
    id: 'union-find-dsu', title: 'Disjoint Set Union: Path Compression, Union by Size, Kruskal', tags: ['union-find', 'disjoint-set', 'path-compression', 'kruskal'],
    difficulty: 3, concept: 'union-find',
    cx: ['O(α(n)) per op / O(E log E) for Kruskal', 'O(n)', 'Path compression with union by size makes each operation nearly constant (inverse Ackermann); Kruskal is dominated by sorting the edges.'],
    prompt: "Write class UnionFind(n) with public arrays this.parent and this.size (parent[i] = i and size[i] = 1 at the start). find(x) must use PATH COMPRESSION (after find, every node on the walked path points directly at the root). union(a, b) joins by SIZE: the root of the smaller set goes under the root of the larger one, and on a tie b's root goes under a's root; it returns true if a merge happened, false if already joined. Also connected(a, b), count() (number of sets) and sizeOf(x) (size of x's set). Write hasCycleUndirected(n, edges) (edges are [a, b]) and kruskalMST(n, edges): edges are [a, b, weight]; return the total weight of a minimum spanning tree, or -1 if the graph is not connected.",
    ref: R`class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array(n).fill(1);
    this.sets = n;
  }
  find(x) {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(a, b) {
    let rootA = this.find(a);
    let rootB = this.find(b);
    if (rootA === rootB) return false;
    if (this.size[rootA] < this.size[rootB]) [rootA, rootB] = [rootB, rootA];
    this.parent[rootB] = rootA;
    this.size[rootA] += this.size[rootB];
    this.sets--;
    return true;
  }
  connected(a, b) {
    return this.find(a) === this.find(b);
  }
  count() {
    return this.sets;
  }
  sizeOf(x) {
    return this.size[this.find(x)];
  }
}

function hasCycleUndirected(n, edges) {
  const uf = new UnionFind(n);
  for (const [a, b] of edges) {
    if (!uf.union(a, b)) return true;
  }
  return false;
}

function kruskalMST(n, edges) {
  const uf = new UnionFind(n);
  const sorted = edges.slice().sort((x, y) => x[2] - y[2]);
  let total = 0;
  for (const [a, b, w] of sorted) {
    if (uf.union(a, b)) total += w;
  }
  return uf.count() === 1 ? total : -1;
}`,
  },
  {
    id: 'lru-doubly-linked-list', title: 'LRU Cache With a Doubly Linked List and Map', tags: ['lru', 'linked-list', 'hash-map', 'design'],
    difficulty: 4, concept: 'lru',
    cx: ['O(1) per get/put', 'O(capacity)', 'A Map finds nodes in constant time and the doubly linked list moves or removes them in constant time; at most capacity nodes are stored.'],
    prompt: "Implement class LRUCache(capacity) with get(key) (the value, or -1 when missing; a hit makes the key most recently used) and put(key, value) (insert or update; the key becomes most recently used; when the cache is over capacity evict the LEAST recently used key). Both must be O(1): use a Map from key to node plus your own doubly linked list (nodes with prev/next and head/tail sentinels), not array searching and not Map insertion-order tricks. Also provide keys() returning the keys from most to least recently used.",
    ref: R`class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = { key: null, value: null, prev: null, next: null };
    this.tail = { key: null, value: null, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  _addFront(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }
  get(key) {
    const node = this.map.get(key);
    if (!node) return -1;
    this._remove(node);
    this._addFront(node);
    return node.value;
  }
  put(key, value) {
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      this._remove(existing);
      this._addFront(existing);
      return;
    }
    const node = { key, value, prev: null, next: null };
    this.map.set(key, node);
    this._addFront(node);
    if (this.map.size > this.capacity) {
      const lru = this.tail.prev;
      this._remove(lru);
      this.map.delete(lru.key);
    }
  }
  keys() {
    const out = [];
    for (let node = this.head.next; node !== this.tail; node = node.next) out.push(node.key);
    return out;
  }
}`,
  },
];

for (const c of cards) {
  fs.writeFileSync(path.join(dir, `${c.id}.meta.json`), JSON.stringify({ track: 'algorithms', title: c.title, tags: c.tags }, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, `${c.id}.prompt.txt`), c.prompt + '\n');
  fs.writeFileSync(path.join(dir, `${c.id}.ref.js`), c.ref + '\n');
  ladder[c.id] = { difficulty: c.difficulty, concept: c.concept };
  cache[c.id] = { targetTime: c.cx[0], targetSpace: c.cx[1], complexityExplanation: c.cx[2] };
}
fs.writeFileSync(diffFile, JSON.stringify(ladder, null, 1) + '\n');
fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
console.log(`wrote ${cards.length} cards`);
