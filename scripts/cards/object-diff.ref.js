function diff(a, b) {
  const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const isPlain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);

  const equal = (x, y) => {
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

  const changes = [];
  const walk = (x, y, prefix) => {
    for (const key of Object.keys(x)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (!has(y, key)) {
        changes.push({ path, type: 'removed', from: x[key] });
      } else if (isPlain(x[key]) && isPlain(y[key])) {
        walk(x[key], y[key], path);
      } else if (!equal(x[key], y[key])) {
        changes.push({ path, type: 'changed', from: x[key], to: y[key] });
      }
    }
    for (const key of Object.keys(y)) {
      if (!has(x, key)) changes.push({ path: prefix ? `${prefix}.${key}` : key, type: 'added', to: y[key] });
    }
  };

  walk(a, b, '');
  return changes;
}
