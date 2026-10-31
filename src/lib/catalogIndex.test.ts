import { describe, it, expect } from 'vitest';
import catalogIndex from '../data/catalogIndex.json';
import topics from '../data/topics.json';

describe('Catalog Index Pipeline', () => {
  it('contains exactly the same 289 cards as topics.json in matching order', () => {
    expect(catalogIndex.length).toBe(topics.length);
    expect(catalogIndex.length).toBe(289);

    for (let i = 0; i < topics.length; i++) {
      expect(catalogIndex[i].id).toBe(topics[i].id);
      expect(catalogIndex[i].title).toBe(topics[i].title);
      expect(catalogIndex[i].track).toBe(topics[i].track);
      expect(catalogIndex[i].concept).toBe(topics[i].concept);
      expect(catalogIndex[i].difficulty).toBe(topics[i].difficulty);
    }
  });

  it('validates every card entry has well-formed metadata and non-empty summary', () => {
    for (const card of catalogIndex) {
      expect(card.id).toBeTruthy();
      expect(typeof card.id).toBe('string');
      expect(card.title).toBeTruthy();
      expect(typeof card.title).toBe('string');
      expect(card.track).toBeTruthy();
      expect(typeof card.track).toBe('string');
      expect(card.difficulty).toBeGreaterThanOrEqual(1);
      expect(card.difficulty).toBeLessThanOrEqual(5);
      expect(Array.isArray(card.tags)).toBe(true);
      expect(card.summary).toBeTruthy();
      expect(typeof card.summary).toBe('string');
      expect(card.summary.length).toBeGreaterThan(5);
    }
  });
});
