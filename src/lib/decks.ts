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
  'graphql',
]);

export const ALGORITHMIC_UTILITY_CONCEPTS: ReadonlySet<string> = new Set<string>([
  'collections',
  'flatten',
  'array-polyfills',
  'equality-clone',
  'lru',
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
    description: 'Complete 278-card curriculum across all 11 frontend and computer-science domains',
    badge: '278 Cards',
    isBuiltIn: true,
    filter: () => true,
  },
  {
    id: 'full-stack',
    name: 'Full-Stack Core',
    description: 'Practical full-stack interview prep: React, DOM, async JS, utilities, TypeScript, and core interview algorithms',
    badge: '225 Cards',
    isBuiltIn: true,
    filter: (card) => card.track !== 'advanced-algorithms',
  },
  {
    id: 'frontend-specialist',
    name: 'Frontend Specialist',
    description: 'React components, hooks, DOM APIs, async plumbing, and core JS/TS utilities',
    badge: '198 Cards',
    isBuiltIn: true,
    filter: (card) => FRONTEND_TRACKS.has(card.track),
  },
  {
    id: 'algorithms',
    name: 'Algorithms & Data Structures',
    description: 'Practical algorithms, trees, graphs, DP, backtracking, heaps, and algorithmic JS utilities',
    badge: '96 Cards',
    isBuiltIn: true,
    filter: (card) =>
      card.track === 'algorithms' ||
      card.track === 'advanced-algorithms' ||
      (card.track === 'js-utilities' && ALGORITHMIC_UTILITY_CONCEPTS.has(card.concept ?? '')),
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
  if (typeof localStorage === 'undefined') return 'full-library';
  try {
    const val = localStorage.getItem(ACTIVE_DECK_STORAGE_KEY);
    if (!val) return 'full-library';
    if (val === 'core-algorithms' || val === 'advanced-algorithms') return 'algorithms';
    return val;
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
