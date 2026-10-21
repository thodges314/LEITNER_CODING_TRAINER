const tags = new WeakMap<object, any>();
const seen = new WeakSet<object>();

function tag<T extends object>(obj: T, label: any): T {
  tags.set(obj, label);
  return obj;
}

function getTag(obj: object): any {
  return tags.get(obj);
}

function untag(obj: object): boolean {
  return tags.delete(obj);
}

function markSeen(obj: object): boolean {
  if (seen.has(obj)) return false;
  seen.add(obj);
  return true;
}
