function buildAdjacency(n: number, edges: [number, number][]): number[][] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  return adj;
}

function countComponents(n: number, edges: [number, number][]): number {
  const adj = buildAdjacency(n, edges);
  const seen: boolean[] = new Array(n).fill(false);
  let components = 0;
  for (let start = 0; start < n; start++) {
    if (seen[start]) continue;
    components++;
    const stack: number[] = [start];
    seen[start] = true;
    while (stack.length) {
      const v = stack.pop()!;
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

function validPath(n: number, edges: [number, number][], source: number, destination: number): boolean {
  const adj = buildAdjacency(n, edges);
  const seen = new Set<number>([source]);
  const queue: number[] = [source];
  while (queue.length) {
    const v = queue.shift()!;
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

function findCenter(edges: [number, number][]): number {
  const [a, b] = edges[0];
  return edges[1].includes(a) ? a : b;
}
