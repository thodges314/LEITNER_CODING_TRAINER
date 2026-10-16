function hasCycle(value) {
  const path = new WeakSet();
  const done = new WeakSet();
  const visit = (node) => {
    if (node === null || typeof node !== 'object') return false;
    if (path.has(node)) return true;
    if (done.has(node)) return false;
    path.add(node);
    for (const key of Object.keys(node)) {
      if (visit(node[key])) return true;
    }
    path.delete(node);
    done.add(node);
    return false;
  };
  return visit(value);
}

function countObjects(root) {
  const seen = new WeakSet();
  let count = 0;
  const visit = (node) => {
    if (node === null || typeof node !== 'object' || seen.has(node)) return;
    seen.add(node);
    count++;
    for (const key of Object.keys(node)) visit(node[key]);
  };
  visit(root);
  return count;
}
