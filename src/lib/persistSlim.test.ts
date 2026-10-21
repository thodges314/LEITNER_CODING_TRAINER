// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import seed from '../data/topics.json';
import { STORAGE_KEY, HEAVY_SEED_FIELDS, getDefaultDeckState, loadDeckState, saveDeckState } from './leitner';
import type { LeitnerDeckState, TopicItem } from './leitner';

const seedTopics = seed as unknown as TopicItem[];
const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as LeitnerDeckState;

beforeEach(() => localStorage.clear());

describe('slim persistence: built-in cards are stored as progress only', () => {
  it('the saved deck is a small fraction of the bundled deck', () => {
    saveDeckState(getDefaultDeckState(seedTopics));
    const savedChars = (localStorage.getItem(STORAGE_KEY) ?? '').length;
    const fullChars = JSON.stringify(seedTopics).length;
    expect(savedChars).toBeLessThan(250_000);
    expect(savedChars).toBeLessThan(fullChars / 5);
  });

  it('no heavy content field is written for a built-in card', () => {
    saveDeckState(getDefaultDeckState(seedTopics));
    const first = stored().topics[0] as unknown as Record<string, unknown>;
    for (const field of HEAVY_SEED_FIELDS) expect(first[field], field).toBeUndefined();
    expect(first.id).toBe(seedTopics[0].id);
    expect(typeof first.box).toBe('number');
  });

  it('round trip: progress is kept and the content comes back from the bundled deck', () => {
    const state = getDefaultDeckState(seedTopics);
    const target = state.topics[3];
    const progressed: LeitnerDeckState = {
      ...state,
      totalCompletedReviews: 7,
      topics: state.topics.map((t) => (t.id === target.id ? { ...t, box: 3, streak: 2, nextEligibleTrial: 9, status: 'active' as const } : t)),
    };
    saveDeckState(progressed);
    const loaded = loadDeckState(seedTopics);
    const back = loaded.topics.find((t) => t.id === target.id) as TopicItem;
    expect([back.box, back.streak, back.nextEligibleTrial, back.status]).toEqual([3, 2, 9, 'active']);
    expect(loaded.totalCompletedReviews).toBe(7);
    const source = seedTopics.find((t) => t.id === target.id) as TopicItem;
    expect(back.promptSeed).toBe(source.promptSeed);
    expect(back.testHarness).toBe(source.testHarness);
    expect(back.referenceSolution).toBe(source.referenceSolution);
    expect(back.testCases).toEqual(source.testCases);
  });

  it('a custom card (not in the bundled deck) is stored in full', () => {
    const state = getDefaultDeckState(seedTopics);
    const custom: TopicItem = {
      id: 'my-own-card', track: 'algorithms', title: 'Mine', box: 1, streak: 0, nextEligibleTrial: 0, status: 'active',
      tags: ['custom'], promptSeed: 'Write mine()', testHarness: "$test.check('x', true);", referenceSolution: 'function mine() {}',
    };
    saveDeckState({ ...state, topics: [...state.topics, custom] });
    const savedCustom = stored().topics.find((t) => t.id === 'my-own-card') as TopicItem;
    expect(savedCustom.promptSeed).toBe('Write mine()');
    expect(savedCustom.testHarness).toBe("$test.check('x', true);");
    expect(savedCustom.referenceSolution).toBe('function mine() {}');
    expect(loadDeckState(seedTopics).topics.some((t) => t.id === 'my-own-card')).toBe(true);
  });

  it('a deck saved by the previous version (full content) still loads and is slimmed on the next save', () => {
    const full = getDefaultDeckState(seedTopics);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...full, topics: full.topics.map((t) => ({ ...t, solution: t.referenceSolution, starterCode: t.referenceSolution })) }));
    const loaded = loadDeckState(seedTopics);
    expect(loaded.topics).toHaveLength(seedTopics.length);
    const first = loaded.topics[0];
    expect(first.promptSeed).toBe(seedTopics[0].promptSeed);
    expect(first.solution).toBeUndefined(); // stale duplicate copies are dropped
    expect(first.starterCode).toBeUndefined();
    expect((localStorage.getItem(STORAGE_KEY) ?? '').length).toBeLessThan(250_000);
  });

  it('a stored card that is gone from the bundled deck and has no content is dropped, not kept empty', () => {
    const state = getDefaultDeckState(seedTopics);
    const ghost = { id: 'removed-from-deck', track: 'algorithms', title: 'Ghost', box: 2, streak: 1, nextEligibleTrial: 0, status: 'active', tags: [] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, topics: [...state.topics, ghost] }));
    const loaded = loadDeckState(seedTopics);
    expect(loaded.topics.some((t) => t.id === 'removed-from-deck')).toBe(false);
    expect(loaded.topics).toHaveLength(seedTopics.length);
  });
});
