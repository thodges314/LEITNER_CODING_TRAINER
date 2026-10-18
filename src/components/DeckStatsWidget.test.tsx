// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { DeckStatsWidget } from './DeckStatsWidget';
import type { TopicItem, LeitnerDeckState } from '../lib/leitner';

// Configure React act environment for jsdom
// @ts-expect-error IS_REACT_ACT_ENVIRONMENT is a React global flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockTopics: TopicItem[] = [
  {
    id: 'algo-1',
    title: 'Two Sum',
    track: 'algorithms',
    box: 1,
    status: 'active',
    streak: 0,
    promptSeed: '',
    tags: ['algorithms'],
    nextEligibleTrial: 0,
  },
  {
    id: 'algo-2',
    title: 'Valid Anagram',
    track: 'algorithms',
    box: 2,
    status: 'active',
    streak: 1,
    promptSeed: '',
    tags: ['algorithms'],
    nextEligibleTrial: 0,
  },
  {
    id: 'react-1',
    title: 'Counter Component',
    track: 'react',
    box: 3,
    status: 'active',
    streak: 2,
    promptSeed: '',
    tags: ['react'],
    nextEligibleTrial: 0,
  },
  {
    id: 'ts-1',
    title: 'Generic Stack',
    track: 'typescript-patterns',
    box: 5,
    status: 'active',
    streak: 5,
    promptSeed: '',
    tags: ['typescript'],
    nextEligibleTrial: 0,
  },
  {
    id: 'locked-1',
    title: 'Locked Card',
    track: 'async-js',
    box: 1,
    status: 'locked',
    streak: 0,
    promptSeed: '',
    tags: ['async'],
    nextEligibleTrial: 0,
  },
];

const mockState: LeitnerDeckState = {
  topics: mockTopics,
  totalCompletedReviews: 14,
  unlockedStageCount: 1,
};

describe('DeckStatsWidget', () => {
  let container: HTMLDivElement | null = null;
  let root: ReactDOMClient.Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = ReactDOMClient.createRoot(container);
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
      root = null;
    }
    if (container) {
      container.remove();
      container = null;
    }
  });

  it('renders default Track Orbit mode with donut chart and track slices', async () => {
    const handleSelectTrack = vi.fn();

    await act(async () => {
      root?.render(
        <DeckStatsWidget
          state={mockState}
          topics={mockTopics}
          theme="dark"
          onSelectTrack={handleSelectTrack}
        />
      );
    });

    expect(container?.textContent).toContain('Analytics & Proportions');
    expect(container?.textContent).toContain('Track Orbit');
    expect(container?.textContent).toContain('4'); // 4 active cards in center
    expect(container?.textContent).toContain('Active Cards');

    // Check SVG exists and has paths
    const svg = container?.querySelector('svg');
    expect(svg).toBeTruthy();
    const paths = svg?.querySelectorAll('path');
    expect(paths && paths.length).toBeGreaterThan(0);
  });

  it('can switch between all 3 visual modes using pill buttons and chevrons', async () => {
    await act(async () => {
      root?.render(
        <DeckStatsWidget
          state={mockState}
          topics={mockTopics}
          theme="dark"
        />
      );
    });

    // Switch to Radar / Skill Matrix
    const radarBtn = container?.querySelector('button[data-testid="stats-mode-radar"]') as HTMLButtonElement;
    expect(radarBtn).toBeTruthy();

    await act(async () => {
      radarBtn.click();
    });

    expect(container?.textContent).toContain('Skill Matrix');
    expect(container?.textContent).toContain('Outer rings represent higher Leitner tier mastery');

    // Switch to Concentric Rings / Mastery Tiers
    const tiersBtn = container?.querySelector('button[data-testid="stats-mode-tiers"]') as HTMLButtonElement;
    expect(tiersBtn).toBeTruthy();

    await act(async () => {
      tiersBtn.click();
    });

    expect(container?.textContent).toContain('Mastery Tiers');
    expect(container?.textContent).toContain('Outer rings = Mastered tiers; inner rings = Learning tiers');

    // Test next chevron button
    const nextBtn = container?.querySelector('button[aria-label="Next chart"]') as HTMLButtonElement;
    expect(nextBtn).toBeTruthy();

    await act(async () => {
      nextBtn.click();
    });

    // Wraps back to Orbit
    expect(container?.textContent).toContain('Track Orbit');
  });

  it('adapts styling cleanly for apple-gsos (day) theme', async () => {
    await act(async () => {
      root?.render(
        <DeckStatsWidget
          state={mockState}
          topics={mockTopics}
          theme="apple-gsos"
        />
      );
    });

    const widget = container?.querySelector('[data-testid="deck-stats-widget"]');
    expect(widget).toBeTruthy();
    expect(container?.textContent).toContain('Analytics & Proportions');
  });

  it('invokes onSelectTrack when an orbit slice is clicked', async () => {
    const handleSelectTrack = vi.fn();

    await act(async () => {
      root?.render(
        <DeckStatsWidget
          state={mockState}
          topics={mockTopics}
          theme="dark"
          onSelectTrack={handleSelectTrack}
        />
      );
    });

    const algoSlice = container?.querySelector('path[data-track="algorithms"]') as SVGPathElement;
    expect(algoSlice).toBeTruthy();

    await act(async () => {
      algoSlice.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(handleSelectTrack).toHaveBeenCalledWith('algorithms');
  });

  it('shows empty state when no active cards exist', async () => {
    await act(async () => {
      root?.render(
        <DeckStatsWidget
          state={{ ...mockState, topics: [] }}
          topics={[]}
          theme="dark"
        />
      );
    });

    expect(container?.textContent).toContain('No active cards in rotation yet');
  });
});
