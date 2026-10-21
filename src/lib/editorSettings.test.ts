// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { getTsHoverEnabled, setTsHoverEnabled, TS_HOVER_ENABLED_KEY } from './editorSettings';

describe('editorSettings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to true when unset', () => {
    expect(getTsHoverEnabled()).toBe(true);
  });

  it('can be disabled and persisted', () => {
    setTsHoverEnabled(false);
    expect(localStorage.getItem(TS_HOVER_ENABLED_KEY)).toBe('false');
    expect(getTsHoverEnabled()).toBe(false);
  });

  it('can be re-enabled', () => {
    setTsHoverEnabled(false);
    expect(getTsHoverEnabled()).toBe(false);
    setTsHoverEnabled(true);
    expect(localStorage.getItem(TS_HOVER_ENABLED_KEY)).toBe('true');
    expect(getTsHoverEnabled()).toBe(true);
  });
});
