interface DOMNode {
  id: string;
  children?: DOMNode[];
  classList?: {
    contains(className: string): boolean;
  };
}

function dfsRecursive(root: DOMNode): DOMNode[] {
  const out: DOMNode[] = [root];
  for (const child of root.children || []) out.push(...dfsRecursive(child));
  return out;
}

function dfsIterative(root: DOMNode): DOMNode[] {
  const out: DOMNode[] = [];
  const stack: DOMNode[] = [root];
  while (stack.length) {
    const node = stack.pop()!;
    out.push(node);
    const children = node.children || [];
    for (let i = children.length - 1; i >= 0; i--) stack.push(children[i]);
  }
  return out;
}

function bfs(root: DOMNode): DOMNode[] {
  const out: DOMNode[] = [];
  const queue: DOMNode[] = [root];
  for (let i = 0; i < queue.length; i++) {
    out.push(queue[i]);
    queue.push(...(queue[i].children || []));
  }
  return out;
}

function getElementsByClassName(root: DOMNode, className: string): DOMNode[] {
  return dfsIterative(root).filter((n) => n.classList && n.classList.contains(className));
}

function findPath(node: DOMNode, id: string, path: string[] = []): string[] | null {
  const here = [...path, node.id];
  if (node.id === id) return here;
  for (const child of node.children || []) {
    const found = findPath(child, id, here);
    if (found) return found;
  }
  return null;
}
