function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  const source = value as Record<string, unknown>;
  const copy: Record<string, unknown> | unknown[] = Array.isArray(value) ? [] : {};
  for (const k of Object.keys(source)) (copy as Record<string, unknown>)[k] = deepClone(source[k]);
  return copy as T;
}
