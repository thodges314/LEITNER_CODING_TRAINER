function matchRoute(pattern, pathname) {
  const pSegs = pattern.split('/').filter(Boolean);
  const uSegs = pathname.split('/').filter(Boolean);
  const params = {};

  let uIdx = 0;
  for (let pIdx = 0; pIdx < pSegs.length; pIdx++) {
    const p = pSegs[pIdx];

    // Optional catch-all: [[...param]]
    const optMatch = p.match(/^\[\[\.\.\.([^\]]+)\]\]$/);
    if (optMatch) {
      const key = optMatch[1];
      params[key] = uSegs.slice(uIdx);
      uIdx = uSegs.length;
      break;
    }

    // Catch-all: [...param]
    const catchMatch = p.match(/^\[\.\.\.([^\]]+)\]$/);
    if (catchMatch) {
      const key = catchMatch[1];
      if (uIdx >= uSegs.length) return null;
      params[key] = uSegs.slice(uIdx);
      uIdx = uSegs.length;
      break;
    }

    // Dynamic param: [param]
    const paramMatch = p.match(/^\[([^\]]+)\]$/);
    if (paramMatch) {
      const key = paramMatch[1];
      if (uIdx >= uSegs.length) return null;
      params[key] = uSegs[uIdx];
      uIdx++;
      continue;
    }

    // Static segment
    if (uIdx >= uSegs.length || p !== uSegs[uIdx]) {
      return null;
    }
    uIdx++;
  }

  if (uIdx !== uSegs.length) {
    return null;
  }

  return { params };
}
