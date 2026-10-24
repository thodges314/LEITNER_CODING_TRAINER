type DiffChange =
  | { path: string; type: 'removed'; from: unknown }
  | { path: string; type: 'added'; to: unknown }
  | { path: string; type: 'changed'; from: unknown; to: unknown };

function diff(a: Record<string, unknown>, b: Record<string, unknown>): DiffChange[] {
  const has = (obj: object, key: string): boolean => Object.prototype.hasOwnProperty.call(obj, key);
  const isPlain = (v: unknown): v is Record<string, unknown> =>
    v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);

  const equal = (x: unknown, y: unknown): boolean => {
    if (Object.is(x, y)) return true;
    if (x instanceof Date && y instanceof Date) return x.getTime() === y.getTime();
    if (Array.isArray(x) && Array.isArray(y)) {
      return x.length === y.length && x.every((item, i) => equal(item, y[i]));
    }
    if (isPlain(x) && isPlain(y)) {
      const keysX = Object.keys(x);
      return keysX.length === Object.keys(y).length && keysX.every((k) => has(y, k) && equal(x[k], y[k]));
    }
    return false;
  };

  const changes: DiffChange[] = [];
  const walk = (x: Record<string, unknown>, y: Record<string, unknown>, prefix: string): void => {
    for (const key of Object.keys(x)) {
      const path = prefix ? `${prefix}.${key}` : key;
      const xv = x[key];
      const yv = y[key];
      if (!has(y, key)) {
        changes.push({ path, type: 'removed', from: xv });
      } else if (isPlain(xv) && isPlain(yv)) {
        walk(xv, yv, path);
      } else if (!equal(xv, yv)) {
        changes.push({ path, type: 'changed', from: xv, to: yv });
      }
    }
    for (const key of Object.keys(y)) {
      if (!has(x, key)) changes.push({ path: prefix ? `${prefix}.${key}` : key, type: 'added', to: y[key] });
    }
  };

  walk(a, b, '');
  return changes;
}
