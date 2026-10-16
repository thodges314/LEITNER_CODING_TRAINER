function buildGraph(edges) {
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
}
