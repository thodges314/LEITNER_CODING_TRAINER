function mergeRelayConnections(existing, incoming, direction = 'append') {
  if (!incoming) {
    return existing || {
      edges: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
    };
  }

  if (!existing) {
    const edgesCopy = (incoming.edges || []).map((e) => ({
      ...e,
      node: e.node !== null && typeof e.node === 'object' ? { ...e.node } : e.node,
    }));
    return {
      edges: edgesCopy,
      pageInfo: { ...incoming.pageInfo },
      ...(incoming.totalCount !== undefined ? { totalCount: incoming.totalCount } : {}),
    };
  }

  function getEdgeKey(edge) {
    if (edge.node && typeof edge.node === 'object' && 'id' in edge.node) {
      return `id:${edge.node.id}`;
    }
    return `cursor:${edge.cursor}`;
  }

  const incomingKeys = new Set((incoming.edges || []).map(getEdgeKey));
  const filteredExisting = (existing.edges || []).filter((e) => !incomingKeys.has(getEdgeKey(e)));

  const incomingEdges = (incoming.edges || []).map((e) => ({
    ...e,
    node: e.node !== null && typeof e.node === 'object' ? { ...e.node } : e.node,
  }));
  const existingEdges = filteredExisting.map((e) => ({
    ...e,
    node: e.node !== null && typeof e.node === 'object' ? { ...e.node } : e.node,
  }));

  const mergedEdges =
    direction === 'prepend'
      ? [...incomingEdges, ...existingEdges]
      : [...existingEdges, ...incomingEdges];

  const startCursor = mergedEdges.length > 0 ? mergedEdges[0].cursor : null;
  const endCursor = mergedEdges.length > 0 ? mergedEdges[mergedEdges.length - 1].cursor : null;

  const hasNextPage =
    direction === 'prepend'
      ? (existing.pageInfo?.hasNextPage ?? incoming.pageInfo?.hasNextPage ?? false)
      : (incoming.pageInfo?.hasNextPage ?? false);

  const hasPreviousPage =
    direction === 'prepend'
      ? (incoming.pageInfo?.hasPreviousPage ?? false)
      : (existing.pageInfo?.hasPreviousPage ?? incoming.pageInfo?.hasPreviousPage ?? false);

  const result = {
    edges: mergedEdges,
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      startCursor,
      endCursor,
    },
  };

  if (incoming.totalCount !== undefined) {
    result.totalCount = incoming.totalCount;
  } else if (existing.totalCount !== undefined) {
    result.totalCount = existing.totalCount;
  }

  return result;
}

