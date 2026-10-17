function getAllDescendantIds(node) {
  const ids = [node.id];
  if (node.children) {
    for (const child of node.children) {
      ids.push(...getAllDescendantIds(child));
    }
  }
  return ids;
}

function findNode(nodes, id) {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findNode(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

function computeNodeStatus(node, checkedSet) {
  if (!node.children || node.children.length === 0) {
    return checkedSet.has(node.id) ? 'checked' : 'unchecked';
  }

  let checkedCount = 0;
  let hasIndeterminate = false;

  for (const child of node.children) {
    const s = computeNodeStatus(child, checkedSet);
    if (s === 'checked') checkedCount++;
    else if (s === 'indeterminate') hasIndeterminate = true;
  }

  if (checkedCount === node.children.length) return 'checked';
  if (checkedCount === 0 && !hasIndeterminate) return 'unchecked';
  return 'indeterminate';
}

function useCheckboxTree(treeData, initialChecked = []) {
  const [checkedIds, setCheckedIds] = React.useState(initialChecked);

  const checkedSet = React.useMemo(() => new Set(checkedIds), [checkedIds]);

  const getStatus = React.useCallback(
    (id) => {
      const node = findNode(treeData, id);
      if (!node) return 'unchecked';
      return computeNodeStatus(node, checkedSet);
    },
    [treeData, checkedSet]
  );

  const toggle = React.useCallback(
    (id) => {
      const target = findNode(treeData, id);
      if (!target) return;

      const currentStatus = computeNodeStatus(target, checkedSet);
      const descendantIds = getAllDescendantIds(target);

      setCheckedIds((prev) => {
        const nextSet = new Set(prev);
        if (currentStatus === 'checked') {
          for (const d of descendantIds) nextSet.delete(d);
        } else {
          for (const d of descendantIds) nextSet.add(d);
        }
        return Array.from(nextSet);
      });
    },
    [treeData, checkedSet]
  );

  return {
    checkedIds,
    getStatus,
    toggle,
  };
}
