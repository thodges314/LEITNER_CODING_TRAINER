// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import seed from '../data/topics.json';
import {
  CARD_PACKS,
  checkStagedUnlocks,
  disabledPacks,
  getNextCard,
  isPackEnabled,
  parseDeckBackup,
  scheduleFilter,
  setEnabledPacks,
  visibleTopics,
  mergeStoredWithSeed,
} from './leitner';
import type { LeitnerDeckState, TopicItem } from './leitner';

const card = (id: string, extra: Partial<TopicItem> = {}): TopicItem => ({
  id, track: 'algorithms', title: id, box: 1, streak: 0, nextEligibleTrial: 0, status: 'active', tags: [], promptSeed: '', ...extra,
});

describe('optional card packs', () => {
  const state: LeitnerDeckState = {
    topics: [card('core', { difficulty: 2 }), card('adv', { pack: 'algorithms-advanced', difficulty: 1 })],
    totalCompletedReviews: 0,
  };

  it('packs are off by default and on when listed in enabledPacks', () => {
    expect(disabledPacks(state)).toEqual(['algorithms-advanced']);
    expect(disabledPacks({ enabledPacks: ['algorithms-advanced'] })).toEqual([]);
    expect(isPackEnabled(state.topics[1], state)).toBe(false);
    expect(visibleTopics(state).map((t) => t.id)).toEqual(['core']);
    expect(visibleTopics({ ...state, enabledPacks: ['algorithms-advanced'] })).toHaveLength(2);
  });

  it('disabled-pack cards are never scheduled, even when they are the easiest', () => {
    expect(getNextCard(state.topics, 0, undefined, undefined, scheduleFilter(state))?.id).toBe('core');
    const on = { ...state, enabledPacks: ['algorithms-advanced'] };
    expect(getNextCard(on.topics, 0, undefined, undefined, scheduleFilter(on))?.id).toBe('adv'); // easier first
  });

  it('staged unlocks skip locked cards of disabled packs', () => {
    const passed = [1, 2, 3, 4].map((i) => card(`p${i}`, { box: 3, concept: `c${i}`, difficulty: 1 }));
    const locked = [card('l-adv', { status: 'locked', pack: 'algorithms-advanced', difficulty: 1 }), card('l-core', { status: 'locked', difficulty: 3 })];
    const { updatedTopics } = checkStagedUnlocks([...passed, ...locked], 0, (c) => isPackEnabled(c, { enabledPacks: [] }));
    const unlocked = updatedTopics.filter((t) => t.id.startsWith('l-') && t.status === 'active').map((t) => t.id);
    expect(unlocked).toEqual(['l-core']);
  });

  it('enabledPacks survive save/merge/backup and unknown pack names are dropped', () => {
    localStorage.clear();
    const next = setEnabledPacks(state, ['algorithms-advanced', 'nope']);
    expect(next.enabledPacks).toEqual(['algorithms-advanced']);
    expect(JSON.parse(localStorage.getItem('leitner_coding_deck') ?? '{}').enabledPacks).toEqual(['algorithms-advanced']);
    expect(mergeStoredWithSeed(next, []).enabledPacks).toEqual(['algorithms-advanced']);
    const parsed = parseDeckBackup(JSON.stringify({ ...next, topics: state.topics }));
    expect(parsed.enabledPacks).toEqual(['algorithms-advanced']);
    expect(parsed.topics.find((t) => t.id === 'adv')?.pack).toBe('algorithms-advanced');
  });
});

describe('seed deck packs', () => {
  const cards = seed as unknown as TopicItem[];
  it('every pack name used by a seed card is a known pack', () => {
    for (const c of cards) if (c.pack) expect(Object.keys(CARD_PACKS), c.id).toContain(c.pack);
  });
  it('the core algorithm set keeps a fair, varied representation (incl. basic graph theory)', () => {
    const core = cards.filter((c) => (c.track === 'algorithms' || c.track === 'algorithmic-screens') && !c.pack);
    expect(core.length).toBeGreaterThanOrEqual(40);
    const concepts = new Set(core.map((c) => c.concept));
    for (const must of ['graphs', 'trees', 'linked-lists', 'sliding-window', 'two-pointer', 'binary-search', 'hashing', 'stack', 'dp', 'sorting']) {
      expect(concepts.has(must), must).toBe(true);
    }
    expect(core.filter((c) => c.concept === 'graphs').length).toBeGreaterThanOrEqual(5);
  });
  it('a default (packs-off) deck still starts with an easy, varied rotation', () => {
    const visible = cards.filter((c) => !c.pack);
    const active = visible.filter((c) => c.status === 'active');
    expect(active.length).toBeGreaterThan(40);
  });
});
