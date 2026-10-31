type ParsedQueryValue = string | string[];
type ParsedQuery = Record<string, ParsedQueryValue>;
type QueryInput = Record<string, unknown>;

function decodeSafe(str: string): string {
  try {
    return decodeURIComponent(str.replace(/\+/g, ' '));
  } catch {
    return str;
  }
}

function parseQuery(str: string, sep: string = '&', eq: string = '='): ParsedQuery {
  if (!str || typeof str !== 'string') return {};
  const cleaned = str.startsWith('?') ? str.slice(1) : str;
  if (!cleaned) return {};

  const result: ParsedQuery = {};
  const pairs = cleaned.split(sep);

  for (const pair of pairs) {
    if (!pair) continue;
    const eqIdx = pair.indexOf(eq);
    let rawKey: string;
    let rawVal: string;

    if (eqIdx !== -1) {
      rawKey = pair.slice(0, eqIdx);
      rawVal = pair.slice(eqIdx + eq.length);
    } else {
      rawKey = pair;
      rawVal = '';
    }

    const key = decodeSafe(rawKey);
    const val = decodeSafe(rawVal);

    if (Object.prototype.hasOwnProperty.call(result, key)) {
      const existing = result[key];
      if (Array.isArray(existing)) {
        existing.push(val);
      } else {
        result[key] = [existing as string, val];
      }
    } else {
      result[key] = val;
    }
  }

  return result;
}

function stringifyQuery(obj: QueryInput, sep: string = '&', eq: string = '='): string {
  if (!obj || typeof obj !== 'object') return '';
  const parts: string[] = [];

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val === undefined || val === null || typeof val === 'function') continue;

    const encodedKey = encodeURIComponent(key);

    if (Array.isArray(val)) {
      for (const item of val) {
        if (item === undefined || item === null) continue;
        parts.push(`${encodedKey}${eq}${encodeURIComponent(String(item))}`);
      }
    } else {
      parts.push(`${encodedKey}${eq}${encodeURIComponent(String(val))}`);
    }
  }

  return parts.join(sep);
}
