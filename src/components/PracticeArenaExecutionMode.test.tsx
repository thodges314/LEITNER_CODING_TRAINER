// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { PracticeArena } from './PracticeArena';
import type { TopicItem } from '../lib/leitner';
import { getPreferredExecutionMode, setPreferredExecutionMode } from '../lib/editorSettings';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const algorithmCard: TopicItem = {
  id: 'two-sum-algo',
  track: 'algorithms',
  title: 'Two Sum',
  box: 1,
  streak: 0,
  nextEligibleTrial: 0,
  status: 'active',
  tags: ['algorithms'],
  promptSeed: 'Find two sum',
  referenceSolution: 'function twoSum() {}',
  testHarness: 'expect(twoSum()).toBeDefined();',
};

const typescriptCard: TopicItem = {
  id: 'ts-typed-event-emitter',
  track: 'typescript-patterns',
  title: 'Typed Event Emitter',
  box: 1,
  streak: 0,
  nextEligibleTrial: 0,
  status: 'active',
  tags: ['typescript-patterns'],
  promptSeed: 'Implement type-safe event emitter',
  referenceSolution: 'class EventEmitter {}',
  testHarness: 'type Cases = [];',
};

describe('PracticeArena Execution Mode & Track Override Behavior', () => {
  let container: HTMLDivElement | null = null;
  let root: ReactDOMClient.Root | null = null;

  beforeEach(() => {
    if (!Range.prototype.getClientRects) {
      Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
    }
    localStorage.clear();
    setPreferredExecutionMode('js');
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
    localStorage.clear();
  });

  it('initializes non-TS card with default preferred mode (js)', async () => {
    await act(async () => {
      root?.render(
        <PracticeArena
          currentCard={algorithmCard}
          totalCompletedReviews={0}
          onCommitReview={vi.fn()}
          onSkipCard={vi.fn()}
          onOpenDeckView={vi.fn()}
        />
      );
    });

    const buttons = container?.querySelectorAll('button');
    const jsBtn = Array.from(buttons ?? []).find((b) => b.textContent?.includes('JS (Fast)'));
    const tsBtn = Array.from(buttons ?? []).find((b) => b.textContent?.includes('TS (Strict Type Check)'));

    expect(jsBtn).toBeDefined();
    expect(tsBtn).toBeDefined();
    expect(getPreferredExecutionMode()).toBe('js');
  });

  it('persists preferred mode when user switches mode on a standard non-TS card', async () => {
    await act(async () => {
      root?.render(
        <PracticeArena
          currentCard={algorithmCard}
          totalCompletedReviews={0}
          onCommitReview={vi.fn()}
          onSkipCard={vi.fn()}
          onOpenDeckView={vi.fn()}
        />
      );
    });

    const buttons = container?.querySelectorAll('button');
    const tsBtn = Array.from(buttons ?? []).find((b) => b.textContent?.includes('TS (Strict Type Check)'));

    await act(async () => {
      tsBtn?.click();
    });

    expect(getPreferredExecutionMode()).toBe('ts');

    const jsBtn = Array.from(buttons ?? []).find((b) => b.textContent?.includes('JS (Fast)'));
    await act(async () => {
      jsBtn?.click();
    });

    expect(getPreferredExecutionMode()).toBe('js');
  });

  it('temporarily overrides to ts for typescript-patterns track without altering localStorage', async () => {
    // User preference starts as 'js'
    setPreferredExecutionMode('js');

    await act(async () => {
      root?.render(
        <PracticeArena
          currentCard={typescriptCard}
          totalCompletedReviews={0}
          onCommitReview={vi.fn()}
          onSkipCard={vi.fn()}
          onOpenDeckView={vi.fn()}
        />
      );
    });

    // Stored preference in localStorage remains 'js'
    expect(getPreferredExecutionMode()).toBe('js');

    const buttons = container?.querySelectorAll('button');
    const jsBtn = Array.from(buttons ?? []).find((b) => b.textContent?.includes('JS (Fast)'));
    const tsBtn = Array.from(buttons ?? []).find((b) => b.textContent?.includes('TS (Strict • Required)'));

    // TS is active and marked as required
    expect(tsBtn).toBeDefined();
    // JS button is marked unavailable on TypeScript Patterns track, but stays clickable so it can explain why
    expect(jsBtn?.getAttribute('aria-disabled')).toBe('true');
    expect(container?.querySelector('[data-testid="ts-only-notice"]')).toBeNull();
    await act(async () => {
      jsBtn?.click();
    });
    expect(container?.querySelector('[data-testid="ts-only-notice"]')?.textContent).toContain('TypeScript topic');
    expect(getPreferredExecutionMode()).toBe('js');

    // Now advance to a non-TS card
    await act(async () => {
      root?.render(
        <PracticeArena
          currentCard={algorithmCard}
          totalCompletedReviews={1}
          onCommitReview={vi.fn()}
          onSkipCard={vi.fn()}
          onOpenDeckView={vi.fn()}
        />
      );
    });

    // Reverted back to the user's default ('js')
    expect(getPreferredExecutionMode()).toBe('js');
    const newButtons = container?.querySelectorAll('button');
    const newJsBtn = Array.from(newButtons ?? []).find((b) => b.textContent?.includes('JS (Fast)'));
    expect(newJsBtn?.disabled).toBe(false);
  });
});
