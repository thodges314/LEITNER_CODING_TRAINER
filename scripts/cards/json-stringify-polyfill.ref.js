const ESCAPES = { '"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t' };

function quote(str) {
  return (
    '"' +
    str.replace(/["\\\u0000-\u001f]/g, (ch) => ESCAPES[ch] || '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) +
    '"'
  );
}

function stringify(value, seen = new Set()) {
  if (value !== null && typeof value === 'object' && typeof value.toJSON === 'function') value = value.toJSON();
  if (value === null) return 'null';
  switch (typeof value) {
    case 'string':
      return quote(value);
    case 'number':
      return Number.isFinite(value) ? String(value) : 'null';
    case 'boolean':
      return String(value);
    case 'undefined':
    case 'function':
    case 'symbol':
      return undefined;
    case 'bigint':
      throw new TypeError('Do not know how to serialize a BigInt');
  }
  if (seen.has(value)) throw new TypeError('Converting circular structure to JSON');
  seen.add(value);
  let out;
  if (Array.isArray(value)) {
    out = '[' + value.map((v) => stringify(v, seen) ?? 'null').join(',') + ']';
  } else {
    const parts = [];
    for (const key of Object.keys(value)) {
      const s = stringify(value[key], seen);
      if (s !== undefined) parts.push(quote(key) + ':' + s);
    }
    out = '{' + parts.join(',') + '}';
  }
  seen.delete(value);
  return out;
}
