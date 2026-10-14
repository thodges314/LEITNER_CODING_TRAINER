function parseStyle(text) {
  const out = {};
  for (const decl of text.split(';')) {
    const colon = decl.indexOf(':');
    if (colon === -1) continue;
    const name = decl.slice(0, colon).trim();
    const value = decl.slice(colon + 1).trim();
    if (!name || !value) continue;
    out[name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
  }
  return out;
}

function styleToString(obj) {
  return Object.entries(obj)
    .map(([name, value]) => `${name.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}: ${value};`)
    .join(' ');
}
