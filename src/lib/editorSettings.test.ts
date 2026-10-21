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

  describe('preferredExecutionMode', () => {
    it('defaults to js when unset', async () => {
      const { getPreferredExecutionMode } = await import('./editorSettings');
      expect(getPreferredExecutionMode()).toBe('js');
    });

    it('persists preferred mode when changed', async () => {
      const { getPreferredExecutionMode, setPreferredExecutionMode } = await import('./editorSettings');
      setPreferredExecutionMode('ts');
      expect(getPreferredExecutionMode()).toBe('ts');
      setPreferredExecutionMode('js');
      expect(getPreferredExecutionMode()).toBe('js');
    });

    it('overrides to ts for typescript-patterns track without altering stored preference', async () => {
      const {
        getPreferredExecutionMode,
        setPreferredExecutionMode,
        resolveExecutionModeForCard,
      } = await import('./editorSettings');

      // User preference is js
      setPreferredExecutionMode('js');
      expect(getPreferredExecutionMode()).toBe('js');

      // Standard track resolves to preferred 'js'
      expect(resolveExecutionModeForCard({ track: 'algorithms' })).toBe('js');

      // TypeScript track overrides to 'ts'
      expect(resolveExecutionModeForCard({ track: 'typescript-patterns' })).toBe('ts');

      // Stored preference is completely untouched!
      expect(getPreferredExecutionMode()).toBe('js');

      // Reverts back to 'js' on next non-TS problem
      expect(resolveExecutionModeForCard({ track: 'async-js' })).toBe('js');
      expect(resolveExecutionModeForCard(null)).toBe('js');
    });

    it('respects user choice if user preferred mode is ts', async () => {
      const {
        setPreferredExecutionMode,
        resolveExecutionModeForCard,
      } = await import('./editorSettings');

      setPreferredExecutionMode('ts');
      expect(resolveExecutionModeForCard({ track: 'algorithms' })).toBe('ts');
      expect(resolveExecutionModeForCard({ track: 'typescript-patterns' })).toBe('ts');
    });
  });
});

