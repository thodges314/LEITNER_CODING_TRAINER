function flattenVisible(nodes, expandedIds) {
  const rows = [];
  const walk = (list, depth) => {
    for (const node of list) {
      const hasChildren = Array.isArray(node.children) && node.children.length > 0;
      const expanded = hasChildren && expandedIds.has(node.id);
      rows.push({ id: node.id, label: node.label, depth, hasChildren, expanded });
      if (expanded) walk(node.children, depth + 1);
    }
  };
  walk(nodes, 0);
  return rows;
}

function toggleExpanded(expandedIds, id) {
  const next = new Set(expandedIds);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
