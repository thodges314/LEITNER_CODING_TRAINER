import type { TopicItem, TrackType } from './leitner';

export const ACTIVE_DECK_STORAGE_KEY = 'leitner_active_deck_id';
export const CUSTOM_DECKS_STORAGE_KEY = 'leitner_custom_decks';

export const FRONTEND_TRACKS: ReadonlySet<TrackType> = new Set<TrackType>([
  'react',
  'react-components',
  'dom-browser',
  'async-js',
  'js-utilities',
  'js-language',
  'testing-tooling',
  'typescript-patterns',
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
}

export type DeckDefinition = DeckPreset | CustomDeck;

export const BUILT_IN_DECKS: DeckPreset[] = [
  {
    id: 'full-library',
    name: 'Full Library (All Cards)',
    description: 'Complete 277-card curriculum across all frontend and computer-science domains',
    badge: '277 Cards',
    isBuiltIn: true,
    filter: () => true,
  },
  {
    id: 'frontend-specialist',
    name: 'Frontend Specialist',
    description: 'React components, hooks, DOM APIs, async plumbing, and core JS/TS utilities',
    badge: '197 Cards',
    isBuiltIn: true,
    filter: (card) => FRONTEND_TRACKS.has(card.track),
  },
  {
    id: 'core-algorithms',
    name: 'Core Algorithms',
    description: 'Practical coding interview algorithms: arrays, hashing, two pointers, sliding window, binary search, intervals, linked lists',
    badge: '27 Cards',
    isBuiltIn: true,
    filter: (card) => card.track === 'algorithms',
  },
  {
    id: 'advanced-algorithms',
    name: 'Advanced Algorithms',
    description: 'Academic computer science: trees, BSTs, graphs, heaps, dynamic programming, backtracking, tries, bit manipulation',
    badge: '53 Cards',
    isBuiltIn: true,
    filter: (card) => card.track === 'advanced-algorithms',
  },
];

export function getBuiltInDecks(): DeckPreset[] {
  return BUILT_IN_DECKS;
}

export function getBuiltInDeck(id: string): DeckPreset | undefined {
  return BUILT_IN_DECKS.find((d) => d.id === id);
}

export function getStoredActiveDeckId(): string {
  if (typeof localStorage === 'undefined') return 'full-library';
  try {
    const val = localStorage.getItem(ACTIVE_DECK_STORAGE_KEY);
    return val || 'full-library';
  } catch {
    return 'full-library';
  }
}

export function setStoredActiveDeckId(id: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_DECK_STORAGE_KEY, id);
  } catch {
    // Ignore storage quota/security errors
  }
}

export function getStoredCustomDecks(): CustomDeck[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_DECKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (d) => d && typeof d.id === 'string' && typeof d.name === 'string' && Array.isArray(d.cardIds)
    );
  } catch {
    return [];
  }
}

export function setStoredCustomDecks(decks: CustomDeck[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_DECKS_STORAGE_KEY, JSON.stringify(decks));
  } catch {
    // Ignore storage quota errors
  }
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

  const builtIn = getBuiltInDeck(deckId);
  if (builtIn) {
    return cards.filter(builtIn.filter);
  }

  const custom = customDecks.find((d) => d.id === deckId);
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
