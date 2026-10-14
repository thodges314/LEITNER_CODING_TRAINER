import { describe, expect, it } from 'vitest';
import seed from '../data/topics.json';
import { runHarness } from './runner';
import type { TopicItem } from './leitner';

const topics = seed as unknown as TopicItem[];
// Harnesses that hit the network are not deterministic in CI/offline runs.
const offline = topics.filter((t) => t.testHarness && !/https?:\/\//.test(t.testHarness));

describe('seed cards', () => {
  it('have unique ids and a harness plus reference solution', () => {
    expect(new Set(topics.map((t) => t.id)).size).toBe(topics.length);
    for (const t of topics) {
      expect(t.testHarness?.trim(), t.id).toBeTruthy();
      expect(t.referenceSolution?.trim(), t.id).toBeTruthy();
    }
  });

  it.each(offline.map((t) => [t.id, t] as const))('%s: reference solution passes its harness', async (_id, t) => {
    const mode = t.track === 'typescript-patterns' ? 'ts' : 'js';
    const r = await runHarness(t, t.referenceSolution!, mode);
    expect({ id: t.id, summary: r.summary, lines: r.lines }).toMatchObject({ summary: expect.stringMatching(/^[1-9]\d* passed, 0 failed$/) });
  }, 20000);
});
