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

export type PreferredExecutionMode = 'js' | 'ts';
export const PREFERRED_EXECUTION_MODE_KEY = 'leitner_preferred_execution_mode';

/**
 * Returns the user's preferred default execution mode for non-TS tracks.
 * Defaults to 'js' unless the user explicitly switched to 'ts'.
 */
export function getPreferredExecutionMode(): PreferredExecutionMode {
  if (typeof window === 'undefined') return 'js';
  try {
    const val = localStorage.getItem(PREFERRED_EXECUTION_MODE_KEY);
    return val === 'ts' ? 'ts' : 'js';
  } catch {
    return 'js';
  }
}

/**
 * Persists the user's preferred default execution mode in localStorage.
 */
export function setPreferredExecutionMode(mode: PreferredExecutionMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREFERRED_EXECUTION_MODE_KEY, mode);
  } catch {
    /* ignore */
  }
}

/**
 * Resolves the effective execution mode for a card:
 * - Cards in 'typescript-patterns' are always overridden to 'ts' (without modifying the stored preference).
 * - All other cards use the user's stored preferred execution mode ('js' by default, or 'ts' if switched).
 */
export function resolveExecutionModeForCard(card: { track?: string } | null | undefined): PreferredExecutionMode {
  if (card?.track === 'typescript-patterns') {
    return 'ts';
  }
  return getPreferredExecutionMode();
}

