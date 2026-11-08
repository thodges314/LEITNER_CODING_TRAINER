import type { TopicItem, TrackType } from './leitner';
import { STORAGE_KEYS, safeGetItem, safeSetItem, safeGetJson, safeSetJson } from './storage';

export const ACTIVE_DECK_STORAGE_KEY = STORAGE_KEYS.ACTIVE_DECK_ID;
export const CUSTOM_DECKS_STORAGE_KEY = STORAGE_KEYS.CUSTOM_DECKS;

export const FRONTEND_TRACKS: ReadonlySet<TrackType> = new Set<TrackType>([
  'nextjs',
  'react',
  'react-components',
  'd3',
  'tailwind',
  'dom-browser',
  'async-js',
  'js-utilities',
  'js-language',
  'testing-tooling',
  'typescript-patterns',
  'graphql',
]);

export const ALGORITHMIC_UTILITY_CONCEPTS: ReadonlySet<string> = new Set<string>([
  'collections',
  'flatten',
  'array-polyfills',
  'equality-clone',
  'lru',
]);

export const DATA_SCALING_CARD_IDS: ReadonlySet<string> = new Set<string>([
  'async-generator-pagination',
  'promise-pool',
  'async-queue-scheduler',
  'graphql-dataloader-batching',
  'graphql-query-complexity-calculator',
  'graphql-relay-pagination-merger',
  'graphql-relay-connection-builder',
  'node-stream-backpressure-pipe',
  'node-ndjson-stream-splitter',
  'node-length-prefixed-ipc-framing',
  'node-worker-pool-dispatcher',
  'stream-event-micro-batcher',
  'web-stream-transform-pipeline',
  'chunked-batch-pipeline',
  'stream-token-bucket-shaper',
  'k-way-stream-merger',
]);

export interface DeckPreset {
  id: string;
  name: string;
  description: string;
  badge?: string;
  isBuiltIn: true;
  filter: (card: TopicItem) => boolean;
}

export interface CustomDeck {
  id: string;
  name: string;
  description?: string;
  cardIds: string[];
  createdAt: number;
  updatedAt: number;
  isBuiltIn?: false;
  dossierId?: string;
}

export type DeckDefinition = DeckPreset | CustomDeck;

export const BUILT_IN_DECKS: DeckPreset[] = [
  {
    id: 'full-library',
    name: 'Full Library (All Cards)',
    description: 'Complete curriculum across all 16 frontend, backend, database, and computer-science domains',
    isBuiltIn: true,
    filter: () => true,
  },
  {
    id: 'full-stack',
    name: 'Full-Stack Core',
    description: 'Practical full-stack interview prep: React, Node.js, GraphQL, PostgreSQL, DOM, async JS, utilities, TypeScript, and core interview algorithms',
    isBuiltIn: true,
    filter: (card) => card.track !== 'advanced-algorithms',
  },
  {
    id: 'frontend-specialist',
    name: 'Frontend Specialist',
    description: 'React components, hooks, DOM APIs, async plumbing, and core JS/TS utilities',
    isBuiltIn: true,
    filter: (card) => FRONTEND_TRACKS.has(card.track),
  },
  {
    id: 'algorithms',
    name: 'Algorithms & Data Structures',
    description: 'Practical algorithms, trees, graphs, DP, backtracking, heaps, and algorithmic JS utilities',
    isBuiltIn: true,
    filter: (card) =>
      card.track === 'algorithms' ||
      card.track === 'advanced-algorithms' ||
      (card.track === 'js-utilities' && ALGORITHMIC_UTILITY_CONCEPTS.has(card.concept ?? '')),
  },
  {
    id: 'data-scaling-streams',
    name: 'Data Scaling & Streams',
    description: 'High-throughput data streaming, memory-bounded pagination, reactive event batching, Web Streams pipelines, and flow-control backpressure',
    isBuiltIn: true,
    filter: (card) => {
      const tags = card.tags || [];
      return (
        DATA_SCALING_CARD_IDS.has(card.id) ||
        tags.includes('streams') ||
        tags.includes('scaling') ||
        tags.includes('batching') ||
        tags.includes('backpressure')
      );
    },
  },
];

export function getBuiltInDecks(): DeckPreset[] {
  return BUILT_IN_DECKS;
}

export function getBuiltInDeck(id: string): DeckPreset | undefined {
  if (id === 'core-algorithms' || id === 'advanced-algorithms') {
    return BUILT_IN_DECKS.find((d) => d.id === 'algorithms');
  }
  return BUILT_IN_DECKS.find((d) => d.id === id);
}

export function getDeckName(deckId: string, customDecks: CustomDeck[] = []): string {
  const normalizedId = deckId === 'core-algorithms' || deckId === 'advanced-algorithms' ? 'algorithms' : deckId;
  const builtIn = getBuiltInDeck(normalizedId);
  if (builtIn) return builtIn.name;
  const custom = customDecks.find((d) => d.id === normalizedId);
  if (custom) return custom.name;
  return 'Full Library (All Cards)';
}

export function getStoredActiveDeckId(): string {
  const val = safeGetItem(ACTIVE_DECK_STORAGE_KEY);
  if (!val) return 'full-library';
  if (val === 'core-algorithms' || val === 'advanced-algorithms') return 'algorithms';
  return val;
}

export function setStoredActiveDeckId(id: string): void {
  safeSetItem(ACTIVE_DECK_STORAGE_KEY, id);
}

export function getStoredCustomDecks(): CustomDeck[] {
  const parsed = safeGetJson<unknown>(CUSTOM_DECKS_STORAGE_KEY, null);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(
    (d): d is CustomDeck =>
      Boolean(d && typeof d.id === 'string' && typeof d.name === 'string' && Array.isArray(d.cardIds))
  );
}

export function setStoredCustomDecks(decks: CustomDeck[]): void {
  safeSetJson(CUSTOM_DECKS_STORAGE_KEY, decks);
}

/**
 * Filter topics to only those belonging to the active deck.
 */
export function filterCardsByDeck(
  cards: TopicItem[],
  deckId: string,
  customDecks: CustomDeck[] = []
): TopicItem[] {
  if (!deckId || deckId === 'full-library') {
    return cards;
  }

  const normalizedId = deckId === 'core-algorithms' || deckId === 'advanced-algorithms' ? 'algorithms' : deckId;
  const builtIn = getBuiltInDeck(normalizedId);
  if (builtIn) {
    return cards.filter(builtIn.filter);
  }

  const custom = customDecks.find((d) => d.id === normalizedId);
  if (custom) {
    const allowed = new Set(custom.cardIds);
    return cards.filter((c) => allowed.has(c.id));
  }

  // Fallback if deck id is unrecognized: return all cards
  return cards;
}

/**
 * Computes deck card count dynamically against the loaded topics.
 */
export function getDeckCardCount(
  deck: DeckDefinition,
  cards: TopicItem[]
): number {
  if ('filter' in deck && typeof deck.filter === 'function') {
    return cards.filter(deck.filter).length;
  }
  if ('cardIds' in deck && Array.isArray(deck.cardIds)) {
    const cardSet = new Set(cards.map((c) => c.id));
    return deck.cardIds.filter((id) => cardSet.has(id)).length;
  }
  return 0;
}
