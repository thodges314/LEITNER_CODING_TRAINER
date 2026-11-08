import { STORAGE_KEYS, safeGetItem, safeSetItem, safeRemoveItem } from './storage';

/**
 * Tracks completed problem sessions and triggers a one-time advisory modal
 * after completing 4 problems (scored reviews, excluding unscored reinforcement repeats)
 * reminding users that progress is saved in localStorage and recommending regular JSON exports.
 */

export const BACKUP_ADVISORY_THRESHOLD = 4;
export const STORAGE_KEY_PROBLEMS_COMPLETED = STORAGE_KEYS.PROBLEMS_COMPLETED;
export const STORAGE_KEY_ADVISORY_DISMISSED = STORAGE_KEYS.ADVISORY_DISMISSED;

export function getCompletedProblemsCount(): number {
  if (typeof window === 'undefined') return 0;
  const raw = safeGetItem(STORAGE_KEY_PROBLEMS_COMPLETED);
  const parsed = parseInt(raw ?? '', 10);
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

export function hasSeenBackupAdvisory(): boolean {
  if (typeof window === 'undefined') return false;
  return safeGetItem(STORAGE_KEY_ADVISORY_DISMISSED) === '1';
}

export function recordProblemCompletion(): { count: number; shouldShowAdvisory: boolean } {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { count: 0, shouldShowAdvisory: false };
  }
  const current = getCompletedProblemsCount();
  const next = current + 1;
  safeSetItem(STORAGE_KEY_PROBLEMS_COMPLETED, String(next));

  const alreadyAdvised = hasSeenBackupAdvisory();
  const shouldShowAdvisory = next >= BACKUP_ADVISORY_THRESHOLD && !alreadyAdvised;

  return { count: next, shouldShowAdvisory };
}

export function markBackupAdvisorySeen(): void {
  if (typeof window === 'undefined') return;
  safeSetItem(STORAGE_KEY_ADVISORY_DISMISSED, '1');
}

export function resetBackupAdvisoryState(): void {
  if (typeof window === 'undefined') return;
  safeRemoveItem(STORAGE_KEY_PROBLEMS_COMPLETED);
  safeRemoveItem(STORAGE_KEY_ADVISORY_DISMISSED);
}
