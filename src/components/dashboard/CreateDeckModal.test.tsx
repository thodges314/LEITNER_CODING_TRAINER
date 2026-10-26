// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { CreateDeckModal } from './CreateDeckModal';
import type { TopicItem } from '../../lib/leitner';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockCards: TopicItem[] = [
  {
    id: 'stepper',
    title: 'Accessible Stepper',
    track: 'react-components',
    box: 1,
    status: 'active',
    streak: 0,
    promptSeed: '',
    tags: [],
    nextEligibleTrial: 0,
  },
  {
    id: 'tabs-accordion-compound',
    title: 'Compound Tabs and Accordion',
    track: 'react-components',
    box: 1,
    status: 'active',
    streak: 0,
    promptSeed: '',
    tags: [],
    nextEligibleTrial: 0,
  },
];

describe('CreateDeckModal', () => {
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

  it('renders nothing when isOpen is false', async () => {
    await act(async () => {
      root?.render(
        <CreateDeckModal
          isOpen={false}
          allCards={mockCards}
          onConfirmCreateDeck={vi.fn()}
          onClose={vi.fn()}
        />
      );
    });
    expect(container?.innerHTML).toBe('');
  });

  it('renders modal with initial card notice when cards are pre-selected', async () => {
    const onConfirmCreateDeck = vi.fn();
    const onClose = vi.fn();

    await act(async () => {
      root?.render(
        <CreateDeckModal
          isOpen={true}
          initialCardIds={['stepper', 'tabs-accordion-compound']}
          allCards={mockCards}
          onConfirmCreateDeck={onConfirmCreateDeck}
          onClose={onClose}
        />
      );
    });

    expect(container?.textContent).toContain('Create Custom Deck');
    expect(container?.textContent).toContain('Deck will be initialized with 2 selected cards');

    const nameInput = container?.querySelector('input[data-testid="create-deck-name-input"]') as HTMLInputElement;
    expect(nameInput).toBeTruthy();

    await act(async () => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeInputValueSetter?.call(nameInput, 'Stripe Frontend Sprint');
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const descInput = container?.querySelector('textarea[data-testid="create-deck-description-input"]') as HTMLTextAreaElement;
    await act(async () => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
      nativeSetter?.call(descInput, 'React components focus');
      descInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const form = container?.querySelector('form') as HTMLFormElement;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(onConfirmCreateDeck).toHaveBeenCalledWith(
      'Stripe Frontend Sprint',
      'React components focus',
      ['stepper', 'tabs-accordion-compound']
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking cancel or close button', async () => {
    const onClose = vi.fn();

    await act(async () => {
      root?.render(
        <CreateDeckModal
          isOpen={true}
          allCards={mockCards}
          onConfirmCreateDeck={vi.fn()}
          onClose={onClose}
        />
      );
    });

    const cancelBtn = container?.querySelector('button[data-testid="create-deck-cancel-btn"]') as HTMLButtonElement;
    expect(cancelBtn).toBeTruthy();
    await act(async () => {
      cancelBtn.click();
    });
    expect(onClose).toHaveBeenCalledTimes(1);

    const closeBtn = container?.querySelector('button[data-testid="create-deck-close-btn"]') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    await act(async () => {
      closeBtn.click();
    });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
