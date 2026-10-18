/** One-time hints: each is shown the first time it is relevant, then never again (remembered in localStorage). */
export const TRACK_FILTER_HINT_KEY = 'leitner_hint_track_filter';

type ReadStore = Pick<Storage, 'getItem'>;
type WriteStore = Pick<Storage, 'setItem'>;
const defaultStore = (): Storage | null => (typeof localStorage === 'undefined' ? null : localStorage);

export function isHintSeen(key: string, storage: ReadStore | null = defaultStore()): boolean {
  try {
    return storage?.getItem(key) !== null && storage?.getItem(key) !== undefined;
  } catch {
    return true; // storage unavailable: never nag
  }
}

export function markHintSeen(key: string, storage: WriteStore | null = defaultStore()): void {
  try {
    storage?.setItem(key, '1');
  } catch {
    // storage unavailable: the hint may show again, which is harmless
  }
}
