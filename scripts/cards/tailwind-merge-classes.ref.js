function twMerge(...classLists) {
  const FONT_SIZE_TOKENS = new Set([
    'text-xs',
    'text-sm',
    'text-base',
    'text-lg',
    'text-xl',
    'text-2xl',
    'text-3xl',
    'text-4xl',
    'text-5xl',
    'text-6xl',
    'text-7xl',
    'text-8xl',
    'text-9xl',
  ]);

  const DISPLAY_TOKENS = new Set([
    'block',
    'inline-block',
    'inline',
    'flex',
    'inline-flex',
    'grid',
    'inline-grid',
    'hidden',
  ]);

  function parseInputs(args) {
    const tokens = [];
    for (const arg of args) {
      if (!arg) continue;
      if (typeof arg === 'string') {
        const parts = arg.trim().split(/\s+/).filter(Boolean);
        tokens.push(...parts);
      } else if (Array.isArray(arg)) {
        tokens.push(...parseInputs(arg));
      } else if (typeof arg === 'object') {
        for (const [key, val] of Object.entries(arg)) {
          if (val && typeof key === 'string') {
            const parts = key.trim().split(/\s+/).filter(Boolean);
            tokens.push(...parts);
          }
        }
      }
    }
    return tokens;
  }

  function getConflictKey(token) {
    if (!token) return null;
    const colonIndex = token.lastIndexOf(':');
    const prefix = colonIndex !== -1 ? token.slice(0, colonIndex + 1) : '';
    const base = colonIndex !== -1 ? token.slice(colonIndex + 1) : token;

    if (FONT_SIZE_TOKENS.has(base)) {
      return prefix + 'font-size';
    }
    if (base.startsWith('text-')) {
      return prefix + 'text-color';
    }
    if (DISPLAY_TOKENS.has(base)) {
      return prefix + 'display';
    }

    // Directional paddings & margins
    const directionalPrefixes = [
      'px-', 'py-', 'pt-', 'pr-', 'pb-', 'pl-',
      'mx-', 'my-', 'mt-', 'mr-', 'mb-', 'ml-',
    ];
    for (const dp of directionalPrefixes) {
      if (base.startsWith(dp)) {
        return prefix + dp.slice(0, -1);
      }
    }

    if (base.startsWith('p-')) return prefix + 'p';
    if (base.startsWith('m-')) return prefix + 'm';
    if (base.startsWith('bg-')) return prefix + 'bg';
    if (base.startsWith('w-')) return prefix + 'w';
    if (base.startsWith('h-')) return prefix + 'h';
    if (base === 'rounded' || base.startsWith('rounded-')) return prefix + 'rounded';
    if (base.startsWith('opacity-')) return prefix + 'opacity';

    if (base === 'border' || /^border-(0|2|4|8)$/.test(base)) {
      return prefix + 'border-w';
    }
    if (base.startsWith('border-')) {
      return prefix + 'border-c';
    }

    return null;
  }

  const allTokens = parseInputs(classLists);
  const seen = new Set();
  const surviving = [];

  for (let i = allTokens.length - 1; i >= 0; i--) {
    const token = allTokens[i];
    const key = getConflictKey(token);

    if (key !== null) {
      if (seen.has(key)) continue;
      seen.add(key);
    }
    surviving.unshift(token);
  }

  return surviving.join(' ');
}

