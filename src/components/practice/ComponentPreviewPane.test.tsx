// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import ReactDOM from 'react-dom/client';
import { ComponentPreviewPane } from './ComponentPreviewPane';
import type { TopicItem } from '../../lib/leitner';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('ComponentPreviewPane', () => {
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

  const baseCard: TopicItem = {
    id: 'custom-hook',
    title: 'useCounter Hook',
    track: 'react',
    box: 1,
    streak: 0,
    nextEligibleTrial: 0,
    status: 'active',
    tags: ['hook'],
    promptSeed: 'Write a counter hook...',
  };

  it('renders unmounted state when no component is mounted', async () => {
    await act(async () => {
      root?.render(
        <ComponentPreviewPane
          currentCard={baseCard}
          code="function useCounter() {}"
          executionMode="js"
          isPreviewLive={false}
          previewRunTrigger={0}
          appendConsoleLog={vi.fn()}
          mountedComponent={null}
          isLegacyPoppedOut={false}
          legacyPopupWindow={null}
          handleLegacyPopOut={vi.fn()}
          handleLegacyDockBack={vi.fn()}
          setMountedComponent={vi.fn()}
          setIsOutputOpen={vi.fn()}
        />
      );
    });

    expect(container?.textContent).toContain('Component Preview / Hook Test');
    expect(container?.textContent).toContain('Unmounted');
    expect(container?.textContent).toContain('Ready to Preview');
  });

  it('renders live mounted component and handles reset mount', async () => {
    const handleSetMounted = vi.fn();

    await act(async () => {
      root?.render(
        <ComponentPreviewPane
          currentCard={baseCard}
          code="function useCounter() {}"
          executionMode="js"
          isPreviewLive={true}
          previewRunTrigger={1}
          appendConsoleLog={vi.fn()}
          mountedComponent={{
            key: 1,
            element: <div data-testid="live-preview-element">Count: 5</div>,
          }}
          isLegacyPoppedOut={false}
          legacyPopupWindow={null}
          handleLegacyPopOut={vi.fn()}
          handleLegacyDockBack={vi.fn()}
          setMountedComponent={handleSetMounted}
          setIsOutputOpen={vi.fn()}
        />
      );
    });

    expect(container?.textContent).toContain('Live Mounted');
    expect(container?.querySelector('[data-testid="live-preview-element"]')?.textContent).toBe('Count: 5');

    const resetBtn = Array.from(container?.querySelectorAll('button') ?? []).find((b) =>
      b.textContent?.includes('Reset Mount')
    );
    expect(resetBtn).toBeDefined();
    await act(async () => {
      resetBtn?.click();
    });
    expect(handleSetMounted).toHaveBeenCalledWith(null);
  });
});
