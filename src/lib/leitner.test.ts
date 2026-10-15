import { describe, expect, it } from 'vitest';
import {
  BOX_INTERVALS,
  GRADUATED_INTERVALS,
  checkStagedUnlocks,
  commitCardReview,
  deleteTopicFromDeck,
  getNextCard,
  getTopicTestCases,
  isTrackType,
  mergeStoredWithSeed,
  parseDeckBackup,
  getSchedulingAlgorithm,
  setSchedulingAlgorithm,
} from './leitner';
import type { LeitnerDeckState, TopicItem } from './leitner';

function card(over: Partial<TopicItem> & { id: string }): TopicItem {
  return {
    track: 'algorithms',
    title: over.id,
    box: 1,
    streak: 0,
    nextEligibleTrial: 0,
    status: 'active',
    tags: [],
    promptSeed: 'seed',
    ...over,
  };
}

function deck(topics: TopicItem[], over: Partial<LeitnerDeckState> = {}): LeitnerDeckState {
  return { topics, totalCompletedReviews: 0, unlockedStageCount: 0, ...over };
}

describe('commitCardReview', () => {
  it('promotes on pass and schedules by box interval', () => {
    const { nextState, updatedCard } = commitCardReview(deck([card({ id: 'a', box: 2, streak: 1 })]), 'a', true);
    expect(updatedCard.box).toBe(3);
    expect(updatedCard.streak).toBe(2);
    expect(nextState.totalCompletedReviews).toBe(1);
    expect(updatedCard.nextEligibleTrial).toBe(1 + BOX_INTERVALS[3]);
  });

  it('caps at box 5', () => {
    const { updatedCard } = commitCardReview(deck([card({ id: 'a', box: 5 })]), 'a', true);
    expect(updatedCard.box).toBe(5);
  });

  it('resets to box 1 on failure and schedules immediate replay', () => {
    const { updatedCard } = commitCardReview(deck([card({ id: 'a', box: 4, streak: 3 })], { totalCompletedReviews: 7 }), 'a', false);
    expect(updatedCard.box).toBe(1);
    expect(updatedCard.streak).toBe(0);
    expect(updatedCard.nextEligibleTrial).toBe(8);
  });

  it('records the reviewed track', () => {
    const { nextState } = commitCardReview(deck([card({ id: 'a', track: 'react' })]), 'a', true);
    expect(nextState.lastReviewedTrack).toBe('react');
  });
});

describe('checkStagedUnlocks', () => {
  const locked = (n: number) => Array.from({ length: n }, (_, i) => card({ id: `l${i}`, status: 'locked', box: 3 }));
  const mastered = (n: number) => Array.from({ length: n }, (_, i) => card({ id: `m${i}`, box: 3 }));

  it('does nothing below 4 cards in box 3+', () => {
    const r = checkStagedUnlocks([...mastered(3), ...locked(8)], 0);
    expect(r.newlyUnlocked).toBe(0);
  });

  it('unlocks 4 cards per 4 cards in box 3+, resetting them to box 1', () => {
    const r = checkStagedUnlocks([...mastered(4), ...locked(8)], 0);
    expect(r.newlyUnlocked).toBe(4);
    expect(r.newStageCount).toBe(1);
    const unlocked = r.updatedTopics.filter((t) => t.id.startsWith('l') && t.status === 'active');
    expect(unlocked).toHaveLength(4);
    expect(unlocked.every((t) => t.box === 1 && t.streak === 0)).toBe(true);
  });

  it('does not re-unlock for a stage already granted', () => {
    const r = checkStagedUnlocks([...mastered(4), ...locked(8)], 1);
    expect(r.newlyUnlocked).toBe(0);
  });
});

describe('getNextCard', () => {
  it('returns null with no active cards', () => {
    expect(getNextCard([card({ id: 'a', status: 'locked' })], 0)).toBeNull();
  });

  it('skips locked cards and prefers lower boxes among eligible ones', () => {
    const topics = [
      card({ id: 'high', box: 4 }),
      card({ id: 'low', box: 1 }),
      card({ id: 'locked', box: 1, status: 'locked' }),
    ];
    expect(getNextCard(topics, 5)?.id).toBe('low');
  });

  it('does not return cards that are not yet due while others are eligible', () => {
    const topics = [card({ id: 'later', box: 1, nextEligibleTrial: 50 }), card({ id: 'due', box: 3 })];
    expect(getNextCard(topics, 10)?.id).toBe('due');
  });

  it('falls back to the soonest-due card when nothing is eligible', () => {
    const topics = [card({ id: 'far', nextEligibleTrial: 100 }), card({ id: 'near', nextEligibleTrial: 12 })];
    expect(getNextCard(topics, 10)?.id).toBe('near');
  });

  it('avoids repeating the same track and the current card when alternatives exist', () => {
    const topics = [
      card({ id: 'a', track: 'react' }),
      card({ id: 'b', track: 'react' }),
      card({ id: 'c', track: 'async-js', box: 2 }),
    ];
    expect(getNextCard(topics, 5, 'react', 'a')?.id).toBe('c');
  });
});

describe('mergeStoredWithSeed', () => {
  const seed = [
    card({ id: 's1', title: 'Seed v2', promptSeed: 'new prompt', testHarness: 'NEW', starterCode: 'code' }),
    card({ id: 's2' }),
  ];

  it('keeps progress but refreshes content of seed-backed cards', () => {
    const stored = deck([card({ id: 's1', title: 'Seed v1', promptSeed: 'old', box: 4, streak: 6, nextEligibleTrial: 30 })]);
    const merged = mergeStoredWithSeed(stored, seed);
    const s1 = merged.topics.find((t) => t.id === 's1')!;
    expect(s1.title).toBe('Seed v2');
    expect(s1.promptSeed).toBe('new prompt');
    expect(s1.testHarness).toBe('NEW');
    expect(s1.box).toBe(4);
    expect(s1.streak).toBe(6);
    expect(s1.nextEligibleTrial).toBe(30);
  });

  it('appends new seed topics', () => {
    const merged = mergeStoredWithSeed(deck([card({ id: 's1' })]), seed);
    expect(merged.topics.map((t) => t.id)).toEqual(['s1', 's2']);
  });

  it('does not resurrect seed topics the user deleted', () => {
    const merged = mergeStoredWithSeed(deck([card({ id: 's1' })], { deletedSeedIds: ['s2'] }), seed);
    expect(merged.topics.map((t) => t.id)).toEqual(['s1']);
  });

  it('leaves custom cards untouched', () => {
    const custom = card({ id: 'mine', title: 'Mine', box: 3 });
    const merged = mergeStoredWithSeed(deck([custom]), seed);
    expect(merged.topics.find((t) => t.id === 'mine')).toEqual(custom);
  });
});

describe('deleteTopicFromDeck', () => {
  it('removes the card and only tracks seed ids as deleted', () => {
    const state = deck([card({ id: 'async-fetch-error-handling' }), card({ id: 'custom-1' })]);
    const a = deleteTopicFromDeck(state, 'async-fetch-error-handling');
    expect(a.topics.map((t) => t.id)).toEqual(['custom-1']);
    expect(a.deletedSeedIds).toContain('async-fetch-error-handling');
    const b = deleteTopicFromDeck(a, 'custom-1');
    expect(b.deletedSeedIds).not.toContain('custom-1');
  });
});

describe('parseDeckBackup', () => {
  it('preserves all tracks and card content', () => {
    const backup = JSON.stringify(
      deck([
        card({
          id: 'x',
          track: 'typescript-patterns',
          box: 9,
          starterCode: 'a',
          testHarness: 'b',
          solution: 'c',
          referenceSolution: 'd',
          testCases: [{ input: 'i', expected: 'e' }],
        }),
      ])
    );
    const [t] = parseDeckBackup(backup).topics;
    expect(t.track).toBe('typescript-patterns');
    expect(t.box).toBe(5);
    expect([t.starterCode, t.testHarness, t.solution, t.referenceSolution]).toEqual(['a', 'b', 'c', 'd']);
    expect(t.testCases).toEqual([{ input: 'i', expected: 'e', description: undefined }]);
  });

  it('falls back to algorithms for unknown tracks and rejects bad files', () => {
    const [t] = parseDeckBackup(JSON.stringify({ topics: [{ id: 'x', track: 'nope' }] })).topics;
    expect(t.track).toBe('algorithms');
    expect(() => parseDeckBackup('{"nope":1}')).toThrow();
  });
});

describe('getTopicTestCases', () => {
  it('prefers explicit testCases', () => {
    const tc = [{ input: 'f(1)', expected: '2' }];
    expect(getTopicTestCases(card({ id: 'a', testCases: tc }))).toBe(tc);
  });

  it('derives cases from PASS/FAIL console assertions', () => {
    const harness = "const r = add(1, 2);\nconsole.log('adds:', r === 3 ? 'PASS' : 'FAIL');";
    const [c] = getTopicTestCases(card({ id: 'a', testHarness: harness }));
    expect(c.description).toBe('adds');
    expect(c.input).toBe('add(1, 2)');
    expect(c.expected).toBe('3');
  });
});

describe('isTrackType', () => {
  it('accepts known tracks only', () => {
    expect(isTrackType('react-patterns')).toBe(true);
    expect(isTrackType('toString')).toBe(false);
    expect(isTrackType(5)).toBe(false);
  });
});

describe('Graduated Interval Recall & chaining', () => {
  it('promotes on pass using graduated intervals', () => {
    // Step 1 -> 2: +3 trials
    const { updatedCard } = commitCardReview(deck([card({ id: 'a', box: 1, streak: 0 })]), 'a', true, 'graduated-interval');
    expect(updatedCard.box).toBe(2);
    expect(updatedCard.streak).toBe(1);
    expect(updatedCard.nextEligibleTrial).toBe(1 + GRADUATED_INTERVALS[2]); // 1 + 3 = 4

    // Step 2 -> 3: +7 trials
    const r2 = commitCardReview(deck([card({ id: 'b', box: 2, streak: 1 })], { totalCompletedReviews: 4 }), 'b', true, 'graduated-interval');
    expect(r2.updatedCard.box).toBe(3);
    expect(r2.updatedCard.nextEligibleTrial).toBe(5 + GRADUATED_INTERVALS[3]); // 5 + 7 = 12

    // Step 3 -> 4: +16 trials
    const r3 = commitCardReview(deck([card({ id: 'c', box: 3, streak: 2 })], { totalCompletedReviews: 12 }), 'c', true, 'graduated-interval');
    expect(r3.updatedCard.box).toBe(4);
    expect(r3.updatedCard.nextEligibleTrial).toBe(13 + GRADUATED_INTERVALS[4]); // 13 + 16 = 29

    // Step 4 -> 5: +35 trials
    const r4 = commitCardReview(deck([card({ id: 'd', box: 4, streak: 3 })], { totalCompletedReviews: 29 }), 'd', true, 'graduated-interval');
    expect(r4.updatedCard.box).toBe(5);
    expect(r4.updatedCard.nextEligibleTrial).toBe(30 + GRADUATED_INTERVALS[5]); // 30 + 35 = 65
  });

  it('resets failed card to box 1 and schedules immediate re-test (0 intervening cards)', () => {
    const { updatedCard } = commitCardReview(deck([card({ id: 'a', box: 4, streak: 3 })], { totalCompletedReviews: 10 }), 'a', false, 'graduated-interval');
    expect(updatedCard.box).toBe(1);
    expect(updatedCard.streak).toBe(0);
    expect(updatedCard.nextEligibleTrial).toBe(11); // nextTotal (immediate retry)
  });

  it('prioritizes due in-flight cards over introducing new unseen cards', () => {
    const unseen = [card({ id: 'new1' }), card({ id: 'new2' })];
    const dueInFlight = card({ id: 'in-flight-due', box: 2, streak: 1, nextEligibleTrial: 4 });
    const topics = [...unseen, dueInFlight];

    // At review 4, dueInFlight is due (nextEligibleTrial 4 <= 4)
    expect(getNextCard(topics, 4, undefined, undefined, undefined, 'graduated-interval')?.id).toBe('in-flight-due');
  });

  it('chains in unseen cards when in-flight cards are not yet due and chain is under limit', () => {
    const inFlight = [
      card({ id: 'active1', box: 2, streak: 1, nextEligibleTrial: 5 }),
      card({ id: 'active2', box: 2, streak: 1, nextEligibleTrial: 6 }),
    ];
    const unseen = [card({ id: 'new-card', difficulty: 1 })];
    const topics = [...inFlight, ...unseen];

    expect(getNextCard(topics, 2, undefined, undefined, undefined, 'graduated-interval')?.id).toBe('new-card');
  });

  it('falls back to soonest-due card when active chain is full and nothing is due yet', () => {
    const inFlight = [
      card({ id: 'card1', box: 2, streak: 1, nextEligibleTrial: 10 }),
      card({ id: 'card2', box: 2, streak: 1, nextEligibleTrial: 7 }),
      card({ id: 'card3', box: 2, streak: 1, nextEligibleTrial: 12 }),
      card({ id: 'card4', box: 2, streak: 1, nextEligibleTrial: 9 }),
    ];
    const unseen = [card({ id: 'new-blocked' })];
    // Chain limit is 4, 4 cards in-flight, reviews = 4. Soonest due is card2 (due at 7)
    expect(getNextCard([...inFlight, ...unseen], 4, undefined, undefined, undefined, 'graduated-interval')?.id).toBe('card2');
  });

  it('prioritizes failed box 1 card over higher box cards among due items', () => {
    const failedDue = card({ id: 'failed', box: 1, streak: 0, nextEligibleTrial: 5 });
    const regularDue = card({ id: 'advanced', box: 3, streak: 2, nextEligibleTrial: 5 });
    expect(getNextCard([regularDue, failedDue], 5, undefined, undefined, undefined, 'graduated-interval')?.id).toBe('failed');
  });

  it('respects ladder gating when selecting unseen cards to chain', () => {
    const gatedHard = card({ id: 'hard', concept: 'closures', difficulty: 3 });
    const openEasy = card({ id: 'easy', concept: 'closures', difficulty: 1 });
    expect(getNextCard([gatedHard, openEasy], 0, undefined, undefined, undefined, 'graduated-interval')?.id).toBe('easy');
  });

  it('interleaves tracks for due cards when alternative track is available', () => {
    const dueReact1 = card({ id: 'r1', track: 'react', box: 2, nextEligibleTrial: 3 });
    const dueReact2 = card({ id: 'r2', track: 'react', box: 2, nextEligibleTrial: 3 });
    const dueAsync = card({ id: 'a1', track: 'async-js', box: 2, nextEligibleTrial: 3 });
    expect(getNextCard([dueReact1, dueReact2, dueAsync], 3, 'react', undefined, undefined, 'graduated-interval')?.id).toBe('a1');
  });
});

describe('scheduling algorithm switching and backup', () => {
  it('stores and retrieves algorithm mode', () => {
    const st = deck([]);
    const updated = setSchedulingAlgorithm(st, 'graduated-interval');
    expect(updated.algorithm).toBe('graduated-interval');
    expect(getSchedulingAlgorithm(updated)).toBe('graduated-interval');
  });

  it('preserves algorithm in backup serialization and parsing', () => {
    const json = JSON.stringify({ topics: [card({ id: 'x' })], algorithm: 'graduated-interval' });
    const parsed = parseDeckBackup(json);
    expect(parsed.algorithm).toBe('graduated-interval');
  });
});
