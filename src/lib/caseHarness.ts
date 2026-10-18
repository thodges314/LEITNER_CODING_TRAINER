import type { TestCaseItem } from './leitner';

/**
 * A test case written as an explicit input / output pair (the format of the built-in cards).
 * `input` is JavaScript whose LAST line is an expression (earlier lines may set things up);
 * `expected` is a JavaScript expression for the exact expected value.
 * With `throws` set (a regex source) the call must reject/throw an error whose message matches it.
 */
export interface DraftCase {
  description: string;
  input: string;
  expected: string;
  throws?: string;
}

const MAX_CASES = 12;
const q = (s: string) => JSON.stringify(s);
const indent = (text: string, pad = '  ') =>
  text
    .split('\n')
    .map((line) => (line.length ? pad + line : line))
    .join('\n');

/** Cleans untrusted (AI-written) case data: keeps well-formed entries only. */
export function normalizeDraftCases(value: unknown): DraftCase[] {
  if (!Array.isArray(value)) return [];
  const out: DraftCase[] = [];
  for (const raw of value) {
    if (typeof raw !== 'object' || raw === null) continue;
    const c = raw as Record<string, unknown>;
    const input = typeof c.input === 'string' ? c.input.trim() : '';
    if (!input) continue;
    const throws = typeof c.throws === 'string' && c.throws.trim() ? c.throws.trim() : undefined;
    const expected = typeof c.expected === 'string' ? c.expected.trim() : c.expected === undefined || c.expected === null ? '' : String(c.expected);
    if (!throws && !expected) continue;
    const description = typeof c.description === 'string' && c.description.trim() ? c.description.trim() : `Case ${out.length + 1}`;
    out.push({ description, input, expected, ...(throws ? { throws } : {}) });
    if (out.length >= MAX_CASES) break;
  }
  return out;
}

/** Builds the `$test` harness script the runner executes after the user's code. */
export function buildHarnessFromCases(cases: DraftCase[]): string {
  const blocks: string[] = [];
  for (const c of cases) {
    const lines = c.input.trimEnd().split('\n');
    const expr = (lines.pop() ?? '').replace(/;\s*$/, '');
    const setup = lines.length ? indent(lines.join('\n')) + '\n' : '';
    const body = `  const sleep = $test.sleep;\n${setup}  return (${expr});`;
    if (c.throws) {
      blocks.push(`await $test.rejects(${q(c.description)}, async () => {\n${body}\n}, ${q(c.throws)});`);
    } else {
      blocks.push(`await $test.run(${q(c.description)}, async () => {\n${body}\n}, () => (${c.expected}));`);
    }
  }
  return blocks.join('\n\n');
}

/** The input -> expected pairs shown in the card UI. */
export function casesToTestCaseItems(cases: DraftCase[]): TestCaseItem[] {
  return cases.map((c) => ({
    description: c.description,
    input: c.input,
    expected: c.throws ? `Rejects with Error \u2014 message matches /${c.throws}/` : c.expected,
  }));
}
