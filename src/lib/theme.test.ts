// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getStoredTheme, setStoredTheme, THEME_STORAGE_KEY } from './theme';

describe('theme management', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.restoreAllMocks();
  });

  it('defaults to dark mode when no theme is saved and matchMedia light does not match', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    expect(getStoredTheme()).toBe('dark');
  });

  it('defaults to apple-gsos (light mode) when no theme is saved and browser prefers light mode', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: light)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    expect(getStoredTheme()).toBe('apple-gsos');
  });

  it('honors explicitly saved dark theme even if browser prefers light', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: true,
      media: '(prefers-color-scheme: light)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    expect(getStoredTheme()).toBe('dark');
  });

  it('honors explicitly saved apple-gsos theme even if browser prefers dark', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'apple-gsos');
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      media: '(prefers-color-scheme: light)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    expect(getStoredTheme()).toBe('apple-gsos');
  });

  it('sets stored theme in localStorage and applies data-theme attribute to document', () => {
    setStoredTheme('apple-gsos');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('apple-gsos');
    expect(document.documentElement.getAttribute('data-theme')).toBe('apple-gsos');

    setStoredTheme('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
