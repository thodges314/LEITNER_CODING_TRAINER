import { STORAGE_KEYS, getDefaultStorage, safeGetItem, safeSetItem, safeRemoveItem } from './storage';

/** Per-card code drafts, so a frozen tab or a reload never costs you what you typed. */
const PREFIX = STORAGE_KEYS.DRAFT_PREFIX;

export function loadDraft(cardId: string | undefined): string | null {
  if (!cardId) return null;
  return safeGetItem(PREFIX + cardId);
}

export function saveDraft(cardId: string | undefined, code: string): void {
  if (!cardId) return;
  safeSetItem(PREFIX + cardId, code);
}

export function clearDraft(cardId: string | undefined): void {
  if (!cardId) return;
  safeRemoveItem(PREFIX + cardId);
}

export function clearAllDrafts(): void {
  const store = getDefaultStorage();
  if (!store) return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (key && key.startsWith(PREFIX)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      store.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}
