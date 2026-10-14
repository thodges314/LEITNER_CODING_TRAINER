// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  STORAGE_KEY,
  setPracticeFilter,
  cardMatchesFilter,
  deletePreset,
  EMPTY_FILTER,
  getNextCard,
  isFilterActive,
  mergeStoredWithSeed,
  normalizeFilter,
  parseDeckBackup,
  savePreset,
} from './leitner';
import type { LeitnerDeckState, TopicItem } from './leitner';

const card = (id: string, track: TopicItem['track'], tags: string[], extra: Partial<TopicItem> = {}): TopicItem => ({
  id,
  track,
  title: id,
  box: 1,
  streak: 0,
  nextEligibleTrial: 0,
  status: 'active',
  tags,
  promptSeed: '',
  ...extra,
});

const topics = [
  card('a', 'react', ['hooks', 'state']),
  card('b', 'algorithms', ['graph']),
  card('c', 'react-components', ['a11y', 'state']),
  card('d', 'algorithms', ['dp'], { status: 'locked' }),
];

describe('practice filter', () => {
  it('an empty filter matches everything', () => {
    expect(isFilterActive(EMPTY_FILTER)).toBe(false);
    expect(topics.every((t) => cardMatchesFilter(t, EMPTY_FILTER))).toBe(true);
  });

  it('include tracks / tags narrow the pool, excludes always win', () => {
    const f = { ...EMPTY_FILTER, includeTracks: ['react', 'react-components'] };
    expect(topics.filter((t) => cardMatchesFilter(t, f)).map((t) => t.id)).toEqual(['a', 'c']);
    expect(topics.filter((t) => cardMatchesFilter(t, { ...f, excludeTags: ['a11y'] })).map((t) => t.id)).toEqual(['a']);
    expect(topics.filter((t) => cardMatchesFilter(t, { ...EMPTY_FILTER, includeTags: ['state'] })).map((t) => t.id)).toEqual(['a', 'c']);
    expect(topics.filter((t) => cardMatchesFilter(t, { ...EMPTY_FILTER, excludeTracks: ['algorithms'] })).map((t) => t.id)).toEqual(['a', 'c']);
  });

  it('getNextCard only schedules matching active cards, and returns null when none match', () => {
    const f = { ...EMPTY_FILTER, includeTracks: ['algorithms'] };
    expect(getNextCard(topics, 0, undefined, undefined, f)?.id).toBe('b'); // d is locked
    expect(getNextCard(topics, 0, undefined, undefined, { ...EMPTY_FILTER, includeTags: ['nope'] })).toBeNull();
  });

  it('presets save, overwrite and delete; filters survive merge and backup parsing', () => {
    const state: LeitnerDeckState = { topics, totalCompletedReviews: 0 };
    const f = { ...EMPTY_FILTER, includeTracks: ['react'] };
    const withPreset = savePreset({ ...state, practiceFilter: f }, '  React screen ', f);
    expect(Object.keys(withPreset.filterPresets ?? {})).toEqual(['React screen']);
    expect(Object.keys(deletePreset(withPreset, 'React screen').filterPresets ?? {})).toEqual([]);
    const merged = mergeStoredWithSeed(withPreset, []);
    expect(merged.practiceFilter).toEqual(f);
    expect(merged.filterPresets?.['React screen']).toEqual(f);
    const parsed = parseDeckBackup(JSON.stringify(withPreset));
    expect(parsed.practiceFilter).toEqual(f);
    expect(parsed.filterPresets?.['React screen']).toEqual(f);
  });

  it('setPracticeFilter and presets are persisted to localStorage', () => {
    localStorage.clear();
    const state: LeitnerDeckState = { topics, totalCompletedReviews: 0 };
    const f = { ...EMPTY_FILTER, excludeTags: ['graph'] };
    const next = savePreset(setPracticeFilter(state, f), 'No graphs', f);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(stored.practiceFilter).toEqual(f);
    expect(stored.filterPresets['No graphs']).toEqual(f);
    expect(next.practiceFilter).toEqual(f);
  });

  it('difficulty range filters cards (unset difficulty counts as 3)', () => {
    const cards = [card('e', 'react', [], { difficulty: 1 }), card('m', 'react', []), card('h', 'react', [], { difficulty: 5 })];
    const ids = (f: Parameters<typeof cardMatchesFilter>[1]) => cards.filter((c) => cardMatchesFilter(c, f)).map((c) => c.id);
    expect(ids({ ...EMPTY_FILTER, maxDifficulty: 2 })).toEqual(['e']);
    expect(ids({ ...EMPTY_FILTER, minDifficulty: 3 })).toEqual(['m', 'h']);
    expect(ids({ ...EMPTY_FILTER, minDifficulty: 2, maxDifficulty: 4 })).toEqual(['m']);
    expect(isFilterActive({ ...EMPTY_FILTER, maxDifficulty: 2 })).toBe(true);
    expect(normalizeFilter({ minDifficulty: 9, maxDifficulty: '4' })).toEqual({ ...EMPTY_FILTER, maxDifficulty: 4 });
  });

  it('normalizeFilter tolerates junk', () => {
    expect(normalizeFilter(null)).toEqual(EMPTY_FILTER);
    expect(normalizeFilter({ includeTracks: 'x', excludeTags: ['a', 'a', 1] })).toEqual({ ...EMPTY_FILTER, excludeTags: ['a', '1'] });
  });
});
