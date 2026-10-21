function hasCycle(value: unknown): boolean {
  const path = new WeakSet<object>();
  const done = new WeakSet<object>();
  const visit = (node: unknown): boolean => {
    if (node === null || typeof node !== 'object') return false;
    const obj = node as object;
    if (path.has(obj)) return true;
    if (done.has(obj)) return false;
    path.add(obj);
    for (const key of Object.keys(obj)) {
      if (visit((obj as Record<string, unknown>)[key])) return true;
    }
    path.delete(obj);
    done.add(obj);
    return false;
  };
  return visit(value);
}

function countObjects(root: unknown): number {
  const seen = new WeakSet<object>();
  let count = 0;
  const visit = (node: unknown): void => {
    if (node === null || typeof node !== 'object') return;
    const obj = node as object;
    if (seen.has(obj)) return;
    seen.add(obj);
    count++;
    for (const key of Object.keys(obj)) {
      visit((obj as Record<string, unknown>)[key]);
    }
  };
  visit(root);
  return count;
}
