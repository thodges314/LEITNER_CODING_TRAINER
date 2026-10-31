interface ParsedArgv {
  _: Array<string | number>;
  [key: string]: any;
}

function coerceValue(val: string): any {
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val);
  return val;
}

function parseArgv(args: string[]): ParsedArgv {
  const result: ParsedArgv = { _: [] };
  let i = 0;

  while (i < args.length) {
    const arg = args[i];

    if (arg === '--') {
      for (let j = i + 1; j < args.length; j++) {
        result._.push(coerceValue(args[j]));
      }
      break;
    }

    if (arg.startsWith('--')) {
      const rest = arg.slice(2);
      if (rest.startsWith('no-')) {
        const key = rest.slice(3);
        result[key] = false;
        i++;
      } else if (rest.includes('=')) {
        const eqIdx = rest.indexOf('=');
        const key = rest.slice(0, eqIdx);
        const val = rest.slice(eqIdx + 1);
        result[key] = coerceValue(val);
        i++;
      } else {
        const key = rest;
        const nextArg = args[i + 1];
        if (nextArg !== undefined && !nextArg.startsWith('-')) {
          result[key] = coerceValue(nextArg);
          i += 2;
        } else {
          result[key] = true;
          i++;
        }
      }
    } else if (arg.startsWith('-') && arg.length > 1) {
      const flags = arg.slice(1);
      if (flags.length === 1) {
        const nextArg = args[i + 1];
        if (nextArg !== undefined && !nextArg.startsWith('-')) {
          result[flags] = coerceValue(nextArg);
          i += 2;
        } else {
          result[flags] = true;
          i++;
        }
      } else {
        for (let f = 0; f < flags.length; f++) {
          result[flags[f]] = true;
        }
        i++;
      }
    } else {
      result._.push(coerceValue(arg));
      i++;
    }
  }

  return result;
}
