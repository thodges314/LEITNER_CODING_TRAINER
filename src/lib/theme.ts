export type AppTheme = 'dark' | 'apple-gsos';

export const THEME_STORAGE_KEY = 'leitner_theme';

export function getStoredTheme(): AppTheme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'apple-gsos' || saved === 'dark') {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'dark'; // default to synthwave dark
}

export function setStoredTheme(theme: AppTheme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }
  applyThemeToDocument(theme);
}

export function applyThemeToDocument(theme: AppTheme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
