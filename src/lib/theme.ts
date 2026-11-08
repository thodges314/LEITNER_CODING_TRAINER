import { STORAGE_KEYS, safeGetItem, safeSetItem } from './storage';

export type AppTheme = 'dark' | 'apple-gsos';

export const THEME_STORAGE_KEY = STORAGE_KEYS.THEME;

export function getStoredTheme(): AppTheme {
  const saved = safeGetItem(THEME_STORAGE_KEY);
  if (saved === 'apple-gsos' || saved === 'dark') {
    return saved;
  }

  // Start up in dark mode by default unless the user's browser is explicitly set to light mode
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: light)').matches
  ) {
    return 'apple-gsos';
  }

  return 'dark'; // default to synthwave dark
}

export function setStoredTheme(theme: AppTheme): void {
  safeSetItem(THEME_STORAGE_KEY, theme);
  applyThemeToDocument(theme);
}

export function applyThemeToDocument(theme: AppTheme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
