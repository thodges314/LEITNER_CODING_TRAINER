import { describe, expect, it } from 'vitest';
import { bufferContainsHarness, classifyLogLine, runHarness } from './runner';
import type { TopicItem } from './leitner';

const base: TopicItem = {
  id: 'add',
  track: 'algorithms',
  title: 'add',
  box: 1,
  streak: 0,
  nextEligibleTrial: 0,
  status: 'active',
  tags: [],
  promptSeed: '',
  testHarness: "console.log('adds:', add(1, 2) === 3 ? 'PASS' : 'FAIL');",
};

describe('classifyLogLine', () => {
  it('classifies pass, fail, error and neutral output', () => {
    expect(classifyLogLine('log', ['x', 'PASS'])).toBe('pass');
    expect(classifyLogLine('log', ['x: FAIL'])).toBe('fail');
    expect(classifyLogLine('error', ['boom'])).toBe('error');
    expect(classifyLogLine('log', ['hello'])).toBe('neutral');
    expect(classifyLogLine('log', ['Test 1: ', ['FAIL', 3]])).toBe('fail');
  });
});

describe('bufferContainsHarness', () => {
  it('detects an uncommented harness but not a commented one', () => {
    expect(bufferContainsHarness(`x\n${base.testHarness}\n`, base.testHarness!)).toBe(true);
    expect(bufferContainsHarness(`x\n// ${base.testHarness}\n`, base.testHarness!)).toBe(false);
  });
});

describe('runHarness', () => {
  it('passes a correct solution', async () => {
    const r = await runHarness(base, 'function add(a, b) { return a + b; }', 'js');
    expect(r.ran).toBe(true);
    expect(r.passed).toBe(true);
    expect(r.passCount).toBe(1);
  });

  it('fails an incorrect solution', async () => {
    const r = await runHarness(base, 'function add(a, b) { return a - b; }', 'js');
    expect(r.passed).toBe(false);
    expect(r.failCount).toBe(1);
  });

  it('does not double-append a harness already in the buffer', async () => {
    const code = `function add(a, b) { return a + b; }\n${base.testHarness}\n`;
    const r = await runHarness(base, code, 'js');
    expect(r.passCount).toBe(1);
  });

  it('treats a runtime error as not passed', async () => {
    const r = await runHarness(base, 'throw new Error("nope")', 'js');
    expect(r.passed).toBe(false);
    expect(r.errorCount).toBeGreaterThan(0);
  });

  it('reports a compile error without running', async () => {
    const r = await runHarness(base, 'function add(a, b) {', 'js');
    expect(r.ran).toBe(false);
    expect(r.passed).toBe(false);
  });

  it('counts timer-based assertions', async () => {
    const card = { ...base, testHarness: "setTimeout(() => console.log('late', 'PASS'), 50);" };
    const r = await runHarness(card, '', 'js');
    expect(r.passCount).toBe(1);
  });

  it('is not run without a harness', async () => {
    const r = await runHarness({ ...base, testHarness: undefined }, 'x', 'js');
    expect(r.ran).toBe(false);
  });

  it('enforces a strict type check in ts mode', async () => {
    const bad = await runHarness(base, 'function add(a, b) { return a + b; }', 'ts');
    expect(bad.passed).toBe(false); // implicit any
    const good = await runHarness(base, 'function add(a: number, b: number): number { return a + b; }', 'ts');
    expect(good.passed).toBe(true);
  });
});
