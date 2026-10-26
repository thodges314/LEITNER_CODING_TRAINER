// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import seed from '../data/topics.json';
import {
  CARD_PACKS,
  checkStagedUnlocks,
  disabledPacks,
  isPackEnabled,
  parseDeckBackup,
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

  it('all built-in card packs have been migrated to first-class topic tracks', () => {
    expect(CARD_PACKS).toEqual({});
    expect(disabledPacks(state)).toEqual([]);
    expect(isPackEnabled(state.topics[0], state)).toBe(true);
    expect(isPackEnabled(state.topics[1], state)).toBe(true);
    expect(visibleTopics(state)).toHaveLength(2);
  });

  it('legacy stored cards with pack: algorithms-advanced have pack stripped and are visible', () => {
    const legacy = card('tree-depth-sum', { pack: 'algorithms-advanced', track: 'algorithms' });
    const merged = mergeStoredWithSeed({ topics: [legacy], totalCompletedReviews: 0 });
    expect(merged.topics[0].pack).toBeUndefined();
    expect(merged.topics[0].track).toBe('advanced-algorithms');
    expect(isPackEnabled(merged.topics[0], merged)).toBe(true);
    expect(visibleTopics(merged).map((t) => t.id)).toContain('tree-depth-sum');
  });

  it('staged unlocks work across active cards', () => {
    const passed = [1, 2, 3, 4].map((i) => card(`p${i}`, { box: 3, concept: `c${i}`, difficulty: 1 }));
    const locked = [card('l-1', { status: 'locked', difficulty: 1 }), card('l-2', { status: 'locked', difficulty: 3 })];
    const { updatedTopics } = checkStagedUnlocks([...passed, ...locked], 0, (c) => isPackEnabled(c, { enabledPacks: [] }));
    const unlocked = updatedTopics.filter((t) => t.id.startsWith('l-') && t.status === 'active').map((t) => t.id);
    expect(unlocked).toEqual(['l-1', 'l-2']);
  });

  it('unknown pack names in enabledPacks are safely filtered', () => {
    localStorage.clear();
    const next = setEnabledPacks(state, ['nope']);
    expect(next.enabledPacks).toEqual([]);
    expect(JSON.parse(localStorage.getItem('leitner_coding_deck') ?? '{}').enabledPacks).toEqual([]);
    expect(mergeStoredWithSeed(next, []).enabledPacks).toEqual([]);
    const parsed = parseDeckBackup(JSON.stringify({ ...next, topics: state.topics }));
    expect(parsed.enabledPacks).toEqual([]);
  });
});

describe('seed deck packs', () => {
  const cards = seed as unknown as TopicItem[];
  it('every pack name used by a seed card is a known pack', () => {
    for (const c of cards) if (c.pack) expect(Object.keys(CARD_PACKS), c.id).toContain(c.pack);
  });
  // The maintainer's rubric: core = practical data processing; advanced = academic / whiteboard computer science.
  it('the core algorithm set is the practical one: linear array/string processing, hashing, intervals, lists, stacks, sorting, DOM trees', () => {
    const core = cards.filter((c) => c.track === 'algorithms');
    expect(core.length).toBeGreaterThanOrEqual(20);
    const concepts = new Set(core.map((c) => c.concept));
    for (const must of ['arrays', 'strings', 'sliding-window', 'two-pointer', 'binary-search', 'hashing', 'intervals', 'linked-lists', 'stack', 'sorting', 'matrix']) {
      expect(concepts.has(must), `core should keep ${must}`).toBe(true);
    }
    for (const academic of ['graphs', 'heap', 'dp', 'dp2d', 'backtracking', 'bits', 'bst', 'trie']) {
      expect(concepts.has(academic), `${academic} belongs in the advanced-algorithms track`).toBe(false);
    }
    // the only tree left in the core deck is the realistic n-ary DOM hierarchy, not { val, left, right } pointer trees
    expect(core.filter((c) => c.concept === 'trees').map((c) => c.id)).toEqual(['tree-traversal-dom']);
  });
  it('the academic cards moved on purpose (binary trees/BSTs, graphs, heaps, tries, DP, backtracking, bits) are in advanced-algorithms', () => {
    const moved = [
      'tree-depth-sum', 'bst-search-insert', 'bst-validate-lca-invert', 'tree-level-order', 'tree-path-sum', 'tree-diameter-balanced',
      'graph-adjacency-bfs', 'graph-components-paths', 'graph-clone-bipartite', 'graph-grid-bfs', 'course-schedule-topo', 'flood-fill-islands',
      'heap-array-basics', 'heap-kth-largest', 'climb-stairs-fib-dp', 'coin-change-dp', 'binary-strings-combinations',
      'permutations-subsets-backtracking', 'bit-basics', 'trie-nested-object', 'trie-prefix-tree',
    ];
    for (const id of moved) expect(cards.find((c) => c.id === id)?.track, id).toBe('advanced-algorithms');
  });
  it('the practical algorithm cards the maintainer keeps stay in the core deck', () => {
    const kept = [
      'two-pointer-sorted-sum', 'container-water-two-pointer', 'sliding-window-fixed', 'longest-substring-window', 'valid-parentheses-stack', 'min-stack',
      'linked-list-cycle-merge', 'reverse-linked-list', 'list-remove-reorder', 'strings-basics', 'anagram-palindrome', 'group-anagrams-top-k',
      'two-sum-hashmap', 'kadane-prefix-sum', 'merge-intervals', 'interval-overlap', 'binary-search-exact', 'binary-search-variants',
      'search-rotated-array', 'matrix-basics', 'matrix-rotate-spiral', 'insertion-sort-basic', 'merge-sort-quick-sort', 'tree-traversal-dom',
    ];
    for (const id of kept) {
      const card = cards.find((c) => c.id === id);
      expect(card, id).toBeDefined();
      expect(card?.pack, id).toBeUndefined();
    }
  });
  it('a default (packs-off) deck still starts with an easy, varied rotation', () => {
    const visible = cards.filter((c) => !c.pack);
    const active = visible.filter((c) => c.status === 'active');
    expect(active.length).toBeGreaterThan(40);
  });
});
