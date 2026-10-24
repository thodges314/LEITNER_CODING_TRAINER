interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

interface VisibleRow {
  id: string;
  label: string;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
}

function flattenVisible(nodes: TreeNode[], expandedIds: Set<string>): VisibleRow[] {
  const rows: VisibleRow[] = [];
  const walk = (list: TreeNode[], depth: number): void => {
    for (const node of list) {
      const hasChildren = Array.isArray(node.children) && node.children.length > 0;
      const expanded = hasChildren && expandedIds.has(node.id);
      rows.push({ id: node.id, label: node.label, depth, hasChildren, expanded });
      if (expanded && node.children) walk(node.children, depth + 1);
    }
  };
  walk(nodes, 0);
  return rows;
}

function toggleExpanded(expandedIds: Set<string>, id: string): Set<string> {
  const next = new Set<string>(expandedIds);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
