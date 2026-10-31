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
    expect(classifyLogLine('error', ['boom'])).toBe('neutral');
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

  it('allows generic arrow functions without trailing comma in ts mode', async () => {
    const card: TopicItem = {
      ...base,
      id: 'generic-identity',
      testHarness: "$test.check('identity works', identity(42) === 42 && identity('a') === 'a');",
    };
    const r = await runHarness(card, 'const identity = <T>(value: T): T => value;', 'ts');
    expect(r.passed).toBe(true);
    expect(r.ran).toBe(true);
  });
});

describe('sandbox hygiene', () => {
  it('restores built-in prototypes patched by a solution', async () => {
    const card: TopicItem = { ...base, id: 'poly', testHarness: "$test.check('x', typeof [].myThing === 'function');" };
    const r = await runHarness(card, "Object.defineProperty(Array.prototype, 'myThing', { value() {}, configurable: true });", 'js');
    expect(r.passed).toBe(true);
    expect(typeof ([] as unknown as { myThing?: unknown }).myThing).toBe('undefined');
  });

  it('does not treat console.error output as a failure', async () => {
    const card: TopicItem = { ...base, id: 'err', testHarness: "console.error('just logging'); $test.check('ok', true);" };
    const r = await runHarness(card, '', 'js');
    expect(r.passed).toBe(true);
  });

  it('$test.run reports FAIL with received/expected', async () => {
    const card: TopicItem = { ...base, id: 'run', testHarness: "await $test.run('adds', async () => 1 + 1, () => 3);" };
    const r = await runHarness(card, '', 'js');
    expect(r.passed).toBe(false);
    expect(r.lines.join('\n')).toMatch(/received 2, expected 3/);
  });

  it('safely recovers from a synchronous infinite loop in user code', async () => {
    const card: TopicItem = {
      ...base,
      id: 'loop',
      testHarness: "console.log('loop:', add(1, 2) === 3 ? 'PASS' : 'FAIL');",
    };
    const r = await runHarness(card, 'function add(a, b) { while (true) {} return a + b; }', 'js', 300);
    expect(r.passed).toBe(false);
    expect(r.timedOut).toBe(true);
    expect(r.lines.join('\n')).toMatch(/infinite loop detected/);
  });
});

describe('runWithTimeout', () => {
  it('resolves successful code result', async () => {
    const { runWithTimeout } = await import('./runner');
    const result = await runWithTimeout('return 40 + 2;');
    expect(result).toBe(42);
  });

  it('rejects on execution error', async () => {
    const { runWithTimeout } = await import('./runner');
    await expect(runWithTimeout('throw new Error("worker error");')).rejects.toThrow('worker error');
  });

  it('times out and rejects on infinite loop', async () => {
    const { runWithTimeout } = await import('./runner');
    await expect(runWithTimeout('while(true) {}', 100)).rejects.toThrow(/Execution timed out after 100ms/);
  });

  it('supports explicit import statements from react', async () => {
    const card: TopicItem = {
      ...base,
      id: 'import-test',
      testHarness: "console.log('hook:', typeof useTest === 'function' ? 'PASS' : 'FAIL');",
    };
    const code = `
      import React, { useState } from 'react';
      function useTest() {
        return useState(0);
      }
    `;
    const r = await runHarness(card, code, 'js');
    expect(r.passed).toBe(true);
    expect(r.passCount).toBe(1);
  });
});
