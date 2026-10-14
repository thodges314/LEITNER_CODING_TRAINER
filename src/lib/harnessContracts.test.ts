import { describe, expect, it } from 'vitest';
import { extractHarnessContracts } from './harnessContracts';

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
