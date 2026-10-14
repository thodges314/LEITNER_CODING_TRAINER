import { describe, expect, it } from 'vitest';
import seed from '../data/topics.json';
import type { TopicItem } from './leitner';

const topics = seed as unknown as TopicItem[];

describe('seed testCases', () => {
  it.each(topics.map((t) => [t.id, t] as const))('%s has explicit input/expected pairs', (_id, t) => {
    expect(t.testCases?.length ?? 0).toBeGreaterThanOrEqual(2);
    for (const tc of t.testCases ?? []) {
      expect(tc.description?.trim(), 'description').toBeTruthy();
      expect(tc.input.trim(), 'input').toBeTruthy();
      expect(tc.expected.trim(), 'expected').toBeTruthy();
    }
  });
});
