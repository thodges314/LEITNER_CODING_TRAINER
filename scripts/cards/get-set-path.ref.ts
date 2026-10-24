const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function toKeys(path: string): string[] {
  return path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
}

function get<T = unknown>(obj: unknown, path: string, defaultValue?: T): T {
  let curr: unknown = obj;
  for (const k of toKeys(path)) {
    if (curr == null || typeof curr !== 'object') return defaultValue as T;
    curr = (curr as Record<string, unknown>)[k];
  }
  return curr === undefined ? (defaultValue as T) : (curr as T);
}

function set<T extends object = Record<string, unknown>>(obj: T, path: string, value: unknown): T {
  const keys = toKeys(path);
  if (keys.some((k) => UNSAFE_KEYS.has(k))) throw new Error(`Unsafe path: ${path}`);
  let curr: Record<string, unknown> = obj as Record<string, unknown>;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) {
      curr[k] = value;
      return;
    }
    if (curr[k] == null || typeof curr[k] !== 'object') {
      curr[k] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    }
    curr = curr[k] as Record<string, unknown>;
  });
  return obj;
}
