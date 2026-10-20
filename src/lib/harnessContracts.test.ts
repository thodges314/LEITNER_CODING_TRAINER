import { describe, expect, it } from 'vitest';
import { extractHarnessContracts, sanitizeCallSignature, TOPIC_CONTRACT_OVERRIDES } from './harnessContracts';

describe('extractHarnessContracts', () => {
  it('returns nothing for an empty harness', () => {
    expect(extractHarnessContracts('')).toEqual([]);
    expect(extractHarnessContracts(undefined)).toEqual([]);
  });

  it('resolves variables and does not truncate nested calls', () => {
    const h = "const tb = makeBucket(2, 10);\nconst r = tb.allow(clamp(1, 2));\nconsole.log('first allowed:', r === true ? 'PASS' : 'FAIL');";
    expect(extractHarnessContracts(h)).toEqual([
      { description: 'first allowed', input: 'tb.allow(clamp(1, 2))', expected: 'true' },
    ]);
  });

  it('unwraps JSON.stringify on both sides and handles commas inside literals', () => {
    const h = "console.log('merge:', JSON.stringify(merge([[1, 3], [2, 6]])) === JSON.stringify([[1, 6]]) ? 'PASS' : 'FAIL');";
    const [c] = extractHarnessContracts(h);
    expect(c.input).toBe('merge([[1, 3], [2, 6]])');
    expect(c.expected).toBe('[[1, 6]]');
  });

  it('treats a bare condition as truthy and negations as "not"', () => {
    const [a, b] = extractHarnessContracts(
      "console.log('ok', isValid('()') ? 'PASS' : 'FAIL');\nconsole.log('differs', a !== b ? 'PASS' : 'FAIL');"
    );
    expect(a.expected).toBe('truthy');
    expect(b.expected).toBe('not b');
  });

  it('derives throw expectations from FAIL guards and finds the preceding call', () => {
    const h = "try {\n  await run(null);\n  console.error('Test 2: FAIL (Expected rejection)');\n} catch (e) {}";
    expect(extractHarnessContracts(h)).toEqual([
      { description: 'Test 2: FAIL (Expected rejection)', input: 'run(null)', expected: 'Throws Error (rejection)' },
    ]);
  });

  it('ignores PASS text that appears inside strings', () => {
    expect(extractHarnessContracts("console.log('says ? PASS : nothing');")).toEqual([]);
  });
});

describe('sanitizeCallSignature', () => {
  it('returns empty string for null, undefined, or empty inputs', () => {
    expect(sanitizeCallSignature('')).toBe('');
    expect(sanitizeCallSignature(undefined)).toBe('');
  });

  it('strips list and toArray helper factory preambles from linked list tests', () => {
    const raw = `const list = (...vals) => vals.reduceRight((next, val) => ({ val, next }), null);
const toArray = (node) => { const out = []; while (node) { out.push(node.val); node = node.next; } return out; };
toArray(reverseList(list(1, 2, 3, 4)))`;

    expect(sanitizeCallSignature(raw)).toBe('toArray(reverseList(list(1, 2, 3, 4)))');
  });

  it('preserves multiline test setup and assertions after stripping preambles', () => {
    const raw = `const list = (...vals) => vals.reduceRight((next, val) => ({ val, next }), null);
const toArray = (node) => { const out = []; while (node) { out.push(node.val); node = node.next; } return out; };
const a = list(1, 2);
const head = a;
const r = reverseList(a);
[r.val, r.next === head, head.next]`;

    expect(sanitizeCallSignature(raw)).toBe(
      `const a = list(1, 2);\nconst head = a;\nconst r = reverseList(a);\n[r.val, r.next === head, head.next]`
    );
  });

  it('strips norm helper from sorting/grouping test cases', () => {
    const raw = `const norm = (groups) => groups.map((g) => [...g].sort()).sort((a, b) => (a.join() < b.join() ? -1 : 1));
norm(subsets([1, 2, 3]))`;

    expect(sanitizeCallSignature(raw)).toBe('norm(subsets([1, 2, 3]))');
  });

  it('strips multiline function declarations matching known helpers', () => {
    const raw = `function toArray(node) {
  const out = [];
  while (node) {
    out.push(node.val);
    node = node.next;
  }
  return out;
}
hasCycle(list(1, 2, 3))`;

    expect(sanitizeCallSignature(raw)).toBe('hasCycle(list(1, 2, 3))');
  });

  it('does not strip data array declarations named list that are not helper functions', () => {
    const raw = `const list = [{ id: 1, text: 'hello' }];\nrenderQueue(list)`;
    expect(sanitizeCallSignature(raw)).toBe(raw);
  });

  it('falls back to the original string when no known preambles are present', () => {
    const simple = 'add(1, 2)';
    expect(sanitizeCallSignature(simple)).toBe(simple);

    const multiline = `const a = [1, 2, 3];\nconst b = a.slice();\n[a, b]`;
    expect(sanitizeCallSignature(multiline)).toBe(multiline);
  });
});

describe('TOPIC_CONTRACT_OVERRIDES', () => {
  it('provides clean contracts for reverse-linked-list aligned with expectations', () => {
    const cases = TOPIC_CONTRACT_OVERRIDES['reverse-linked-list'];
    expect(cases).toBeDefined();
    expect(cases.length).toBe(6);
    expect(cases[0].input).toBe('toArray(reverseList(list(1, 2, 3, 4)))');
    expect(cases[0].expected).toBe('[4, 3, 2, 1]');
    expect(cases[2].expected).toBe('[2, true, null]');
  });
});

