function decodeSafe(str) {
  try {
    return decodeURIComponent(str.replace(/\+/g, ' '));
  } catch {
    return str;
  }
}

function parseQuery(str, sep = '&', eq = '=') {
  if (!str || typeof str !== 'string') return {};
  const cleaned = str.startsWith('?') ? str.slice(1) : str;
  if (!cleaned) return {};

  const result = {};
  const pairs = cleaned.split(sep);

  for (const pair of pairs) {
    if (!pair) continue;
    const eqIdx = pair.indexOf(eq);
    let rawKey;
    let rawVal;

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
      if (Array.isArray(result[key])) {
        result[key].push(val);
      } else {
        result[key] = [result[key], val];
      }
    } else {
      result[key] = val;
    }
  }

  return result;
}

function stringifyQuery(obj, sep = '&', eq = '=') {
  if (!obj || typeof obj !== 'object') return '';
  const parts = [];

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
