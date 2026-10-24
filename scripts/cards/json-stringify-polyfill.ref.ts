const ESCAPES: Record<string, string> = {
  '"': '\\"',
  '\\': '\\\\',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
};

function quote(str: string): string {
  return (
    '"' +
    str.replace(/["\\\u0000-\u001f]/g, (ch) => ESCAPES[ch] || '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) +
    '"'
  );
}

function stringify(value: unknown, seen = new Set<unknown>()): string | undefined {
  let val: unknown = value;
  if (val !== null && typeof val === 'object' && typeof (val as { toJSON?: unknown }).toJSON === 'function') {
    val = ((val as { toJSON: () => unknown }).toJSON)();
  }
  if (val === null) return 'null';
  switch (typeof val) {
    case 'string':
      return quote(val);
    case 'number':
      return Number.isFinite(val) ? String(val) : 'null';
    case 'boolean':
      return String(val);
    case 'undefined':
    case 'function':
    case 'symbol':
      return undefined;
    case 'bigint':
      throw new TypeError('Do not know how to serialize a BigInt');
  }
  if (seen.has(val)) throw new TypeError('Converting circular structure to JSON');
  seen.add(val);
  let out: string;
  if (Array.isArray(val)) {
    out = '[' + (val as unknown[]).map((v) => stringify(v, seen) ?? 'null').join(',') + ']';
  } else {
    const parts: string[] = [];
    const obj = val as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      const s = stringify(obj[key], seen);
      if (s !== undefined) parts.push(quote(key) + ':' + s);
    }
    out = '{' + parts.join(',') + '}';
  }
  seen.delete(val);
  return out;
}
