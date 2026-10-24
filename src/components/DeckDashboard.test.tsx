// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { DeckDashboard } from './DeckDashboard';
import type { TopicItem, LeitnerDeckState } from '../lib/leitner';

// @ts-expect-error IS_REACT_ACT_ENVIRONMENT is a React global flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const testTopics: TopicItem[] = [
  {
    id: 'card-tier-1',
    title: 'Tier 1 Learning Card',
    track: 'algorithms',
    box: 1,
    status: 'active',
    streak: 0,
    promptSeed: '',
    tags: ['algorithms'],
    nextEligibleTrial: 0,
  },
  {
    id: 'card-tier-5',
    title: 'Tier 5 Mastered Card',
    track: 'react',
    box: 5,
    status: 'active',
    streak: 4,
    promptSeed: '',
    tags: ['react'],
    nextEligibleTrial: 0,
  },
  {
    id: 'card-tier-6',
    title: 'Tier 6 Veteran Card',
    track: 'typescript-patterns',
    box: 6,
    status: 'active',
    streak: 5,
    promptSeed: '',
    tags: ['typescript'],
    nextEligibleTrial: 0,
  },
];

const mockState: LeitnerDeckState = {
  topics: testTopics,
  totalCompletedReviews: 10,
  unlockedStageCount: 1,
  algorithm: 'graduated-interval',
};

describe('DeckDashboard tier pill filtering and multiselect', () => {
  let container: HTMLDivElement | null = null;
  let root: ReactDOMClient.Root | null = null;

  beforeEach(() => {
    localStorage.clear();
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

  const renderDashboard = async (state = mockState) => {
    await act(async () => {
      root?.render(
        <DeckDashboard
          state={state}
          theme="dark"
          onSelectCardToPractice={vi.fn()}
          onToggleLock={vi.fn()}
          onResetBox={vi.fn()}
          onDeleteTopic={vi.fn()}
          onStateUpdated={vi.fn()}
          onOpenAddModal={vi.fn()}
        />
      );
    });
  };

  it('clicking Tier 5 pill strictly isolates Tier 5 cards and hides Tier 6 cards', async () => {
    await renderDashboard();

    // Verify all 3 cards are initially rendered
    expect(container?.textContent).toContain('Tier 1 Learning Card');
    expect(container?.textContent).toContain('Tier 5 Mastered Card');
    expect(container?.textContent).toContain('Tier 6 Veteran Card');

    // Click Tier 5 pill
    const pill5 = container?.querySelector('[data-testid="tier-pill-5"]') as HTMLElement;
    expect(pill5).toBeTruthy();

    await act(async () => {
      pill5.click();
    });

    // Pill 5 should be selected, Pill 6 should NOT be selected
    expect(pill5.getAttribute('aria-pressed')).toBe('true');
    const pill6 = container?.querySelector('[data-testid="tier-pill-6"]') as HTMLElement;
    expect(pill6.getAttribute('aria-pressed')).toBe('false');

    // ONLY Tier 5 card should be visible; Tier 6 and Tier 1 cards must NOT be visible
    expect(container?.textContent).toContain('Tier 5 Mastered Card');
    expect(container?.textContent).not.toContain('Tier 6 Veteran Card');
    expect(container?.textContent).not.toContain('Tier 1 Learning Card');
  });

  it('supports multiselect across tier pills', async () => {
    await renderDashboard();

    const pill5 = container?.querySelector('[data-testid="tier-pill-5"]') as HTMLElement;
    const pill6 = container?.querySelector('[data-testid="tier-pill-6"]') as HTMLElement;

    // 1. Select Tier 5
    await act(async () => {
      pill5.click();
    });
    expect(pill5.getAttribute('aria-pressed')).toBe('true');
    expect(pill6.getAttribute('aria-pressed')).toBe('false');
    expect(container?.textContent).toContain('Tier 5 Mastered Card');
    expect(container?.textContent).not.toContain('Tier 6 Veteran Card');

    // 2. Select Tier 6 as well (multiselect)
    await act(async () => {
      pill6.click();
    });
    expect(pill5.getAttribute('aria-pressed')).toBe('true');
    expect(pill6.getAttribute('aria-pressed')).toBe('true');
    // Both Tier 5 and Tier 6 cards are now shown; Tier 1 remains hidden
    expect(container?.textContent).toContain('Tier 5 Mastered Card');
    expect(container?.textContent).toContain('Tier 6 Veteran Card');
    expect(container?.textContent).not.toContain('Tier 1 Learning Card');

    // 3. Deselect Tier 5 by clicking it again
    await act(async () => {
      pill5.click();
    });
    expect(pill5.getAttribute('aria-pressed')).toBe('false');
    expect(pill6.getAttribute('aria-pressed')).toBe('true');
    expect(container?.textContent).not.toContain('Tier 5 Mastered Card');
    expect(container?.textContent).toContain('Tier 6 Veteran Card');

    // 4. Deselect Tier 6 by clicking it again -> resets to 'all'
    await act(async () => {
      pill6.click();
    });
    expect(pill5.getAttribute('aria-pressed')).toBe('false');
    expect(pill6.getAttribute('aria-pressed')).toBe('false');
    expect(container?.textContent).toContain('Tier 1 Learning Card');
    expect(container?.textContent).toContain('Tier 5 Mastered Card');
    expect(container?.textContent).toContain('Tier 6 Veteran Card');
  });

  it('resets tier selection when Reset to All Tiers button is clicked', async () => {
    await renderDashboard();

    const pill5 = container?.querySelector('[data-testid="tier-pill-5"]') as HTMLElement;
    await act(async () => {
      pill5.click();
    });

    // Reset button should now be visible
    const resetBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Reset to All Tiers')
    );
    expect(resetBtn).toBeTruthy();

    await act(async () => {
      resetBtn?.click();
    });

    // All pills unselected, all cards visible
    expect(pill5.getAttribute('aria-pressed')).toBe('false');
    expect(container?.textContent).toContain('Tier 1 Learning Card');
    expect(container?.textContent).toContain('Tier 5 Mastered Card');
    expect(container?.textContent).toContain('Tier 6 Veteran Card');
  });

  it('selects all pills for tier 5 and above when Tier 5+ classification is clicked on the analytics graph', async () => {
    await renderDashboard();

    // Switch to Mastery Tiers mode on DeckStatsWidget
    const tiersBtn = container?.querySelector('button[data-testid="stats-mode-tiers"]') as HTMLButtonElement;
    expect(tiersBtn).toBeTruthy();
    await act(async () => {
      tiersBtn.click();
    });

    // Click Tier 5+ classification arc
    const box5Group = container?.querySelector('g[data-box="5"]') as SVGGElement;
    expect(box5Group).toBeTruthy();
    await act(async () => {
      box5Group.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Verify all pills for Tier 5 and above (5, 6, 7, 8, 9) are now selected
    const pill5 = container?.querySelector('[data-testid="tier-pill-5"]') as HTMLElement;
    const pill6 = container?.querySelector('[data-testid="tier-pill-6"]') as HTMLElement;
    const pill7 = container?.querySelector('[data-testid="tier-pill-7"]') as HTMLElement;
    const pill8 = container?.querySelector('[data-testid="tier-pill-8"]') as HTMLElement;
    const pill9 = container?.querySelector('[data-testid="tier-pill-9"]') as HTMLElement;
    const pill1 = container?.querySelector('[data-testid="tier-pill-1"]') as HTMLElement;

    expect(pill5.getAttribute('aria-pressed')).toBe('true');
    expect(pill6.getAttribute('aria-pressed')).toBe('true');
    expect(pill7.getAttribute('aria-pressed')).toBe('true');
    expect(pill8.getAttribute('aria-pressed')).toBe('true');
    expect(pill9.getAttribute('aria-pressed')).toBe('true');
    expect(pill1.getAttribute('aria-pressed')).toBe('false');

    // Both Tier 5 and Tier 6 cards should be visible; Tier 1 card is hidden
    expect(container?.textContent).toContain('Tier 5 Mastered Card');
    expect(container?.textContent).toContain('Tier 6 Veteran Card');
    expect(container?.textContent).not.toContain('Tier 1 Learning Card');

    // Clicking Tier 5+ ring again deselects and returns to 'all'
    await act(async () => {
      box5Group.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(pill5.getAttribute('aria-pressed')).toBe('false');
    expect(pill6.getAttribute('aria-pressed')).toBe('false');
    expect(container?.textContent).toContain('Tier 1 Learning Card');
    expect(container?.textContent).toContain('Tier 5 Mastered Card');
    expect(container?.textContent).toContain('Tier 6 Veteran Card');
  });

  it('persists filters and sort across unmount and remount (navigating to a card and back)', async () => {
    // Mount first time
    await renderDashboard();

    // Select Tier 5 pill
    const pill5 = container?.querySelector('[data-testid="tier-pill-5"]') as HTMLElement;
    expect(pill5).toBeTruthy();
    await act(async () => {
      pill5.click();
    });

    // Change status filter to 'unlocked'
    const statusSelect = container?.querySelector('select[aria-label="Filter by Status"]') as HTMLSelectElement;
    expect(statusSelect).toBeTruthy();
    await act(async () => {
      statusSelect.value = 'unlocked';
      statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Change sort option to 'difficulty-desc'
    const sortSelect = container?.querySelector('select[aria-label="Sort Cards"]') as HTMLSelectElement;
    expect(sortSelect).toBeTruthy();
    await act(async () => {
      sortSelect.value = 'difficulty-desc';
      sortSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Change search query
    const searchInput = container?.querySelector('input[placeholder*="Search cards"]') as HTMLInputElement;
    expect(searchInput).toBeTruthy();
    const inputSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    await act(async () => {
      inputSetter?.call(searchInput, 'Mastered');
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Verify filtered output on initial mount
    expect(container?.textContent).toContain('Tier 5 Mastered Card');
    expect(container?.textContent).not.toContain('Tier 1 Learning Card');
    expect(container?.textContent).not.toContain('Tier 6 Veteran Card');

    // Simulate unmounting (user goes to a card to practice)
    await act(async () => {
      root?.unmount();
    });
    root = ReactDOMClient.createRoot(container!);

    // Simulate remounting (user backs out to deck screen)
    await renderDashboard();

    // Verify filters and sort are still applied
    const restoredPill5 = container?.querySelector('[data-testid="tier-pill-5"]') as HTMLElement;
    const restoredStatusSelect = container?.querySelector('select[aria-label="Filter by Status"]') as HTMLSelectElement;
    const restoredSortSelect = container?.querySelector('select[aria-label="Sort Cards"]') as HTMLSelectElement;
    const restoredSearchInput = container?.querySelector('input[placeholder*="Search cards"]') as HTMLInputElement;

    expect(restoredPill5.getAttribute('aria-pressed')).toBe('true');
    expect(restoredStatusSelect.value).toBe('unlocked');
    expect(restoredSortSelect.value).toBe('difficulty-desc');
    expect(restoredSearchInput.value).toBe('Mastered');

    expect(container?.textContent).toContain('Tier 5 Mastered Card');
    expect(container?.textContent).not.toContain('Tier 1 Learning Card');
    expect(container?.textContent).not.toContain('Tier 6 Veteran Card');

    // Reset filters button restores defaults
    const allButtons = Array.from(container?.querySelectorAll('button') || []);
    const resetFiltersBtn = allButtons.find((b) => b.textContent?.includes('Reset Filters'));
    expect(resetFiltersBtn).toBeTruthy();
    await act(async () => {
      resetFiltersBtn?.click();
    });

    expect(restoredPill5.getAttribute('aria-pressed')).toBe('false');
    expect(container?.textContent).toContain('Tier 1 Learning Card');
    expect(container?.textContent).toContain('Tier 5 Mastered Card');
    expect(container?.textContent).toContain('Tier 6 Veteran Card');
  });
});
