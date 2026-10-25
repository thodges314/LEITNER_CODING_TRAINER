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
      'frontend-specialist',
      'core-algorithms',
      'advanced-algorithms',
    ]);
  });

  it('Full Library contains all 277 seed cards', () => {
    const full = filterCardsByDeck(cards, 'full-library');
    expect(full).toHaveLength(277);
    expect(getDeckCardCount(BUILT_IN_DECKS[0], cards)).toBe(277);
  });

  it('Frontend Specialist contains 197 frontend cards and zero algorithm cards', () => {
    const fe = filterCardsByDeck(cards, 'frontend-specialist');
    expect(fe).toHaveLength(197);
    const tracks = new Set(fe.map((c) => c.track));
    expect(tracks.has('algorithms')).toBe(false);
    expect(tracks.has('advanced-algorithms')).toBe(false);
    expect(tracks.has('react')).toBe(true);
    expect(tracks.has('react-components')).toBe(true);
    expect(tracks.has('dom-browser')).toBe(true);
    expect(tracks.has('async-js')).toBe(true);
    expect(tracks.has('js-utilities')).toBe(true);
    expect(tracks.has('js-language')).toBe(true);
    expect(tracks.has('testing-tooling')).toBe(true);
    expect(tracks.has('typescript-patterns')).toBe(true);
  });

  it('Core Algorithms contains exactly 27 practical algorithms cards', () => {
    const core = filterCardsByDeck(cards, 'core-algorithms');
    expect(core).toHaveLength(27);
    for (const c of core) {
      expect(c.track).toBe('algorithms');
    }
  });

  it('Advanced Algorithms contains exactly 53 academic CS cards', () => {
    const adv = filterCardsByDeck(cards, 'advanced-algorithms');
    expect(adv).toHaveLength(53);
    for (const c of adv) {
      expect(c.track).toBe('advanced-algorithms');
    }
  });

  it('the sum of specialized decks equals the total card count (197 + 27 + 53 = 277)', () => {
    const feCount = filterCardsByDeck(cards, 'frontend-specialist').length;
    const coreCount = filterCardsByDeck(cards, 'core-algorithms').length;
    const advCount = filterCardsByDeck(cards, 'advanced-algorithms').length;
    expect(feCount + coreCount + advCount).toBe(277);
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
    expect(filtered).toHaveLength(277);
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
