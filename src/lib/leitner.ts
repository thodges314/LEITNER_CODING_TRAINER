import seedTopicsData from '../data/topics.json';
import { extractHarnessContracts } from './harnessContracts';

export type TrackType =
  | 'async-js'
  | 'data-structures'
  | 'react'
  | 'algorithms'
  | 'js-runtime-fundamentals'
  | 'async-web-plumbing'
  | 'collections-transformations'
  | 'react-patterns'
  | 'algorithmic-screens'
  | 'typescript-patterns'
  | 'js-language'
  | 'dom-browser'
  | 'react-components'
  | 'testing-tooling';

export interface TestCaseItem {
  input: string;
  expected: string;
  description?: string;
}

export interface TopicItem {
  id: string;
  track: TrackType;
  title: string;
  box: number; // 1 to 5
  streak: number;
  nextEligibleTrial: number; // The global trial index when this card can next appear
  status: 'active' | 'locked';
  tags: string[];
  /** 1 (warm-up) to 5 (expert). Easier rungs of a concept are mastered before harder ones unlock. */
  difficulty?: number;
  /** Cards sharing a concept form a ladder ordered by difficulty (e.g. 'rate-limiting', 'promise'). */
  concept?: string;
  promptSeed: string;
  starterCode?: string;
  testHarness?: string;
  solution?: string;
  referenceSolution?: string;
  testCases?: TestCaseItem[];
}

/**
 * Narrows which cards are scheduled for practice. Excludes always win; an empty include list means "everything".
 * Cards outside the filter keep their Leitner state untouched.
 */
export interface PracticeFilter {
  /** Inclusive difficulty range (1-5). Unset = no limit. */
  minDifficulty?: number;
  maxDifficulty?: number;
  includeTracks: string[];
  excludeTracks: string[];
  includeTags: string[];
  excludeTags: string[];
}

export const DIFFICULTY_LABELS: Record<number, string> = { 1: 'Warm-up', 2: 'Basic', 3: 'Intermediate', 4: 'Advanced', 5: 'Expert' };
export const DEFAULT_DIFFICULTY = 3;
export const LADDER_PASS_BOX = 2; // an easier rung must reach this box before the next rung unlocks

export function difficultyOf(card: Pick<TopicItem, 'difficulty'>): number {
  const d = Number(card.difficulty);
  return Number.isInteger(d) && d >= 1 && d <= 5 ? d : DEFAULT_DIFFICULTY;
}

export const EMPTY_FILTER: PracticeFilter = { includeTracks: [], excludeTracks: [], includeTags: [], excludeTags: [] };

export interface LeitnerDeckState {
  /** Practice focus: only matching cards are scheduled. */
  practiceFilter?: PracticeFilter;
  /** Named focus presets, e.g. "React screen". */
  filterPresets?: Record<string, PracticeFilter>;
  topics: TopicItem[];
  totalCompletedReviews: number;
  lastReviewedTrack?: TrackType;
  unlockedStageCount?: number;
  /** Seed topic ids the user deleted, so they are not re-added on the next load. */
  deletedSeedIds?: string[];
  /** Spaced repetition algorithm mode: 'leitner' (discrete boxes) or 'graduated-interval' (graduated-interval recall & chaining). */
  algorithm?: SpacedAlgorithm;
}

export type SpacedAlgorithm = 'leitner' | 'graduated-interval';

export const STORAGE_KEY = 'leitner_coding_deck';
export const ALGORITHM_STORAGE_KEY = 'spaced_repetition_algorithm';
export const DEFAULT_ALGORITHM: SpacedAlgorithm = 'leitner';

/** Focused active working chain capacity before introducing new unseen topics in graduated-interval mode. */
export const GRADUATED_ACTIVE_CHAIN_LIMIT = 4;

export const BOX_INTERVALS: Record<number, number> = {
  1: 1,  // immediate rotation (+1 trial)
  2: 4,  // +4 trials
  3: 10, // +10 trials
  4: 22, // +22 trials
  5: 45, // +45 trials (Mastered)
};

/**
 * Graduated expanding intervals:
 * Step 1: +1 trial (immediate reinforcement recall)
 * Step 2: +3 trials (graduated expansion)
 * Step 3: +7 trials (graduated consolidation)
 * Step 4: +16 trials (intermediate retention)
 * Step 5: +35 trials (mastered long-term memory)
 */
export const GRADUATED_INTERVALS: Record<number, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 16,
  5: 35,
};

export const TRACK_METADATA: Record<string, { label: string; color: string; bg: string; border: string }> = {
  'async-js': {
    label: 'Async JS',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    border: 'rgba(56, 189, 248, 0.35)',
  },
  'data-structures': {
    label: 'Data Structures',
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.12)',
    border: 'rgba(168, 85, 247, 0.35)',
  },
  'react': {
    label: 'React Invariants',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.35)',
  },
  'algorithms': {
    label: 'Algorithms',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
  },
  'js-runtime-fundamentals': {
    label: 'JS Runtime',
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.12)',
    border: 'rgba(236, 72, 153, 0.35)',
  },
  'async-web-plumbing': {
    label: 'Async Plumbing',
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.12)',
    border: 'rgba(99, 102, 241, 0.35)',
  },
  'collections-transformations': {
    label: 'Collections',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.35)',
  },
  'react-patterns': {
    label: 'React Patterns',
    color: '#14b8a6',
    bg: 'rgba(20, 184, 166, 0.12)',
    border: 'rgba(20, 184, 166, 0.35)',
  },
  'algorithmic-screens': {
    label: 'Algorithms Screen',
    color: '#eab308',
    bg: 'rgba(234, 179, 8, 0.12)',
    border: 'rgba(234, 179, 8, 0.35)',
  },
  'typescript-patterns': {
    label: 'TypeScript Patterns',
    color: '#3178c6',
    bg: 'rgba(49, 120, 198, 0.12)',
    border: 'rgba(49, 120, 198, 0.35)',
  },
  'js-language': {
    label: 'JS Language & Utils',
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.35)',
  },
  'dom-browser': {
    label: 'DOM & Browser',
    color: '#84cc16',
    bg: 'rgba(132, 204, 22, 0.12)',
    border: 'rgba(132, 204, 22, 0.35)',
  },
  'react-components': {
    label: 'React Components',
    color: '#22d3ee',
    bg: 'rgba(34, 211, 238, 0.12)',
    border: 'rgba(34, 211, 238, 0.35)',
  },
  'testing-tooling': {
    label: 'Testing & Libraries',
    color: '#f43f5e',
    bg: 'rgba(244, 63, 94, 0.12)',
    border: 'rgba(244, 63, 94, 0.35)',
  },
};

export const TRACK_TYPES = Object.keys(TRACK_METADATA) as TrackType[];

export function isTrackType(value: unknown): value is TrackType {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(TRACK_METADATA, value);
}

export function getTrackMeta(track: string): { label: string; color: string; bg: string; border: string } {
  return (
    TRACK_METADATA[track] ?? {
      label: track,
      color: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.12)',
      border: 'rgba(148, 163, 184, 0.35)',
    }
  );
}

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
    includeTracks: stringList(v.includeTracks),
    excludeTracks: stringList(v.excludeTracks),
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
    for (const [name, f] of Object.entries(value as Record<string, unknown>)) out[name] = normalizeFilter(f);
  }
  return out;
}

export function isFilterActive(filter: PracticeFilter | undefined): boolean {
  if (!filter) return false;
  return (
    filter.includeTracks.length + filter.excludeTracks.length + filter.includeTags.length + filter.excludeTags.length > 0 ||
    filter.minDifficulty !== undefined ||
    filter.maxDifficulty !== undefined
  );
}

export function cardMatchesFilter(card: Pick<TopicItem, 'track' | 'tags' | 'difficulty'>, filter: PracticeFilter | undefined): boolean {
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

export function setPracticeFilter(state: LeitnerDeckState, filter: PracticeFilter): LeitnerDeckState {
  const nextState = { ...state, practiceFilter: normalizeFilter(filter) };
  saveDeckState(nextState);
  return nextState;
}

export function savePreset(state: LeitnerDeckState, name: string, filter: PracticeFilter): LeitnerDeckState {
  const trimmed = name.trim();
  if (!trimmed) return state;
  const nextState = { ...state, filterPresets: { ...(state.filterPresets ?? {}), [trimmed]: normalizeFilter(filter) } };
  saveDeckState(nextState);
  return nextState;
}

export function deletePreset(state: LeitnerDeckState, name: string): LeitnerDeckState {
  const presets = { ...(state.filterPresets ?? {}) };
  delete presets[name];
  const nextState = { ...state, filterPresets: presets };
  saveDeckState(nextState);
  return nextState;
}

export function intervalForBox(box: number, algorithm: SpacedAlgorithm = 'leitner'): number {
  if (algorithm === 'graduated-interval') {
    return GRADUATED_INTERVALS[box] ?? 1;
  }
  return BOX_INTERVALS[box] ?? 1;
}

export function getStoredAlgorithm(): SpacedAlgorithm {
  if (typeof window === 'undefined') return DEFAULT_ALGORITHM;
  try {
    const val = localStorage.getItem(ALGORITHM_STORAGE_KEY);
    if (val === 'graduated-interval') return 'graduated-interval';
    if (val === 'leitner') return 'leitner';
  } catch {
    // ignore
  }
  return DEFAULT_ALGORITHM;
}

export function setStoredAlgorithm(algo: SpacedAlgorithm): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ALGORITHM_STORAGE_KEY, algo);
  } catch (err) {
    console.error('Failed to save algorithm setting to localStorage:', err);
  }
}

export function getSchedulingAlgorithm(state?: LeitnerDeckState): SpacedAlgorithm {
  if (state?.algorithm === 'graduated-interval') {
    return 'graduated-interval';
  }
  if (state?.algorithm === 'leitner') {
    return 'leitner';
  }
  return getStoredAlgorithm();
}

export function setSchedulingAlgorithm(state: LeitnerDeckState, algo: SpacedAlgorithm): LeitnerDeckState {
  setStoredAlgorithm(algo);
  const nextState: LeitnerDeckState = { ...state, algorithm: algo };
  saveDeckState(nextState);
  return nextState;
}

export function getDefaultDeckState(): LeitnerDeckState {
  return {
    topics: (seedTopicsData as unknown as TopicItem[]).map((t) => ({ ...t })),
    totalCompletedReviews: 0,
    lastReviewedTrack: undefined,
    unlockedStageCount: 0,
    deletedSeedIds: [],
    algorithm: getStoredAlgorithm(),
  };
}

/** Fields describing the card itself (owned by the seed file), as opposed to review progress. */
const SEED_CONTENT_FIELDS = [
  'track',
  'title',
  'tags',
  'difficulty',
  'concept',
  'promptSeed',
  'starterCode',
  'testHarness',
  'solution',
  'referenceSolution',
  'testCases',
] as const;

/**
 * Merges a stored deck with the current seed topics.
 * - Progress (box, streak, schedule, status) always comes from the stored card.
 * - Content of seed-backed cards is refreshed from the seed so edits to topics.json take effect.
 * - Seed topics that are new and were not deleted by the user are appended.
 * - Custom (non-seed) cards are left untouched.
 */
export function mergeStoredWithSeed(parsed: LeitnerDeckState, seedTopics: TopicItem[]): LeitnerDeckState {
  const seedMap = new Map(seedTopics.map((t) => [t.id, t]));
  const deleted = new Set(parsed.deletedSeedIds ?? []);

  const hydratedTopics = parsed.topics.map((t) => {
    const seed = seedMap.get(t.id);
    if (!seed) return t;
    const merged: TopicItem = { ...t };
    for (const field of SEED_CONTENT_FIELDS) {
      if (seed[field] !== undefined) {
        (merged as unknown as Record<string, unknown>)[field] = seed[field];
      }
    }
    const fallbackSol = merged.referenceSolution ?? merged.solution ?? merged.starterCode;
    merged.solution = merged.solution ?? fallbackSol;
    merged.referenceSolution = merged.referenceSolution ?? fallbackSol;
    return merged;
  });

  const existingIds = new Set(parsed.topics.map((t) => t.id));
  const newSeedTopics = seedTopics
    .filter((t) => !existingIds.has(t.id) && !deleted.has(t.id))
    .map((t) => ({ ...t }));

  return {
    topics: [...hydratedTopics, ...newSeedTopics],
    totalCompletedReviews: Number.isInteger(parsed.totalCompletedReviews) ? parsed.totalCompletedReviews : 0,
    lastReviewedTrack: parsed.lastReviewedTrack,
    unlockedStageCount: parsed.unlockedStageCount ?? 0,
    deletedSeedIds: [...deleted],
    practiceFilter: parsed.practiceFilter ? normalizeFilter(parsed.practiceFilter) : undefined,
    filterPresets: normalizePresets(parsed.filterPresets),
    algorithm: parsed.algorithm === 'graduated-interval' ? 'graduated-interval' : parsed.algorithm === 'leitner' ? 'leitner' : getStoredAlgorithm(),
  };
}

export function loadDeckState(): LeitnerDeckState {
  if (typeof window === 'undefined') return getDefaultDeckState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultState = getDefaultDeckState();
      saveDeckState(defaultState);
      return defaultState;
    }
    const parsed = JSON.parse(raw) as LeitnerDeckState;
    if (!Array.isArray(parsed.topics)) {
      throw new Error('Invalid deck structure');
    }
    const loadedState = mergeStoredWithSeed(parsed, seedTopicsData as unknown as TopicItem[]);
    saveDeckState(loadedState);
    return loadedState;
  } catch (err) {
    console.error('Failed to load deck from localStorage, resetting to seed:', err);
    const defaultState = getDefaultDeckState();
    saveDeckState(defaultState);
    return defaultState;
  }
}

export function saveDeckState(state: LeitnerDeckState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save deck to localStorage:', err);
  }
}

/**
 * Extracts or derives structured test cases from topic.testCases or falls back to
 * parsing topic.testHarness assertions.
 */
export function getTopicTestCases(topic: TopicItem): TestCaseItem[] {
  if (topic.testCases && topic.testCases.length > 0) {
    return topic.testCases;
  }

  const harness = topic.testHarness || '';
  if (!harness.trim()) {
    return [
      {
        description: 'Contract Validation',
        input: `${topic.id}(...)`,
        expected: 'Valid execution return',
      },
    ];
  }

  const cases = extractHarnessContracts(harness);

  if (cases.length === 0) {
    cases.push({
      description: 'Default Example Contract',
      input: `${topic.id}(...)`,
      expected: 'Adheres to prompt constraints',
    });
  }

  return cases;
}

/**
 * A locked card may unlock once every easier card of the same concept is active and has passed at least once.
 * Cards without a concept (custom topics) are never gated.
 */
export function isLadderOpen(card: TopicItem, topics: TopicItem[]): boolean {
  if (!card.concept) return true;
  const d = difficultyOf(card);
  return topics
    .filter((o) => o.id !== card.id && o.concept === card.concept && difficultyOf(o) < d)
    .every((o) => o.status === 'active' && o.box >= LADDER_PASS_BOX);
}

/**
 * Checks staged unlock condition:
 * For every 4 active cards in Box 3 or higher (cumulative), unlock 4 more locked cards.
 */
export function checkStagedUnlocks(topics: TopicItem[], currentStageCount: number): { updatedTopics: TopicItem[]; newStageCount: number; newlyUnlocked: number } {
  const activeBox3Plus = topics.filter((t) => t.status === 'active' && t.box >= 3).length;
  const targetStages = Math.floor(activeBox3Plus / 4);

  if (targetStages > currentStageCount) {
    const stagesToUnlock = targetStages - currentStageCount;
    const cardsToUnlock = stagesToUnlock * 4;
    // Unlock easiest-first, and only cards whose easier rungs (same concept) are already learned.
    const toUnlock = new Set(
      topics
        .map((t, index) => ({ t, index }))
        .filter(({ t }) => t.status === 'locked' && isLadderOpen(t, topics))
        .sort((a, b) => difficultyOf(a.t) - difficultyOf(b.t) || a.index - b.index)
        .slice(0, cardsToUnlock)
        .map(({ t }) => t.id)
    );
    const unlockedCount = toUnlock.size;

    const updatedTopics = topics.map((t) =>
      toUnlock.has(t.id) ? { ...t, status: 'active' as const, box: 1, streak: 0, nextEligibleTrial: 0 } : t
    );

    return {
      updatedTopics,
      newStageCount: targetStages,
      newlyUnlocked: unlockedCount,
    };
  }

  return {
    updatedTopics: topics,
    newStageCount: currentStageCount,
    newlyUnlocked: 0,
  };
}

/**
 * Commits an evaluation result (pass or fail) for a topic.
 * State Transitions on Evaluation Commit:
 * - Pass:
 *     box = Math.min(5, box + 1)
 *     streak += 1
 *     nextEligibleTrial = totalCompletedReviews + intervalForBox(box)
 * - Fail:
 *     box = 1
 *     streak = 0
 *     nextEligibleTrial = totalCompletedReviews + 1
 * - Increment totalCompletedReviews += 1
 */
export function commitCardReview(
  state: LeitnerDeckState,
  topicId: string,
  passed: boolean,
  algorithmOverride?: SpacedAlgorithm
): { nextState: LeitnerDeckState; newlyUnlockedCount: number; updatedCard: TopicItem } {
  const algo = algorithmOverride ?? getSchedulingAlgorithm(state);
  const currentTotal = state.totalCompletedReviews;
  const nextTotal = currentTotal + 1;
  let reviewedTrack: TrackType | undefined = state.lastReviewedTrack;
  let updatedCard: TopicItem | null = null;

  const updatedTopics = state.topics.map((item) => {
    if (item.id !== topicId) return item;

    reviewedTrack = item.track;
    let nextBox: number;
    let nextStreak: number;
    let nextEligibleTrial: number;

    if (passed) {
      nextBox = Math.min(5, item.box + 1);
      nextStreak = item.streak + 1;
      nextEligibleTrial = nextTotal + intervalForBox(nextBox, algo);
    } else {
      nextBox = algo === 'graduated-interval' ? Math.max(1, Math.floor(item.box / 2)) : 1;
      nextStreak = 0;
      nextEligibleTrial = nextTotal + intervalForBox(nextBox, algo);
    }

    const modified: TopicItem = {
      ...item,
      box: nextBox,
      streak: nextStreak,
      nextEligibleTrial,
      status: 'active',
    };
    updatedCard = modified;
    return modified;
  });

  // Check staged unlocks
  const { updatedTopics: finalTopics, newStageCount, newlyUnlocked } = checkStagedUnlocks(
    updatedTopics,
    state.unlockedStageCount ?? 0
  );

  const nextState: LeitnerDeckState = {
    ...state,
    topics: finalTopics,
    totalCompletedReviews: nextTotal,
    lastReviewedTrack: reviewedTrack,
    unlockedStageCount: newStageCount,
    algorithm: algo,
  };

  saveDeckState(nextState);

  return {
    nextState,
    newlyUnlockedCount: newlyUnlocked,
    updatedCard: updatedCard || state.topics[0],
  };
}

/**
 * Graduated-Interval Recall & Chaining Selection:
 * 1. Immediate / Graduated Recall Priority: Any in-flight card whose recall interval is due
 *    (nextEligibleTrial <= totalCompletedReviews) is recalled immediately before new cards are introduced.
 * 2. Active Chaining: If no cards are due, and the active working chain (< GRADUATED_ACTIVE_CHAIN_LIMIT unmastered cards)
 *    has capacity, introduce a new unseen card (easiest rung first, ladder-gated).
 * 3. Soonest-due fallback: If chain is full and no card is due yet, pick the in-flight card closest to being due.
 * 4. Interleaves tracks across reviews whenever alternatives exist.
 */
export function getNextCardGraduatedInterval(
  topics: TopicItem[],
  totalCompletedReviews: number,
  lastTrack?: TrackType,
  currentCardId?: string,
  filter?: PracticeFilter
): TopicItem | null {
  const activeTopics = topics.filter((t) => t.status === 'active' && cardMatchesFilter(t, filter));
  if (activeTopics.length === 0) return null;
  if (activeTopics.length === 1) return activeTopics[0];

  const poolExcludingCurrent = activeTopics.filter((t) => t.id !== currentCardId);
  const candidates = poolExcludingCurrent.length > 0 ? poolExcludingCurrent : activeTopics;

  // An unseen card is an active card that has never been reviewed (box 1, streak 0, nextEligibleTrial 0)
  const isUnseen = (t: TopicItem) => t.box === 1 && t.streak === 0 && t.nextEligibleTrial === 0;

  const inFlight = candidates.filter((t) => !isUnseen(t));
  const unseen = candidates.filter((t) => isUnseen(t));

  // 1. Check for due in-flight cards (graduated recall interval has elapsed)
  const dueInFlight = inFlight.filter((t) => t.nextEligibleTrial <= totalCompletedReviews);

  if (dueInFlight.length > 0) {
    let duePool = dueInFlight;
    if (lastTrack) {
      const altTrack = dueInFlight.filter((t) => t.track !== lastTrack);
      if (altTrack.length > 0) duePool = altTrack;
    }

    const sortedDue = [...duePool].sort((a, b) => {
      // Lower box first (box 1 immediate reinforcement > box 2 > box 3)
      if (a.box !== b.box) return a.box - b.box;
      // Cards waiting longest past their scheduled review
      if (a.nextEligibleTrial !== b.nextEligibleTrial) return a.nextEligibleTrial - b.nextEligibleTrial;
      // Easier rungs first
      if (difficultyOf(a) !== difficultyOf(b)) return difficultyOf(a) - difficultyOf(b);
      return a.streak - b.streak;
    });

    return sortedDue[0] ?? null;
  }

  // 2. No in-flight cards are due. Can we introduce an unseen card into the active chain?
  const activeChain = inFlight.filter((t) => t.box < 5);
  const shouldIntroduceNew =
    unseen.length > 0 && (activeChain.length < GRADUATED_ACTIVE_CHAIN_LIMIT || inFlight.length === 0);

  if (shouldIntroduceNew) {
    // Prefer cards whose ladder is open
    const openUnseen = unseen.filter((t) => isLadderOpen(t, topics));
    const unseenPoolBase = openUnseen.length > 0 ? openUnseen : unseen;

    let unseenPool = unseenPoolBase;
    if (lastTrack) {
      const altTrack = unseenPoolBase.filter((t) => t.track !== lastTrack);
      if (altTrack.length > 0) unseenPool = altTrack;
    }

    const sortedUnseen = [...unseenPool].sort((a, b) => {
      if (difficultyOf(a) !== difficultyOf(b)) return difficultyOf(a) - difficultyOf(b);
      return 0;
    });

    return sortedUnseen[0] ?? null;
  }

  // 3. Chain is full or no unseen cards exist, and nothing is due yet.
  // Fall back to the in-flight card closest to being due.
  const poolToWait = inFlight.length > 0 ? inFlight : candidates;
  let waitPool = poolToWait;
  if (lastTrack) {
    const altTrack = poolToWait.filter((t) => t.track !== lastTrack);
    if (altTrack.length > 0) waitPool = altTrack;
  }

  const sortedByDistance = [...waitPool].sort((a, b) => {
    const distA = Math.max(0, a.nextEligibleTrial - totalCompletedReviews);
    const distB = Math.max(0, b.nextEligibleTrial - totalCompletedReviews);
    if (distA !== distB) return distA - distB;
    if (a.box !== b.box) return a.box - b.box;
    if (difficultyOf(a) !== difficultyOf(b)) return difficultyOf(a) - difficultyOf(b);
    return a.streak - b.streak;
  });

  return sortedByDistance[0] ?? null;
}

/**
 * Next Card Selection (getNextCard(topics, totalCompletedReviews, lastTrack, currentCardId, filter, algorithm)):
 * Supports 'leitner' (discrete box tiers) and 'graduated-interval' (graduated-interval recall & chaining).
 */
export function getNextCard(
  topics: TopicItem[],
  totalCompletedReviews: number,
  lastTrack?: TrackType,
  currentCardId?: string,
  filter?: PracticeFilter,
  algorithm: SpacedAlgorithm = 'leitner'
): TopicItem | null {
  if (algorithm === 'graduated-interval') {
    return getNextCardGraduatedInterval(topics, totalCompletedReviews, lastTrack, currentCardId, filter);
  }

  const activeTopics = topics.filter((t) => t.status === 'active' && cardMatchesFilter(t, filter));
  if (activeTopics.length === 0) return null;
  if (activeTopics.length === 1) return activeTopics[0];

  // Candidates excluding the currently active card if possible
  const poolExcludingCurrent = activeTopics.filter((t) => t.id !== currentCardId);
  const candidatesBase = poolExcludingCurrent.length > 0 ? poolExcludingCurrent : activeTopics;

  // Eligible pool: nextEligibleTrial <= totalCompletedReviews
  const eligiblePool = candidatesBase.filter((t) => t.nextEligibleTrial <= totalCompletedReviews);

  let poolToUse: TopicItem[];
  if (eligiblePool.length > 0) {
    poolToUse = eligiblePool;
  } else {
    // Pick the card(s) whose nextEligibleTrial is closest to totalCompletedReviews
    const sortedByDistance = [...candidatesBase].sort(
      (a, b) => Math.abs(a.nextEligibleTrial - totalCompletedReviews) - Math.abs(b.nextEligibleTrial - totalCompletedReviews)
    );
    const minDistance = Math.abs(sortedByDistance[0].nextEligibleTrial - totalCompletedReviews);
    poolToUse = sortedByDistance.filter(
      (t) => Math.abs(t.nextEligibleTrial - totalCompletedReviews) <= minDistance + 2
    );
  }

  // Interleave tracks if options exist
  let filteredByTrack = poolToUse;
  if (lastTrack) {
    const alternateTrackPool = poolToUse.filter((t) => t.track !== lastTrack);
    if (alternateTrackPool.length > 0) {
      filteredByTrack = alternateTrackPool;
    }
  }

  // Prioritize lower box levels first (Box 1 > 2 > 3...), then cards waiting longest
  const sorted = [...filteredByTrack].sort((a, b) => {
    if (a.box !== b.box) {
      return a.box - b.box; // lowest box first
    }
    if (difficultyOf(a) !== difficultyOf(b)) {
      return difficultyOf(a) - difficultyOf(b); // easier first within a box
    }
    if (a.nextEligibleTrial !== b.nextEligibleTrial) {
      return a.nextEligibleTrial - b.nextEligibleTrial; // earliest eligibility first
    }
    return a.streak - b.streak; // lower streak first
  });

  return sorted[0] ?? null;
}

export function unlockSingleCard(state: LeitnerDeckState, topicId: string): LeitnerDeckState {
  const updated = state.topics.map((t) =>
    t.id === topicId
      ? { ...t, status: 'active' as const, nextEligibleTrial: state.totalCompletedReviews }
      : t
  );
  const nextState = { ...state, topics: updated };
  saveDeckState(nextState);
  return nextState;
}

export function lockSingleCard(state: LeitnerDeckState, topicId: string): LeitnerDeckState {
  const updated = state.topics.map((t) =>
    t.id === topicId ? { ...t, status: 'locked' as const } : t
  );
  const nextState = { ...state, topics: updated };
  saveDeckState(nextState);
  return nextState;
}

export function resetCardBox(state: LeitnerDeckState, topicId: string): LeitnerDeckState {
  const updated = state.topics.map((t) =>
    t.id === topicId
      ? { ...t, box: 1, streak: 0, nextEligibleTrial: state.totalCompletedReviews }
      : t
  );
  const nextState = { ...state, topics: updated };
  saveDeckState(nextState);
  return nextState;
}

export function addCustomTopicToDeck(
  state: LeitnerDeckState,
  newCard: {
    id: string;
    track: TrackType;
    title: string;
    promptSeed: string;
    tags: string[];
  }
): LeitnerDeckState {
  // Ensure id is unique
  let safeId = newCard.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  if (!safeId) safeId = `custom-topic-${Date.now()}`;
  if (state.topics.some((t) => t.id === safeId)) {
    safeId = `${safeId}-${Date.now().toString(36)}`;
  }

  const createdTopic: TopicItem = {
    id: safeId,
    track: newCard.track,
    title: newCard.title.trim(),
    box: 1,
    streak: 0,
    nextEligibleTrial: state.totalCompletedReviews,
    status: 'active',
    tags: newCard.tags.map((tg) => tg.trim()).filter(Boolean),
    promptSeed: newCard.promptSeed.trim(),
  };

  const nextState: LeitnerDeckState = {
    ...state,
    topics: [createdTopic, ...state.topics],
  };

  saveDeckState(nextState);
  return nextState;
}

/** Removes a topic and remembers deleted seed topics so they are not re-added on load. */
export function deleteTopicFromDeck(state: LeitnerDeckState, topicId: string): LeitnerDeckState {
  const isSeed = (seedTopicsData as unknown as TopicItem[]).some((t) => t.id === topicId);
  const deleted = new Set(state.deletedSeedIds ?? []);
  if (isSeed) deleted.add(topicId);
  const nextState: LeitnerDeckState = {
    ...state,
    topics: state.topics.filter((t) => t.id !== topicId),
    deletedSeedIds: [...deleted],
  };
  saveDeckState(nextState);
  return nextState;
}

export function exportDeckBackup(state: LeitnerDeckState): void {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  a.href = url;
  a.download = `leitner-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function parseTestCases(value: unknown): TestCaseItem[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const cases = value
    .filter((c): c is Record<string, unknown> => typeof c === 'object' && c !== null)
    .map((c) => ({
      input: String(c.input ?? ''),
      expected: String(c.expected ?? ''),
      description: optionalString(c.description),
    }));
  return cases.length > 0 ? cases : undefined;
}

/** Validates and normalizes a backup file, preserving every card field. */
export function parseDeckBackup(jsonText: string): LeitnerDeckState {
  const parsed = JSON.parse(jsonText);
  if (!parsed || !Array.isArray(parsed.topics)) {
    throw new Error('Invalid Leitner backup file: missing topics array.');
  }
  const validTopics: TopicItem[] = parsed.topics.map((item: Record<string, unknown>) => ({
    id: String(item.id || `topic-${Math.random().toString(36).slice(2)}`),
    track: isTrackType(item.track) ? item.track : 'algorithms',
    title: String(item.title || 'Untitled Topic'),
    box: Math.max(1, Math.min(5, Number(item.box) || 1)),
    streak: Math.max(0, Number(item.streak) || 0),
    nextEligibleTrial: Math.max(0, Number(item.nextEligibleTrial) || 0),
    status: item.status === 'locked' ? 'locked' : 'active',
    tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
    difficulty: Number.isInteger(Number(item.difficulty)) && Number(item.difficulty) >= 1 && Number(item.difficulty) <= 5 ? Number(item.difficulty) : undefined,
    concept: optionalString(item.concept),
    promptSeed: String(item.promptSeed || ''),
    starterCode: optionalString(item.starterCode),
    testHarness: optionalString(item.testHarness),
    solution: optionalString(item.solution),
    referenceSolution: optionalString(item.referenceSolution),
    testCases: parseTestCases(item.testCases),
  }));

  return {
    topics: validTopics,
    totalCompletedReviews: Number.isInteger(parsed.totalCompletedReviews) ? parsed.totalCompletedReviews : 0,
    lastReviewedTrack: isTrackType(parsed.lastReviewedTrack) ? parsed.lastReviewedTrack : undefined,
    unlockedStageCount: Number.isInteger(parsed.unlockedStageCount) ? parsed.unlockedStageCount : 0,
    deletedSeedIds: Array.isArray(parsed.deletedSeedIds) ? parsed.deletedSeedIds.map(String) : [],
    practiceFilter: parsed.practiceFilter ? normalizeFilter(parsed.practiceFilter) : undefined,
    filterPresets: normalizePresets(parsed.filterPresets),
    algorithm: parsed.algorithm === 'graduated-interval' ? 'graduated-interval' : 'leitner',
  };
}

export function importDeckBackup(jsonText: string): LeitnerDeckState {
  const newState = parseDeckBackup(jsonText);
  saveDeckState(newState);
  return newState;
}
