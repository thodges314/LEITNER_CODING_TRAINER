// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { TierFilterBar } from './TierFilterBar';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('TierFilterBar', () => {
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

  it('renders all tier pills with their labels and counts', async () => {
    const displayedBoxes = [1, 2, 3, 4, 5];
    const boxCounts = [10, 5, 3, 2, 8];
    const onToggleBox = vi.fn();
    const onResetBoxes = vi.fn();

    await act(async () => {
      root?.render(
        <TierFilterBar
          tierName="Tier"
          selectedBox="all"
          displayedBoxes={displayedBoxes}
          boxCounts={boxCounts}
          algorithm="graduated-interval"
          onToggleBox={onToggleBox}
          onResetBoxes={onResetBoxes}
        />
      );
    });

    expect(container?.textContent).toContain('Active Spacing Tiers:');
    expect(container?.textContent).toContain('Tier 1 (+1)');
    expect(container?.textContent).toContain('10');
    expect(container?.textContent).toContain('Tier 5 (+35)');
    expect(container?.textContent).toContain('8');

    // No reset button when all are selected
    expect(container?.querySelector('.tier-filter-reset-btn')).toBeNull();
  });

  it('handles pill clicking and displays reset button when a box is selected', async () => {
    const displayedBoxes = [1, 2, 3];
    const boxCounts = [4, 2, 1];
    const onToggleBox = vi.fn();
    const onResetBoxes = vi.fn();

    await act(async () => {
      root?.render(
        <TierFilterBar
          tierName="Box"
          selectedBox={2}
          displayedBoxes={displayedBoxes}
          boxCounts={boxCounts}
          algorithm="leitner"
          onToggleBox={onToggleBox}
          onResetBoxes={onResetBoxes}
        />
      );
    });

    expect(container?.textContent).toContain('1 of 3 selected');
    const resetBtn = container?.querySelector('.tier-filter-reset-btn') as HTMLButtonElement;
    expect(resetBtn).toBeTruthy();
    expect(resetBtn.textContent).toContain('Reset to All Boxs');

    await act(async () => {
      resetBtn.click();
    });
    expect(onResetBoxes).toHaveBeenCalledTimes(1);

    const pill1 = container?.querySelector('[data-testid="tier-pill-1"]') as HTMLElement;
    await act(async () => {
      pill1.click();
    });
    expect(onToggleBox).toHaveBeenCalledWith(1);
  });
});
