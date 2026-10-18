// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import seed from '../data/topics.json';
import { evaluateCodeSubmission, failedCheckNames, stripComments } from './ai';
import type { HarnessReport } from './runner';
import type { TopicItem } from './leitner';

const topic = (seed as unknown as TopicItem[]).find((t) => t.id === 'map-frequency-counter') as TopicItem;

const report = (lines: string[], extra: Partial<HarnessReport> = {}): HarnessReport => ({
  ran: true, passCount: 0, failCount: 2, errorCount: 0, timedOut: false, passed: false, summary: '0 passed, 2 failed', lines, ...extra,
});

describe('stripComments', () => {
  it('removes line and block comments', () => {
    expect(stripComments('// a\nconst x = 1; // b\n/* c\nd */ const y = 2;')).toBe('\nconst x = 1; \n const y = 2;');
  });
  it('keeps // inside strings (URLs)', () => {
    expect(stripComments("const u = 'https://example.com'; // note")).toBe("const u = 'https://example.com'; ");
  });
});

describe('failedCheckNames', () => {
  it('lists the labels of FAIL lines only', () => {
    const names = failedCheckNames(report(['Counts repeated items: FAIL received 1, expected 2', 'Empty array: PASS', 'NaN is one key: FAIL threw Error']));
    expect(names).toEqual(['Counts repeated items', 'NaN is one key']);
  });
  it('is empty without a report or without failures', () => {
    expect(failedCheckNames(undefined)).toEqual([]);
    expect(failedCheckNames(report(['a: PASS'], { passed: true, failCount: 0 }))).toEqual([]);
  });
});

describe('offline critique', () => {
  beforeEach(() => localStorage.clear());

  it('does not credit structure that only appears in comments, and does not paste the solution', async () => {
    const code = [
      '// Test runner example:',
      '// const m = new Map(); m.get(1); m.set(1, 2);',
      'function countFrequencies(arr) { return 1; }',
    ].join('\n');
    const res = await evaluateCodeSubmission(topic, code, report(['Counts repeated items: FAIL received 1', 'Empty array: FAIL received 1']));
    expect(res.passed).toBe(false);
    expect(res.invariantsMet).not.toContain('Core data structure primitive instantiated properly');
    expect(res.invariantsMet).not.toContain('Map/Set operational API methods invoked with correct semantics');
    expect(res.critique).toContain('Failed checks: Counts repeated items; Empty array.');
    expect(res.critique).not.toContain('Canonical Reference Pattern');
    expect(res.critique).not.toContain('```');
  });

  it('still credits structure that is really in the code', async () => {
    const code = 'function countFrequencies(arr) { const m = new Map(); for (const x of arr) m.set(x, (m.get(x) || 0) + 1); return m; }';
    const res = await evaluateCodeSubmission(topic, code, report(['Counts repeated items: FAIL x']));
    expect(res.invariantsMet).toContain('Core data structure primitive instantiated properly');
    expect(res.invariantsMet).toContain('Map/Set operational API methods invoked with correct semantics');
  });
});
