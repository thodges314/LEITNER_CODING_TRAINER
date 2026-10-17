function cloneGraph(node) {
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
}
