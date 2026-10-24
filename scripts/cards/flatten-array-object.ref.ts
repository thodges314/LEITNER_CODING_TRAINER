function flatten<T>(arr: unknown[], depth: number = Infinity): T[] {
  const out: unknown[] = [];
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) out.push(...flatten<unknown>(item, depth - 1));
    else out.push(item);
  }
  return out as T[];
}

function flattenObject(obj: Record<string, unknown>, prefix: string = ''): Record<string, unknown> {
  const res: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    const isPlainObject = v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);
    if (isPlainObject && Object.keys(v as object).length > 0) Object.assign(res, flattenObject(v as Record<string, unknown>, key));
    else res[key] = v; // primitives, arrays, Dates, null and empty objects are leaves
  }
  return res;
}
