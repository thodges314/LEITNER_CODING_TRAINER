// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { CatalogTable } from './CatalogTable';
import type { TopicItem } from '../../lib/leitner';

// @ts-expect-error IS_REACT_ACT_ENVIRONMENT is a React global flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const testCards: TopicItem[] = [
  {
    id: 'test-card-1',
    title: 'Two Sum Algorithm',
    track: 'algorithms',
    box: 2,
    status: 'active',
    streak: 3,
    promptSeed: '',
    tags: ['array', 'hashmap'],
    nextEligibleTrial: 0,
  },
  {
    id: 'test-card-2',
    title: 'Counter Component',
    track: 'react-components',
    box: 1,
    status: 'locked',
    streak: 0,
    promptSeed: '',
    tags: ['react'],
    nextEligibleTrial: 0,
  },
  {
    id: 'test-card-3',
    title: 'Debounce Utility',
    track: 'js-utilities',
    box: 1,
    status: 'active',
    streak: 0,
    deactivated: true,
    promptSeed: '',
    tags: ['closure'],
    nextEligibleTrial: 0,
  },
];

describe('CatalogTable', () => {
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

  it('renders card rows with badges, tags and responds to header clicks', async () => {
    const onHeaderSort = vi.fn();
    const onSelectCardToPractice = vi.fn();
    const onResetBox = vi.fn();
    const onToggleLock = vi.fn();
    const onDeactivateClick = vi.fn();

    await act(async () => {
      root?.render(
        <CatalogTable
          topics={testCards}
          tierName="Tier"
          isLight={false}
          sortOption="track-asc"
          onHeaderSort={onHeaderSort}
          onSelectCardToPractice={onSelectCardToPractice}
          onResetBox={onResetBox}
          onToggleLock={onToggleLock}
          onDeactivateClick={onDeactivateClick}
        />
      );
    });

    expect(container?.textContent).toContain('Two Sum Algorithm');
    expect(container?.textContent).toContain('Counter Component');
    expect(container?.textContent).toContain('Debounce Utility');
    expect(container?.textContent).toContain('Tier 2');
    expect(container?.textContent).toContain('3'); // streak

    // Click header to sort
    const titleHeader = container?.querySelector('.col-card-title') as HTMLElement;
    expect(titleHeader).toBeTruthy();
    await act(async () => {
      titleHeader.click();
    });
    expect(onHeaderSort).toHaveBeenCalledWith('title');

    // Practice button on active card
    const practiceBtn = container?.querySelector('button[title*="Start blank-buffer"]') as HTMLButtonElement;
    expect(practiceBtn).toBeTruthy();
    await act(async () => {
      practiceBtn.click();
    });
    expect(onSelectCardToPractice).toHaveBeenCalledWith(testCards[0]);

    // Unlock button on locked card
    const unlockBtn = container?.querySelector('button[title="Unlock card to active rotation"]') as HTMLButtonElement;
    expect(unlockBtn).toBeTruthy();
    await act(async () => {
      unlockBtn.click();
    });
    expect(onToggleLock).toHaveBeenCalledWith('test-card-2', 'locked');

    // Deactivate button
    const deactBtn = container?.querySelector('button[title*="Deactivate topic"]') as HTMLButtonElement;
    expect(deactBtn).toBeTruthy();
    await act(async () => {
      deactBtn.click();
    });
    expect(onDeactivateClick).toHaveBeenCalledWith(testCards[0]);
  });

  it('renders empty message when no cards match filter', async () => {
    await act(async () => {
      root?.render(
        <CatalogTable
          topics={[]}
          tierName="Tier"
          isLight={false}
          sortOption="track-asc"
          onHeaderSort={vi.fn()}
          onSelectCardToPractice={vi.fn()}
          onResetBox={vi.fn()}
          onToggleLock={vi.fn()}
          onDeactivateClick={vi.fn()}
        />
      );
    });

    expect(container?.textContent).toContain('No cards match your current filter criteria.');
  });
});
