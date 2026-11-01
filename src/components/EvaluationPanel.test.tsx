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

  it('renders HTML solution and badge when inputLanguage is html', async () => {
    const htmlTopic: TopicItem = {
      ...sampleTopic,
      id: 'html-pricing-card',
      track: 'tailwind',
      inputLanguage: 'html',
      referenceSolution: '<div class="card">\n  <h2>Pricing</h2>\n</div>',
      referenceSolutionTs: undefined,
    };

    await act(async () => {
      root?.render(
        <EvaluationPanel
          topic={htmlTopic}
          submittedCode="<div>broken</div>"
          result={failedResult}
          totalCompletedReviews={0}
          onCommit={vi.fn()}
          onRetry={vi.fn()}
          showSolution={true}
          executionMode="js"
        />
      );
    });

    const badge = container?.querySelector('[data-testid="solution-language-badge"]');
    expect(badge?.textContent).toBe('HTML');
    expect(container?.textContent).toContain('Pricing');
  });

  it('renders SQL solution and badge when inputLanguage is sql', async () => {
    const sqlTopic: TopicItem = {
      ...sampleTopic,
      id: 'sql-seat-swap',
      track: 'sql-postgres',
      inputLanguage: 'sql',
      referenceSolution: 'SELECT id, CASE WHEN id % 2 = 1 THEN id + 1 ELSE id - 1 END AS id FROM seat;',
      referenceSolutionTs: undefined,
    };

    await act(async () => {
      root?.render(
        <EvaluationPanel
          topic={sqlTopic}
          submittedCode="SELECT * FROM seat;"
          result={failedResult}
          totalCompletedReviews={0}
          onCommit={vi.fn()}
          onRetry={vi.fn()}
          showSolution={true}
          executionMode="js"
        />
      );
    });

    const badge = container?.querySelector('[data-testid="solution-language-badge"]');
    expect(badge?.textContent).toBe('SQL');
    expect(container?.textContent).toContain('SELECT id, CASE WHEN id % 2 = 1');
  });

  it('renders GraphQL solution and badge when inputLanguage is graphql', async () => {
    const gqlTopic: TopicItem = {
      ...sampleTopic,
      id: 'graphql-user-query',
      track: 'graphql',
      inputLanguage: 'graphql',
      referenceSolution: 'query CompareUsers($primaryId: ID!) {\n  primary: user(id: $primaryId) { id name }\n}',
      referenceSolutionTs: undefined,
    };

    await act(async () => {
      root?.render(
        <EvaluationPanel
          topic={gqlTopic}
          submittedCode="query { user }"
          result={failedResult}
          totalCompletedReviews={0}
          onCommit={vi.fn()}
          onRetry={vi.fn()}
          showSolution={true}
          executionMode="js"
        />
      );
    });

    const badge = container?.querySelector('[data-testid="solution-language-badge"]');
    expect(badge?.textContent).toBe('GraphQL');
    expect(container?.textContent).toContain('CompareUsers');
  });

  it('copies canonical solution as plain text to clipboard when copy button is clicked', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const gqlTopic: TopicItem = {
      ...sampleTopic,
      id: 'graphql-user-query',
      inputLanguage: 'graphql',
      referenceSolution: 'query CompareUsers {\n  user { id }\n}',
      referenceSolutionTs: undefined,
    };

    await act(async () => {
      root?.render(
        <EvaluationPanel
          topic={gqlTopic}
          submittedCode="broken"
          result={failedResult}
          totalCompletedReviews={0}
          onCommit={vi.fn()}
          onRetry={vi.fn()}
          showSolution={true}
          executionMode="js"
        />
      );
    });

    const copyBtn = Array.from(container?.querySelectorAll('button') ?? []).find((b) =>
      b.textContent?.includes('Copy Solution')
    );
    expect(copyBtn).toBeDefined();

    await act(async () => {
      copyBtn?.click();
    });

    // Expect writeText to be called with the automatically formatted code
    expect(writeTextMock).toHaveBeenCalledWith('query CompareUsers {\n  user {\n    id\n  }\n}');
  });

  it('formats recommended solution with automatic formatter across SQL and JS', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const unformattedSqlTopic: TopicItem = {
      ...sampleTopic,
      id: 'sql-test-unformatted',
      track: 'sql-postgres',
      inputLanguage: 'sql',
      referenceSolution: 'select c.email, count(o.id) as order_count from customers c join orders o on c.id=o.customer_id group by c.id,c.email;',
      referenceSolutionTs: undefined,
    };

    await act(async () => {
      root?.render(
        <EvaluationPanel
          topic={unformattedSqlTopic}
          submittedCode="broken"
          result={failedResult}
          totalCompletedReviews={0}
          onCommit={vi.fn()}
          onRetry={vi.fn()}
          showSolution={true}
          executionMode="js"
        />
      );
    });

    // Give effect tick to resolve async formatter
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const copyBtn = Array.from(container?.querySelectorAll('button') ?? []).find((b) =>
      b.textContent?.includes('Copy Solution')
    );
    await act(async () => {
      copyBtn?.click();
    });

    expect(writeTextMock).toHaveBeenCalledWith(
      expect.stringContaining('SELECT\n  c.email,\n  count(o.id) AS order_count\nFROM')
    );
  });
});
