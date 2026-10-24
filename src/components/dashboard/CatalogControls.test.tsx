// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { CatalogControls } from './CatalogControls';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('CatalogControls', () => {
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

  it('renders search input, selects, count summary and handles changes', async () => {
    const onSearchChange = vi.fn();
    const onStatusChange = vi.fn();
    const onDifficultyChange = vi.fn();
    const onSortChange = vi.fn();
    const onResetFilters = vi.fn();

    await act(async () => {
      root?.render(
        <CatalogControls
          searchQuery="tree"
          onSearchChange={onSearchChange}
          selectedStatus="all"
          onStatusChange={onStatusChange}
          selectedDifficulty="all"
          onDifficultyChange={onDifficultyChange}
          sortOption="track-asc"
          onSortChange={onSortChange}
          tierName="Tier"
          filteredCount={8}
          totalCount={20}
          hasActiveFilters={true}
          onResetFilters={onResetFilters}
        />
      );
    });

    // Check count text
    expect(container?.textContent).toContain('Showing 8 of 20 cards');

    // Check search input
    const searchInput = container?.querySelector('.catalog-search-input') as HTMLInputElement;
    expect(searchInput.value).toBe('tree');
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    await act(async () => {
      nativeSetter?.call(searchInput, 'graph');
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(onSearchChange).toHaveBeenCalledWith('graph');

    // Check status select
    const statusSelect = container?.querySelector('select[aria-label="Filter by Status"]') as HTMLSelectElement;
    expect(statusSelect).toBeTruthy();
    await act(async () => {
      statusSelect.value = 'attempted';
      statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(onStatusChange).toHaveBeenCalledWith('attempted');

    // Check difficulty select
    const diffSelect = container?.querySelector('select[aria-label="Filter by Difficulty"]') as HTMLSelectElement;
    expect(diffSelect).toBeTruthy();
    await act(async () => {
      diffSelect.value = '3';
      diffSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(onDifficultyChange).toHaveBeenCalledWith(3);

    // Check sort select
    const sortSelect = container?.querySelector('select[aria-label="Sort Cards"]') as HTMLSelectElement;
    expect(sortSelect).toBeTruthy();
    await act(async () => {
      sortSelect.value = 'streak-desc';
      sortSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(onSortChange).toHaveBeenCalledWith('streak-desc');

    // Check reset filters button
    const resetBtn = container?.querySelector('.catalog-reset-filters-btn') as HTMLButtonElement;
    expect(resetBtn).toBeTruthy();
    await act(async () => {
      resetBtn.click();
    });
    expect(onResetFilters).toHaveBeenCalledTimes(1);
  });
});
