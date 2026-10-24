// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { EvaluationPanel } from './EvaluationPanel';
import type { TopicItem } from '../lib/leitner';
import type { EvaluationResult } from '../lib/ai';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const sampleTopic: TopicItem = {
  id: 'two-sum-hashmap',
  track: 'algorithms',
  title: 'Two Sum',
  box: 1,
  streak: 0,
  nextEligibleTrial: 0,
  status: 'active',
  tags: ['algorithms'],
  promptSeed: 'Find two sum',
  referenceSolution: 'function twoSum(nums, target) { return [0, 1]; }',
  referenceSolutionTs: 'function twoSum(nums: number[], target: number): [number, number] { return [0, 1]; }',
};

const failedResult: EvaluationResult = {
  passed: false,
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  invariantsMet: [],
  invariantsMissed: ['Must return valid pair'],
  critique: 'Solution was incorrect',
};

describe('EvaluationPanel context-aware solution reveal', () => {
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

  it('renders JavaScript solution and badge when executionMode is js', async () => {
    await act(async () => {
      root?.render(
        <EvaluationPanel
          topic={sampleTopic}
          submittedCode="broken code"
          result={failedResult}
          totalCompletedReviews={0}
          onCommit={vi.fn()}
          onRetry={vi.fn()}
          showSolution={true}
          executionMode="js"
        />
      );
    });

    expect(container?.textContent).toContain('JavaScript');
    expect(container?.textContent).toContain('function twoSum(nums, target) { return [0, 1]; }');
    expect(container?.textContent).not.toContain('nums: number[]');
  });

  it('renders TypeScript solution and badge when executionMode is ts', async () => {
    await act(async () => {
      root?.render(
        <EvaluationPanel
          topic={sampleTopic}
          submittedCode="broken code"
          result={failedResult}
          totalCompletedReviews={0}
          onCommit={vi.fn()}
          onRetry={vi.fn()}
          showSolution={true}
          executionMode="ts"
        />
      );
    });

    expect(container?.textContent).toContain('TypeScript');
    expect(container?.textContent).toContain(
      'function twoSum(nums: number[], target: number): [number, number] { return [0, 1]; }'
    );
  });

  it('falls back to JavaScript when referenceSolutionTs is undefined even in ts mode', async () => {
    const topicWithoutTs: TopicItem = {
      ...sampleTopic,
      referenceSolutionTs: undefined,
    };

    await act(async () => {
      root?.render(
        <EvaluationPanel
          topic={topicWithoutTs}
          submittedCode="broken code"
          result={failedResult}
          totalCompletedReviews={0}
          onCommit={vi.fn()}
          onRetry={vi.fn()}
          showSolution={true}
          executionMode="ts"
        />
      );
    });

    expect(container?.textContent).toContain('JavaScript');
    expect(container?.textContent).toContain('function twoSum(nums, target) { return [0, 1]; }');
  });
});
