function parseQuery(query) {
  const out = {};
  const str = query.startsWith('?') ? query.slice(1) : query;
  for (const pair of str.split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    const rawKey = eq === -1 ? pair : pair.slice(0, eq);
    const rawValue = eq === -1 ? '' : pair.slice(eq + 1);
    const key = decodeURIComponent(rawKey.replace(/\+/g, ' '));
    const value = decodeURIComponent(rawValue.replace(/\+/g, ' '));
    if (Object.prototype.hasOwnProperty.call(out, key)) out[key] = [].concat(out[key], value);
    else out[key] = value;
  }
  return out;
}

function stringifyQuery(params) {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    for (const v of Array.isArray(value) ? value : [value]) {
      if (v === undefined || v === null) continue;
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
    }
  }
  return parts.join('&');
}
