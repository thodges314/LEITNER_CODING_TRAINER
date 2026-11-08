// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { PracticeActionHero } from './PracticeActionHero';
import type { TopicItem } from '../../lib/leitner';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('PracticeActionHero', () => {
  let container: HTMLDivElement;
  let root: ReactDOMClient.Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = ReactDOMClient.createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  const sampleCard: TopicItem = {
    id: 'two-sum',
    track: 'algorithms',
    title: 'Two Sum Problem',
    box: 2,
    streak: 1,
    nextEligibleTrial: 10,
    status: 'active',
    tags: ['algorithms', 'hashmap'],
    promptSeed: '',
  };

  it('renders 24-hour rolling window stats accurately', async () => {
    await act(async () => {
      root.render(
        <PracticeActionHero
          stats={{ attempted: 14, promoted: 11, demoted: 3 }}
          nextCard={sampleCard}
          activeCount={25}
          totalCards={428}
          onResumePractice={() => {}}
        />
      );
    });

    expect(container.textContent).toContain('24-Hour Rolling Window');
    expect(container.textContent).not.toContain('Practice Momentum');
    expect(container.textContent).not.toContain('Active Cards');
    expect(container.textContent).not.toContain('in last 24h');
    expect(container.textContent).not.toContain('tier advanced');
    expect(container.textContent).not.toContain('needs review');

    const attempted = container.querySelector('[data-testid="hero-stat-attempted"]');
    const promoted = container.querySelector('[data-testid="hero-stat-promoted"]');
    const demoted = container.querySelector('[data-testid="hero-stat-demoted"]');

    expect(attempted?.textContent).toContain('14');
    expect(promoted?.textContent).toContain('11');
    expect(demoted?.textContent).toContain('3');

    expect(container.textContent).toContain('Two Sum Problem');
    expect(container.textContent).toContain('(algorithms)');
  });

  it('fires onResumePractice when the launch button is clicked', async () => {
    const handleResume = vi.fn();
    await act(async () => {
      root.render(
        <PracticeActionHero
          stats={{ attempted: 0, promoted: 0, demoted: 0 }}
          nextCard={null}
          activeCount={10}
          totalCards={428}
          onResumePractice={handleResume}
        />
      );
    });

    const btn = container.querySelector<HTMLButtonElement>('[data-testid="resume-practice-hero-btn"]');
    expect(btn).not.toBeNull();
    expect(btn?.textContent).toContain('Resume Practice Arena');

    act(() => {
      btn?.click();
    });

    expect(handleResume).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('Spaced repetition schedule ready');
  });
});
