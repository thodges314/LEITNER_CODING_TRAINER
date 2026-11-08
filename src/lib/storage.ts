/**
 * Centralized localStorage key registry and safe storage access helpers.
 * All storage reads/writes swallow quota, security, or SSR exceptions gracefully.
 */

export const STORAGE_KEYS = {
  DECK: 'leitner_coding_deck',
  ALGORITHM: 'spaced_repetition_algorithm',
  DRAFT_PREFIX: 'leitner_draft:',
  WELCOMED: 'leitner_welcomed',
  CATALOG_TOUR_SEEN: 'leitner_catalog_tour_seen',
  ARENA_TOUR_SEEN: 'leitner_arena_tour_seen',
  PENDING_ARENA_TOUR: 'leitner_pending_arena_tour',
  BACKUP_ADVISORY_SEEN: 'leitner_backup_advisory_seen',
  PROBLEMS_COMPLETED: 'leitner_completed_problems_count',
  ADVISORY_DISMISSED: 'leitner_backup_advisory_dismissed',
  TRACK_FILTER_HINT: 'leitner_hint_track_filter',
  THEME: 'leitner_theme',
  TIMED_MODE_ENABLED: 'leitner_timed_mode',
  TIMED_MODE_DURATION: 'leitner_timed_duration',
  TS_HOVER_ENABLED: 'leitner_ts_hover_enabled',
  PREFERRED_EXECUTION_MODE: 'leitner_preferred_execution_mode',
  DECK_CATALOG_PREFS: 'leitner_deck_catalog_preferences',
  ACTIVE_DECK_ID: 'leitner_active_deck_id',
  CUSTOM_DECKS: 'leitner_custom_decks',
  INTERVIEW_DOSSIERS: 'leitner_interview_dossiers',
} as const;

export function getDefaultStorage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function safeGetItem(
  key: string,
  storage: Pick<Storage, 'getItem'> | null = getDefaultStorage()
): string | null {
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(
  key: string,
  value: string,
  storage: Pick<Storage, 'setItem'> | null = getDefaultStorage()
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeRemoveItem(
  key: string,
  storage: Pick<Storage, 'removeItem'> | null = getDefaultStorage()
): void {
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    // Ignore storage removal errors
  }
}

export function safeGetJson<T>(
  key: string,
  fallback: T,
  storage: Pick<Storage, 'getItem'> | null = getDefaultStorage()
): T {
  const raw = safeGetItem(key, storage);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function safeSetJson(
  key: string,
  value: unknown,
  storage: Pick<Storage, 'setItem'> | null = getDefaultStorage()
): boolean {
  try {
    return safeSetItem(key, JSON.stringify(value), storage);
  } catch {
    return false;
  }
}

