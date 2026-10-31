const decodeSafe = (s) => {
  try { return decodeURIComponent(s.replace(/\+/g, ' ')); } catch { return s; }
};

function parseQuery(str = '', sep = '&', eq = '=') {
  const q = str.startsWith('?') ? str.slice(1) : str;
  if (!q) return {};
  const res = {};
  for (const pair of q.split(sep)) {
    if (!pair) continue;
    const idx = pair.indexOf(eq);
    const k = decodeSafe(idx === -1 ? pair : pair.slice(0, idx));
    const v = decodeSafe(idx === -1 ? '' : pair.slice(idx + eq.length));
    res[k] = k in res ? (Array.isArray(res[k]) ? [...res[k], v] : [res[k], v]) : v;
  }
  return res;
}

function stringifyQuery(obj = {}, sep = '&', eq = '=') {
  if (!obj || typeof obj !== 'object') return '';
  const parts = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v == null || typeof v === 'function') continue;
    const key = encodeURIComponent(k);
    const arr = Array.isArray(v) ? v : [v];
    arr.forEach((item) => item != null && parts.push(`${key}${eq}${encodeURIComponent(String(item))}`));
  }
  return parts.join(sep);
}

