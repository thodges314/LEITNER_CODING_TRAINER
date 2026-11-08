import { migrateTrackList } from './deckMigrations';
import type { TopicItem, LeitnerDeckState } from './leitner';

/**
 * Narrows which cards are scheduled for practice. Excludes always win; an empty include list means "everything".
 * Cards outside the filter keep their Leitner state untouched.
 */
export interface PracticeFilter {
  /** Set by the app from `enabledPacks`; not user-editable and never persisted. */
  excludePacks?: string[];
  /** Inclusive difficulty range (1-5). Unset = no limit. */
  minDifficulty?: number;
  maxDifficulty?: number;
  includeTracks: string[];
  excludeTracks: string[];
  includeTags: string[];
  excludeTags: string[];
}

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Warm-up',
  2: 'Basic',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};
export const DEFAULT_DIFFICULTY = 3;
export const LADDER_PASS_BOX = 2; // an easier rung must reach this box before the next rung unlocks

export function difficultyOf(card: Pick<TopicItem, 'difficulty'>): number {
  const d = Number(card.difficulty);
  return Number.isInteger(d) && d >= 1 && d <= 5 ? d : DEFAULT_DIFFICULTY;
}

export const EMPTY_FILTER: PracticeFilter = {
  includeTracks: [],
  excludeTracks: [],
  includeTags: [],
  excludeTags: [],
};

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? Array.from(new Set(value.map(String))) : [];
}

export function normalizeFilter(value: unknown): PracticeFilter {
  const v = (value ?? {}) as Partial<Record<keyof PracticeFilter, unknown>>;
  const bound = (x: unknown) => {
    const n = Number(x);
    return Number.isInteger(n) && n >= 1 && n <= 5 ? n : undefined;
  };
  const out: PracticeFilter = {
    includeTracks: migrateTrackList(stringList(v.includeTracks), 'include'),
    excludeTracks: migrateTrackList(stringList(v.excludeTracks), 'exclude'),
    includeTags: stringList(v.includeTags),
    excludeTags: stringList(v.excludeTags),
  };
  const min = bound(v.minDifficulty);
  const max = bound(v.maxDifficulty);
  if (min !== undefined) out.minDifficulty = min;
  if (max !== undefined) out.maxDifficulty = max;
  return out;
}

export function normalizePresets(value: unknown): Record<string, PracticeFilter> {
  const out: Record<string, PracticeFilter> = {};
  if (value && typeof value === 'object') {
    for (const [name, f] of Object.entries(value as Record<string, unknown>)) {
      out[name] = normalizeFilter(f);
    }
  }
  return out;
}

export function isFilterActive(filter: PracticeFilter | undefined): boolean {
  if (!filter) return false;
  return (
    filter.includeTracks.length +
      filter.excludeTracks.length +
      filter.includeTags.length +
      filter.excludeTags.length >
      0 ||
    filter.minDifficulty !== undefined ||
    filter.maxDifficulty !== undefined
  );
}

/** Optional card packs. A pack is OFF unless listed in deck state `enabledPacks`. */
export const CARD_PACKS: Record<string, { label: string; description: string }> = {};

export function disabledPacks(state: Pick<LeitnerDeckState, 'enabledPacks'>): string[] {
  const enabled = new Set(state.enabledPacks ?? []);
  return Object.keys(CARD_PACKS).filter((pack) => !enabled.has(pack));
}

export function isPackEnabled(
  card: Pick<TopicItem, 'pack'>,
  state: Pick<LeitnerDeckState, 'enabledPacks'>
): boolean {
  return !card.pack || !disabledPacks(state).includes(card.pack);
}

/** Cards that take part in the app (catalog, scheduling, unlocks) for this deck state. */
export function visibleTopics(state: Pick<LeitnerDeckState, 'topics' | 'enabledPacks'>): TopicItem[] {
  return state.topics.filter((t) => isPackEnabled(t, state));
}

/** The user's Focus filter plus the pack exclusions; this is what the schedulers receive. */
export function scheduleFilter(state: LeitnerDeckState): PracticeFilter {
  return { ...(state.practiceFilter ?? EMPTY_FILTER), excludePacks: disabledPacks(state) };
}

export function cardMatchesFilter(
  card: Pick<TopicItem, 'track' | 'tags' | 'difficulty' | 'pack'>,
  filter: PracticeFilter | undefined
): boolean {
  if (card.pack && filter?.excludePacks?.includes(card.pack)) return false;
  if (!isFilterActive(filter)) return true;
  const f = filter as PracticeFilter;
  const d = difficultyOf(card);
  if (f.minDifficulty !== undefined && d < f.minDifficulty) return false;
  if (f.maxDifficulty !== undefined && d > f.maxDifficulty) return false;
  if (f.excludeTracks.includes(card.track)) return false;
  if (card.tags.some((tag) => f.excludeTags.includes(tag))) return false;
  if (f.includeTracks.length > 0 && !f.includeTracks.includes(card.track)) return false;
  if (f.includeTags.length > 0 && !card.tags.some((tag) => f.includeTags.includes(tag))) return false;
  return true;
}

