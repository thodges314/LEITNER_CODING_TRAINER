export const TIMED_MODE_ENABLED_KEY = 'leitner_timed_mode';
export const TIMED_MODE_DURATION_KEY = 'leitner_timed_duration';

export const DEFAULT_TIMED_DURATION = 10 * 60; // 600 seconds = 10 minutes

export const DURATION_OPTIONS = [
  { label: '5 min', seconds: 5 * 60 },
  { label: '10 min (Default)', seconds: 10 * 60 },
  { label: '15 min', seconds: 15 * 60 },
  { label: '20 min', seconds: 20 * 60 },
] as const;

export function getTimedModeEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(TIMED_MODE_ENABLED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setTimedModeEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TIMED_MODE_ENABLED_KEY, String(enabled));
  } catch {
    /* ignore */
  }
}

export function getTimedModeDuration(): number {
  if (typeof window === 'undefined') return DEFAULT_TIMED_DURATION;
  try {
    const raw = localStorage.getItem(TIMED_MODE_DURATION_KEY);
    const parsed = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMED_DURATION;
  } catch {
    return DEFAULT_TIMED_DURATION;
  }
}

export function setTimedModeDuration(seconds: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TIMED_MODE_DURATION_KEY, String(seconds));
  } catch {
    /* ignore */
  }
}
