/**
 * Keyboard shortcuts shown in the UI (tooltips and the Settings list). The handlers live in PracticeArena;
 * keep this table in sync with them. The key labels adapt to the user's platform (Mac symbols vs. Ctrl/Alt).
 */
export type Platform = 'mac' | 'other';
export type ShortcutId = 'run' | 'submit' | 'format';

interface NavigatorLike {
  platform?: string;
  userAgent?: string;
  userAgentData?: { platform?: string };
}

/** Mac, iPhone and iPad all use the Mac glyphs; everything else gets Ctrl/Alt/Shift names. */
export function detectPlatform(nav: NavigatorLike | null | undefined = typeof navigator !== 'undefined' ? navigator : undefined): Platform {
  const source = nav?.userAgentData?.platform || nav?.platform || nav?.userAgent || '';
  return /mac|iphone|ipad|ipod/i.test(source) ? 'mac' : 'other';
}

interface ShortcutDef {
  label: string;
  /** Primary key combination per platform (what the tooltip shows). */
  mac: string[];
  other: string[];
  /** Other combination that also works, shown in the Settings list. */
  alt?: { mac: string[]; other: string[] };
  /** Value for `aria-keyshortcuts` (spec syntax: Control+Enter, Meta+Enter ...). */
  aria: string;
}

export const SHORTCUTS: Record<ShortcutId, ShortcutDef> = {
  run: { label: 'Run tests', mac: ['⌘', '↵'], other: ['Ctrl', 'Enter'], aria: 'Control+Enter Meta+Enter' },
  submit: {
    label: 'Submit for evaluation',
    mac: ['⌘', '⇧', '↵'],
    other: ['Ctrl', 'Shift', 'Enter'],
    aria: 'Control+Shift+Enter Meta+Shift+Enter',
  },
  format: {
    label: 'Format code',
    mac: ['⇧', '⌥', 'F'],
    other: ['Shift', 'Alt', 'F'],
    alt: { mac: ['⌘', '⇧', 'F'], other: ['Ctrl', 'Shift', 'F'] },
    aria: 'Shift+Alt+F Control+Shift+F Meta+Shift+F',
  },
};

export const SHORTCUT_ORDER: ShortcutId[] = ['run', 'submit', 'format'];

/** Mac glyphs are written together (⌘⇧↵); named keys are joined with + (Ctrl+Shift+Enter). */
export function formatKeys(keys: string[], platform: Platform): string {
  return platform === 'mac' ? keys.join('') : keys.join('+');
}

export function shortcutKeys(id: ShortcutId, platform: Platform): string[] {
  return SHORTCUTS[id][platform];
}

export function shortcutKeyText(id: ShortcutId, platform: Platform): string {
  return formatKeys(shortcutKeys(id, platform), platform);
}

/** Tooltip text, e.g. "Run tests (⌘↵)" or "Run tests (Ctrl+Enter)". */
export function shortcutTooltip(id: ShortcutId, platform: Platform): string {
  return `${SHORTCUTS[id].label} (${shortcutKeyText(id, platform)})`;
}

let cachedPlatform: Platform | undefined;
/** The platform of the current browser, detected once. */
export function currentPlatform(): Platform {
  cachedPlatform ??= detectPlatform();
  return cachedPlatform;
}

/** Attributes for a button that has a shortcut: a visible tooltip (hover and keyboard focus) and `aria-keyshortcuts`. */
export function shortcutAttrs(id: ShortcutId, platform: Platform = currentPlatform()): { 'data-shortcut': string; 'aria-keyshortcuts': string } {
  return { 'data-shortcut': shortcutTooltip(id, platform), 'aria-keyshortcuts': SHORTCUTS[id].aria };
}
