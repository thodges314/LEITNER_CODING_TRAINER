import { describe, expect, it } from 'vitest';
import seed from '../data/topics.json';
import { RETIRED_SEED_IDS, mergeStoredWithSeed } from './leitner';
import type { LeitnerDeckState, TopicItem } from './leitner';

const cards = seed as unknown as TopicItem[];

describe('retired seed cards (removed as duplicates)', () => {
  it('none of them is in the seed deck any more', () => {
    const ids = new Set(cards.map((c) => c.id));
    for (const id of RETIRED_SEED_IDS) expect(ids.has(id), id).toBe(false);
  });

  it('a saved deck that still holds one drops it on load, and keeps everything else', () => {
    const kept = cards[0];
    const stale = { ...kept, id: 'hook-fetch-cleanup', title: 'old copy', box: 4, streak: 3 };
    const stored = { topics: [stale, { ...kept, box: 2 }], algorithm: 'graduated-interval' } as unknown as LeitnerDeckState;
    const merged = mergeStoredWithSeed(stored, cards);
    expect(merged.topics.some((t) => t.id === 'hook-fetch-cleanup')).toBe(false);
    expect(merged.topics.find((t) => t.id === kept.id)!.box).toBe(2);
  });

  it('no seed card is a duplicate of another by id', () => {
    const ids = cards.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
