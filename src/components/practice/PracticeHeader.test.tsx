// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import ReactDOM from 'react-dom/client';
import { PracticeHeader } from './PracticeHeader';
import type { TopicItem } from '../../lib/leitner';
import { getTrackMeta } from '../../lib/leitner';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('PracticeHeader', () => {
  let container: HTMLDivElement | null = null;
  let root: ReactDOM.Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = ReactDOM.createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
    }
    if (container && document.body.contains(container)) {
      document.body.removeChild(container);
    }
    container = null;
    root = null;
  });

  const sampleCard: TopicItem = {
    id: 'two-sum',
    title: 'Two Sum Problem',
    track: 'algorithms',
    box: 3,
    streak: 4,
    nextEligibleTrial: 10,
    status: 'active',
    tags: ['array', 'hash-map'],
    difficulty: 2,
    promptSeed: 'Write a twoSum function...',
    targetTime: 'O(n)',
    targetSpace: 'O(n)',
    complexityExplanation: 'Single-pass hash table achieves linear time complexity.',
  };

  it('renders track, title, difficulty, streak and timer', async () => {
    const trackMeta = getTrackMeta(sampleCard.track);
    const indicatorsRef = { current: null };

    await act(async () => {
      root?.render(
        <PracticeHeader
          currentCard={sampleCard}
          trackMeta={trackMeta}
          activePopover={null}
          setActivePopover={vi.fn()}
          inspectedTier={3}
          setInspectedTier={vi.fn()}
          indicatorsHeaderRef={indicatorsRef}
          timeRemaining={180}
          formatTimer={(s) => `${Math.floor(s / 60)}:00`}
          isTimerRunning={true}
          setIsTimerRunning={vi.fn()}
          timedMode={true}
          configuredDuration={300}
          setTimeRemaining={vi.fn()}
          setTimeExpiredToast={vi.fn()}
        />
      );
    });

    expect(container?.querySelector('h1')?.textContent).toBe('Two Sum Problem');
    expect(container?.querySelector('.arena-track-badge')?.textContent).toBe(trackMeta.label);
    expect(container?.querySelector('.arena-streak-badge')?.textContent).toContain('4 streak');
    expect(container?.querySelector('.arena-complexity-badge')?.textContent).toContain('O(n)');
    expect(container?.querySelector('.arena-timer-value')?.textContent).toBe('3:00');
  });

  it('opens popover when popover is active and triggers close', async () => {
    const trackMeta = getTrackMeta(sampleCard.track);
    const indicatorsRef = { current: null };
    const setActivePopover = vi.fn();

    await act(async () => {
      root?.render(
        <PracticeHeader
          currentCard={sampleCard}
          trackMeta={trackMeta}
          activePopover="track"
          setActivePopover={setActivePopover}
          inspectedTier={3}
          setInspectedTier={vi.fn()}
          indicatorsHeaderRef={indicatorsRef}
          timeRemaining={180}
          formatTimer={(s) => `${s}`}
          isTimerRunning={false}
          setIsTimerRunning={vi.fn()}
          timedMode={false}
          configuredDuration={300}
          setTimeRemaining={vi.fn()}
          setTimeExpiredToast={vi.fn()}
        />
      );
    });

    const popover = container?.querySelector('.arena-popover-panel');
    expect(popover).toBeDefined();
    expect(popover?.textContent).toContain(`Topic: ${trackMeta.label}`);

    const closeBtn = popover?.querySelector('.arena-popover-close-btn') as HTMLButtonElement | null;
    await act(async () => {
      closeBtn?.click();
    });
    expect(setActivePopover).toHaveBeenCalledWith(null);
  });
});
