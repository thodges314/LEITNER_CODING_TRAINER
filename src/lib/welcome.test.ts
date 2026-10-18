import { describe, expect, it } from 'vitest';
import { DECK_STORAGE_KEY, WELCOMED_KEY, isFirstVisit, markWelcomed } from './welcome';

const store = (items: Record<string, string> = {}) => ({
  getItem: (k: string) => (k in items ? items[k] : null),
  setItem: (k: string, v: string) => {
    items[k] = v;
  },
});
const wide = () => ({ matches: false });
const narrow = () => ({ matches: true });

describe('first-visit welcome', () => {
  it('shows for a brand-new visitor on a wide screen', () => {
    expect(isFirstVisit(store(), wide)).toBe(true);
  });
  it('never shows for someone who already has a deck', () => {
    expect(isFirstVisit(store({ [DECK_STORAGE_KEY]: '{}' }), wide)).toBe(false);
  });
  it('never shows again after it was dismissed', () => {
    const s = store();
    markWelcomed(s);
    expect(s.getItem(WELCOMED_KEY)).toBe('1');
    expect(isFirstVisit(s, wide)).toBe(false);
  });
  it('is skipped on narrow screens (the mobile notice shows there) and when storage is unavailable', () => {
    expect(isFirstVisit(store(), narrow)).toBe(false);
    expect(isFirstVisit(null, wide)).toBe(false);
    expect(
      isFirstVisit(
        {
          getItem: () => {
            throw new Error('blocked');
          },
        },
        wide
      )
    ).toBe(false);
  });
});
