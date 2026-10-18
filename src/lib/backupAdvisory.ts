/**
 * Tracks completed problem sessions and triggers a one-time advisory modal
 * after completing 4 problems (scored reviews, excluding unscored reinforcement repeats)
 * reminding users that progress is saved in localStorage and recommending regular JSON exports.
 */

export const BACKUP_ADVISORY_THRESHOLD = 4;
export const STORAGE_KEY_PROBLEMS_COMPLETED = 'leitner_completed_problems_count';
export const STORAGE_KEY_ADVISORY_DISMISSED = 'leitner_backup_advisory_dismissed';

export function getCompletedProblemsCount(): number {
  if (typeof window === 'undefined' || !window.localStorage) return 0;
  const raw = window.localStorage.getItem(STORAGE_KEY_PROBLEMS_COMPLETED);
  const parsed = parseInt(raw ?? '', 10);
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

export function hasSeenBackupAdvisory(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  return window.localStorage.getItem(STORAGE_KEY_ADVISORY_DISMISSED) === '1';
}

export function recordProblemCompletion(): { count: number; shouldShowAdvisory: boolean } {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { count: 0, shouldShowAdvisory: false };
  }
  const current = getCompletedProblemsCount();
  const next = current + 1;
  try {
    window.localStorage.setItem(STORAGE_KEY_PROBLEMS_COMPLETED, String(next));
  } catch {
    // QuotaExceeded or disabled localStorage
  }

  const alreadyAdvised = hasSeenBackupAdvisory();
  const shouldShowAdvisory = next >= BACKUP_ADVISORY_THRESHOLD && !alreadyAdvised;

  return { count: next, shouldShowAdvisory };
}

export function markBackupAdvisorySeen(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY_ADVISORY_DISMISSED, '1');
  } catch {
    // QuotaExceeded or disabled localStorage
  }
}

export function resetBackupAdvisoryState(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY_PROBLEMS_COMPLETED);
    window.localStorage.removeItem(STORAGE_KEY_ADVISORY_DISMISSED);
  } catch {
    // QuotaExceeded or disabled localStorage
  }
}
