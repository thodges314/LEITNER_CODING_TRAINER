import { describe, expect, it } from 'vitest';
import seed from '../data/topics.json';
import { isTsOnlyCard, TS_ONLY_TRACKS } from './tsOnly';
import type { TopicItem } from './leitner';

describe('TypeScript-only cards', () => {
  it('recognises only the TypeScript-only tracks', () => {
    expect(isTsOnlyCard({ track: 'typescript-patterns' })).toBe(true);
    expect(isTsOnlyCard({ track: 'algorithms' })).toBe(false);
    expect(isTsOnlyCard(null)).toBe(false);
    expect(isTsOnlyCard({})).toBe(false);
  });

  it('every TS-only card ships a TypeScript reference solution', () => {
    const cards = (seed as unknown as TopicItem[]).filter((t) => TS_ONLY_TRACKS.includes(t.track));
    expect(cards.length).toBeGreaterThan(0);
    for (const c of cards) expect(c.referenceSolutionTs?.trim(), c.id).toBeTruthy();
  });
});
