import { isTsOnlyCard } from './tsOnly';
import { STORAGE_KEYS, safeGetItem, safeSetItem } from './storage';

export const TS_HOVER_ENABLED_KEY = STORAGE_KEYS.TS_HOVER_ENABLED;

/**
 * Returns whether TypeScript QuickInfo hover tooltips are enabled.
 * Defaults to true unless explicitly disabled by the user in Settings.
 */
export function getTsHoverEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  return safeGetItem(TS_HOVER_ENABLED_KEY) !== 'false';
}

/**
 * Persists the user's preference for TypeScript QuickInfo hover tooltips.
 */
export function setTsHoverEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  safeSetItem(TS_HOVER_ENABLED_KEY, String(enabled));
}

export type PreferredExecutionMode = 'js' | 'ts';
export const PREFERRED_EXECUTION_MODE_KEY = STORAGE_KEYS.PREFERRED_EXECUTION_MODE;

/**
 * Returns the user's preferred default execution mode for non-TS tracks.
 * Defaults to 'js' unless the user explicitly switched to 'ts'.
 */
export function getPreferredExecutionMode(): PreferredExecutionMode {
  if (typeof window === 'undefined') return 'js';
  return safeGetItem(PREFERRED_EXECUTION_MODE_KEY) === 'ts' ? 'ts' : 'js';
}

/**
 * Persists the user's preferred default execution mode in localStorage.
 */
export function setPreferredExecutionMode(mode: PreferredExecutionMode): void {
  if (typeof window === 'undefined') return;
  safeSetItem(PREFERRED_EXECUTION_MODE_KEY, mode);
}

/**
 * Resolves the effective execution mode for a card:
 * - Cards in 'typescript-patterns' are always overridden to 'ts' (without modifying the stored preference).
 * - All other cards use the user's stored preferred execution mode ('js' by default, or 'ts' if switched).
 */
export function resolveExecutionModeForCard(
  card: { track?: string; inputLanguage?: string } | null | undefined
): PreferredExecutionMode {
  if (isTsOnlyCard(card)) {
    return 'ts';
  }
  if (card && 'inputLanguage' in card && card.inputLanguage && card.inputLanguage !== 'javascript') {
    return 'js';
  }
  return getPreferredExecutionMode();
}

