import { describe, expect, it } from 'vitest';
import seed from '../data/topics.json';
import { checkStagedUnlocks, difficultyOf, isLadderOpen, getNextCard } from './leitner';
import type { TopicItem } from './leitner';

const t = (id: string, concept: string | undefined, difficulty: number, extra: Partial<TopicItem> = {}): TopicItem => ({
  id,
  track: 'algorithms',
  title: id,
  box: 1,
  streak: 0,
  nextEligibleTrial: 0,
  status: 'locked',
  tags: [],
  promptSeed: '',
  concept,
  difficulty,
  ...extra,
});

describe('difficulty ladder', () => {
  it('every seed card has a difficulty (1-5) and a concept', () => {
    for (const card of seed as unknown as TopicItem[]) {
      expect(card.difficulty, card.id).toBeGreaterThanOrEqual(1);
      expect(card.difficulty, card.id).toBeLessThanOrEqual(5);
      expect(card.concept, card.id).toBeTruthy();
    }
  });

  it('seed decks start with only bottom-rung warm-up/basic cards active', () => {
    const cards = seed as unknown as TopicItem[];
    for (const card of cards.filter((c) => c.status === 'active')) {
      expect(difficultyOf(card), card.id).toBeLessThanOrEqual(2);
      const easier = cards.filter((o) => o.concept === card.concept && difficultyOf(o) < difficultyOf(card));
      expect(easier, card.id).toHaveLength(0);
    }
  });

  it('a harder rung stays closed until the easier rung is active and passed', () => {
    const easy = t('easy', 'c', 1, { status: 'active', box: 1 });
    const hard = t('hard', 'c', 4);
    expect(isLadderOpen(hard, [easy, hard])).toBe(false);
    expect(isLadderOpen(hard, [{ ...easy, box: 2 }, hard])).toBe(true);
    expect(isLadderOpen(hard, [{ ...easy, status: 'locked', box: 3 }, hard])).toBe(false);
    expect(isLadderOpen(t('solo', undefined, 5), [easy])).toBe(true); // no concept: never gated
  });

  it('staged unlocks go easiest-first and skip gated cards', () => {
    const active = [1, 2, 3, 4].map((i) => t(`a${i}`, `x${i}`, 1, { status: 'active', box: 3 })); // 4 cards in box 3 => 1 stage
    const base = t('base', 'ladder', 1, { status: 'active', box: 1 });
    const gated = t('gated', 'ladder', 2); // blocked: base is only box 1
    const hardSolo = t('hard-solo', 'solo-hard', 5);
    const easySolo = t('easy-solo', 'solo-easy', 1);
    const mid = [t('m1', 'm1', 3), t('m2', 'm2', 2), t('m3', 'm3', 2)];
    const { updatedTopics, newlyUnlocked } = checkStagedUnlocks([...active, base, gated, hardSolo, ...mid, easySolo], 0);
    const unlocked = updatedTopics.filter((c) => c.status === 'active' && c.box === 1 && c.id !== 'base').map((c) => c.id);
    expect(newlyUnlocked).toBe(4);
    expect(unlocked.sort()).toEqual(['easy-solo', 'm1', 'm2', 'm3']);
  });

  it('within the same box easier cards are served first', () => {
    const a = t('a', 'p', 4, { status: 'active' });
    const b = t('b', 'q', 1, { status: 'active' });
    const c = t('c', 'r', 2, { status: 'active' });
    expect(getNextCard([a, b, c], 0)?.id).toBe('b');
  });
});
