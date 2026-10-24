function deepClone<T>(value: T, seen: WeakMap<object, unknown> = new WeakMap()): T {
  if (value === null || typeof value !== 'object') return value;
  const obj = value as object;
  if (seen.has(obj)) return seen.get(obj) as T;
  if (value instanceof Date) return new Date(value.getTime()) as unknown as T;
  if (value instanceof Map) {
    const copy = new Map<unknown, unknown>();
    seen.set(obj, copy);
    value.forEach((v, k) => copy.set(deepClone(k, seen), deepClone(v, seen)));
    return copy as unknown as T;
  }
  if (value instanceof Set) {
    const copy = new Set<unknown>();
    seen.set(obj, copy);
    value.forEach((v) => copy.add(deepClone(v, seen)));
    return copy as unknown as T;
  }
  const copy: Record<string, unknown> | unknown[] = Array.isArray(value) ? [] : {};
  seen.set(obj, copy);
  const source = value as Record<string, unknown>;
  for (const key of Object.keys(source)) {
    (copy as Record<string, unknown>)[key] = deepClone(source[key], seen);
  }
  return copy as T;
}
