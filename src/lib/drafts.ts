/** Per-card code drafts, so a frozen tab or a reload never costs you what you typed. */
const PREFIX = 'leitner_draft:';

export function loadDraft(cardId: string | undefined): string | null {
  if (!cardId || typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(PREFIX + cardId);
  } catch {
    return null;
  }
}

export function saveDraft(cardId: string | undefined, code: string): void {
  if (!cardId || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(PREFIX + cardId, code);
  } catch {
    /* quota exceeded: drafts are best-effort */
  }
}

export function clearDraft(cardId: string | undefined): void {
  if (!cardId || typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(PREFIX + cardId);
  } catch {
    /* ignore */
  }
}

export function clearAllDrafts(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PREFIX)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}
