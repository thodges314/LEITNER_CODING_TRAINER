function parseCookies(header) {
  const out = {};
  for (const segment of String(header ?? '').split(';')) {
    const eq = segment.indexOf('=');
    if (eq === -1) continue;
    const name = segment.slice(0, eq).trim();
    if (!name || Object.prototype.hasOwnProperty.call(out, name)) continue;
    const raw = segment.slice(eq + 1).trim();
    try {
      out[name] = decodeURIComponent(raw);
    } catch {
      out[name] = raw;
    }
  }
  return out;
}

function serializeCookie(name, value, options = {}) {
  if (!name || /[=;,\s]/.test(name)) throw new TypeError('Invalid cookie name');
  let text = name + '=' + encodeURIComponent(value);
  if (options.maxAge !== undefined) text += '; Max-Age=' + Math.floor(options.maxAge);
  if (options.expires) text += '; Expires=' + options.expires.toUTCString();
  if (options.domain) text += '; Domain=' + options.domain;
  if (options.path) text += '; Path=' + options.path;
  if (options.secure) text += '; Secure';
  if (options.httpOnly) text += '; HttpOnly';
  if (options.sameSite !== undefined) {
    const same = String(options.sameSite).toLowerCase();
    if (same !== 'strict' && same !== 'lax' && same !== 'none') throw new TypeError('Invalid SameSite value');
    text += '; SameSite=' + same.charAt(0).toUpperCase() + same.slice(1);
  }
  return text;
}
