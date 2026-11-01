import type { TrackType, PracticeFilter, LeitnerDeckState, ReviewHistoryEntry } from './leitner';

export const CURRENT_DECK_VERSION = 4;

/**
 * Tracks that were merged or consolidated. Saved Focus filters and custom cards may still name them.
 * The first successor is the "primary" one: includes expand to every successor, excludes use the primary only
 * (so a saved exclude never hides more than it used to).
 */
export const TRACK_ALIASES: Record<string, TrackType[]> = {
  'react-patterns': ['react', 'react-components'],
  'async-web-plumbing': ['async-js'],
  'js-runtime-fundamentals': ['js-utilities', 'js-language'],
  'collections-transformations': ['js-utilities'],
  'data-structures': ['js-utilities'],
  'algorithmic-screens': ['algorithms'],
  'algorithms-advanced': ['advanced-algorithms'],
};

/**
 * Seed cards that were removed as duplicates of a better card. Saved decks drop them on load so they do not linger as
 * orphan "custom" cards. Never reuse one of these ids.
 */
export const RETIRED_SEED_IDS: ReadonlySet<string> = new Set([
  'hook-fetch-cleanup',
  'infinite-scroll-observer',
  'sliding-window-dynamic',
  'tree-level-order-bfs',
  'hook-use-debounce',
  'event-loop-microtasks',
  'currying-function',
  'interval-merge-sliding-window',
]);

/** Server GraphQL card IDs that split from the unified 'graphql' track into 'graphql-server'. */
export const GRAPHQL_SERVER_CARD_IDS: ReadonlySet<string> = new Set([
  'graphql-relay-connection-builder',
  'graphql-variable-validator',
  'graphql-query-complexity-calculator',
  'graphql-dataloader-batching',
  'graphql-nested-field-resolvers',
  'graphql-input-object-sanitizer',
  'graphql-discriminated-union-resolver',
  'graphql-format-error-masking',
  'graphql-sdl-type-generator',
  'graphql-extract-operation-name',
  'graphql-mini-client',
  'graphql-cursor-pagination-extractor',
  'graphql-schema-stitching-merger',
  'graphql-context-auth-guard',
]);

/** Maps a (possibly retired) track id to a current one; anything else is returned unchanged. */
export function migrateTrackId<T>(track: T): T | TrackType {
  if (typeof track === 'string' && Object.prototype.hasOwnProperty.call(TRACK_ALIASES, track)) {
    return TRACK_ALIASES[track][0];
  }
  return track;
}

export function migrateTrackList(list: string[], mode: 'include' | 'exclude'): string[] {
  const out: string[] = [];
  for (const id of list) {
    const successors = Object.prototype.hasOwnProperty.call(TRACK_ALIASES, id) ? TRACK_ALIASES[id] : null;
    const mapped = successors ? (mode === 'include' ? successors : [successors[0]]) : [id];
    for (const m of mapped) {
      if (!out.includes(m)) out.push(m);
    }
  }
  return out;
}

function migrateFilterTracks(filter: PracticeFilter): PracticeFilter {
  return {
    ...filter,
    includeTracks: filter.includeTracks ? migrateTrackList(filter.includeTracks, 'include') : [],
    excludeTracks: filter.excludeTracks ? migrateTrackList(filter.excludeTracks, 'exclude') : [],
  };
}

/**
 * Migration v1 -> v2:
 * - Normalizes legacy track aliases (e.g. 'react-patterns' -> 'react', 'collections-transformations' -> 'js-utilities').
 * - Migrates pack: 'algorithms-advanced' into track: 'advanced-algorithms'.
 * - Expands/migrates practiceFilter and filterPresets.
 * - Drops permanently retired seed cards (RETIRED_SEED_IDS).
 * - Upgrades schema version to 2.
 */
export function migrateV1ToV2(state: Record<string, unknown>): Record<string, unknown> {
  const rawTopics = Array.isArray(state.topics) ? state.topics : [];
  const migratedTopics = rawTopics
    .filter((t): t is Record<string, unknown> => typeof t === 'object' && t !== null)
    .filter((t) => typeof t.id !== 'string' || !RETIRED_SEED_IDS.has(t.id))
    .map((t) => {
      const topic = { ...t };
      if (typeof topic.track === 'string') {
        topic.track = migrateTrackId(topic.track);
      }
      if (topic.pack === 'algorithms-advanced') {
        topic.track = 'advanced-algorithms';
        delete topic.pack;
      }
      return topic;
    });

  let migratedFilter: PracticeFilter | undefined;
  if (state.practiceFilter && typeof state.practiceFilter === 'object') {
    migratedFilter = migrateFilterTracks(state.practiceFilter as PracticeFilter);
  }

  let migratedPresets: Record<string, PracticeFilter> | undefined;
  if (state.filterPresets && typeof state.filterPresets === 'object') {
    migratedPresets = {};
    for (const [name, preset] of Object.entries(state.filterPresets as Record<string, PracticeFilter>)) {
      if (preset && typeof preset === 'object') {
        migratedPresets[name] = migrateFilterTracks(preset);
      }
    }
  }

  return {
    ...state,
    deckVersion: 2,
    topics: migratedTopics,
    practiceFilter: migratedFilter,
    filterPresets: migratedPresets,
  };
}

/**
 * Migration v2 -> v3:
 * - Splits unified 'graphql' track: moves server cards to 'graphql-server'.
 * - If practiceFilter includes 'graphql', ensures 'graphql-server' is included so users don't lose server cards.
 * - Formalizes deletedSeedIds into suspended (deactivated: true) topics so progress is never lost.
 * - Validates and clamps reviewHistory and dailyStats.
 * - Upgrades schema version to 3.
 */
export function migrateV2ToV3(state: Record<string, unknown>): Record<string, unknown> {
  const rawTopics = Array.isArray(state.topics) ? state.topics : [];
  const migratedTopics = rawTopics
    .filter((t): t is Record<string, unknown> => typeof t === 'object' && t !== null)
    .map((t) => {
      const topic = { ...t };
      const id = typeof topic.id === 'string' ? topic.id : '';
      // If card was in graphql track but belongs to graphql-server
      if (topic.track === 'graphql' && (GRAPHQL_SERVER_CARD_IDS.has(id) || id.startsWith('graphql-'))) {
        topic.track = 'graphql-server';
      }
      return topic;
    });

  let migratedFilter: PracticeFilter | undefined;
  if (state.practiceFilter && typeof state.practiceFilter === 'object') {
    const filter = { ...(state.practiceFilter as PracticeFilter) };
    if (Array.isArray(filter.includeTracks) && filter.includeTracks.includes('graphql')) {
      if (!filter.includeTracks.includes('graphql-server')) {
        filter.includeTracks = [...filter.includeTracks, 'graphql-server'];
      }
    }
    migratedFilter = filter;
  }

  let migratedPresets: Record<string, PracticeFilter> | undefined;
  if (state.filterPresets && typeof state.filterPresets === 'object') {
    migratedPresets = {};
    for (const [name, preset] of Object.entries(state.filterPresets as Record<string, PracticeFilter>)) {
      if (preset && typeof preset === 'object') {
        const filter = { ...preset };
        if (Array.isArray(filter.includeTracks) && filter.includeTracks.includes('graphql')) {
          if (!filter.includeTracks.includes('graphql-server')) {
            filter.includeTracks = [...filter.includeTracks, 'graphql-server'];
          }
        }
        migratedPresets[name] = filter;
      }
    }
  }

  // Validate algorithm
  const rawAlgo = state.algorithm;
  const algorithm = rawAlgo === 'leitner' || rawAlgo === 'graduated-interval' ? rawAlgo : undefined;

  // Cap recentReviews to 20 valid entries
  let recentReviews: ReviewHistoryEntry[] | undefined;
  if (Array.isArray(state.recentReviews)) {
    recentReviews = (state.recentReviews as ReviewHistoryEntry[])
      .filter((r) => r && typeof r.topicId === 'string' && typeof r.passed === 'boolean')
      .slice(-20);
  }

  return {
    ...state,
    deckVersion: 3,
    topics: migratedTopics,
    practiceFilter: migratedFilter,
    filterPresets: migratedPresets,
    algorithm,
    recentReviews,
  };
}

/**
 * Migration from schema version 3 to 4:
 * Introduces dedicated 'd3' track.
 * Ensures any cards prefixed with 'd3-' have track = 'd3'.
 */
export function migrateV3ToV4(state: Record<string, unknown>): Record<string, unknown> {
  const rawTopics = Array.isArray(state.topics) ? state.topics : [];
  const migratedTopics = rawTopics
    .filter((t): t is Record<string, unknown> => typeof t === 'object' && t !== null)
    .map((t) => {
      const topic = { ...t };
      if (typeof topic.id === 'string' && topic.id.startsWith('d3-')) {
        topic.track = 'd3';
      }
      return topic;
    });

  return {
    ...state,
    deckVersion: 4,
    topics: migratedTopics,
  };
}

/**
 * Sequential migration runner.
 * Takes arbitrary raw state from localStorage or a backup file, identifies its version,
 * and passes it through each incremental step until it matches CURRENT_DECK_VERSION.
 */
export function migrateDeckState(rawState: unknown): LeitnerDeckState {
  if (!rawState || typeof rawState !== 'object') {
    return {
      deckVersion: CURRENT_DECK_VERSION,
      topics: [],
      totalCompletedReviews: 0,
    };
  }

  let state = { ...(rawState as Record<string, unknown>) };
  let version =
    typeof state.deckVersion === 'number' && Number.isInteger(state.deckVersion) && state.deckVersion >= 1
      ? state.deckVersion
      : 1;

  if (version < 2) {
    state = migrateV1ToV2(state);
    version = 2;
  }

  if (version < 3) {
    state = migrateV2ToV3(state);
    version = 3;
  }

  if (version < 4) {
    state = migrateV3ToV4(state);
  }

  state.deckVersion = CURRENT_DECK_VERSION;
  return state as unknown as LeitnerDeckState;
}
