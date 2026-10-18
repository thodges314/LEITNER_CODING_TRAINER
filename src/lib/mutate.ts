/**
 * Tiny source-level mutation generator used to check that card harnesses are not too lenient.
 *
 * Every mutant is the reference solution with ONE small, plausible mistake (a flipped comparison, an off-by-one, a
 * dropped `await`, ...). A good harness must FAIL on it. Mutants that still PASS ("survivors") point at behaviour no
 * documented case pins down; a human then adds a hand-written case (this tool never writes test cases).
 */

export interface Mutant {
  op: string;
  /** index of the first replaced character in the original source */
  index: number;
  original: string;
  replacement: string;
  /** full mutated source */
  code: string;
  /** 1-based line number of the mutation */
  line: number;
}

/** Marks which characters are real code (not inside comments, strings, template text or regex literals). */
export function codeMask(src: string): boolean[] {
  const mask: boolean[] = new Array(src.length).fill(true);
  const stack: Array<'tpl' | 'brace'> = [];
  let i = 0;
  const mark = (from: number, to: number) => {
    for (let k = from; k < to && k < src.length; k++) mask[k] = false;
  };
  let lastSignificant = '';
  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];
    const inTemplateText = stack.length > 0 && stack[stack.length - 1] === 'tpl';
    if (inTemplateText) {
      if (ch === '\\') {
        mark(i, i + 2);
        i += 2;
      } else if (ch === '`') {
        mark(i, i + 1);
        stack.pop();
        lastSignificant = '`';
        i++;
      } else if (ch === '$' && next === '{') {
        mark(i, i + 2);
        stack.push('brace');
        i += 2;
        lastSignificant = '{';
      } else {
        mark(i, i + 1);
        i++;
      }
      continue;
    }
    if (ch === '/' && next === '/') {
      const end = src.indexOf('\n', i);
      const stop = end === -1 ? src.length : end;
      mark(i, stop);
      i = stop;
      continue;
    }
    if (ch === '/' && next === '*') {
      const end = src.indexOf('*/', i + 2);
      const stop = end === -1 ? src.length : end + 2;
      mark(i, stop);
      i = stop;
      continue;
    }
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== ch && src[j] !== '\n') j += src[j] === '\\' ? 2 : 1;
      mark(i, j + 1);
      i = j + 1;
      lastSignificant = ch;
      continue;
    }
    if (ch === '`') {
      mark(i, i + 1);
      stack.push('tpl');
      i++;
      continue;
    }
    if (ch === '/' && /[(,=:[!&|?{};]|^$/.test(lastSignificant)) {
      // regex literal (heuristic: a slash where an expression may start)
      let j = i + 1;
      let inClass = false;
      while (j < src.length && src[j] !== '\n') {
        if (src[j] === '\\') j += 2;
        else {
          if (src[j] === '[') inClass = true;
          else if (src[j] === ']') inClass = false;
          else if (src[j] === '/' && !inClass) break;
          j++;
        }
      }
      if (src[j] === '/') {
        j++;
        while (j < src.length && /[a-z]/i.test(src[j])) j++;
        mark(i, j);
        i = j;
        lastSignificant = '/';
        continue;
      }
    }
    if (ch === '{') stack.push('brace');
    if (ch === '}') {
      if (stack.length && stack[stack.length - 1] === 'brace') stack.pop();
    }
    if (!/\s/.test(ch)) lastSignificant = ch;
    i++;
  }
  return mask;
}

function lineOf(src: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i++) if (src[i] === '\n') line++;
  return line;
}

/** index of the `)` matching the `(` at `open` (code characters only), or -1 */
function matchingParen(src: string, mask: boolean[], open: number): number {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (!mask[i]) continue;
    if (src[i] === '(') depth++;
    if (src[i] === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

interface Site {
  op: string;
  index: number;
  length: number;
  replacement: string;
  /** extra insertion (used by `if (cond)` -> `if (!(cond))`) */
  also?: { index: number; length: number; replacement: string };
}

export function mutationSites(src: string): Site[] {
  const mask = codeMask(src);
  const sites: Site[] = [];
  const isCode = (from: number, len: number) => {
    for (let k = from; k < from + len; k++) if (!mask[k]) return false;
    return true;
  };
  const add = (op: string, index: number, length: number, replacement: string, also?: Site['also']) => {
    if (isCode(index, length)) sites.push({ op, index, length, replacement, also });
  };

  const simple: Array<[RegExp, string, string]> = [
    [/===/g, '!==', 'eq-flip'],
    [/!==/g, '===', 'neq-flip'],
    [/(?<![=!<>])==(?!=)/g, '!=', 'loose-eq-flip'],
    [/ <= /g, ' < ', 'le->lt'],
    [/ >= /g, ' > ', 'ge->gt'],
    [/ < /g, ' <= ', 'lt->le'],
    [/ > /g, ' >= ', 'gt->ge'],
    [/&&/g, '||', 'and->or'],
    [/\|\|/g, '&&', 'or->and'],
    [/ \+ /g, ' - ', 'plus->minus'],
    [/ - /g, ' + ', 'minus->plus'],
    [/\+\+/g, '--', 'inc->dec'],
    [/--/g, '++', 'dec->inc'],
    [/\btrue\b/g, 'false', 'true->false'],
    [/\bfalse\b/g, 'true', 'false->true'],
    [/Math\.min\b/g, 'Math.max', 'min->max'],
    [/Math\.max\b/g, 'Math.min', 'max->min'],
    [/\.push\(/g, '.unshift(', 'push->unshift'],
    [/\.shift\(\)/g, '.pop()', 'shift->pop'],
    [/\.length - 1\b/g, '.length', 'length-1'],
    [/\bawait /g, '', 'drop-await'],
    [/\breturn (?=[^;\s])/g, 'return undefined && ', 'return-undefined'],
  ];
  for (const [re, replacement, op] of simple) {
    for (const m of src.matchAll(re)) add(op, m.index!, m[0].length, replacement);
  }

  // small integer literals: 0 -> 1, n -> n + 1 (not part of identifiers, floats, or property names)
  for (const m of src.matchAll(/(?<![\w.$])(\d{1,3})(?![\w.])/g)) {
    const n = Number(m[1]);
    add('int+1', m.index!, m[0].length, String(n + 1));
    if (n > 1) add('int-1', m.index!, m[0].length, String(n - 1));
  }

  // unary negation removal: !x / !(...) -> x / (...)
  for (const m of src.matchAll(/(?<![!=<>])!(?=[\w($[])/g)) add('drop-not', m.index!, 1, '');

  // if (cond) -> if (!(cond))
  for (const m of src.matchAll(/\bif \(/g)) {
    const open = m.index! + 3;
    if (!mask[open]) continue;
    const close = matchingParen(src, mask, open);
    if (close === -1) continue;
    sites.push({ op: 'negate-if', index: open, length: 1, replacement: '(!(', also: { index: close, length: 1, replacement: '))' } });
  }
  return sites;
}

export function generateMutants(src: string): Mutant[] {
  const out: Mutant[] = [];
  const seen = new Set<string>();
  for (const s of mutationSites(src)) {
    let code: string;
    if (s.also) {
      code = src.slice(0, s.index) + s.replacement + src.slice(s.index + s.length, s.also.index) + s.also.replacement + src.slice(s.also.index + s.also.length);
    } else {
      code = src.slice(0, s.index) + s.replacement + src.slice(s.index + s.length);
    }
    if (code === src || seen.has(code)) continue;
    seen.add(code);
    out.push({ op: s.op, index: s.index, original: src.slice(s.index, s.index + s.length), replacement: s.replacement, code, line: lineOf(src, s.index) });
  }
  return out;
}

/** deterministic pseudo-random sample so reports are reproducible */
export function sampleMutants(mutants: Mutant[], max: number, seed: string): Mutant[] {
  if (mutants.length <= max) return mutants;
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rand = () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pool = mutants.slice();
  // Fisher-Yates, then keep one per operator first so every kind of mistake is represented
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const picked: Mutant[] = [];
  const usedOps = new Set<string>();
  for (const m of pool) {
    if (!usedOps.has(m.op)) {
      picked.push(m);
      usedOps.add(m.op);
    }
  }
  for (const m of pool) {
    if (picked.length >= max) break;
    if (!picked.includes(m)) picked.push(m);
  }
  return picked.slice(0, max);
}
