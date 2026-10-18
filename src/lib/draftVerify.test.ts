// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { verifyDraft } from './draftVerify';
import { buildHarnessFromCases } from './caseHarness';

const CASES = [
  { description: 'adds', input: 'add(2, 3)', expected: '5' },
  { description: 'adds negatives', input: 'add(-1, -2)', expected: '-3' },
  { description: 'adds zero', input: 'add(0, 7)', expected: '7' },
];
const harness = buildHarnessFromCases(CASES);
const REF = 'function add(a, b) { return a + b; }';

describe('verifyDraft', () => {
  it('verified: the reference passes and an empty solution fails', async () => {
    const v = await verifyDraft({ track: 'algorithms', referenceSolution: REF, testHarness: harness });
    expect(v.status).toBe('verified');
    expect(v.checks).toBe(3);
  });
  it('reference-fails: a buggy reference solution is caught, with the failing check in the detail', async () => {
    const v = await verifyDraft({ track: 'algorithms', referenceSolution: 'function add(a, b) { return a - b; }', testHarness: harness });
    expect(v.status).toBe('reference-fails');
    expect(v.detail).toMatch(/does not pass its own tests/);
  });
  it('reference-fails: a reference that does not even compile', async () => {
    const v = await verifyDraft({ track: 'algorithms', referenceSolution: 'function add(a, b) {', testHarness: harness });
    expect(v.status).toBe('reference-fails');
  });
  it('lenient: tests that pass without any solution prove nothing', async () => {
    const lenient = "$test.check('a', true);\n$test.check('b', 1 === 1);";
    const v = await verifyDraft({ track: 'algorithms', referenceSolution: REF, testHarness: lenient });
    expect(v.status).toBe('lenient');
  });
  it('no-tests: missing harness, or fewer than 2 checks', async () => {
    expect((await verifyDraft({ track: 'algorithms', referenceSolution: REF })).status).toBe('no-tests');
    const one = buildHarnessFromCases(CASES.slice(0, 1));
    const v = await verifyDraft({ track: 'algorithms', referenceSolution: REF, testHarness: one });
    expect(v.status).toBe('no-tests');
    expect(v.checks).toBe(1);
  });
  it('no-reference: tests but nothing to check them against', async () => {
    expect((await verifyDraft({ track: 'algorithms', testHarness: harness })).status).toBe('no-reference');
  });
});
