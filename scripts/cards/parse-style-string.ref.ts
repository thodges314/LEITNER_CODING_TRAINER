function parseStyle(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const decl of text.split(';')) {
    const colon = decl.indexOf(':');
    if (colon === -1) continue;
    const name = decl.slice(0, colon).trim();
    const value = decl.slice(colon + 1).trim();
    if (!name || !value) continue;
    out[name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = value;
  }
  return out;
}

function styleToString(obj: Record<string, string | number>): string {
  return Object.entries(obj)
    .map(([name, value]) => `${name.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}: ${value};`)
    .join(' ');
}
