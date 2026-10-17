function buildAdjacency(n, edges) {
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
}
