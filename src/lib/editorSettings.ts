export const TS_HOVER_ENABLED_KEY = 'leitner_ts_hover_enabled';

/**
 * Returns whether TypeScript QuickInfo hover tooltips are enabled.
 * Defaults to true unless explicitly disabled by the user in Settings.
 */
export function getTsHoverEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(TS_HOVER_ENABLED_KEY) !== 'false';
  } catch {
    return true;
  }
}

/**
 * Persists the user's preference for TypeScript QuickInfo hover tooltips.
 */
export function setTsHoverEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TS_HOVER_ENABLED_KEY, String(enabled));
  } catch {
    /* ignore */
  }
}
