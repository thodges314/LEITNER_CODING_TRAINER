import { describe, expect, it } from 'vitest';
import { isHintSeen, markHintSeen, TRACK_FILTER_HINT_KEY } from './hints';

const memoryStore = () => {
  const data = new Map<string, string>();
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
};

describe('one-time hints', () => {
  it('is unseen until marked, then seen', () => {
    const store = memoryStore();
    expect(isHintSeen(TRACK_FILTER_HINT_KEY, store)).toBe(false);
    markHintSeen(TRACK_FILTER_HINT_KEY, store);
    expect(isHintSeen(TRACK_FILTER_HINT_KEY, store)).toBe(true);
  });
  it('keeps hints independent of each other', () => {
    const store = memoryStore();
    markHintSeen('a', store);
    expect(isHintSeen('b', store)).toBe(false);
  });
  it('never nags when storage is unavailable or throws', () => {
    expect(isHintSeen('a', { getItem: () => { throw new Error('denied'); } })).toBe(true);
    expect(() => markHintSeen('a', { setItem: () => { throw new Error('full'); } })).not.toThrow();
    expect(isHintSeen('a', null)).toBe(false);
  });
});
