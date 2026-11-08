import { STORAGE_KEYS, getDefaultStorage, safeSetItem } from './storage';

/** One-time hints: each is shown the first time it is relevant, then never again (remembered in localStorage). */
export const TRACK_FILTER_HINT_KEY = STORAGE_KEYS.TRACK_FILTER_HINT;

type ReadStore = Pick<Storage, 'getItem'>;
type WriteStore = Pick<Storage, 'setItem'>;

export function isHintSeen(key: string, storage: ReadStore | null = getDefaultStorage()): boolean {
  try {
    return storage?.getItem(key) !== null && storage?.getItem(key) !== undefined;
  } catch {
    return true; // storage unavailable: never nag
  }
}

export function markHintSeen(key: string, storage: WriteStore | null = getDefaultStorage()): void {
  safeSetItem(key, '1', storage);
}
