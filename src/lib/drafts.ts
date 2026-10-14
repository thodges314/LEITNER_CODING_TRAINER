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
