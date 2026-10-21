import type { TestCaseItem } from './leitner';

/**
 * Derives a human-readable test contract (input / expected) from a card's test harness.
 * Understands assertions of the form
 *   console.log('label:', <condition> ? 'PASS' : 'FAIL', ...)
 * and `console.error('... FAIL (Expected ...)')` guards. Parsing is bracket- and
 * string-aware so nested calls are not truncated.
 */

type Quote = "'" | '"' | '`';

/** Index just past the end of a string literal starting at `start`. */
function skipString(src: string, start: number): number {
  const quote = src[start] as Quote;
  let i = start + 1;
  while (i < src.length) {
    if (src[i] === '\\') i += 2;
    else if (src[i] === quote) return i + 1;
    else i++;
  }
  return src.length;
}

/** Index of the bracket matching the opener at `open`, or -1. */
function findClosing(src: string, open: number): number {
  const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
  const stack: string[] = [];
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (ch === "'" || ch === '"' || ch === '`') {
      i = skipString(src, i) - 1;
    } else if (pairs[ch]) {
      stack.push(pairs[ch]);
    } else if (ch === ')' || ch === ']' || ch === '}') {
      if (stack.pop() !== ch) return -1;
      if (stack.length === 0) return i;
    }
  }
  return -1;
}

/** Splits on a top-level separator (outside strings and brackets). */
function splitTopLevel(src: string, sep: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let last = 0;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === "'" || ch === '"' || ch === '`') {
      i = skipString(src, i) - 1;
    } else if (ch === '(' || ch === '[' || ch === '{') {
      depth++;
    } else if (ch === ')' || ch === ']' || ch === '}') {
      depth--;
    } else if (depth === 0 && src.startsWith(sep, i)) {
      parts.push(src.slice(last, i));
      last = i + sep.length;
      i += sep.length - 1;
    }
  }
  parts.push(src.slice(last));
  return parts.map((p) => p.trim());
}

/** Finds the first top-level occurrence of any operator, returning its index and text. */
function findTopLevelOperator(src: string, ops: string[]): { index: number; op: string } | null {
  let depth = 0;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === "'" || ch === '"' || ch === '`') {
      i = skipString(src, i) - 1;
    } else if (ch === '(' || ch === '[' || ch === '{') {
      depth++;
    } else if (ch === ')' || ch === ']' || ch === '}') {
      depth--;
    } else if (depth === 0) {
      for (const op of ops) {
        if (src.startsWith(op, i)) return { index: i, op };
      }
    }
  }
  return null;
}

function unquote(s: string): string {
  const t = s.trim();
  if (t.length >= 2 && ["'", '"', '`'].includes(t[0]) && t[t.length - 1] === t[0]) return t.slice(1, -1);
  return t;
}

function unwrapStringify(s: string): string {
  const t = s.trim();
  if (t.startsWith('JSON.stringify(') && findClosing(t, 'JSON.stringify'.length) === t.length - 1) {
    return splitTopLevel(t.slice('JSON.stringify('.length, -1), ',')[0];
  }
  return t;
}

/** Returns the argument source of every `console.<method>(...)` call found in `src`. */
function findConsoleCalls(src: string): Array<{ method: string; args: string[]; index: number }> {
  const calls: Array<{ method: string; args: string[]; index: number }> = [];
  const re = /console\.(log|info|error|warn)\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const open = m.index + m[0].length - 1;
    const close = findClosing(src, open);
    if (close === -1) continue;
    calls.push({ method: m[1], args: splitTopLevel(src.slice(open + 1, close), ','), index: m.index });
    re.lastIndex = close;
  }
  return calls;
}

export function extractHarnessContracts(harness?: string): TestCaseItem[] {
  if (!harness || !harness.trim()) return [];

  // Variable table so `r === 3` can be shown as `add(1, 2) === 3`.
  const vars: Record<string, string> = {};
  for (const raw of harness.split('\n')) {
    const decl = raw.trim().match(/^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:await\s+)?(.+?);?$/);
    if (decl) vars[decl[1]] = decl[2].trim();
  }
  const resolve = (expr: string): string => {
    const e = expr.trim();
    if (vars[e]) return vars[e];
    const base = e.match(/^([A-Za-z_$][\w$]*)([.[].*)$/);
    if (base && vars[base[1]]) return `${vars[base[1]]}${base[2]}`;
    return e;
  };

  const cases: TestCaseItem[] = [];
  const calls = findConsoleCalls(harness);
  const lines = harness.split('\n');

  for (const call of calls) {
    const passIdx = call.args.findIndex((a) => /\?\s*(['"`])PASS/.test(a));
    if (call.method !== 'error' && passIdx !== -1) {
      const ternary = call.args[passIdx];
      const q = findTopLevelOperator(ternary, ['?']);
      const condition = q ? ternary.slice(0, q.index).trim() : ternary;
      const label =
        passIdx > 0 && /^['"`]/.test(call.args[0]) ? unquote(call.args[0]).replace(/:\s*$/, '').trim() : condition;

      const cmp = findTopLevelOperator(condition, ['===', '!==', '==', '!=']);
      let input = condition;
      let expected = 'truthy';
      if (cmp) {
        input = condition.slice(0, cmp.index).trim();
        expected = condition.slice(cmp.index + cmp.op.length).trim();
        if (cmp.op.startsWith('!')) expected = `not ${expected}`;
      }
      input = resolve(unwrapStringify(input));
      expected = unwrapStringify(expected);
      cases.push({ description: label, input, expected });
      continue;
    }

    // `console.error('Test N: FAIL (Expected X)')` inside a try/catch: expects a throw/rejection.
    const first = call.args[0] ?? '';
    if (/^['"`]/.test(first) && /FAIL/i.test(first)) {
      const label = unquote(first).trim();
      const exp = label.match(/\((?:Expected\s+)?([^)]+)\)/i);
      const lineNo = harness.slice(0, call.index).split('\n').length - 1;
      let input = 'Invalid call / boundary case';
      for (let j = lineNo; j >= Math.max(0, lineNo - 5); j--) {
        const prev = lines[j].trim();
        if (prev.includes('(') && !/^(try|\/\/|console\.)/.test(prev)) {
          input = prev
            .replace(/^(?:const|let|var)\s+[\w$]+\s*=\s*/, '')
            .replace(/^await\s+/, '')
            .replace(/;$/, '')
            .trim();
          break;
        }
      }
      cases.push({ description: label, input, expected: exp ? `Throws Error (${exp[1]})` : 'Throws Error' });
    }
  }

  // De-duplicate identical cases (e.g. the same assertion logged in several branches).
  const seen = new Set<string>();
  const unique = cases.filter((c) => {
    const key = `${c.description}|${c.input}|${c.expected}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (unique.length > 0) return unique;

  // Fallback: show representative calls so the contract table is never empty.
  for (const raw of lines) {
    if (/^(console\.|setTimeout|clearTimeout)/.test(raw.trim())) continue;
    const call = raw.trim().match(/([A-Za-z0-9_$]+\s*\([^)]*\));?$/);
    if (call) {
      unique.push({ description: 'Example Execution Contract', input: call[1], expected: 'Valid execution' });
      if (unique.length >= 2) break;
    }
  }
  return unique;
}



/**
 * Strips out known test-harness preambles (such as factory helpers for linked lists, trees,
 * or result normalization) from displayed call signatures while keeping multiline test setups
 * and assertions intact.
 */
export function sanitizeCallSignature(input?: string): string {
  if (!input || typeof input !== 'string') return '';

  // Normalize escaped newlines if coming from serialized JSON
  const raw = input.replace(/\\n/g, '\n');

  const lines = raw.split('\n');
  const cleanLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    // Strip known harness declarations (single-line or multiline headers)
    if (
      /^(?:(?:const|let|var)\s+(?:list|toArray|norm|ser|mk|dump|fails|n|brief)\s*=|function\s+(?:list|toArray|norm|ser|mk|dump|fails|n|brief)\b)/.test(
        trimmed
      ) ||
      /^(?:const|let|var)\s*\{[^}]*\}\s*=\s*\$dom;?$/.test(trimmed)
    ) {
      return false;
    }
    // Strip trailing helper close lines if any
    if (trimmed === '};' || trimmed === '}') return false;
    return true;
  });

  return cleanLines.length > 0 ? cleanLines.join('\n') : input;
}

