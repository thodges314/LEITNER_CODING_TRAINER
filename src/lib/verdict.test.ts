import { describe, expect, it } from 'vitest';
import { summarizeVerdict } from './verdict';
import type { HarnessReport } from './runner';

const report = (passed: boolean): HarnessReport => ({
  ran: true, passCount: passed ? 3 : 1, failCount: passed ? 0 : 2, errorCount: 0, timedOut: false, passed, summary: passed ? '3 passed' : '1 passed, 2 failed', lines: [],
});

describe('summarizeVerdict', () => {
  it('flags an AI reviewer that fails an answer whose tests passed (the Set-methods situation)', () => {
    expect(summarizeVerdict({ passed: false, harness: report(true), evaluationSource: 'api' })).toEqual({
      tests: 'passed', reviewer: 'fail', aiOverruledTests: true,
    });
  });
  it('agreement is not flagged', () => {
    expect(summarizeVerdict({ passed: true, harness: report(true), evaluationSource: 'api' }).aiOverruledTests).toBe(false);
    expect(summarizeVerdict({ passed: false, harness: report(false), evaluationSource: 'api' })).toEqual({
      tests: 'failed', reviewer: 'fail', aiOverruledTests: false,
    });
  });
  it('offline there is no reviewer and nothing can be overruled', () => {
    expect(summarizeVerdict({ passed: true, harness: report(true), evaluationSource: 'heuristic-mock' })).toEqual({
      tests: 'passed', reviewer: null, aiOverruledTests: false,
    });
    expect(summarizeVerdict({ passed: false, harness: report(true), evaluationSource: undefined }).aiOverruledTests).toBe(false);
  });
  it('without a harness run the tests are "not-run"', () => {
    expect(summarizeVerdict({ passed: false, evaluationSource: 'api' })).toEqual({ tests: 'not-run', reviewer: 'fail', aiOverruledTests: false });
  });
});
