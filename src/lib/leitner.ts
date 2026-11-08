import seedTopicsData from '../data/topics.json';
import { extractHarnessContracts } from './harnessContracts';
import { clearDraft } from './drafts';
import { recordDailyStat, updateDailyStatVerdict, sanitizeDailyStats } from './dailyStats';
import type { DailyStats } from './dailyStats';
import {
  CURRENT_DECK_VERSION,
  migrateDeckState,
  migrateV1ToV2,
  migrateV2ToV3,
  TRACK_ALIASES,
  RETIRED_SEED_IDS,
  migrateTrackId,
  migrateTrackList,
} from './deckMigrations';
import {
  TRACK_METADATA,
  TRACK_TYPES,
  isTrackType,
  isReactTrack,
  getTrackMeta,
} from './trackMeta';
import type { TrackType, TrackStyleMeta } from './trackMeta';
import {
  DIFFICULTY_LABELS,
  DEFAULT_DIFFICULTY,
  LADDER_PASS_BOX,
  difficultyOf,
  EMPTY_FILTER,
  normalizeFilter,
  normalizePresets,
  isFilterActive,
  CARD_PACKS,
  disabledPacks,
  isPackEnabled,
  visibleTopics,
  scheduleFilter,
  cardMatchesFilter,
} from './practiceFilter';
import type { PracticeFilter } from './practiceFilter';
import {
  ALGORITHM_STORAGE_KEY,
  DEFAULT_ALGORITHM,
  GRADUATED_ACTIVE_CHAIN_LIMIT,
  BOX_INTERVALS,
  GRADUATED_INTERVALS,
  getGraduatedTierInterval,
  intervalForBox,
  getStoredAlgorithm,
  setStoredAlgorithm,
  getSchedulingAlgorithm,
  isLadderOpen,
  checkStagedUnlocks,
  getNextCardGraduatedInterval,
  getNextCard,
  isCardAttempted,
} from './scheduling';
import type { SpacedAlgorithm } from './scheduling';
import { computeRolling24HourStats } from './deckTelemetry';
import type { ReviewHistoryEntry, Rolling24HourStats } from './deckTelemetry';
import { exportDeckBackup, parseDeckBackup } from './deckBackup';
import { STORAGE_KEYS } from './storage';

export {
  CURRENT_DECK_VERSION,
  migrateDeckState,
  migrateV1ToV2,
  migrateV2ToV3,
  TRACK_ALIASES,
  RETIRED_SEED_IDS,
  migrateTrackId,
  migrateTrackList,
  TRACK_METADATA,
  TRACK_TYPES,
  isTrackType,
  isReactTrack,
  getTrackMeta,
  DIFFICULTY_LABELS,
  DEFAULT_DIFFICULTY,
  LADDER_PASS_BOX,
  difficultyOf,
  EMPTY_FILTER,
  normalizeFilter,
  normalizePresets,
  isFilterActive,
  CARD_PACKS,
  disabledPacks,
  isPackEnabled,
  visibleTopics,
  scheduleFilter,
  cardMatchesFilter,
  ALGORITHM_STORAGE_KEY,
  DEFAULT_ALGORITHM,
  GRADUATED_ACTIVE_CHAIN_LIMIT,
  BOX_INTERVALS,
  GRADUATED_INTERVALS,
  getGraduatedTierInterval,
  intervalForBox,
  getStoredAlgorithm,
  setStoredAlgorithm,
  getSchedulingAlgorithm,
  isLadderOpen,
  checkStagedUnlocks,
  getNextCardGraduatedInterval,
  getNextCard,
  isCardAttempted,
  computeRolling24HourStats,
  exportDeckBackup,
  parseDeckBackup,
};
export type {
  TrackType,
  TrackStyleMeta,
  PracticeFilter,
  SpacedAlgorithm,
  ReviewHistoryEntry,
  Rolling24HourStats,
};

export interface TestCaseItem {
  input: string;
  expected: string;
  description?: string;
  callSignature?: string;
}

export interface TopicItem {
  id: string;
  track: TrackType;
  title: string;
  box: number; // 1 to 5 (Leitner) or 1+ (Graduated Tiers)
  streak: number;
  nextEligibleTrial: number; // The global trial index when this card can next appear
  status: 'active' | 'locked';
  /** True once this card has been attempted in practice at least once. */
  attempted?: boolean;
  /** True when a user has pulled this card out of active spaced repetition study cycle without deleting it. */
  deactivated?: boolean;
  tags: string[];
  /** 1 (warm-up) to 5 (expert). Easier rungs of a concept are mastered before harder ones unlock. */
  difficulty?: number;
  /** Optional card pack (e.g. 'algorithms-advanced'). Cards in a disabled pack are never scheduled, unlocked or listed. */
  pack?: string;
  /** Cards sharing a concept form a ladder ordered by difficulty (e.g. 'rate-limiting', 'promise'). */
  concept?: string;
  promptSeed: string;
  starterCode?: string;
  testHarness?: string;
  solution?: string;
  referenceSolution?: string;
  referenceSolutionTs?: string;
  testCases?: TestCaseItem[];
  targetTime?: string;
  targetSpace?: string;
  complexityExplanation?: string;
  previewCode?: string;
  /** Explicit libraries to load in the preview window (e.g. ['react'], ['d3'], ['tailwind']) */
  previewLibraries?: string[];
  /** Annotated by build-cards.mjs for cards that author and render a React component UI */
  rendersComponent?: boolean;
  /** Explicitly marks whether the card requires a browser DOM environment (window, document, HTMLElement) */
  requiresDom?: boolean;
  /** Explicit language/format expected for user input (e.g. 'html', 'javascript', 'typescript', 'sql', 'graphql') */
  inputLanguage?: CardInputLanguage;
}

export type CardInputLanguage = 'javascript' | 'typescript' | 'html' | 'sql' | 'graphql';

export function getCardInputLanguage(
  card: Pick<TopicItem, 'inputLanguage'> | null | undefined
): CardInputLanguage {
  return card?.inputLanguage ?? 'javascript';
}

export function isHtmlCard(
  card: Pick<TopicItem, 'inputLanguage' | 'track'> | null | undefined
): boolean {
  return getCardInputLanguage(card) === 'html';
}

export interface LeitnerDeckState {
  /** Schema version of the deck state, used for sequential migrations. */
  deckVersion?: number;
  /** Practice focus: only matching cards are scheduled. */
  practiceFilter?: PracticeFilter;
  /** Enabled optional card packs (see CARD_PACKS). Default: none, i.e. optional packs are hidden. */
  enabledPacks?: string[];
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
  /** Log of recent review outcomes for sparkline and velocity diagnostics (capped at last 20) */
  recentReviews?: ReviewHistoryEntry[];
  /** Scored reviews and passes per local calendar day (see dailyStats.ts), for the activity graph. */
  dailyStats?: DailyStats;
}

export const STORAGE_KEY = STORAGE_KEYS.DECK;

/**
 * Specifies whether a card authors and renders a React component UI
 * (backed by explicit build annotation card.rendersComponent and/or card.previewCode).
 */
export function isReactComponentCard(card?: TopicItem | null): boolean {
  if (!card) return false;
  return Boolean(card.rendersComponent || card.previewCode);
}

export function setEnabledPacks(state: LeitnerDeckState, packs: string[]): LeitnerDeckState {
  const known = packs.filter((p) => p in CARD_PACKS);
  const nextState: LeitnerDeckState = { ...state, enabledPacks: Array.from(new Set(known)) };
  saveDeckState(nextState);
  return nextState;
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

export function setSchedulingAlgorithm(state: LeitnerDeckState, algo: SpacedAlgorithm): LeitnerDeckState {
  setStoredAlgorithm(algo);
  const nextState: LeitnerDeckState = { ...state, algorithm: algo };
  saveDeckState(nextState);
  return nextState;
}

export function getDefaultDeckState(
  seedTopics: TopicItem[] = seedTopicsData as unknown as TopicItem[]
): LeitnerDeckState {
  return {
    deckVersion: CURRENT_DECK_VERSION,
    topics: seedTopics.map((t) => ({ ...t })),
    totalCompletedReviews: 0,
    lastReviewedTrack: undefined,
    unlockedStageCount: 0,
    deletedSeedIds: [],
    algorithm: getStoredAlgorithm(),
  };
}

/** Fields describing the card itself (owned by the seed file), as opposed to review progress. */
export const SEED_CONTENT_FIELDS = [
  'track',
  'title',
  'tags',
  'difficulty',
  'concept',
  'pack',
  'promptSeed',
  'starterCode',
  'testHarness',
  'solution',
  'referenceSolution',
  'referenceSolutionTs',
  'testCases',
  'targetTime',
  'targetSpace',
  'complexityExplanation',
  'previewCode',
  'previewLibraries',
  'rendersComponent',
  'requiresDom',
  'inputLanguage',
] as const;

/**
 * Merges a stored deck with the current seed topics.
 * - Progress (box, streak, schedule, status) always comes from the stored card.
 * - Content of seed-backed cards is refreshed from the seed so edits to topics.json take effect.
 * - Seed topics that are new and were not deleted by the user are appended in their default state.
 * - Custom (non-seed) cards are left untouched with preserved progress.
 */
export function mergeStoredWithSeed(
  rawParsed: LeitnerDeckState,
  seedTopics: TopicItem[] = seedTopicsData as unknown as TopicItem[]
): LeitnerDeckState {
  const parsed = migrateDeckState(rawParsed);
  const seedMap = new Map(seedTopics.map((t) => [t.id, t]));
  const deleted = new Set(parsed.deletedSeedIds ?? []);

  const hydratedTopics = parsed.topics
    // A stored card that is no longer in the bundled deck and has no content of its own (it was saved without its
    // content) cannot be played: drop it instead of keeping an empty card.
    .filter((t) => !RETIRED_SEED_IDS.has(t.id) && (seedMap.has(t.id) || typeof t.promptSeed === 'string'))
    .map((t) => {
    const seed = seedMap.get(t.id);
    if (!seed) {
      // Custom (non-seed) card: keep untouched, ensuring progress invariants are numbers
      const rawBox = Math.max(1, Math.floor(Number(t.box)) || 1);
      const isGraduated = (parsed.algorithm ?? getStoredAlgorithm()) === 'graduated-interval';
      const customTopic: TopicItem = {
        ...t,
        track: migrateTrackId(t.track) as TrackType,
        box: isGraduated ? rawBox : Math.min(5, rawBox),
        streak: Math.max(0, Math.floor(Number(t.streak)) || 0),
        nextEligibleTrial: Math.max(0, Math.floor(Number(t.nextEligibleTrial)) || 0),
        status: t.status === 'locked' ? ('locked' as const) : ('active' as const),
      };
      if (customTopic.pack === 'algorithms-advanced') delete customTopic.pack;
      return customTopic;
    }

    // Seed-backed card: refresh content fields from seed
    const merged: TopicItem = { ...t };
    for (const field of SEED_CONTENT_FIELDS) {
      if (seed[field] !== undefined) {
        const val = seed[field];
        (merged as unknown as Record<string, unknown>)[field] = Array.isArray(val) ? [...val] : val;
      }
    }
    const fallbackSol = merged.referenceSolution ?? merged.solution ?? merged.starterCode;
    merged.referenceSolution = merged.referenceSolution ?? fallbackSol;
    // Older saved decks carry full duplicate copies of the reference solution; the seed no longer has them.
    if (seed.solution === undefined) delete merged.solution;
    if (seed.starterCode === undefined) delete merged.starterCode;
    if (seed.pack === undefined || merged.pack === 'algorithms-advanced') delete merged.pack;
    if (seed.previewLibraries === undefined) delete merged.previewLibraries;
    if (seed.rendersComponent === undefined) delete merged.rendersComponent;
    if (seed.requiresDom === undefined) delete merged.requiresDom;
    merged.track = (seed.track ?? migrateTrackId(merged.track)) as TrackType;

    // Strictly preserve user review progress fields
    const isGraduated = (parsed.algorithm ?? getStoredAlgorithm()) === 'graduated-interval';
    const rawBox = Math.max(1, Math.floor(Number(t.box)) || (seed.box ?? 1));
    merged.box = isGraduated ? rawBox : Math.min(5, rawBox);
    merged.streak = Math.max(0, Math.floor(Number(t.streak)) || 0);
    merged.nextEligibleTrial = Math.max(0, Math.floor(Number(t.nextEligibleTrial)) || 0);
    merged.status = t.status === 'locked' || t.status === 'active' ? t.status : (seed.status === 'active' ? 'active' : 'locked');
    if (deleted.has(t.id)) {
      merged.deactivated = true;
      deleted.delete(t.id);
    }

    return merged;
  });

  const seenIds = new Set(hydratedTopics.map((t) => t.id));

  // Automatically convert legacy deleted seed cards into suspended (deactivated: true) topics
  const convertedDeletedTopics: TopicItem[] = [];
  for (const id of Array.from(deleted)) {
    const seed = seedMap.get(id);
    if (seed && !RETIRED_SEED_IDS.has(id)) {
      if (!seenIds.has(id)) {
        seenIds.add(id);
        const converted: TopicItem = {
          ...seed,
          box: Math.max(1, Math.floor(Number(seed.box)) || 1),
          streak: Math.max(0, Math.floor(Number(seed.streak)) || 0),
          nextEligibleTrial: Math.max(0, Math.floor(Number(seed.nextEligibleTrial)) || 0),
          status: seed.status === 'active' ? ('active' as const) : ('locked' as const),
          deactivated: true,
        };
        if (converted.pack === 'algorithms-advanced' || seed.pack === undefined) delete converted.pack;
        convertedDeletedTopics.push(converted);
      }
      deleted.delete(id);
    }
  }

  // Append new seed topics that are not in stored deck and not deleted by user
  const newSeedTopics = seedTopics
    .filter((t) => !seenIds.has(t.id) && !deleted.has(t.id))
    .map((t) => {
      seenIds.add(t.id);
      const newTopic: TopicItem = {
        ...t,
        box: Math.max(1, Math.floor(Number(t.box)) || 1),
        streak: Math.max(0, Math.floor(Number(t.streak)) || 0),
        nextEligibleTrial: Math.max(0, Math.floor(Number(t.nextEligibleTrial)) || 0),
        status: t.status === 'active' ? ('active' as const) : ('locked' as const),
      };
      if (newTopic.pack === 'algorithms-advanced' || t.pack === undefined) delete newTopic.pack;
      return newTopic;
    });

  return {
    deckVersion: CURRENT_DECK_VERSION,
    topics: [...hydratedTopics, ...convertedDeletedTopics, ...newSeedTopics],
    totalCompletedReviews: typeof parsed.totalCompletedReviews === 'number' && Number.isInteger(parsed.totalCompletedReviews) && parsed.totalCompletedReviews >= 0 ? parsed.totalCompletedReviews : 0,
    lastReviewedTrack: parsed.lastReviewedTrack,
    unlockedStageCount: typeof parsed.unlockedStageCount === 'number' && Number.isInteger(parsed.unlockedStageCount) && parsed.unlockedStageCount >= 0 ? parsed.unlockedStageCount : 0,
    deletedSeedIds: [...deleted],
    practiceFilter: parsed.practiceFilter ? normalizeFilter(parsed.practiceFilter) : undefined,
    enabledPacks: Array.isArray(parsed.enabledPacks) ? parsed.enabledPacks.map(String).filter((p: string) => p in CARD_PACKS) : undefined,
    filterPresets: normalizePresets(parsed.filterPresets),
    algorithm: parsed.algorithm === 'graduated-interval' ? 'graduated-interval' : parsed.algorithm === 'leitner' ? 'leitner' : getStoredAlgorithm(),
    recentReviews: Array.isArray(parsed.recentReviews) ? parsed.recentReviews : undefined,
    dailyStats: sanitizeDailyStats(parsed.dailyStats),
  };
}

export function loadDeckState(
  seedTopics: TopicItem[] = seedTopicsData as unknown as TopicItem[]
): LeitnerDeckState {
  if (typeof window === 'undefined') return getDefaultDeckState(seedTopics);

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultState = getDefaultDeckState(seedTopics);
      saveDeckState(defaultState);
      return defaultState;
    }
    const parsed = JSON.parse(raw) as LeitnerDeckState;
    if (!parsed || !Array.isArray(parsed.topics)) {
      throw new Error('Invalid deck structure');
    }
    const loadedState = mergeStoredWithSeed(parsed, seedTopics);
    saveDeckState(loadedState);
    return loadedState;
  } catch (err) {
    console.error('Failed to load deck from localStorage, resetting to seed:', err);
    const defaultState = getDefaultDeckState(seedTopics);
    saveDeckState(defaultState);
    return defaultState;
  }
}

/**
 * Large content fields of built-in cards. They are never written to localStorage: `mergeStoredWithSeed` refills them
 * from the bundled deck on every load, so storing them only wasted space (about 1.4 MB per save, against a ~5 MB
 * browser quota) and slowed every review. Custom (non-seed) cards are stored in full.
 */
export const HEAVY_SEED_FIELDS = [
  'promptSeed',
  'starterCode',
  'testHarness',
  'solution',
  'referenceSolution',
  'referenceSolutionTs',
  'testCases',
  'targetTime',
  'targetSpace',
  'complexityExplanation',
  'previewCode',
] as const;

let seedIdSet: Set<string> | null = null;

/** The state as it is persisted: built-in cards keep their progress and small metadata, not their heavy content. */
export function slimForStorage(state: LeitnerDeckState): LeitnerDeckState {
  seedIdSet ??= new Set((seedTopicsData as unknown as TopicItem[]).map((t) => t.id));
  const seedIds = seedIdSet;
  return {
    ...state,
    deckVersion: state.deckVersion ?? CURRENT_DECK_VERSION,
    topics: state.topics.map((t) => {
      if (!seedIds.has(t.id)) return t;
      const slim: Record<string, unknown> = { ...t };
      for (const field of HEAVY_SEED_FIELDS) delete slim[field];
      return slim as unknown as TopicItem;
    }),
  };
}

export function saveDeckState(state: LeitnerDeckState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slimForStorage(state)));
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
  clearDraft(topicId);
  const algo = algorithmOverride ?? getSchedulingAlgorithm(state);
  const currentTotal = state.totalCompletedReviews;
  const nextTotal = currentTotal + 1;
  let reviewedTrack: TrackType | undefined = state.lastReviewedTrack;
  let updatedCard: TopicItem | null = null;
  const cardBefore = state.topics.find((item) => item.id === topicId);
  const previousBox = cardBefore ? cardBefore.box : 1;
  const activeDeckSize = state.topics.filter((t) => t.status === 'active').length;

  const updatedTopics = state.topics.map((item) => {
    if (item.id !== topicId) return item;

    reviewedTrack = item.track;
    let nextBox: number;
    let nextStreak: number;
    let nextEligibleTrial: number;

    if (passed) {
      nextBox = algo === 'graduated-interval' ? item.box + 1 : Math.min(5, item.box + 1);
      nextStreak = item.streak + 1;
      nextEligibleTrial = nextTotal + intervalForBox(nextBox, algo, activeDeckSize);
    } else {
      nextBox = algo === 'graduated-interval' ? Math.max(1, Math.floor(item.box / 2)) : 1;
      nextStreak = 0;
      nextEligibleTrial = nextTotal + intervalForBox(nextBox, algo, activeDeckSize);
    }

    const modified: TopicItem = {
      ...item,
      box: nextBox,
      streak: nextStreak,
      nextEligibleTrial,
      status: 'active',
      attempted: true,
    };
    updatedCard = modified;
    return modified;
  });

  // Check staged unlocks
  const { updatedTopics: finalTopics, newStageCount, newlyUnlocked } = checkStagedUnlocks(
    updatedTopics,
    state.unlockedStageCount ?? 0,
    (card) => cardMatchesFilter(card, scheduleFilter(state))
  );

  const reviewEntry: ReviewHistoryEntry = {
    topicId,
    passed,
    box: updatedCard ? (updatedCard as TopicItem).box : 1,
    previousBox,
    trial: nextTotal,
    timestamp: Date.now(),
  };
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const inWindow = (state.recentReviews ?? []).filter(
    (r) => typeof r.timestamp === 'number' && r.timestamp >= cutoff
  );
  const updatedRecent = [...inWindow.slice(-249), reviewEntry];

  const nextState: LeitnerDeckState = {
    ...state,
    topics: finalTopics,
    totalCompletedReviews: nextTotal,
    lastReviewedTrack: reviewedTrack,
    unlockedStageCount: newStageCount,
    algorithm: algo,
    recentReviews: updatedRecent,
    dailyStats: recordDailyStat(state.dailyStats, reviewEntry.timestamp ?? Date.now(), passed),
  };

  saveDeckState(nextState);

  return {
    nextState,
    newlyUnlockedCount: newlyUnlocked,
    updatedCard: updatedCard || state.topics[0],
  };
}

/**
 * Overrides the verdict of the review that was just committed for cardBeforeReview.
 * Updates box, streak, nextEligibleTrial, recentReviews entry, and dailyStats
 * without incrementing totalCompletedReviews again.
 */
export function overrideCommittedReview(
  state: LeitnerDeckState,
  cardBeforeReview: TopicItem,
  passed: boolean,
  algorithmOverride?: SpacedAlgorithm
): LeitnerDeckState {
  const algo = algorithmOverride ?? getSchedulingAlgorithm(state);
  const activeDeckSize = state.topics.filter((t) => t.status === 'active').length;
  const currentTotal = state.totalCompletedReviews;

  let nextBox: number;
  let nextStreak: number;
  let nextEligibleTrial: number;

  if (passed) {
    nextBox = algo === 'graduated-interval' ? cardBeforeReview.box + 1 : Math.min(5, cardBeforeReview.box + 1);
    nextStreak = cardBeforeReview.streak + 1;
    nextEligibleTrial = currentTotal + intervalForBox(nextBox, algo, activeDeckSize);
  } else {
    nextBox = algo === 'graduated-interval' ? Math.max(1, Math.floor(cardBeforeReview.box / 2)) : 1;
    nextStreak = 0;
    nextEligibleTrial = currentTotal + intervalForBox(nextBox, algo, activeDeckSize);
  }

  const updatedTopics = state.topics.map((item) => {
    if (item.id !== cardBeforeReview.id) return item;
    return {
      ...item,
      box: nextBox,
      streak: nextStreak,
      nextEligibleTrial,
      status: 'active' as const,
      attempted: true,
    };
  });

  const { updatedTopics: finalTopics } = checkStagedUnlocks(
    updatedTopics,
    state.unlockedStageCount ?? 0,
    (card) => cardMatchesFilter(card, scheduleFilter(state))
  );

  let reviewTimestamp = Date.now();
  const updatedRecent = (state.recentReviews ?? []).map((entry, idx, arr) => {
    if (idx === arr.length - 1 && entry.topicId === cardBeforeReview.id) {
      if (entry.timestamp) reviewTimestamp = entry.timestamp;
      return {
        ...entry,
        passed,
        box: nextBox,
        previousBox: cardBeforeReview.box,
      };
    }
    return entry;
  });

  const nextState: LeitnerDeckState = {
    ...state,
    topics: finalTopics,
    recentReviews: updatedRecent,
    dailyStats: updateDailyStatVerdict(state.dailyStats, reviewTimestamp, passed),
  };

  saveDeckState(nextState);
  return nextState;
}

export function unlockSingleCard(state: LeitnerDeckState, topicId: string): LeitnerDeckState {
  const updated = state.topics.map((t) =>
    t.id === topicId
      ? { ...t, status: 'active' as const, nextEligibleTrial: 0 }
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
  clearDraft(topicId);
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
    targetTime?: string;
    targetSpace?: string;
    complexityExplanation?: string;
    starterCode?: string;
    referenceSolution?: string;
    testHarness?: string;
    difficulty?: number;
    concept?: string;
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
    targetTime: newCard.targetTime?.trim() || 'O(n)',
    targetSpace: newCard.targetSpace?.trim() || 'O(1)',
    complexityExplanation: newCard.complexityExplanation?.trim(),
    starterCode: newCard.starterCode?.trim(),
    solution: newCard.referenceSolution?.trim(),
    referenceSolution: newCard.referenceSolution?.trim(),
    testHarness: newCard.testHarness?.trim(),
    difficulty: newCard.difficulty ?? 2,
    concept: newCard.concept?.trim(),
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
  clearDraft(topicId);
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

/** Deactivates a topic, pulling it out of the active spaced repetition study cycle while keeping it in the catalog. */
export function deactivateTopic(state: LeitnerDeckState, topicId: string): LeitnerDeckState {
  clearDraft(topicId);
  const nextState: LeitnerDeckState = {
    ...state,
    topics: state.topics.map((t) => (t.id === topicId ? { ...t, deactivated: true } : t)),
  };
  saveDeckState(nextState);
  return nextState;
}

/** Reactivates a deactivated topic back into the active study cycle. */
export function reactivateTopic(state: LeitnerDeckState, topicId: string): LeitnerDeckState {
  const nextState: LeitnerDeckState = {
    ...state,
    topics: state.topics.map((t) => (t.id === topicId ? { ...t, deactivated: false } : t)),
  };
  saveDeckState(nextState);
  return nextState;
}

/** Toggles topic deactivation status. */
export function toggleTopicDeactivation(state: LeitnerDeckState, topicId: string): LeitnerDeckState {
  const target = state.topics.find((t) => t.id === topicId);
  if (!target) return state;
  return target.deactivated ? reactivateTopic(state, topicId) : deactivateTopic(state, topicId);
}

export function importDeckBackup(
  jsonText: string,
  seedTopics: TopicItem[] = seedTopicsData as unknown as TopicItem[]
): LeitnerDeckState {
  const parsedBackup = parseDeckBackup(jsonText);
  const reconciled = mergeStoredWithSeed(parsedBackup, seedTopics);
  saveDeckState(reconciled);
  return reconciled;
}
