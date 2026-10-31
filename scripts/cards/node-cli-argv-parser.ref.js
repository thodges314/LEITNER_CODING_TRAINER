function coerce(val) {
  if (val === 'true') return true;
  if (val === 'false') return false;
  return /^-?\d+(\.\d+)?$/.test(val) ? Number(val) : val;
}

function parseArgv(args) {
  const res = { _: [] };
  for (let i = 0; i < args.length; i++) {
    const a = args[i], next = args[i + 1];
    if (a === '--') {
      res._.push(...args.slice(i + 1).map(coerce));
      break;
    }
    if (a.startsWith('--')) {
      const rest = a.slice(2);
      if (rest.startsWith('no-')) res[rest.slice(3)] = false;
      else if (rest.includes('=')) {
        const [k, v] = rest.split(/=(.*)/s);
        res[k] = coerce(v);
      } else if (next !== undefined && !next.startsWith('-')) {
        res[rest] = coerce(next);
        i++;
      } else res[rest] = true;
    } else if (a.startsWith('-') && a.length > 1) {
      const flags = a.slice(1);
      if (flags.length === 1 && next !== undefined && !next.startsWith('-')) {
        res[flags] = coerce(next);
        i++;
      } else {
        for (const f of flags) res[f] = true;
      }
    } else {
      res._.push(coerce(a));
    }
  }
  return res;
}
