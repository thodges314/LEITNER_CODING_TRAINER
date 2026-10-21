function buildGraph<T extends string | number>(edges: [T, T][]): Record<T, T[]> {
  const graph = {} as Record<T, T[]>;
  for (const [a, b] of edges) {
    if (!graph[a]) graph[a] = [];
    if (!graph[b]) graph[b] = [];
    graph[a].push(b);
    graph[b].push(a);
  }
  return graph;
}

function shortestPathLength<T extends string | number>(edges: [T, T][], start: T, end: T): number {
  if (start === end) return 0;
  const graph = buildGraph(edges);
  const seen = new Set<T>([start]);
  const queue: [T, number][] = [[start, 0]];
  while (queue.length) {
    const [node, dist] = queue.shift()!;
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

function hasPath<T extends string | number>(edges: [T, T][], start: T, end: T): boolean {
  return shortestPathLength(edges, start, end) !== -1;
}
