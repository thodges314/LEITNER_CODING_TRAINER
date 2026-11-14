import type { LeitnerDeckState, TopicItem, TrackType } from './leitner';

export type TrackContentMap = Record<string, Partial<TopicItem>>;

const TRACK_LOADERS: Record<TrackType, () => Promise<{ default: unknown }>> = {
  'algorithms': () => import('../data/tracks/algorithms.json'),
  'advanced-algorithms': () => import('../data/tracks/advanced-algorithms.json'),
  'async-js': () => import('../data/tracks/async-js.json'),
  'js-language': () => import('../data/tracks/js-language.json'),
  'js-utilities': () => import('../data/tracks/js-utilities.json'),
  'dom-browser': () => import('../data/tracks/dom-browser.json'),
  'react': () => import('../data/tracks/react.json'),
  'react-components': () => import('../data/tracks/react-components.json'),
  'd3': () => import('../data/tracks/d3.json'),
  'tailwind': () => import('../data/tracks/tailwind.json'),
  'typescript-patterns': () => import('../data/tracks/typescript-patterns.json'),
  'testing-tooling': () => import('../data/tracks/testing-tooling.json'),
  'graphql': () => import('../data/tracks/graphql.json'),
  'graphql-server': () => import('../data/tracks/graphql-server.json'),
  'node': () => import('../data/tracks/node.json'),
  'sql-postgres': () => import('../data/tracks/sql-postgres.json'),
  'nextjs': () => import('../data/tracks/nextjs.json'),
};

const trackContentCache = new Map<string, TrackContentMap>();
const inFlightTrackLoads = new Map<string, Promise<TrackContentMap>>();

export function isCardContentHydrated(card: TopicItem | null | undefined): boolean {
  if (!card) return true;
  return typeof card.promptSeed === 'string';
}

export function getCachedTrackContent(track: string): TrackContentMap | undefined {
  return trackContentCache.get(track);
}

export async function loadTrackContent(track: string): Promise<TrackContentMap> {
  const cached = trackContentCache.get(track);
  if (cached) return cached;

  const existing = inFlightTrackLoads.get(track);
  if (existing) return existing;

  const loader = TRACK_LOADERS[track as TrackType];
  if (!loader) {
    return {};
  }

  const promise = loader()
    .then((mod) => {
      const data = (mod.default ?? {}) as TrackContentMap;
      trackContentCache.set(track, data);
      inFlightTrackLoads.delete(track);
      return data;
    })
    .catch((err) => {
      inFlightTrackLoads.delete(track);
      throw err;
    });

  inFlightTrackLoads.set(track, promise);
  return promise;
}

export function hydrateDeckStateWithTrack(
  state: LeitnerDeckState,
  track: string,
  contentById: TrackContentMap
): LeitnerDeckState {
  let changed = false;
  const nextTopics = state.topics.map((topic) => {
    if (topic.track !== track || isCardContentHydrated(topic)) {
      return topic;
    }
    const payload = contentById[topic.id];
    if (!payload) return topic;
    changed = true;
    return {
      ...topic,
      ...payload,
    };
  });

  if (!changed) return state;
  return {
    ...state,
    topics: nextTopics,
  };
}

