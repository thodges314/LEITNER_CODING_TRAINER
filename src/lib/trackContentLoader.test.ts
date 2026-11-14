import { describe, it, expect } from 'vitest';
import {
  isCardContentHydrated,
  loadTrackContent,
  hydrateDeckStateWithTrack,
} from './trackContentLoader';
import { getDefaultDeckState } from './leitner';
import seedTopicsFull from '../data/topics.json';

describe('trackContentLoader', () => {
  it('detects unhydrated seed metadata cards and hydrated cards', () => {
    const metaDeck = getDefaultDeckState();
    const firstMeta = metaDeck.topics[0];
    expect(isCardContentHydrated(firstMeta)).toBe(false);
    expect(isCardContentHydrated(null)).toBe(true);

    const hydratedDeck = getDefaultDeckState(seedTopicsFull as unknown as typeof metaDeck.topics);
    expect(isCardContentHydrated(hydratedDeck.topics[0])).toBe(true);
  });

  it('loads per-track content lazily and hydrates matching cards without losing progress', async () => {
    const metaDeck = getDefaultDeckState();
    const targetCard = metaDeck.topics.find((t) => t.track === 'async-js')!;
    const customizedDeck = {
      ...metaDeck,
      topics: metaDeck.topics.map((t) =>
        t.id === targetCard.id ? { ...t, box: 3, streak: 2 } : t
      ),
    };

    const trackContent = await loadTrackContent('async-js');
    expect(trackContent[targetCard.id]).toBeDefined();
    expect(typeof trackContent[targetCard.id].promptSeed).toBe('string');

    const hydrated = hydrateDeckStateWithTrack(customizedDeck, 'async-js', trackContent);
    const hydratedTarget = hydrated.topics.find((t) => t.id === targetCard.id)!;
    expect(isCardContentHydrated(hydratedTarget)).toBe(true);
    expect(hydratedTarget.box).toBe(3);
    expect(hydratedTarget.streak).toBe(2);

    // Calling hydrate again on already-hydrated track is a no-op (referential equality)
    expect(hydrateDeckStateWithTrack(hydrated, 'async-js', trackContent)).toBe(hydrated);
  });
});

