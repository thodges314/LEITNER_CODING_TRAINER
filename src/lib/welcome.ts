export const DECK_STORAGE_KEY = 'leitner_coding_deck';
export const WELCOMED_KEY = 'leitner_welcomed';
const NARROW_QUERY = '(max-width: 820px)';

/**
 * True only for a brand-new visitor: no saved deck, never dismissed the welcome. Existing users (who already have a
 * deck) never see it. Narrow screens get the mobile notice instead. Call it ONCE, at module load, before the app
 * creates and saves its default deck.
 */
export function isFirstVisit(
  storage: Pick<Storage, 'getItem'> | null = typeof localStorage === 'undefined' ? null : localStorage,
  matchMedia: ((q: string) => { matches: boolean }) | null = typeof window === 'undefined' || !window.matchMedia ? null : window.matchMedia.bind(window)
): boolean {
  if (!storage) return false;
  try {
    if (storage.getItem(DECK_STORAGE_KEY) !== null || storage.getItem(WELCOMED_KEY) !== null) return false;
    if (matchMedia && matchMedia(NARROW_QUERY).matches) return false;
    return true;
  } catch {
    return false;
  }
}

export function markWelcomed(storage: Pick<Storage, 'setItem'> | null = typeof localStorage === 'undefined' ? null : localStorage): void {
  try {
    storage?.setItem(WELCOMED_KEY, '1');
  } catch {
    // storage unavailable: the welcome may show again, which is harmless
  }
}
