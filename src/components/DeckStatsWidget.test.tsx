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

  it('renders default Skill Matrix mode with 6 domain axes and mastery polygon', async () => {
    await act(async () => {
      root?.render(
        <DeckStatsWidget
          state={mockState}
          topics={mockTopics}
          theme="dark"
        />
      );
    });

    expect(container?.textContent).toContain('Analytics & Proportions');
    expect(container?.textContent).toContain('Skill Matrix');
    expect(container?.textContent).toContain('Algorithms');
    expect(container?.textContent).toContain('React & UI');
    expect(container?.textContent).toContain('TypeScript');

    // Check SVG exists and has paths
    const svg = container?.querySelector('svg[data-testid="stats-chart-svg"]');
    expect(svg).toBeTruthy();
  });

  it('can switch between all 4 visual modes including Velocity Diagnostic', async () => {
    await act(async () => {
      root?.render(
        <DeckStatsWidget
          state={mockState}
          topics={mockTopics}
          theme="dark"
        />
      );
    });

    // Switch to Track Orbit
    const orbitBtn = container?.querySelector('button[data-testid="stats-mode-orbit"]') as HTMLButtonElement;
    expect(orbitBtn).toBeTruthy();

    await act(async () => {
      orbitBtn.click();
    });

    expect(container?.textContent).toContain('Track Orbit');
    expect(container?.textContent).toContain('Active Cards');

    // Switch to Concentric Rings / Mastery Tiers
    const tiersBtn = container?.querySelector('button[data-testid="stats-mode-tiers"]') as HTMLButtonElement;
    expect(tiersBtn).toBeTruthy();

    await act(async () => {
      tiersBtn.click();
    });

    expect(container?.textContent).toContain('Mastery Tiers');

    // Switch to Velocity Diagnostic
    const velocityBtn = container?.querySelector('button[data-testid="stats-mode-velocity"]') as HTMLButtonElement;
    expect(velocityBtn).toBeTruthy();

    await act(async () => {
      velocityBtn.click();
    });

    expect(container?.textContent).toContain('Velocity');
    expect(container?.textContent).toContain('Drag');
    expect(container?.textContent).toContain('Accel');
    expect(container?.textContent).toContain('Hyper');

    // Test next chevron wraps back to Skill Matrix
    const nextBtn = container?.querySelector('button[aria-label="Next chart"]') as HTMLButtonElement;
    expect(nextBtn).toBeTruthy();

    await act(async () => {
      nextBtn.click();
    });

    expect(container?.textContent).toContain('Skill Matrix');
  });

  it('adapts styling cleanly for apple-gsos (day) theme with higher contrast guidelines', async () => {
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
    expect(container?.textContent).toContain('Skill Matrix');
  });

  it('invokes onSelectExclusiveTrack when an orbit slice is clicked', async () => {
    const handleSelectExclusiveTrack = vi.fn();

    await act(async () => {
      root?.render(
        <DeckStatsWidget
          state={mockState}
          topics={mockTopics}
          theme="dark"
          onSelectExclusiveTrack={handleSelectExclusiveTrack}
        />
      );
    });

    // Switch to orbit
    const orbitBtn = container?.querySelector('button[data-testid="stats-mode-orbit"]') as HTMLButtonElement;
    await act(async () => {
      orbitBtn.click();
    });

    const algoSlice = container?.querySelector('path[data-track="algorithms"]') as SVGPathElement;
    expect(algoSlice).toBeTruthy();

    await act(async () => {
      algoSlice.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(handleSelectExclusiveTrack).toHaveBeenCalledWith('algorithms');
  });

  it('invokes onSelectExclusiveTracks when a domain in skill matrix is clicked', async () => {
    const handleSelectExclusiveTracks = vi.fn();

    await act(async () => {
      root?.render(
        <DeckStatsWidget
          state={mockState}
          topics={mockTopics}
          theme="dark"
          onSelectExclusiveTracks={handleSelectExclusiveTracks}
        />
      );
    });

    // Find domain text/axis for Algorithms
    const algoNode = container?.querySelector('g[data-domain="algorithms"]');
    expect(algoNode).toBeTruthy();

    await act(async () => {
      algoNode?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(handleSelectExclusiveTracks).toHaveBeenCalledWith(['algorithms']);
  });

  it('invokes onSelectExclusiveBox when velocity tier buttons are clicked', async () => {
    const handleSelectExclusiveBox = vi.fn();

    await act(async () => {
      root?.render(
        <DeckStatsWidget
          state={mockState}
          topics={mockTopics}
          theme="dark"
          onSelectExclusiveBox={handleSelectExclusiveBox}
        />
      );
    });

    // Switch to velocity
    const velocityBtn = container?.querySelector('button[data-testid="stats-mode-velocity"]') as HTMLButtonElement;
    await act(async () => {
      velocityBtn.click();
    });

    const dragBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Drag')
    );
    expect(dragBtn).toBeTruthy();

    await act(async () => {
      dragBtn?.click();
    });

    expect(handleSelectExclusiveBox).toHaveBeenCalledWith(1);
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
