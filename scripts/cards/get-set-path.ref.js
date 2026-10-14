const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function toKeys(path) {
  return path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
}

function get(obj, path, defaultValue) {
  let curr = obj;
  for (const k of toKeys(path)) {
    if (curr == null) return defaultValue;
    curr = curr[k];
  }
  return curr === undefined ? defaultValue : curr;
}

function set(obj, path, value) {
  const keys = toKeys(path);
  if (keys.some((k) => UNSAFE_KEYS.has(k))) throw new Error(`Unsafe path: ${path}`);
  let curr = obj;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) {
      curr[k] = value;
      return;
    }
    if (curr[k] == null || typeof curr[k] !== 'object') {
      curr[k] = /^\d+$/.test(keys[i + 1]) ? [] : {}; // numeric next segment => array
    }
    curr = curr[k];
  });
  return obj;
}
