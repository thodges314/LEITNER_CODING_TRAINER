import seedTopicsData from '../data/topics.json';

export type TrackType =
  | 'async-js'
  | 'data-structures'
  | 'react'
  | 'algorithms'
  | 'js-runtime-fundamentals'
  | 'async-web-plumbing'
  | 'collections-transformations'
  | 'react-patterns'
  | 'algorithmic-screens';

export interface TopicItem {
  id: string;
  track: TrackType;
  title: string;
  box: number; // 1 to 5
  streak: number;
  nextEligibleTrial: number; // The global trial index when this card can next appear
  status: 'active' | 'locked';
  tags: string[];
  promptSeed: string;
  starterCode?: string;
  testHarness?: string;
}

export interface LeitnerDeckState {
  topics: TopicItem[];
  totalCompletedReviews: number;
  lastReviewedTrack?: TrackType;
  unlockedStageCount?: number;
}

export const STORAGE_KEY = 'leitner_coding_deck';

export const BOX_INTERVALS: Record<number, number> = {
  1: 1,  // immediate rotation (+1 trial)
  2: 4,  // +4 trials
  3: 10, // +10 trials
  4: 22, // +22 trials
  5: 45, // +45 trials (Mastered)
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
    bg: 'rgba(168, 85, 247, 0.12)',
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
};

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

export function intervalForBox(box: number): number {
  return BOX_INTERVALS[box] ?? 1;
}

export function getDefaultDeckState(): LeitnerDeckState {
  return {
    topics: (seedTopicsData as unknown as TopicItem[]).map((t) => ({ ...t })),
    totalCompletedReviews: 0,
    lastReviewedTrack: undefined,
    unlockedStageCount: 0,
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
    const seedMap = new Map((seedTopicsData as unknown as TopicItem[]).map((t) => [t.id, t]));
    const hydratedTopics = parsed.topics.map((t) => {
      const seed = seedMap.get(t.id);
      return {
        ...t,
        starterCode: t.starterCode ?? seed?.starterCode,
        testHarness: t.testHarness ?? seed?.testHarness,
      };
    });

    return {
      topics: hydratedTopics,
      totalCompletedReviews: Number.isInteger(parsed.totalCompletedReviews) ? parsed.totalCompletedReviews : 0,
      lastReviewedTrack: parsed.lastReviewedTrack,
      unlockedStageCount: parsed.unlockedStageCount ?? 0,
    };
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
 * Checks staged unlock condition:
 * When at least 4 active cards reach Box 3 or higher, automatically unlock the next 4 locked cards.
 */
export function checkStagedUnlocks(topics: TopicItem[], currentStageCount: number): { updatedTopics: TopicItem[]; newStageCount: number; newlyUnlocked: number } {
  const activeBox3Plus = topics.filter((t) => t.status === 'active' && t.box >= 3).length;
  // Each stage requires (stage + 1) * 4 cards in Box 3+
  const targetStages = Math.floor(activeBox3Plus / 4);

  if (targetStages > currentStageCount) {
    const stagesToUnlock = targetStages - currentStageCount;
    const cardsToUnlock = stagesToUnlock * 4;
    let unlockedCount = 0;

    const updatedTopics = topics.map((t) => {
      if (t.status === 'locked' && unlockedCount < cardsToUnlock) {
        unlockedCount++;
        return {
          ...t,
          status: 'active' as const,
          box: 1,
          streak: 0,
          nextEligibleTrial: 0,
        };
      }
      return t;
    });

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
  passed: boolean
): { nextState: LeitnerDeckState; newlyUnlockedCount: number; updatedCard: TopicItem } {
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
      nextEligibleTrial = nextTotal + intervalForBox(nextBox);
    } else {
      nextBox = 1;
      nextStreak = 0;
      nextEligibleTrial = nextTotal + 1;
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
    topics: finalTopics,
    totalCompletedReviews: nextTotal,
    lastReviewedTrack: reviewedTrack,
    unlockedStageCount: newStageCount,
  };

  saveDeckState(nextState);

  return {
    nextState,
    newlyUnlockedCount: newlyUnlocked,
    updatedCard: updatedCard || state.topics[0],
  };
}

/**
 * Next Card Selection (getNextCard(topics, totalCompletedReviews)):
 * - Filter to status === 'active'
 * - Eligible pool: cards where nextEligibleTrial <= totalCompletedReviews
 * - If the eligible pool is empty (all cards are spaced out ahead), pick the card whose nextEligibleTrial is closest to the current trial count.
 * - Prioritize lower box levels first, interleaving tracks so the exact same track is not presented consecutively when options exist.
 */
export function getNextCard(
  topics: TopicItem[],
  totalCompletedReviews: number,
  lastTrack?: TrackType,
  currentCardId?: string
): TopicItem | null {
  const activeTopics = topics.filter((t) => t.status === 'active');
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

/**
 * Removes a topic by id from state array and persists the filtered array back
 * to localStorage under 'leitner_coding_deck'.
 */
export function deleteTopic(id: string): LeitnerDeckState {
  const current = loadDeckState();
  const updatedTopics = current.topics.filter((t) => t.id !== id);
  const nextState: LeitnerDeckState = {
    ...current,
    topics: updatedTopics,
  };
  saveDeckState(nextState);
  return nextState;
}

export function deleteTopicFromDeck(state: LeitnerDeckState, topicId: string): LeitnerDeckState {
  const updated = state.topics.filter((t) => t.id !== topicId);
  const nextState = { ...state, topics: updated };
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

export function importDeckBackup(jsonText: string): LeitnerDeckState {
  const parsed = JSON.parse(jsonText);
  if (!parsed || !Array.isArray(parsed.topics)) {
    throw new Error('Invalid Leitner backup file: missing topics array.');
  }
  const validTopics: TopicItem[] = parsed.topics.map((item: Record<string, unknown>) => ({
    id: String(item.id || `topic-${Math.random()}`),
    track: (typeof item.track === 'string' && ['async-js', 'data-structures', 'react', 'algorithms'].includes(item.track))
      ? (item.track as TrackType)
      : 'algorithms',
    title: String(item.title || 'Untitled Topic'),
    box: Math.max(1, Math.min(5, Number(item.box) || 1)),
    streak: Math.max(0, Number(item.streak) || 0),
    nextEligibleTrial: Math.max(0, Number(item.nextEligibleTrial) || 0),
    status: item.status === 'locked' ? 'locked' : 'active',
    tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
    promptSeed: String(item.promptSeed || ''),
  }));

  const newState: LeitnerDeckState = {
    topics: validTopics,
    totalCompletedReviews: Number.isInteger(parsed.totalCompletedReviews) ? parsed.totalCompletedReviews : 0,
    lastReviewedTrack: parsed.lastReviewedTrack,
    unlockedStageCount: Number.isInteger(parsed.unlockedStageCount) ? parsed.unlockedStageCount : 0,
  };

  saveDeckState(newState);
  return newState;
}
