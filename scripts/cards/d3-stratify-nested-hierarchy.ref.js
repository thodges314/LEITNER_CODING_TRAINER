function stratifyHierarchy(data, options = {}) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Input data must be a non-empty array of records');
  }

  const stratify = d3
    .stratify()
    .id((d) => d.id)
    .parentId((d) => (d.parentId === '' ? null : d.parentId));

  const root = stratify(data);

  const valueAccessor =
    options?.valueAccessor || ((d) => Number(d.value) || 0);

  root.sum(valueAccessor);

  const toMetric = (node) => ({
    id: node.id,
    parentId: node.data.parentId ?? null,
    depth: node.depth,
    height: node.height,
    value: node.value ?? 0,
  });

  const leaves = root.leaves().map(toMetric);

  const nodeMap = new Map();
  for (const node of root.descendants()) {
    nodeMap.set(node.id, node);
  }

  const ancestorsOf = (id) => {
    const node = nodeMap.get(id);
    if (!node) return [];
    return node.ancestors().map((n) => n.id);
  };

  const descendantsOf = (id) => {
    const node = nodeMap.get(id);
    if (!node) return [];
    return node.descendants().map((n) => n.id);
  };

  const getNode = (id) => {
    const node = nodeMap.get(id);
    if (!node) return null;
    return toMetric(node);
  };

  return {
    root,
    rootId: root.id,
    totalValue: root.value ?? 0,
    maxDepth: root.height,
    leaves,
    ancestorsOf,
    descendantsOf,
    getNode,
  };
}
