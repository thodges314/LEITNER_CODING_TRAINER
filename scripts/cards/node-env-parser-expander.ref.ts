type EnvDictionary = Record<string, string>;

function parseEnv(src: string, baseEnv: EnvDictionary = {}): EnvDictionary {
  const result: EnvDictionary = {};
  const context: EnvDictionary = { ...baseEnv };

  if (!src || typeof src !== 'string') return result;

  const lines = src.split(/\r?\n/);

  function expand(str: string): string {
    return str.replace(/\$(\{([A-Za-z0-9_]+)(?::-([^}]*))?\}|([A-Za-z0-9_]+))/g, (_, bracketed, varName1, defaultVal, varName2) => {
      const name = (varName1 || varName2) as string;
      const def = defaultVal !== undefined ? (defaultVal as string) : '';
      if (context[name] !== undefined && context[name] !== '') {
        return context[name];
      }
      return def;
    });
  }

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;

    if (line.startsWith('export ')) {
      line = line.slice(7).trim();
    }

    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;

    const rawKey = line.slice(0, eqIdx).trim();
    let rawVal = line.slice(eqIdx + 1).trim();

    if (!rawKey) continue;

    let finalVal = '';
    if (rawVal.startsWith('"') && rawVal.endsWith('"') && rawVal.length >= 2) {
      const inner = rawVal.slice(1, -1)
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
      finalVal = expand(inner);
    } else if (rawVal.startsWith("'") && rawVal.endsWith("'") && rawVal.length >= 2) {
      finalVal = rawVal.slice(1, -1);
    } else {
      const commentIdx = rawVal.indexOf(' #');
      if (commentIdx !== -1) {
        rawVal = rawVal.slice(0, commentIdx).trim();
      }
      finalVal = expand(rawVal);
    }

    result[rawKey] = finalVal;
    context[rawKey] = finalVal;
  }

  return result;
}
