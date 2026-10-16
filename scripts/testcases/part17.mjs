import { c } from './part1.mjs';

// Hand-written cases for batch 17: algorithms round 2, part B (weighted graphs, Dijkstra, union-find, LRU).
const G = `const graph = { A: [['B', 4], ['C', 1]], C: [['B', 2], ['D', 5]], B: [['D', 1]] };`;

export default {
  'weighted-graph-basics': [
    c('buildWeightedGraph (undirected) adds both directions', `buildWeightedGraph([['A', 'B', 3], ['B', 'C', 5]])`, "{ A: [['B', 3]], B: [['A', 3], ['C', 5]], C: [['B', 5]] }"),
    c('buildWeightedGraph (directed) only adds forward edges but keys every node', `buildWeightedGraph([['A', 'B', 3], ['A', 'C', 1]], true)`, "{ A: [['B', 3], ['C', 1]], B: [], C: [] }"),
    c('buildWeightedGraph of no edges', `buildWeightedGraph([])`, '{}'),
    c('totalWeight sums the weights', `[totalWeight([['A', 'B', 3], ['B', 'C', 5], ['A', 'C', 1]]), totalWeight([])]`, '[9, 0]'),
    c('cheapestEdge returns the first minimum', `cheapestEdge([['A', 'B', 3], ['B', 'C', 1], ['C', 'D', 1]])`, "['B', 'C', 1]"),
    c('cheapestEdge of nothing', `cheapestEdge([])`, 'undefined'),
    c('pathCost adds the edge weights along a path', `const g = buildWeightedGraph([['A', 'B', 3], ['B', 'C', 5]]);\n[pathCost(g, ['A', 'B', 'C']), pathCost(g, ['C', 'B', 'A']), pathCost(g, ['A'])]`, '[8, 8, 0]'),
    c('pathCost is null when an edge is missing', `const g = buildWeightedGraph([['A', 'B', 3]], true);\n[pathCost(g, ['B', 'A']), pathCost(g, ['A', 'Z'])]`, '[null, null]'),
  ],
  'dijkstra-shortest-path': [
    c('dijkstra finds shortest distances to every node', `${G}\ndijkstra(graph, 'A')`, "{ A: 0, B: 3, C: 1, D: 4 }"),
    c('dijkstra from another source leaves earlier nodes unreachable', `${G}\ndijkstra(graph, 'B')`, "{ A: Infinity, B: 0, C: Infinity, D: 1 }"),
    c('dijkstra on a single node', `dijkstra({}, 'A')`, "{ A: 0 }"),
    c('dijkstra includes nodes that only appear as neighbours', `dijkstra({ A: [['B', 2]] }, 'A')`, "{ A: 0, B: 2 }"),
    c('dijkstra chooses a longer-in-hops but cheaper route', `dijkstra({ S: [['T', 10], ['X', 1]], X: [['Y', 1]], Y: [['T', 1]] }, 'S').T`, '3'),
    c('dijkstra handles zero-weight edges', `dijkstra({ A: [['B', 0]], B: [['C', 0]] }, 'A')`, "{ A: 0, B: 0, C: 0 }"),
    c('shortestPath returns the distance and node list', `${G}\nshortestPath(graph, 'A', 'D')`, "{ distance: 4, path: ['A', 'C', 'B', 'D'] }"),
    c('shortestPath to the source itself', `${G}\nshortestPath(graph, 'A', 'A')`, "{ distance: 0, path: ['A'] }"),
    c('shortestPath is null when unreachable', `${G}\nshortestPath(graph, 'D', 'A')`, 'null'),
  ],
  'union-find-basics': [
    c('Every element starts in its own set', `const uf = new SimpleUnionFind(4);\n[uf.count(), uf.connected(0, 1), uf.find(2)]`, '[4, false, 2]'),
    c('union merges two sets and reports it', `const uf = new SimpleUnionFind(4);\n[uf.union(0, 1), uf.connected(0, 1), uf.count()]`, '[true, true, 3]'),
    c('union of already joined elements returns false', `const uf = new SimpleUnionFind(3);\nuf.union(0, 1);\n[uf.union(1, 0), uf.count()]`, '[false, 2]'),
    c('Connectivity is transitive', `const uf = new SimpleUnionFind(5);\nuf.union(0, 1); uf.union(1, 2); uf.union(3, 4);\n[uf.connected(0, 2), uf.connected(0, 3), uf.connected(3, 4), uf.count()]`, '[true, false, true, 2]'),
    c('countComponents counts connected groups', `[countComponents(5, [[0, 1], [1, 2], [3, 4]]), countComponents(4, []), countComponents(3, [[0, 1], [1, 2], [0, 2]])]`, '[2, 4, 1]'),
    c('countComponents with no nodes', `countComponents(0, [])`, '0'),
  ],
  'union-find-dsu': [
    c('Initial state: own parents and size 1', `const uf = new UnionFind(3);\n[uf.parent, uf.size, uf.count()]`, '[[0, 1, 2], [1, 1, 1], 3]'),
    c('union merges and tracks set sizes', `const uf = new UnionFind(5);\nuf.union(0, 1); uf.union(1, 2);\n[uf.sizeOf(2), uf.sizeOf(4), uf.count(), uf.connected(0, 2)]`, '[3, 1, 3, true]'),
    c('union returns false when already connected', `const uf = new UnionFind(3);\n[uf.union(0, 1), uf.union(1, 0), uf.union(0, 1)]`, '[true, false, false]'),
    c('Union by size attaches the smaller set under the larger', `const uf = new UnionFind(4);\nuf.union(0, 1); uf.union(0, 2);\nuf.union(3, 0);\n[uf.find(3) === uf.find(0), uf.parent[3] === uf.find(0), uf.parent[0]]`, '[true, true, 0]'),
    c('On equal sizes b\'s root goes under a\'s root', `const uf = new UnionFind(2);\nuf.union(0, 1);\n[uf.parent[1], uf.parent[0]]`, '[0, 0]'),
    c('find compresses the path', `const uf = new UnionFind(4);\nuf.union(0, 1); uf.union(2, 3); uf.union(1, 3);\nconst before = uf.parent[3];\nuf.find(3);\n[before, uf.parent[3]]`, '[2, 0]'),
    c('hasCycleUndirected', `[hasCycleUndirected(3, [[0, 1], [1, 2]]), hasCycleUndirected(3, [[0, 1], [1, 2], [2, 0]]), hasCycleUndirected(2, [[0, 1], [1, 0]]), hasCycleUndirected(4, [])]`, '[false, true, true, false]'),
    c('kruskalMST returns the minimum spanning tree weight', `kruskalMST(4, [[0, 1, 4], [1, 2, 2], [0, 2, 3], [2, 3, 1]])`, '6'),
    c('kruskalMST returns -1 for a disconnected graph', `kruskalMST(4, [[0, 1, 1], [2, 3, 1]])`, '-1'),
    c('kruskalMST with a single node and with parallel edges', `[kruskalMST(1, []), kruskalMST(2, [[0, 1, 5], [0, 1, 2]])]`, '[0, 2]'),
  ],
  'lru-doubly-linked-list': [
    c('get returns -1 for missing keys and the value for present ones', `const c1 = new LRUCache(2);\nc1.put(1, 'a');\n[c1.get(1), c1.get(2)]`, "['a', -1]"),
    c('The least recently used key is evicted', `const c1 = new LRUCache(2);\nc1.put(1, 1); c1.put(2, 2);\nc1.put(3, 3);\n[c1.get(1), c1.get(2), c1.get(3)]`, '[-1, 2, 3]'),
    c('get refreshes recency', `const c1 = new LRUCache(2);\nc1.put(1, 1); c1.put(2, 2);\nc1.get(1);\nc1.put(3, 3);\n[c1.get(1), c1.get(2), c1.get(3)]`, '[1, -1, 3]'),
    c('put on an existing key updates the value and recency', `const c1 = new LRUCache(2);\nc1.put(1, 1); c1.put(2, 2);\nc1.put(1, 10);\nc1.put(3, 3);\n[c1.get(1), c1.get(2), c1.get(3)]`, '[10, -1, 3]'),
    c('keys lists most to least recently used', `const c1 = new LRUCache(3);\nc1.put('a', 1); c1.put('b', 2); c1.put('c', 3);\nc1.get('a');\nc1.keys()`, "['a', 'c', 'b']"),
    c('Capacity 1 keeps only the latest key', `const c1 = new LRUCache(1);\nc1.put(1, 1); c1.put(2, 2);\n[c1.get(1), c1.get(2), c1.keys()]`, '[-1, 2, [2]]'),
    c('The classic LeetCode sequence', `const c1 = new LRUCache(2);\nconst out = [];\nc1.put(1, 1); c1.put(2, 2);\nout.push(c1.get(1));\nc1.put(3, 3);\nout.push(c1.get(2));\nc1.put(4, 4);\nout.push(c1.get(1), c1.get(3), c1.get(4));\nout`, '[1, -1, -1, 3, 4]'),
    c('A falsy stored value is still a hit', `const c1 = new LRUCache(2);\nc1.put('z', 0);\n[c1.get('z'), c1.keys()]`, "[0, ['z']]"),
  ],
};
