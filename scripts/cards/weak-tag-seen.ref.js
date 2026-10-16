const tags = new WeakMap();
const seen = new WeakSet();

function tag(obj, label) {
  tags.set(obj, label);
  return obj;
}

function getTag(obj) {
  return tags.get(obj);
}

function untag(obj) {
  return tags.delete(obj);
}

function markSeen(obj) {
  if (seen.has(obj)) return false;
  seen.add(obj);
  return true;
}
