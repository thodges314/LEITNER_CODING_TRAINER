// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from 'vitest';
import seed from '../data/topics.json';
import {
  BUILT_IN_DECKS,
  getBuiltInDeck,
  getBuiltInDecks,
  filterCardsByDeck,
  getDeckCardCount,
  getStoredActiveDeckId,
  setStoredActiveDeckId,
  getStoredCustomDecks,
  setStoredCustomDecks,
  ACTIVE_DECK_STORAGE_KEY,
  CUSTOM_DECKS_STORAGE_KEY,
} from './decks';
import type { TopicItem } from './leitner';

const cards = seed as unknown as TopicItem[];

describe('preset decks architecture', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('declares 4 built-in preset decks', () => {
    const decks = getBuiltInDecks();
    expect(decks.map((d) => d.id)).toEqual([
      'full-library',
      'full-stack',
      'frontend-specialist',
      'algorithms',
    ]);
  });

  it('Full Library contains all 319 seed cards', () => {
    const full = filterCardsByDeck(cards, 'full-library');
    expect(full).toHaveLength(319);
    expect(getDeckCardCount(BUILT_IN_DECKS[0], cards)).toBe(319);
  });

  it('Full-Stack Core contains 266 cards excluding advanced algorithms', () => {
    const fsDeck = filterCardsByDeck(cards, 'full-stack');
    expect(fsDeck).toHaveLength(266);
    for (const c of fsDeck) {
      expect(c.track).not.toBe('advanced-algorithms');
    }
  });

  it('Frontend Specialist contains 204 frontend cards and zero algorithm cards', () => {
    const fe = filterCardsByDeck(cards, 'frontend-specialist');
    expect(fe).toHaveLength(204);
    const tracks = new Set(fe.map((c) => c.track));
    expect(tracks.has('algorithms')).toBe(false);
    expect(tracks.has('advanced-algorithms')).toBe(false);
    expect(tracks.has('react')).toBe(true);
    expect(tracks.has('react-components')).toBe(true);
    expect(tracks.has('dom-browser')).toBe(true);
    expect(tracks.has('async-js')).toBe(true);
    expect(tracks.has('graphql')).toBe(true);
    expect(tracks.has('js-utilities')).toBe(true);
    expect(tracks.has('js-language')).toBe(true);
    expect(tracks.has('testing-tooling')).toBe(true);
    expect(tracks.has('typescript-patterns')).toBe(true);
  });

  it('Algorithms & Data Structures contains 96 cards (core + advanced + algorithmic utilities)', () => {
    const algo = filterCardsByDeck(cards, 'algorithms');
    expect(algo).toHaveLength(96);

    const coreCount = algo.filter((c) => c.track === 'algorithms').length;
    const advCount = algo.filter((c) => c.track === 'advanced-algorithms').length;
    const utilCount = algo.filter((c) => c.track === 'js-utilities').length;

    expect(coreCount).toBe(27);
    expect(advCount).toBe(53);
    expect(utilCount).toBe(16);
    expect(coreCount + advCount + utilCount).toBe(96);
  });

  it('aliases legacy core-algorithms and advanced-algorithms to unified algorithms deck', () => {
    expect(filterCardsByDeck(cards, 'core-algorithms')).toHaveLength(96);
    expect(filterCardsByDeck(cards, 'advanced-algorithms')).toHaveLength(96);
    expect(getBuiltInDeck('core-algorithms')?.id).toBe('algorithms');
    expect(getBuiltInDeck('advanced-algorithms')?.id).toBe('algorithms');
  });

  it('correctly filters cards by custom deck cardIds', () => {
    const customDecks = [
      {
        id: 'stripe-prep',
        name: 'Stripe Screen',
        cardIds: ['tabs-accordion-compound', 'two-sum-hashmap'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];
    const filtered = filterCardsByDeck(cards, 'stripe-prep', customDecks);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((c) => c.id).sort()).toEqual(['tabs-accordion-compound', 'two-sum-hashmap']);
    expect(getDeckCardCount(customDecks[0], cards)).toBe(2);
  });

  it('falls back to all cards for unknown deck id', () => {
    const filtered = filterCardsByDeck(cards, 'non-existent-deck');
    expect(filtered).toHaveLength(319);
  });

  it('handles getStoredActiveDeckId and setStoredActiveDeckId', () => {
    expect(getStoredActiveDeckId()).toBe('full-library');
    setStoredActiveDeckId('frontend-specialist');
    expect(localStorage.getItem(ACTIVE_DECK_STORAGE_KEY)).toBe('frontend-specialist');
    expect(getStoredActiveDeckId()).toBe('frontend-specialist');
  });

  it('handles getStoredCustomDecks and setStoredCustomDecks with validation', () => {
    expect(getStoredCustomDecks()).toEqual([]);
    const testDecks = [
      {
        id: 'test-1',
        name: 'My Custom Deck',
        cardIds: ['card-a', 'card-b'],
        createdAt: 1000,
        updatedAt: 1000,
      },
    ];
    setStoredCustomDecks(testDecks);
    expect(getStoredCustomDecks()).toEqual(testDecks);

    // Corrupt data fallback
    localStorage.setItem(CUSTOM_DECKS_STORAGE_KEY, 'invalid-json');
    expect(getStoredCustomDecks()).toEqual([]);
  });

  it('getBuiltInDeck returns deck preset or undefined', () => {
    expect(getBuiltInDeck('frontend-specialist')?.name).toBe('Frontend Specialist');
    expect(getBuiltInDeck('non-existent')).toBeUndefined();
  });
});
