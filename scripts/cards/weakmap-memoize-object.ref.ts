function memoizeByObject<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const cache = new WeakMap<object, R>();
  return function (this: unknown, ...args: A): R {
    const arg = args[0];
    const cacheable = arg !== null && (typeof arg === 'object' || typeof arg === 'function');
    if (!cacheable) return fn.apply(this, args);
    const key = arg as object;
    if (cache.has(key)) return cache.get(key)!;
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const ids = new WeakMap<object, number>();
let nextId = 1;

function idOf(obj: object): number {
  if (!ids.has(obj)) ids.set(obj, nextId++);
  return ids.get(obj)!;
}
