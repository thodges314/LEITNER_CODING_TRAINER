function parseEnv(src = '', baseEnv = {}) {
  const res = {}, ctx = { ...baseEnv };
  const expand = str => str.replace(/\$(\{([A-Za-z0-9_]+)(?::-([^}]*))?\}|([A-Za-z0-9_]+))/g, (_, _b, k1, def = '', k2) => ctx[k1 || k2] || def);
  const unesc = { '\\n': '\n', '\\r': '\r', '\\t': '\t', '\\"': '"', '\\\\': '\\' };

  for (let line of src.split(/\r?\n/)) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('export ')) line = line.slice(7).trim();
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (!key) continue;

    if (val.startsWith('"') && val.endsWith('"')) {
      val = expand(val.slice(1, -1).replace(/\\(\\|n|r|t|")/g, m => unesc[m] || m));
    } else if (val.startsWith("'") && val.endsWith("'")) {
      val = val.slice(1, -1);
    } else {
      const c = val.indexOf(' #');
      if (c !== -1) val = val.slice(0, c).trim();
      val = expand(val);
    }
    res[key] = ctx[key] = val;
  }
  return res;
}
