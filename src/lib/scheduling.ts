import {
  LADDER_PASS_BOX,
  difficultyOf,
  cardMatchesFilter,
} from './practiceFilter';
import type { PracticeFilter } from './practiceFilter';
import { STORAGE_KEYS, safeGetItem } from './storage';
import type { TopicItem, LeitnerDeckState } from './leitner';
import type { TrackType } from './trackMeta';

export type SpacedAlgorithm = 'leitner' | 'graduated-interval';

export const ALGORITHM_STORAGE_KEY = STORAGE_KEYS.ALGORITHM;
export const DEFAULT_ALGORITHM: SpacedAlgorithm = 'graduated-interval';

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
 * Step 6: +75 trials (~2.2x geometric expansion)
 * Step 7: +165 trials
 * Step 8: +360 trials
 * Step 9: +800 trials
 * Step 10+: dynamic geometric growth (~2.2x per tier) for continuous maintenance
 */
export const GRADUATED_INTERVALS: Record<number, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 16,
  5: 35,
  6: 75,
  7: 165,
  8: 360,
  9: 800,
};

export function getGraduatedTierInterval(tier: number): number {
  if (tier <= 1) return 1;
  if (tier in GRADUATED_INTERVALS) {
    return GRADUATED_INTERVALS[tier];
  }
  // Dynamic geometric progression (~2.2x) for Tier 10 and beyond
  return Math.round(800 * Math.pow(2.2, tier - 9));
}

export function intervalForBox(
  box: number,
  algorithm: SpacedAlgorithm = 'leitner',
  activeDeckSize?: number
): number {
  if (algorithm === 'graduated-interval') {
    const raw = getGraduatedTierInterval(box);
    if (typeof activeDeckSize === 'number' && activeDeckSize > 0) {
      return Math.max(1, Math.min(raw, activeDeckSize));
    }
    return raw;
  }
  return BOX_INTERVALS[box] ?? 1;
}

export function getStoredAlgorithm(): SpacedAlgorithm {
  if (typeof window === 'undefined') return DEFAULT_ALGORITHM;
  const val = safeGetItem(ALGORITHM_STORAGE_KEY);
  if (val === 'graduated-interval') return 'graduated-interval';
  if (val === 'leitner') return 'leitner';
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

export function getSchedulingAlgorithm(state?: Pick<LeitnerDeckState, 'algorithm'>): SpacedAlgorithm {
  if (state?.algorithm === 'graduated-interval') {
    return 'graduated-interval';
  }
  if (state?.algorithm === 'leitner') {
    return 'leitner';
  }
  return getStoredAlgorithm();
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
export function checkStagedUnlocks(
  topics: TopicItem[],
  currentStageCount: number,
  isAllowed: (card: TopicItem) => boolean = () => true
): { updatedTopics: TopicItem[]; newStageCount: number; newlyUnlocked: number } {
  const activeBox3Plus = topics.filter((t) => t.status === 'active' && t.box >= 3).length;
  const targetStages = Math.floor(activeBox3Plus / 4);

  if (targetStages > currentStageCount) {
    const stagesToUnlock = targetStages - currentStageCount;
    const cardsToUnlock = stagesToUnlock * 4;
    // Unlock easiest-first, and only cards whose easier rungs (same concept) are already learned.
    const toUnlock = new Set(
      topics
        .map((t, index) => ({ t, index }))
        .filter(({ t }) => t.status === 'locked' && isAllowed(t) && isLadderOpen(t, topics))
        .sort((a, b) => difficultyOf(a.t) - difficultyOf(b.t) || a.index - b.index)
        .slice(0, cardsToUnlock)
        .map(({ t }) => t.id)
    );
    const unlockedCount = toUnlock.size;
    // Unlock credit is only spent on cards that really unlock. If the user's Focus (or a disabled pack) held cards
    // back, the unspent credit stays, so loosening the Focus later releases those unlocks on the next review.
    const heldBack = topics.some((t) => t.status === 'locked' && !isAllowed(t));
    const consumedStages = unlockedCount < cardsToUnlock && heldBack ? Math.ceil(unlockedCount / 4) : stagesToUnlock;

    const updatedTopics = topics.map((t) =>
      toUnlock.has(t.id) ? { ...t, status: 'active' as const, box: 1, streak: 0, nextEligibleTrial: 0 } : t
    );

    return {
      updatedTopics,
      newStageCount: currentStageCount + consumedStages,
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
  const activeTopics = topics.filter((t) => t.status === 'active' && !t.deactivated && cardMatchesFilter(t, filter));
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

  const activeTopics = topics.filter((t) => t.status === 'active' && !t.deactivated && cardMatchesFilter(t, filter));
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

export function isCardAttempted(card: TopicItem): boolean {
  return !card.deactivated && card.status === 'active' && Boolean(card.attempted || card.box > 1 || card.streak > 0);
}
