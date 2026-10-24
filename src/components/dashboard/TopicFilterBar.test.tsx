// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { TopicFilterBar } from './TopicFilterBar';
import type { TrackType } from '../../lib/leitner';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('TopicFilterBar', () => {
  let container: HTMLDivElement | null = null;
  let root: ReactDOMClient.Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = ReactDOMClient.createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    container = null;
    root = null;
  });

  const availableTracks: TrackType[] = ['algorithms', 'react-components', 'async-js'];
  const trackCounts: Record<string, number> = {
    algorithms: 15,
    'react-components': 10,
    'async-js': 5,
  };

  it('renders all topics pill and individual track pills', async () => {
    const onToggleTrack = vi.fn();
    const onResetTracks = vi.fn();
    const onDismissHint = vi.fn();

    await act(async () => {
      root?.render(
        <TopicFilterBar
          allAvailableTracks={availableTracks}
          selectedTracks={['all']}
          isAllTracks={true}
          trackCounts={trackCounts}
          totalTopicsCount={30}
          showTrackHint={false}
          onToggleTrack={onToggleTrack}
          onResetTracks={onResetTracks}
          onDismissHint={onDismissHint}
        />
      );
    });

    expect(container?.textContent).toContain('Filter Topics:');
    expect(container?.textContent).toContain('All Topics (30)');
    expect(container?.textContent).toContain('Algorithms');
    expect(container?.textContent).toContain('React Components');
    expect(container?.textContent).toContain('Async JS');

    // Clicking All Topics calls onToggleTrack('all')
    const allBtn = container?.querySelector('.track-filter-btn') as HTMLButtonElement;
    await act(async () => {
      allBtn.click();
    });
    expect(onToggleTrack).toHaveBeenCalledWith('all');
  });

  it('shows track hint and allows dismissing or opening focus', async () => {
    const onToggleTrack = vi.fn();
    const onResetTracks = vi.fn();
    const onDismissHint = vi.fn();
    const onOpenFocus = vi.fn();

    await act(async () => {
      root?.render(
        <TopicFilterBar
          allAvailableTracks={availableTracks}
          selectedTracks={['algorithms']}
          isAllTracks={false}
          trackCounts={trackCounts}
          totalTopicsCount={30}
          showTrackHint={true}
          onToggleTrack={onToggleTrack}
          onResetTracks={onResetTracks}
          onDismissHint={onDismissHint}
          onOpenFocus={onOpenFocus}
        />
      );
    });

    const hint = container?.querySelector('[data-testid="track-filter-hint"]');
    expect(hint).toBeTruthy();
    expect(hint?.textContent).toContain('This filter is for inspecting cards');

    // Click Open Focus
    const openFocusBtn = container?.querySelector('.track-filter-hint-actions button.btn-primary') as HTMLButtonElement;
    await act(async () => {
      openFocusBtn.click();
    });
    expect(onDismissHint).toHaveBeenCalledTimes(1);
    expect(onOpenFocus).toHaveBeenCalledTimes(1);

    // Reset button appears when isAllTracks is false
    const resetBtn = container?.querySelector('.topic-filter-reset-btn') as HTMLButtonElement;
    expect(resetBtn).toBeTruthy();
    await act(async () => {
      resetBtn.click();
    });
    expect(onResetTracks).toHaveBeenCalledTimes(1);
  });
});
