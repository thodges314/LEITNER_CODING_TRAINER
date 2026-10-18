// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { checkStagedUnlocks, cardMatchesFilter, commitCardReview, EMPTY_FILTER } from './leitner';
import type { LeitnerDeckState, TopicItem } from './leitner';

const card = (id: string, extra: Partial<TopicItem> = {}): TopicItem => ({
  id, track: 'algorithms', title: id, box: 1, streak: 0, nextEligibleTrial: 0, status: 'active', tags: [], promptSeed: '', ...extra,
});
const mastered = (n: number, track: TopicItem['track'] = 'react') =>
  Array.from({ length: n }, (_, i) => card(`m-${track}-${i}`, { track, box: 3, streak: 2 }));
const locked = (n: number, track: TopicItem['track'], prefix = 'l') =>
  Array.from({ length: n }, (_, i) => card(`${prefix}-${track}-${i}`, { track, status: 'locked' }));

const reactOnly = (c: TopicItem) => cardMatchesFilter(c, { ...EMPTY_FILTER, includeTracks: ['react'] });

describe('staged unlocks respect the Focus filter', () => {
  it('only unlocks cards that match the Focus', () => {
    const topics = [...mastered(4), ...locked(4, 'algorithms'), ...locked(4, 'react')];
    const r = checkStagedUnlocks(topics, 0, reactOnly);
    const unlocked = r.updatedTopics.filter((t) => t.status === 'active' && t.box === 1).map((t) => t.track);
    expect(r.newlyUnlocked).toBe(4);
    expect(unlocked).toEqual(['react', 'react', 'react', 'react']);
    expect(r.updatedTopics.filter((t) => t.track === 'algorithms').every((t) => t.status === 'locked')).toBe(true);
  });

  it('keeps the unlock credit when the Focus leaves nothing to unlock', () => {
    const topics = [...mastered(4), ...locked(6, 'algorithms')];
    const r = checkStagedUnlocks(topics, 0, reactOnly);
    expect(r.newlyUnlocked).toBe(0);
    expect(r.newStageCount).toBe(0); // credit not spent
    // loosening the Focus releases the saved unlocks on the next check
    const later = checkStagedUnlocks(r.updatedTopics, r.newStageCount, () => true);
    expect(later.newlyUnlocked).toBe(4);
    expect(later.newStageCount).toBe(1);
  });

  it('consumes a stage only for the cards that really unlocked', () => {
    const topics = [...mastered(8), ...locked(2, 'react'), ...locked(5, 'algorithms')];
    const r = checkStagedUnlocks(topics, 0, reactOnly); // 2 stages earned, but only 2 matching cards
    expect(r.newlyUnlocked).toBe(2);
    expect(r.newStageCount).toBe(1);
  });

  it('without a Focus the behavior is unchanged (stages are consumed in full)', () => {
    const r = checkStagedUnlocks([...mastered(8), ...locked(3, 'react')], 0);
    expect(r.newlyUnlocked).toBe(3);
    expect(r.newStageCount).toBe(2);
  });
});

describe('commitCardReview applies the Focus when unlocking', () => {
  beforeEach(() => localStorage.clear());

  it('a React-only Focus unlocks React cards, never algorithm cards', () => {
    // three mastered cards plus one card in box 2 that passes and moves to box 3 -> 4 cards in box 3+
    const topics = [...mastered(3), card('about-to-pass', { track: 'react', box: 2, streak: 1 }), ...locked(4, 'algorithms'), ...locked(4, 'react')];
    const state: LeitnerDeckState = {
      topics,
      totalCompletedReviews: 0,
      unlockedStageCount: 0,
      practiceFilter: { ...EMPTY_FILTER, includeTracks: ['react'] },
    };
    const { nextState, newlyUnlockedCount } = commitCardReview(state, 'about-to-pass', true, 'graduated-interval');
    expect(newlyUnlockedCount).toBe(4);
    expect(nextState.topics.filter((t) => t.track === 'algorithms' && t.status === 'active')).toHaveLength(0);
    expect(nextState.topics.filter((t) => t.id.startsWith('l-react') && t.status === 'active')).toHaveLength(4);
  });
});
