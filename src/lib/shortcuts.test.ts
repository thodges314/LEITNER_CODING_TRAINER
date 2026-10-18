import { describe, expect, it } from 'vitest';
import { SHORTCUT_ORDER, SHORTCUTS, detectPlatform, formatKeys, shortcutAttrs, shortcutKeyText, shortcutTooltip } from './shortcuts';

describe('detectPlatform', () => {
  it('detects Mac from userAgentData, platform and user agent', () => {
    expect(detectPlatform({ userAgentData: { platform: 'macOS' } })).toBe('mac');
    expect(detectPlatform({ platform: 'MacIntel' })).toBe('mac');
    expect(detectPlatform({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15' })).toBe('mac');
    expect(detectPlatform({ platform: 'iPhone' })).toBe('mac');
    expect(detectPlatform({ userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)' })).toBe('mac');
  });
  it('treats Windows, Linux, Android and unknown as non-Mac', () => {
    expect(detectPlatform({ userAgentData: { platform: 'Windows' } })).toBe('other');
    expect(detectPlatform({ platform: 'Win32' })).toBe('other');
    expect(detectPlatform({ platform: 'Linux x86_64' })).toBe('other');
    expect(detectPlatform({ userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)' })).toBe('other');
    expect(detectPlatform({})).toBe('other');
    expect(detectPlatform(null)).toBe('other');
  });
  it('prefers userAgentData over the deprecated platform string', () => {
    expect(detectPlatform({ userAgentData: { platform: 'Windows' }, platform: 'MacIntel' })).toBe('other');
  });
});

describe('shortcut labels', () => {
  it('writes Mac glyphs together and named keys with +', () => {
    expect(formatKeys(['⌘', '⇧', '↵'], 'mac')).toBe('⌘⇧↵');
    expect(formatKeys(['Ctrl', 'Shift', 'Enter'], 'other')).toBe('Ctrl+Shift+Enter');
  });
  it('matches the real handlers: run = Cmd/Ctrl+Enter, submit adds Shift, format = Shift+Alt+F', () => {
    expect(shortcutKeyText('run', 'mac')).toBe('⌘↵');
    expect(shortcutKeyText('run', 'other')).toBe('Ctrl+Enter');
    expect(shortcutKeyText('submit', 'mac')).toBe('⌘⇧↵');
    expect(shortcutKeyText('submit', 'other')).toBe('Ctrl+Shift+Enter');
    expect(shortcutKeyText('format', 'mac')).toBe('⇧⌥F');
    expect(shortcutKeyText('format', 'other')).toBe('Shift+Alt+F');
  });
  it('builds tooltip text and button attributes', () => {
    expect(shortcutTooltip('run', 'other')).toBe('Run tests (Ctrl+Enter)');
    expect(shortcutAttrs('submit', 'mac')).toEqual({
      'data-shortcut': 'Submit for evaluation (⌘⇧↵)',
      'aria-keyshortcuts': 'Control+Shift+Enter Meta+Shift+Enter',
    });
  });
  it('lists every shortcut once, with an alternative only where one exists', () => {
    expect(SHORTCUT_ORDER).toEqual(['run', 'submit', 'format']);
    expect(Object.keys(SHORTCUTS).sort()).toEqual([...SHORTCUT_ORDER].sort());
    expect(SHORTCUTS.format.alt?.mac).toEqual(['⌘', '⇧', 'F']);
    expect(SHORTCUTS.run.alt).toBeUndefined();
  });
});
