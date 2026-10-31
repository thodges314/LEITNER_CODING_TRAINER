import { describe, expect, it } from 'vitest';
import seed from '../data/topics.json';
import {
  TRACK_ALIASES,
  TRACK_METADATA,
  isReactTrack,
  isTrackType,
  mergeStoredWithSeed,
  migrateTrackId,
  migrateTrackList,
  normalizeFilter,
  parseDeckBackup,
} from './leitner';
import type { LeitnerDeckState, TopicItem } from './leitner';

const cards = seed as unknown as TopicItem[];

describe('track consolidation: the seed deck', () => {
  it('every seed card sits in a known, labelled track', () => {
    for (const c of cards) {
      expect(isTrackType(c.track), `${c.id}: ${c.track}`).toBe(true);
      expect(TRACK_METADATA[c.track]?.label, c.id).toBeTruthy();
    }
  });

  it('there are exactly 12 tracks, and none of the retired ids is still in use', () => {
    const used = new Set<string>(cards.map((c) => c.track));
    expect([...used].sort()).toEqual(
      ['advanced-algorithms', 'algorithms', 'async-js', 'dom-browser', 'graphql', 'js-language', 'js-utilities', 'node', 'react', 'react-components', 'testing-tooling', 'typescript-patterns']
    );
    for (const retired of Object.keys(TRACK_ALIASES)) expect(used.has(retired), retired).toBe(false);
  });

  it('every concept (ladder) lives in exactly one track', () => {
    const tracksOf = new Map<string, Set<string>>();
    for (const c of cards) tracksOf.set(c.concept!, (tracksOf.get(c.concept!) ?? new Set()).add(c.track));
    const spanning = [...tracksOf].filter(([, s]) => s.size > 1).map(([concept, s]) => `${concept}: ${[...s].join(', ')}`);
    expect(spanning).toEqual([]);
  });

  it('hooks are in the react track and components in react-components', () => {
    const track = (id: string) => cards.find((c) => c.id === id)!.track;
    expect(track('use-local-storage-hook')).toBe('react');
    expect(track('use-debounce-hook')).toBe('react');
    expect(track('tabs-accordion-compound')).toBe('react-components');
    expect(track('stopwatch')).toBe('react-components');
    expect(track('debounce-implementation')).toBe('js-utilities');
    expect(track('ts-typed-event-emitter')).toBe('typescript-patterns');
  });
});

describe('track consolidation: migrating saved data', () => {
  it('maps a retired track to its primary successor and leaves everything else alone', () => {
    expect(migrateTrackId('react-patterns')).toBe('react');
    expect(migrateTrackId('async-web-plumbing')).toBe('async-js');
    expect(migrateTrackId('data-structures')).toBe('js-utilities');
    expect(migrateTrackId('algorithmic-screens')).toBe('algorithms');
    expect(migrateTrackId('react')).toBe('react');
    expect(migrateTrackId('toString')).toBe('toString');
    expect(migrateTrackId(undefined)).toBe(undefined);
  });

  it('includes expand to every successor, excludes use the primary only, without duplicates', () => {
    expect(migrateTrackList(['react-patterns', 'react', 'async-web-plumbing'], 'include')).toEqual(['react', 'react-components', 'async-js']);
    expect(migrateTrackList(['react-patterns', 'js-runtime-fundamentals'], 'exclude')).toEqual(['react', 'js-utilities']);
    expect(migrateTrackList([], 'include')).toEqual([]);
  });

  it('saved Focus filters and presets that name retired tracks keep working', () => {
    const f = normalizeFilter({ includeTracks: ['collections-transformations', 'react-patterns'], excludeTracks: ['algorithmic-screens'] });
    expect(f.includeTracks).toEqual(['js-utilities', 'react', 'react-components']);
    expect(f.excludeTracks).toEqual(['algorithms']);
  });

  it('a custom card saved under a retired track is moved to its successor on load', () => {
    const custom = { ...cards[0], id: 'my-own-card', track: 'data-structures' } as unknown as TopicItem;
    const stored = { ...({ topics: [custom], algorithm: 'graduated-interval' } as unknown as LeitnerDeckState) };
    const merged = mergeStoredWithSeed(stored, []);
    expect(merged.topics.find((t) => t.id === 'my-own-card')!.track).toBe('js-utilities');
  });

  it('an imported backup with retired tracks is migrated instead of falling back to algorithms', () => {
    const backup = JSON.stringify({
      algorithm: 'graduated-interval',
      topics: [
        { id: 'a', title: 'A', track: 'react-patterns', box: 1, streak: 0, nextEligibleTrial: 0, status: 'active', tags: [], promptSeed: '' },
        { id: 'b', title: 'B', track: 'async-web-plumbing', box: 1, streak: 0, nextEligibleTrial: 0, status: 'active', tags: [], promptSeed: '' },
      ],
    });
    const state = parseDeckBackup(backup);
    expect(state.topics.map((t) => t.track)).toEqual(['react', 'async-js']);
  });

  it('React starter hints apply to both React tracks', () => {
    expect(isReactTrack('react')).toBe(true);
    expect(isReactTrack('react-components')).toBe(true);
    expect(isReactTrack('js-language')).toBe(false);
  });
});
