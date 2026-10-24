// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadDeckCatalogPreferences,
  saveDeckCatalogPreferences,
  clearDeckCatalogPreferences,
  DEFAULT_DECK_CATALOG_PREFERENCES,
  DECK_CATALOG_STORAGE_KEY,
} from './deckFilters';
import type { DeckCatalogPreferences } from './deckFilters';

describe('deckFilters catalog preferences persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default preferences when storage is empty', () => {
    const prefs = loadDeckCatalogPreferences();
    expect(prefs).toEqual(DEFAULT_DECK_CATALOG_PREFERENCES);
  });

  it('persists and restores valid custom preferences', () => {
    const custom: DeckCatalogPreferences = {
      selectedTracks: ['react-components', 'algorithms'],
      selectedBox: [2, 3],
      selectedStatus: 'active',
      selectedDifficulty: 4,
      sortOption: 'difficulty-desc',
      searchQuery: 'binary search',
    };

    saveDeckCatalogPreferences(custom);
    const loaded = loadDeckCatalogPreferences();
    expect(loaded).toEqual(custom);
  });

  it('sanitizes invalid or malformed data in storage', () => {
    localStorage.setItem(
      DECK_CATALOG_STORAGE_KEY,
      JSON.stringify({
        selectedTracks: ['valid-track', 123, ''],
        selectedBox: -5,
        selectedStatus: 'non-existent-status',
        selectedDifficulty: 99,
        sortOption: 'invalid-sort',
        searchQuery: 42,
      })
    );

    const loaded = loadDeckCatalogPreferences();
    expect(loaded.selectedTracks).toEqual(['all']);
    expect(loaded.selectedBox).toBe('all');
    expect(loaded.selectedStatus).toBe('all');
    expect(loaded.selectedDifficulty).toBe('all');
    expect(loaded.sortOption).toBe('track-asc');
    expect(loaded.searchQuery).toBe('');
  });

  it('handles single number box and array of box numbers', () => {
    saveDeckCatalogPreferences({
      ...DEFAULT_DECK_CATALOG_PREFERENCES,
      selectedBox: 5,
    });
    expect(loadDeckCatalogPreferences().selectedBox).toBe(5);

    saveDeckCatalogPreferences({
      ...DEFAULT_DECK_CATALOG_PREFERENCES,
      selectedBox: [1, 5],
    });
    expect(loadDeckCatalogPreferences().selectedBox).toEqual([1, 5]);
  });

  it('clears preferences from storage', () => {
    saveDeckCatalogPreferences({
      ...DEFAULT_DECK_CATALOG_PREFERENCES,
      searchQuery: 'test',
    });
    expect(localStorage.getItem(DECK_CATALOG_STORAGE_KEY)).toBeTruthy();

    clearDeckCatalogPreferences();
    expect(localStorage.getItem(DECK_CATALOG_STORAGE_KEY)).toBeNull();
    expect(loadDeckCatalogPreferences()).toEqual(DEFAULT_DECK_CATALOG_PREFERENCES);
  });

  it('gracefully handles throwing storage operations', () => {
    const throwingStorage = {
      getItem: () => {
        throw new Error('Access denied');
      },
      setItem: () => {
        throw new Error('Quota exceeded');
      },
      removeItem: () => {
        throw new Error('Access denied');
      },
      clear: () => {},
      key: () => null,
      length: 0,
    } as unknown as Storage;

    expect(() => saveDeckCatalogPreferences(DEFAULT_DECK_CATALOG_PREFERENCES, throwingStorage)).not.toThrow();
    expect(loadDeckCatalogPreferences(throwingStorage)).toEqual(DEFAULT_DECK_CATALOG_PREFERENCES);
    expect(() => clearDeckCatalogPreferences(throwingStorage)).not.toThrow();
  });
});
