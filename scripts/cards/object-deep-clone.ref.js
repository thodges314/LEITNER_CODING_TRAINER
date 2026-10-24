function deepClone(value) {
  if (value === null || typeof value !== 'object') return value;
  const copy = Array.isArray(value) ? [] : {};
  for (const k of Object.keys(value)) copy[k] = deepClone(value[k]);
  return copy;
}
