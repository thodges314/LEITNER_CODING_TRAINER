// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { buildHarnessFromCases, casesToTestCaseItems, normalizeDraftCases } from './caseHarness';
import { runHarness } from './runner';
import type { TopicItem } from './leitner';

const card = (harness: string) => ({ id: 'x', track: 'algorithms', testHarness: harness }) as TopicItem;
const REF = 'function add(a, b) { return a + b; }';

describe('normalizeDraftCases', () => {
  it('keeps well-formed cases and trims them', () => {
    expect(normalizeDraftCases([{ description: ' sums ', input: ' add(1, 2) ', expected: ' 3 ' }])).toEqual([{ description: 'sums', input: 'add(1, 2)', expected: '3' }]);
  });
  it('drops junk: non-arrays, non-objects, no input, no expected and no throws', () => {
    expect(normalizeDraftCases('nope')).toEqual([]);
    expect(normalizeDraftCases([null, 5, { input: '' , expected: '1' }, { input: 'f()' }])).toEqual([]);
  });
  it('accepts a throws case without expected, and numbers as expected', () => {
    expect(normalizeDraftCases([{ input: 'f()', throws: 'bad' }, { input: 'g()', expected: 0 }])).toEqual([
      { description: 'Case 1', input: 'f()', expected: '', throws: 'bad' },
      { description: 'Case 2', input: 'g()', expected: '0' },
    ]);
  });
  it('caps the number of cases', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ input: `f(${i})`, expected: String(i) }));
    expect(normalizeDraftCases(many)).toHaveLength(12);
  });
});

describe('buildHarnessFromCases', () => {
  const cases = [
    { description: 'adds', input: 'add(2, 3)', expected: '5' },
    { description: 'uses setup lines', input: 'const base = 10;\nadd(base, 1);', expected: '11' },
  ];
  it('produces a harness the runner can execute: the reference passes every case', async () => {
    const report = await runHarness(card(buildHarnessFromCases(cases)), REF, 'js');
    expect(report.summary).toBe('2 passed, 0 failed');
  });
  it('a wrong implementation fails', async () => {
    const report = await runHarness(card(buildHarnessFromCases(cases)), 'function add(a, b) { return a - b; }', 'js');
    expect(report.passed).toBe(false);
    expect(report.failCount).toBe(2);
  });
  it('supports throws cases', async () => {
    const harness = buildHarnessFromCases([
      { description: 'rejects', input: 'boom()', expected: '', throws: 'nope' },
      { description: 'fine', input: 'ok()', expected: "'yes'" },
    ]);
    const good = await runHarness(card(harness), "function boom() { throw new Error('nope'); }\nfunction ok() { return 'yes'; }", 'js');
    expect(good.summary).toBe('2 passed, 0 failed');
    const bad = await runHarness(card(harness), "function boom() { return 1; }\nfunction ok() { return 'yes'; }", 'js');
    expect(bad.passed).toBe(false);
  });
  it('is empty for no cases', () => {
    expect(buildHarnessFromCases([])).toBe('');
  });
});

describe('casesToTestCaseItems', () => {
  it('shows input and expected for the UI', () => {
    expect(casesToTestCaseItems([{ description: 'adds', input: 'add(2, 3)', expected: '5' }, { description: 'bad', input: 'f()', expected: '', throws: 'nope' }])).toEqual([
      { description: 'adds', input: 'add(2, 3)', expected: '5' },
      { description: 'bad', input: 'f()', expected: 'Rejects with Error \u2014 message matches /nope/' },
    ]);
  });
});
