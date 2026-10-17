import { c } from './part1.mjs';

// Hand-written cases for batch 20: heaps and graph search, round 2.
const LL = `const list = (...vals) => vals.reduceRight((next, val) => ({ val, next }), null);
const toArray = (node) => { const out = []; while (node) { out.push(node.val); node = node.next; } return out; };`;
const CLONE = `const mk = (adj) => { const nodes = adj.map((_, i) => ({ val: i + 1, neighbors: [] })); adj.forEach((ns, i) => { nodes[i].neighbors = ns.map((j) => nodes[j]); }); return nodes[0]; };
const dump = (start) => { const seen = new Set([start]); const queue = [start]; const out = []; while (queue.length) { const x = queue.shift(); out.push([x.val, x.neighbors.map((y) => y.val)]); for (const y of x.neighbors) if (!seen.has(y)) { seen.add(y); queue.push(y); } } return out.sort((a, b) => a[0] - b[0]); };`;

export default {
  'heap-kth-largest': [
    c('findKthLargest classic examples', `[findKthLargest([3, 2, 1, 5, 6, 4], 2), findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)]`, '[5, 4]'),
    c('findKthLargest with one element, duplicates and negatives', `[findKthLargest([1], 1), findKthLargest([2, 2, 2], 2), findKthLargest([-1, -5, -3], 3)]`, '[1, 2, -5]'),
    c('findKthLargest does not reorder the input', `const a = [3, 1, 2];\nfindKthLargest(a, 2);\na`, '[3, 1, 2]'),
    c('KthLargest tracks the third largest as values arrive', `const k = new KthLargest(3, [4, 5, 8, 2]);\n[k.add(3), k.add(5), k.add(10), k.add(9), k.add(4)]`, '[4, 5, 5, 8, 8]'),
    c('KthLargest with k = 1 and an empty start', `const k = new KthLargest(1, []);\n[k.add(-3), k.add(-2), k.add(-4)]`, '[-3, -2, -2]'),
    c('lastStoneWeight smashes the two heaviest', `[lastStoneWeight([2, 7, 4, 1, 8, 1]), lastStoneWeight([3, 3, 3])]`, '[1, 3]'),
    c('lastStoneWeight: single stone, equal pair, no stones', `[lastStoneWeight([1]), lastStoneWeight([2, 2]), lastStoneWeight([])]`, '[1, 0, 0]'),
  ],
  'heap-merge-k-lists': [
    c('mergeKLists merges three sorted lists', `${LL}\ntoArray(mergeKLists([list(1, 4, 5), list(1, 3, 4), list(2, 6)]))`, '[1, 1, 2, 3, 4, 4, 5, 6]'),
    c('mergeKLists with empty inputs', `${LL}\n[mergeKLists([]), mergeKLists([null, null])]`, '[null, null]'),
    c('mergeKLists skips null lists among real ones', `${LL}\ntoArray(mergeKLists([list(1), null, list(0)]))`, '[0, 1]'),
    c('mergeKLists of a single list keeps it', `${LL}\ntoArray(mergeKLists([list(1, 2, 3)]))`, '[1, 2, 3]'),
    c('mergeKSortedArrays merges and skips empty arrays', `mergeKSortedArrays([[1, 4, 7], [2, 5], [], [3, 6, 8]])`, '[1, 2, 3, 4, 5, 6, 7, 8]'),
    c('mergeKSortedArrays: nothing to merge and duplicates', `[mergeKSortedArrays([]), mergeKSortedArrays([[], []]), mergeKSortedArrays([[2, 2], [2]])]`, '[[], [], [2, 2, 2]]'),
    c('kClosest returns the closest points sorted by distance', `[kClosest([[1, 3], [-2, 2]], 1), kClosest([[3, 3], [5, -1], [-2, 4]], 2)]`, '[[[-2, 2]], [[3, 3], [-2, 4]]]'),
    c('kClosest with k = 0 and k = n', `[kClosest([[1, 1]], 0), kClosest([[2, 0], [1, 0]], 2)]`, '[[], [[1, 0], [2, 0]]]'),
    c('kClosest keeps input order on equal distances', `kClosest([[1, 0], [0, 1], [0, -1]], 2)`, '[[1, 0], [0, 1]]'),
  ],
  'heap-median-stream': [
    c('MedianFinder after 1, 2, 3', `const m = new MedianFinder();\nm.addNum(1);\nconst a = m.findMedian();\nm.addNum(2);\nconst b = m.findMedian();\nm.addNum(3);\n[a, b, m.findMedian()]`, '[1, 1.5, 2]'),
    c('MedianFinder with an unsorted stream', `const m = new MedianFinder();\nconst out = [];\nfor (const x of [5, 15, 1, 3]) { m.addNum(x); out.push(m.findMedian()); }\nout`, '[5, 10, 5, 4]'),
    c('MedianFinder with descending negatives', `const m = new MedianFinder();\nconst out = [];\nfor (const x of [-1, -2, -3, -4, -5]) { m.addNum(x); out.push(m.findMedian()); }\nout`, '[-1, -1.5, -2, -2.5, -3]'),
    c('MedianFinder is undefined when empty and handles duplicates', `const m = new MedianFinder();\nconst empty = m.findMedian();\nm.addNum(2); m.addNum(2); m.addNum(2);\n[empty, m.findMedian()]`, '[undefined, 2]'),
    c('leastInterval with cooldown idle slots', `[leastInterval(['A', 'A', 'A', 'B', 'B', 'B'], 2), leastInterval(['A', 'A', 'A', 'A', 'A', 'A', 'B', 'C', 'D', 'E', 'F', 'G'], 2)]`, '[8, 16]'),
    c('leastInterval without cooldown or repeats', `[leastInterval(['A', 'A', 'A', 'B', 'B', 'B'], 0), leastInterval(['A', 'B', 'C'], 5), leastInterval([], 3)]`, '[6, 3, 0]'),
  ],
  'graph-components-paths': [
    c('countComponents counts connected groups', `[countComponents(5, [[0, 1], [1, 2], [3, 4]]), countComponents(5, [[0, 1], [1, 2], [2, 3], [3, 4]])]`, '[2, 1]'),
    c('countComponents: isolated vertices and an empty graph', `[countComponents(4, []), countComponents(0, [])]`, '[4, 0]'),
    c('validPath finds a route through a cycle', `validPath(3, [[0, 1], [1, 2], [2, 0]], 0, 2)`, 'true'),
    c('validPath is false across components', `validPath(6, [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], 0, 5)`, 'false'),
    c('validPath from a vertex to itself', `validPath(1, [], 0, 0)`, 'true'),
    c('findCenter returns the shared vertex', `[findCenter([[1, 2], [2, 3], [4, 2]]), findCenter([[1, 2], [5, 1], [1, 3], [1, 4]])]`, '[2, 1]'),
  ],
  'graph-clone-bipartite': [
    c('cloneGraph copies values and neighbor order', `${CLONE}\ndump(cloneGraph(mk([[1, 3], [0, 2], [1, 3], [0, 2]])))`, '[[1, [2, 4]], [2, [1, 3]], [3, [2, 4]], [4, [1, 3]]]'),
    c('cloneGraph returns fresh nodes that point at each other', `${CLONE}\nconst g = mk([[1, 3], [0, 2], [1, 3], [0, 2]]);\nconst copy = cloneGraph(g);\n[copy !== g, copy.neighbors[0].neighbors.includes(copy), copy.neighbors[0].neighbors.includes(g)]`, '[true, true, false]'),
    c('cloneGraph: no node of the clone is shared with the original', `${CLONE}\nconst g = mk([[1], [0, 2], [1]]);\nconst originals = new Set([g, g.neighbors[0], g.neighbors[0].neighbors[1]]);\nconst copy = cloneGraph(g);\n[copy, copy.neighbors[0], copy.neighbors[0].neighbors[1]].some((x) => originals.has(x))`, 'false'),
    c('cloneGraph: null and a lone node', `${CLONE}\n[cloneGraph(null), dump(cloneGraph(mk([[]])))]`, '[null, [[1, []]]]'),
    c('isBipartite accepts an even cycle and rejects an odd-ish dense graph', `[isBipartite([[1, 3], [0, 2], [1, 3], [0, 2]]), isBipartite([[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]])]`, '[true, false]'),
    c('isBipartite checks every component', `[isBipartite([[1], [0], [3, 4], [2, 4], [2, 3]]), isBipartite([[], []]), isBipartite([])]`, '[false, true, true]'),
    c('validTree accepts a tree', `validTree(5, [[0, 1], [0, 2], [0, 3], [1, 4]])`, 'true'),
    c('validTree rejects cycles and disconnected graphs', `[validTree(5, [[0, 1], [1, 2], [2, 3], [1, 3], [1, 4]]), validTree(4, [[0, 1], [2, 3]])]`, '[false, false]'),
    c('validTree: a single vertex', `validTree(1, [])`, 'true'),
  ],
  'graph-grid-bfs': [
    c('orangesRotting classic grids', `[orangesRotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]]), orangesRotting([[2, 1, 1], [0, 1, 1], [1, 0, 1]])]`, '[4, -1]'),
    c('orangesRotting with nothing fresh', `[orangesRotting([[0, 2]]), orangesRotting([[0]]), orangesRotting([[1]])]`, '[0, 0, -1]'),
    c('orangesRotting does not change the input grid', `const g = [[2, 1]];\norangesRotting(g);\ng`, '[[2, 1]]'),
    c('shortestPathBinaryMatrix counts cells on the path', `[shortestPathBinaryMatrix([[0, 1], [1, 0]]), shortestPathBinaryMatrix([[0, 0, 0], [1, 1, 0], [1, 1, 0]])]`, '[2, 4]'),
    c('shortestPathBinaryMatrix with blocked ends and one cell', `[shortestPathBinaryMatrix([[1, 0, 0], [1, 1, 0], [1, 1, 0]]), shortestPathBinaryMatrix([[0, 0], [1, 1]]), shortestPathBinaryMatrix([[0]])]`, '[-1, -1, 1]'),
    c('shortestPathBinaryMatrix routes around a wall', `shortestPathBinaryMatrix([[0, 0, 0], [0, 1, 0], [0, 0, 0]])`, '4'),
    c('updateMatrix finds distance to the nearest zero', `updateMatrix([[0, 0, 0], [0, 1, 0], [1, 1, 1]])`, '[[0, 0, 0], [0, 1, 0], [1, 2, 1]]'),
    c('updateMatrix: all zeros and a single row', `[updateMatrix([[0]]), updateMatrix([[1, 0]]), updateMatrix([[1, 1, 0]])]`, '[[[0]], [[1, 0]], [[2, 1, 0]]]'),
  ],
  'graph-word-ladder': [
    c('ladderLength counts words including both ends', `ladderLength('hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log', 'cog'])`, '5'),
    c('ladderLength is 0 when the end word is missing or unreachable', `[ladderLength('hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log']), ladderLength('hit', 'cog', ['hot', 'dot', 'tog', 'cog'])]`, '[0, 0]'),
    c('ladderLength with a one-letter hop', `[ladderLength('a', 'c', ['a', 'b', 'c']), ladderLength('hot', 'dot', ['dot'])]`, '[2, 2]'),
    c('minMutation single and double steps', `[minMutation('AACCGGTT', 'AACCGGTA', ['AACCGGTA']), minMutation('AACCGGTT', 'AAACGGTA', ['AACCGGTA', 'AACCGCTA', 'AAACGGTA'])]`, '[1, 2]'),
    c('minMutation: end not in bank and identical genes', `[minMutation('AACCGGTT', 'AACCGGTA', []), minMutation('AACCGGTT', 'AACCGGTT', [])]`, '[-1, 0]'),
    c('openLock avoids dead ends', `openLock(['0201', '0101', '0102', '1212', '2002'], '0202')`, '6'),
    c('openLock: one wheel wrap-around and impossible cases', `[openLock(['8888'], '0009'), openLock(['8887', '8889', '8878', '8898', '8788', '8988', '7888', '9888'], '8888'), openLock(['0000'], '8888'), openLock([], '0000')]`, '[1, -1, -1, 0]'),
  ],
};
