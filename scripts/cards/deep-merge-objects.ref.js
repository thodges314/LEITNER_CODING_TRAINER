function deepMerge(target, ...sources) {
  const isPlain = (v) => {
    if (v === null || typeof v !== 'object') return false;
    const proto = Object.getPrototypeOf(v);
    return proto === Object.prototype || proto === null;
  };
  const BLOCKED = new Set(['__proto__', 'constructor', 'prototype']);

  const clone = (v) => {
    if (Array.isArray(v)) return v.map(clone);
    if (isPlain(v)) return mergeInto({}, v);
    return v;
  };

  const mergeInto = (out, src) => {
    for (const key of Object.keys(src)) {
      if (BLOCKED.has(key)) continue;
      const value = src[key];
      if (value === undefined) continue;
      if (isPlain(value) && Object.prototype.hasOwnProperty.call(out, key) && isPlain(out[key])) {
        mergeInto(out[key], value);
      } else {
        out[key] = clone(value);
      }
    }
    return out;
  };

  const result = {};
  for (const source of [target, ...sources]) {
    if (source !== null && source !== undefined) mergeInto(result, source);
  }
  return result;
}
