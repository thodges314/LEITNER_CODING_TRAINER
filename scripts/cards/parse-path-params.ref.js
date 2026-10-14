function parsePath(pattern, path) {
  const clean = (s) => s.split(/[?#]/)[0].split('/').filter(Boolean);
  const patternParts = clean(pattern);
  const parts = clean(path);
  if (patternParts.length !== parts.length) return null;
  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) params[patternParts[i].slice(1)] = parts[i];
    else if (patternParts[i] !== parts[i]) return null;
  }
  return params;
}
