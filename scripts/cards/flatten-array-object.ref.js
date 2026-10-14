function flatten(arr, depth = Infinity) {
  const out = [];
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) out.push(...flatten(item, depth - 1));
    else out.push(item);
  }
  return out;
}

function flattenObject(obj, prefix = '') {
  const res = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    const isPlainObject = v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);
    if (isPlainObject && Object.keys(v).length > 0) Object.assign(res, flattenObject(v, key));
    else res[key] = v; // primitives, arrays, Dates, null and empty objects are leaves
  }
  return res;
}
