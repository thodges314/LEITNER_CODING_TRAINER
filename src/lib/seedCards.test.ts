// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import seed from '../data/topics.json';
import { runHarness } from './runner';
import type { TopicItem } from './leitner';

const topics = seed as unknown as TopicItem[];

describe('seed cards', () => {
  it('have unique ids, a harness, a reference solution and test cases', () => {
    expect(new Set(topics.map((t) => t.id)).size).toBe(topics.length);
    for (const t of topics) {
      expect(t.testHarness?.trim(), t.id).toBeTruthy();
      expect(t.referenceSolution?.trim(), t.id).toBeTruthy();
      expect(t.testCases?.length ?? 0, `${t.id}: every card needs at least 4 documented cases`).toBeGreaterThanOrEqual(4);
    }
  });

  it('no card harness is a bare typeof check', () => {
    for (const t of topics) {
      expect(t.testHarness, t.id).not.toMatch(/typeof \w+ === 'function' \? 'PASS'/);
    }
  });

  it.each(topics.map((t) => [t.id, t] as const))('%s: reference solution passes its harness', async (_id, t) => {
    const mode = t.track === 'typescript-patterns' ? 'ts' : 'js';
    const r = await runHarness(t, t.referenceSolution!, mode, 20000);
    expect({ id: t.id, summary: r.summary, lines: r.lines.filter((l) => /FAIL|error/i.test(l)) }).toMatchObject({
      summary: expect.stringMatching(/^[1-9]\d* passed, 0 failed$/),
    });
    if (t.track !== 'typescript-patterns') {
      // Every documented case is asserted under the same label (so failures show the matching input/expected).
      const labels = new Set(r.lines.map((l) => l.replace(/^\[\w+\] /, '').replace(/:\s*(PASS|FAIL).*$/s, '')));
      const missing = (t.testCases ?? []).map((c) => c.description ?? '').filter((d) => !labels.has(d));
      expect(missing, `${t.id}: cases without a matching harness assertion`).toEqual([]);
    }
  }, 30000);

  it.each(topics.map((t) => [t.id, t] as const))('%s: an empty solution does NOT pass the harness', async (_id, t) => {
    const mode = t.track === 'typescript-patterns' ? 'ts' : 'js';
    const r = await runHarness(t, '// intentionally empty', mode, 20000);
    expect(r.passed, `${t.id}: harness passed with no solution (${r.summary})`).toBe(false);
  }, 30000);

  const tsTopics = topics.filter((t) => Boolean(t.referenceSolutionTs));
  it.each(tsTopics.map((t) => [t.id, t] as const))('%s: TypeScript reference solution passes its harness in TS mode', async (_id, t) => {
    const r = await runHarness(t, t.referenceSolutionTs!, 'ts', 20000);
    expect({ id: t.id, summary: r.summary, lines: r.lines.filter((l) => /FAIL|error/i.test(l)) }).toMatchObject({
      summary: expect.stringMatching(/^[1-9]\d* passed, 0 failed$/),
    });
  }, 30000);
});

