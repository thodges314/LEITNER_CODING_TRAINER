import { describe, it, expect } from 'vitest';
import {
  CURRENT_DECK_VERSION,
  migrateDeckState,
  migrateV1ToV2,
  migrateV2ToV3,
  migrateTrackId,
  migrateTrackList,
} from './deckMigrations';
import { mergeStoredWithSeed, parseDeckBackup, getDefaultDeckState } from './leitner';
import type { TopicItem, LeitnerDeckState } from './leitner';

describe('deckMigrations', () => {
  it('defines CURRENT_DECK_VERSION as 3', () => {
    expect(CURRENT_DECK_VERSION).toBe(3);
  });

  describe('migrateTrackId & migrateTrackList', () => {
    it('migrates legacy retired track names to primary successors', () => {
      expect(migrateTrackId('react-patterns')).toBe('react');
      expect(migrateTrackId('async-web-plumbing')).toBe('async-js');
      expect(migrateTrackId('js-runtime-fundamentals')).toBe('js-utilities');
      expect(migrateTrackId('collections-transformations')).toBe('js-utilities');
      expect(migrateTrackId('data-structures')).toBe('js-utilities');
      expect(migrateTrackId('algorithmic-screens')).toBe('algorithms');
      expect(migrateTrackId('algorithms-advanced')).toBe('advanced-algorithms');
      expect(migrateTrackId('algorithms')).toBe('algorithms');
    });

    it('expands track list in include mode and uses primary in exclude mode', () => {
      expect(migrateTrackList(['react-patterns'], 'include')).toEqual(['react', 'react-components']);
      expect(migrateTrackList(['react-patterns'], 'exclude')).toEqual(['react']);
    });
  });

  describe('migrateV1ToV2', () => {
    it('migrates tracks, retired packs, and filters, and removes retired seed cards', () => {
      const v1State = {
        totalCompletedReviews: 10,
        topics: [
          { id: 'custom-1', track: 'react-patterns', title: 'Old React Card' },
          { id: 'custom-2', track: 'algorithms', pack: 'algorithms-advanced', title: 'Old Pack Card' },
          { id: 'hook-use-debounce', track: 'react', title: 'Retired Duplicate Card' },
        ],
        practiceFilter: {
          includeTracks: ['react-patterns', 'async-web-plumbing'],
          excludeTracks: ['algorithmic-screens'],
        },
        filterPresets: {
          myPreset: {
            includeTracks: ['collections-transformations'],
            excludeTracks: [],
          },
        },
      };

      const v2 = migrateV1ToV2(v1State);
      expect(v2.deckVersion).toBe(2);

      const topics = v2.topics as Array<Record<string, unknown>>;
      expect(topics).toHaveLength(2);
      expect(topics[0].track).toBe('react');
      expect(topics[1].track).toBe('advanced-algorithms');
      expect(topics[1].pack).toBeUndefined();

      const filter = v2.practiceFilter as { includeTracks: string[]; excludeTracks: string[] };
      expect(filter.includeTracks).toEqual(['react', 'react-components', 'async-js']);
      expect(filter.excludeTracks).toEqual(['algorithms']);

      const presets = v2.filterPresets as Record<string, { includeTracks: string[] }>;
      expect(presets.myPreset.includeTracks).toEqual(['js-utilities']);
    });
  });

  describe('migrateV2ToV3', () => {
    it('splits graphql server cards from client cards and updates practice filter', () => {
      const v2State = {
        deckVersion: 2,
        totalCompletedReviews: 25,
        topics: [
          { id: 'gql-query-nested-fields', track: 'graphql', title: 'Client Query' },
          { id: 'graphql-nested-field-resolvers', track: 'graphql', title: 'Server Resolver' },
          { id: 'graphql-dataloader-batching', track: 'graphql', title: 'Server Dataloader' },
          { id: 'two-sum', track: 'algorithms', title: 'Two Sum' },
        ],
        practiceFilter: {
          includeTracks: ['graphql', 'algorithms'],
          excludeTracks: [],
        },
        filterPresets: {
          graphqlPreset: {
            includeTracks: ['graphql'],
            excludeTracks: [],
          },
        },
      };

      const v3 = migrateV2ToV3(v2State);
      expect(v3.deckVersion).toBe(3);

      const topics = v3.topics as Array<Record<string, unknown>>;
      expect(topics[0].track).toBe('graphql');
      expect(topics[1].track).toBe('graphql-server');
      expect(topics[2].track).toBe('graphql-server');
      expect(topics[3].track).toBe('algorithms');

      const filter = v3.practiceFilter as { includeTracks: string[] };
      expect(filter.includeTracks).toEqual(['graphql', 'algorithms', 'graphql-server']);

      const presets = v3.filterPresets as Record<string, { includeTracks: string[] }>;
      expect(presets.graphqlPreset.includeTracks).toEqual(['graphql', 'graphql-server']);
    });

    it('caps recent reviews to 20 valid items and sanitizes algorithm', () => {
      const longReviews = Array.from({ length: 30 }, (_, i) => ({
        topicId: `card-${i}`,
        passed: i % 2 === 0,
        box: 1,
        trial: i,
      }));

      const v2State = {
        deckVersion: 2,
        algorithm: 'invalid-algo',
        recentReviews: longReviews,
        topics: [],
      };

      const v3 = migrateV2ToV3(v2State);
      expect(v3.deckVersion).toBe(3);
      expect(v3.algorithm).toBeUndefined();
      expect((v3.recentReviews as unknown[]).length).toBe(20);
    });
  });

  describe('migrateDeckState sequential runner', () => {
    it('sequentially upgrades unversioned (v1) state to v3', () => {
      const unversioned = {
        totalCompletedReviews: 5,
        topics: [
          { id: 'custom-pack', track: 'algorithms', pack: 'algorithms-advanced', title: 'Legacy' },
          { id: 'graphql-dataloader-batching', track: 'graphql', title: 'Server DL' },
        ],
        practiceFilter: {
          includeTracks: ['react-patterns', 'graphql'],
        },
      };

      const v3 = migrateDeckState(unversioned);
      expect(v3.deckVersion).toBe(3);
      expect(v3.topics[0].track).toBe('advanced-algorithms');
      expect(v3.topics[0].pack).toBeUndefined();
      expect(v3.topics[1].track).toBe('graphql-server');
      expect(v3.practiceFilter?.includeTracks).toContain('graphql-server');
      expect(v3.practiceFilter?.includeTracks).toContain('react');
      expect(v3.practiceFilter?.includeTracks).toContain('react-components');
    });

    it('upgrades v2 state directly to v3', () => {
      const v2 = {
        deckVersion: 2,
        totalCompletedReviews: 12,
        topics: [{ id: 'graphql-context-auth-guard', track: 'graphql', title: 'Auth' }],
      };

      const v3 = migrateDeckState(v2);
      expect(v3.deckVersion).toBe(3);
      expect(v3.topics[0].track).toBe('graphql-server');
    });

    it('leaves v3 state untouched', () => {
      const v3Original: LeitnerDeckState = {
        deckVersion: 3,
        totalCompletedReviews: 15,
        topics: [{ id: 'test', track: 'graphql-server', title: 'Server', box: 1, streak: 0, nextEligibleTrial: 0, status: 'active', tags: [], promptSeed: '' }],
      };

      const migrated = migrateDeckState(v3Original);
      expect(migrated.deckVersion).toBe(3);
      expect(migrated.topics[0].track).toBe('graphql-server');
    });

    it('handles null and undefined gracefully', () => {
      expect(migrateDeckState(null).deckVersion).toBe(3);
      expect(migrateDeckState(undefined).deckVersion).toBe(3);
      expect(migrateDeckState({}).deckVersion).toBe(3);
    });
  });

  describe('integration with getDefaultDeckState, mergeStoredWithSeed, and parseDeckBackup', () => {
    it('getDefaultDeckState sets deckVersion to CURRENT_DECK_VERSION', () => {
      const defaultState = getDefaultDeckState([]);
      expect(defaultState.deckVersion).toBe(3);
    });

    it('mergeStoredWithSeed migrates legacy stored deck on load and sets deckVersion to 3', () => {
      const legacyStored: LeitnerDeckState = {
        totalCompletedReviews: 2,
        topics: [
          {
            id: 'graphql-context-auth-guard',
            track: 'graphql' as TopicItem['track'],
            title: 'Auth',
            box: 2,
            streak: 1,
            nextEligibleTrial: 3,
            status: 'active',
            tags: [],
            promptSeed: '',
          },
        ],
      };

      const seedTopic: TopicItem = {
        id: 'graphql-context-auth-guard',
        track: 'graphql-server',
        title: 'Auth Guard',
        box: 1,
        streak: 0,
        nextEligibleTrial: 0,
        status: 'active',
        tags: [],
        promptSeed: 'Write auth guard',
      };

      const merged = mergeStoredWithSeed(legacyStored, [seedTopic]);
      expect(merged.deckVersion).toBe(3);
      expect(merged.topics[0].track).toBe('graphql-server');
      expect(merged.topics[0].box).toBe(2); // user progress preserved
      expect(merged.topics[0].streak).toBe(1);
    });

    it('parseDeckBackup migrates unversioned backup JSON to version 3', () => {
      const unversionedBackup = JSON.stringify({
        totalCompletedReviews: 4,
        topics: [
          {
            id: 'card-1',
            track: 'react-patterns',
            title: 'Patterns',
            box: 1,
            streak: 0,
            nextEligibleTrial: 0,
            status: 'active',
          },
          {
            id: 'graphql-context-auth-guard',
            track: 'graphql',
            title: 'Server Auth',
            box: 2,
            streak: 1,
            nextEligibleTrial: 4,
            status: 'active',
          },
        ],
      });

      const parsed = parseDeckBackup(unversionedBackup);
      expect(parsed.deckVersion).toBe(3);
      expect(parsed.topics[0].track).toBe('react');
      expect(parsed.topics[1].track).toBe('graphql-server');
    });
  });
});
