function dfsRecursive(root) {
  const out = [root];
  for (const child of root.children || []) out.push(...dfsRecursive(child));
  return out;
}

function dfsIterative(root) {
  const out = [];
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    out.push(node);
    const children = node.children || [];
    for (let i = children.length - 1; i >= 0; i--) stack.push(children[i]); // reversed so the first child pops first
  }
  return out;
}

function bfs(root) {
  const out = [];
  const queue = [root];
  for (let i = 0; i < queue.length; i++) {
    out.push(queue[i]);
    queue.push(...(queue[i].children || []));
  }
  return out;
}

function getElementsByClassName(root, className) {
  return dfsIterative(root).filter((n) => n.classList && n.classList.contains(className));
}

function findPath(node, id, path = []) {
  const here = [...path, node.id];
  if (node.id === id) return here;
  for (const child of node.children || []) {
    const found = findPath(child, id, here);
    if (found) return found;
  }
  return null;
}
