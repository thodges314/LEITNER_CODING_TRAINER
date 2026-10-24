interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

type CheckboxStatus = 'checked' | 'unchecked' | 'indeterminate';

function getAllDescendantIds(node: TreeNode): string[] {
  const ids: string[] = [node.id];
  if (node.children) {
    for (const child of node.children) {
      ids.push(...getAllDescendantIds(child));
    }
  }
  return ids;
}

function findNode(nodes: TreeNode[], id: string): TreeNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findNode(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

function computeNodeStatus(node: TreeNode, checkedSet: Set<string>): CheckboxStatus {
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

function useCheckboxTree(
  treeData: TreeNode[],
  initialChecked: string[] = []
): {
  checkedIds: string[];
  getStatus: (id: string) => CheckboxStatus;
  toggle: (id: string) => void;
} {
  const [checkedIds, setCheckedIds] = React.useState<string[]>(initialChecked);

  const checkedSet = React.useMemo(() => new Set<string>(checkedIds), [checkedIds]);

  const getStatus = React.useCallback(
    (id: string): CheckboxStatus => {
      const node = findNode(treeData, id);
      if (!node) return 'unchecked';
      return computeNodeStatus(node, checkedSet);
    },
    [treeData, checkedSet]
  );

  const toggle = React.useCallback(
    (id: string): void => {
      const target = findNode(treeData, id);
      if (!target) return;

      const currentStatus = computeNodeStatus(target, checkedSet);
      const descendantIds = getAllDescendantIds(target);

      setCheckedIds((prev) => {
        const nextSet = new Set<string>(prev);
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
