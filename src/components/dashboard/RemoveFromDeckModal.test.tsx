// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { RemoveFromDeckModal } from './RemoveFromDeckModal';
import type { TopicItem } from '../../lib/leitner';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockTopic: TopicItem = {
  id: 'card-to-remove',
  title: 'Binary Tree Level Order',
  track: 'algorithms',
  box: 1,
  status: 'active',
  streak: 0,
  promptSeed: '',
  tags: [],
  nextEligibleTrial: 0,
};

describe('RemoveFromDeckModal', () => {
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

  it('renders nothing when isOpen is false or card is null', async () => {
    await act(async () => {
      root?.render(
        <RemoveFromDeckModal
          isOpen={false}
          card={mockTopic}
          activeDeckName="Frontend Specialist"
          onConfirmForkAndRemove={vi.fn()}
          onClose={vi.fn()}
        />
      );
    });
    expect(container?.innerHTML).toBe('');

    await act(async () => {
      root?.render(
        <RemoveFromDeckModal
          isOpen={true}
          card={null}
          activeDeckName="Frontend Specialist"
          onConfirmForkAndRemove={vi.fn()}
          onClose={vi.fn()}
        />
      );
    });
    expect(container?.innerHTML).toBe('');
  });

  it('renders modal with default personal deck name and calls onConfirmForkAndRemove', async () => {
    const onConfirmForkAndRemove = vi.fn();
    const onClose = vi.fn();

    await act(async () => {
      root?.render(
        <RemoveFromDeckModal
          isOpen={true}
          card={mockTopic}
          activeDeckName="Frontend Specialist"
          onConfirmForkAndRemove={onConfirmForkAndRemove}
          onClose={onClose}
        />
      );
    });

    expect(container?.textContent).toContain('Remove Card From Deck');
    expect(container?.textContent).toContain('Binary Tree Level Order');
    expect(container?.textContent).toContain('Frontend Specialist');

    const input = container?.querySelector('input[data-testid="fork-deck-name-input"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe('Frontend Specialist (Personal)');

    // Change input value
    await act(async () => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeInputValueSetter?.call(input, 'My Custom Algorithm Prep');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const form = container?.querySelector('form') as HTMLFormElement;
    expect(form).toBeTruthy();
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(onConfirmForkAndRemove).toHaveBeenCalledWith('card-to-remove', 'My Custom Algorithm Prep');
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking Cancel button or Close X button', async () => {
    const onClose = vi.fn();

    await act(async () => {
      root?.render(
        <RemoveFromDeckModal
          isOpen={true}
          card={mockTopic}
          activeDeckName="Full-Stack Core"
          onConfirmForkAndRemove={vi.fn()}
          onClose={onClose}
        />
      );
    });

    const cancelBtn = container?.querySelector('button[data-testid="fork-deck-cancel-btn"]') as HTMLButtonElement;
    expect(cancelBtn).toBeTruthy();
    await act(async () => {
      cancelBtn.click();
    });
    expect(onClose).toHaveBeenCalledTimes(1);

    const closeXBtn = container?.querySelector('button.modal-close-btn') as HTMLButtonElement;
    expect(closeXBtn).toBeTruthy();
    await act(async () => {
      closeXBtn.click();
    });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
