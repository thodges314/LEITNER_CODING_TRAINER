function deepMerge<T extends Record<string, unknown> = Record<string, unknown>>(
  target: unknown,
  ...sources: unknown[]
): T {
  const isPlain = (v: unknown): v is Record<string, unknown> => {
    if (v === null || typeof v !== 'object') return false;
    const proto = Object.getPrototypeOf(v);
    return proto === Object.prototype || proto === null;
  };
  const BLOCKED = new Set(['__proto__', 'constructor', 'prototype']);

  const clone = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(clone);
    if (isPlain(v)) return mergeInto({}, v);
    return v;
  };

  const mergeInto = (out: Record<string, unknown>, src: Record<string, unknown>): Record<string, unknown> => {
    for (const key of Object.keys(src)) {
      if (BLOCKED.has(key)) continue;
      const value = src[key];
      if (value === undefined) continue;
      if (isPlain(value) && Object.prototype.hasOwnProperty.call(out, key) && isPlain(out[key])) {
        mergeInto(out[key] as Record<string, unknown>, value);
      } else {
        out[key] = clone(value);
      }
    }
    return out;
  };

  const result: Record<string, unknown> = {};
  for (const source of [target, ...sources]) {
    if (source !== null && source !== undefined && typeof source === 'object') {
      mergeInto(result, source as Record<string, unknown>);
    }
  }
  return result as T;
}
