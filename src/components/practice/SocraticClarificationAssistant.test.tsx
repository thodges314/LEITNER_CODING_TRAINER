// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import ReactDOM from 'react-dom/client';
import { SocraticClarificationAssistant } from './SocraticClarificationAssistant';
import * as aiModule from '../../lib/ai';
import type { TopicItem } from '../../lib/leitner';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('../../lib/ai', async () => {
  const actual = await vi.importActual('../../lib/ai');
  return {
    ...actual,
    askSocraticClarification: vi.fn(),
    getStoredApiKey: vi.fn(),
  };
});

const sampleTopic: TopicItem = {
  id: 'binary-search-exact',
  title: 'Binary Search Exact Match',
  track: 'algorithms',
  concept: 'binary-search',
  difficulty: 2,
  tags: ['search', 'divide-and-conquer'],
  promptSeed: 'Implement binarySearch(nums, target) returning the index or -1.',
  box: 1,
  streak: 0,
  lastReviewed: 0,
  nextReviewTrial: 1,
};

describe('SocraticClarificationAssistant', () => {
  let container: HTMLDivElement | null = null;
  let root: ReactDOM.Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = ReactDOM.createRoot(container);
    vi.clearAllMocks();
    vi.mocked(aiModule.getStoredApiKey).mockReturnValue('dummy-key');
    vi.mocked(aiModule.askSocraticClarification).mockResolvedValue(
      'Binary search divides the sorted space in half using two pointers.'
    );
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

  it('renders the translucent question mark button in closed state', async () => {
    await act(async () => {
      root?.render(
        <SocraticClarificationAssistant
          topic={sampleTopic}
          currentCode="function binarySearch() {}"
        />
      );
    });

    const btn = container?.querySelector('button[aria-label="Ask AI Tutor for Clarification or Hints"]');
    expect(btn).not.toBeNull();
    expect(container?.textContent).not.toContain('Socratic AI Tutor');
  });

  it('opens panel and displays chips when clicking the question mark button', async () => {
    await act(async () => {
      root?.render(
        <SocraticClarificationAssistant
          topic={sampleTopic}
          currentCode="function binarySearch() {}"
        />
      );
    });

    const btn = container?.querySelector('button[aria-label="Ask AI Tutor for Clarification or Hints"]') as HTMLButtonElement;
    await act(async () => {
      btn.click();
    });

    expect(container?.textContent).toContain('Socratic AI Tutor');
    expect(container?.textContent).toContain('No code spoilers');
    expect(container?.textContent).toContain('Clarify Prompt');
    expect(container?.textContent).toContain('Concept Refresher');
    expect(container?.textContent).toContain('Edge Cases');
    expect(container?.textContent).toContain('Why is current approach broken?');
  });

  it('closes panel when clicking the close button', async () => {
    await act(async () => {
      root?.render(
        <SocraticClarificationAssistant
          topic={sampleTopic}
          currentCode="function binarySearch() {}"
        />
      );
    });

    const btn = container?.querySelector('button[aria-label="Ask AI Tutor for Clarification or Hints"]') as HTMLButtonElement;
    await act(async () => {
      btn.click();
    });
    expect(container?.textContent).toContain('Socratic AI Tutor');

    const closeBtn = container?.querySelector('button[aria-label="Close tutor panel"]') as HTMLButtonElement;
    await act(async () => {
      closeBtn.click();
    });

    expect(container?.textContent).not.toContain('Socratic AI Tutor');
  });

  it('submits question and shows Socratic response when clicking a prompt chip', async () => {
    await act(async () => {
      root?.render(
        <SocraticClarificationAssistant
          topic={sampleTopic}
          currentCode="function binarySearch() {}"
        />
      );
    });

    const btn = container?.querySelector('button[aria-label="Ask AI Tutor for Clarification or Hints"]') as HTMLButtonElement;
    await act(async () => {
      btn.click();
    });

    const chipBtns = Array.from(container?.querySelectorAll('.socratic-chip-btn') || []) as HTMLButtonElement[];
    const conceptChip = chipBtns.find((b) => b.textContent?.includes('Concept Refresher'));
    expect(conceptChip).toBeDefined();

    await act(async () => {
      conceptChip?.click();
    });

    expect(aiModule.askSocraticClarification).toHaveBeenCalledTimes(1);

    // Wait for streamed response
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(container?.textContent).toContain('Binary search');
  });

  it('displays offline notice and Add Key button when no API key is saved', async () => {
    vi.mocked(aiModule.getStoredApiKey).mockReturnValue('');
    const onOpenSettings = vi.fn();

    await act(async () => {
      root?.render(
        <SocraticClarificationAssistant
          topic={sampleTopic}
          currentCode=""
          onOpenSettings={onOpenSettings}
        />
      );
    });

    const btn = container?.querySelector('button[aria-label="Ask AI Tutor for Clarification or Hints"]') as HTMLButtonElement;
    await act(async () => {
      btn.click();
    });

    expect(container?.textContent).toContain('Offline Mode');
    const addKeyBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Add Key')
    );
    expect(addKeyBtn).toBeDefined();

    await act(async () => {
      addKeyBtn?.click();
    });
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});
