function cloneGraph(node: GraphNode | null): GraphNode | null {
  if (!node) return null;
  const copies = new Map<GraphNode, GraphNode>();
  function copy(original: GraphNode): GraphNode {
    if (copies.has(original)) return copies.get(original)!;
    const clone: GraphNode = { val: original.val, neighbors: [] };
    copies.set(original, clone);
    for (const next of original.neighbors) clone.neighbors.push(copy(next));
    return clone;
  }
  return copy(node);
}

function isBipartite(graph: number[][]): boolean {
  const color: number[] = new Array(graph.length).fill(-1);
  for (let start = 0; start < graph.length; start++) {
    if (color[start] !== -1) continue;
    color[start] = 0;
    const queue: number[] = [start];
    while (queue.length) {
      const v = queue.shift()!;
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

function validTree(n: number, edges: [number, number][]): boolean {
  if (edges.length !== n - 1) return false;
  const parent: number[] = Array.from({ length: n }, (_, i) => i);
  const find = (x: number): number => {
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
}
