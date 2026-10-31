function buildRelayConnection(items = [], args = {}) {
  const safeItems = Array.isArray(items) ? items : [];
  let edges = safeItems.map((node, i) => ({ node, cursor: btoa(String(i)) }));
  const { first, after, last, before } = args || {};

  const afterIndex = after ? parseInt(atob(after), 10) : undefined;
  const beforeIndex = before ? parseInt(atob(before), 10) : undefined;

  if (afterIndex !== undefined) edges = edges.filter((e) => parseInt(atob(e.cursor), 10) > afterIndex);
  if (beforeIndex !== undefined) edges = edges.filter((e) => parseInt(atob(e.cursor), 10) < beforeIndex);

  let hasPreviousPage = afterIndex !== undefined && afterIndex >= 0;
  let hasNextPage = beforeIndex !== undefined && beforeIndex < safeItems.length;

  if (first !== undefined) {
    if (first < 0) throw new Error('first must be non-negative');
    if (edges.length > first) { hasNextPage = true; edges = edges.slice(0, first); }
  }
  if (last !== undefined) {
    if (last < 0) throw new Error('last must be non-negative');
    if (edges.length > last) { hasPreviousPage = true; edges = edges.slice(edges.length - last); }
  }

  return {
    edges,
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      startCursor: edges[0]?.cursor ?? null,
      endCursor: edges[edges.length - 1]?.cursor ?? null,
    },
    totalCount: safeItems.length,
  };
}

