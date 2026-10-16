function memoizeByObject(fn) {
  const cache = new WeakMap();
  return function (arg, ...rest) {
    const cacheable = arg !== null && (typeof arg === 'object' || typeof arg === 'function');
    if (!cacheable) return fn.call(this, arg, ...rest);
    if (cache.has(arg)) return cache.get(arg);
    const result = fn.call(this, arg, ...rest);
    cache.set(arg, result);
    return result;
  };
}

const ids = new WeakMap();
let nextId = 1;

function idOf(obj) {
  if (!ids.has(obj)) ids.set(obj, nextId++);
  return ids.get(obj);
}
