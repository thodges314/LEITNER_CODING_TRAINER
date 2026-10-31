// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { CreateDeckModal } from './CreateDeckModal';
import { DeckEditorModal } from './DeckEditorModal';
import type { TopicItem } from '../../lib/leitner';
import type { CustomDeck } from '../../lib/decks';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockCards: TopicItem[] = [
  {
    id: 'stepper',
    title: 'Accessible Stepper',
    track: 'react-components',
    box: 2,
    status: 'active',
    streak: 3,
    attempted: true,
    promptSeed: '',
    tags: ['react', 'accessibility'],
    nextEligibleTrial: 0,
  },
  {
    id: 'tabs-accordion-compound',
    title: 'Compound Tabs and Accordion',
    track: 'react-components',
    box: 1,
    status: 'active',
    streak: 0,
    attempted: false,
    promptSeed: '',
    tags: ['compound-components'],
    nextEligibleTrial: 0,
  },
  {
    id: 'node-event-emitter',
    title: 'Node Event Emitter',
    track: 'node',
    box: 1,
    status: 'active',
    streak: 0,
    attempted: false,
    promptSeed: '',
    tags: ['node', 'events'],
    nextEligibleTrial: 0,
  },
];

describe('DeckEditorModal & CreateDeckModal', () => {
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

  it('renders modal with topic accordion, seen/unseen badges and submits new deck', async () => {
    const onConfirmCreateDeck = vi.fn();
    const onClose = vi.fn();

    await act(async () => {
      root?.render(
        <CreateDeckModal
          isOpen={true}
          initialCardIds={['stepper']}
          allCards={mockCards}
          onConfirmCreateDeck={onConfirmCreateDeck}
          onClose={onClose}
        />
      );
    });

    expect(container?.textContent).toContain('Create Custom Deck');
    expect(container?.textContent).toContain('Selected: 1 of 3 cards');

    // Accordions are closed by default; expand react-components to inspect cards
    const reactHeader = container?.querySelector('[data-testid="deck-editor-topic-header-react-components"]') as HTMLElement;
    expect(reactHeader).toBeTruthy();
    await act(async () => {
      reactHeader.click();
    });

    // Check seen badge for stepper (practiced) and tabs (unseen)
    const seenBadge = container?.querySelector('[data-testid="deck-editor-card-seen-stepper"]');
    expect(seenBadge).toBeTruthy();
    expect(seenBadge?.textContent).toContain('Practiced');

    const unseenBadge = container?.querySelector('[data-testid="deck-editor-card-unseen-tabs-accordion-compound"]');
    expect(unseenBadge).toBeTruthy();
    expect(unseenBadge?.textContent).toContain('Unseen');

    // Fill in deck name and description
    const nameInput = container?.querySelector('input[data-testid="create-deck-name-input"]') as HTMLInputElement;
    expect(nameInput).toBeTruthy();

    await act(async () => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeSetter?.call(nameInput, 'Stripe Frontend Sprint');
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const descInput = container?.querySelector('input[data-testid="create-deck-description-input"]') as HTMLInputElement;
    await act(async () => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeSetter?.call(descInput, 'React components focus');
      descInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Toggle another card via checkbox
    const tabsCheckbox = container?.querySelector('[data-testid="deck-editor-card-checkbox-tabs-accordion-compound"]') as HTMLInputElement;
    expect(tabsCheckbox).toBeTruthy();
    expect(tabsCheckbox.checked).toBe(false);

    await act(async () => {
      tabsCheckbox.click();
    });

    expect(container?.textContent).toContain('Selected: 2 of 3 cards');

    // Submit form
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

  it('supports edit mode when deckToEdit is provided to DeckEditorModal', async () => {
    const onSaveDeck = vi.fn();
    const onClose = vi.fn();

    const existingDeck: CustomDeck = {
      id: 'custom-stripe-sprint',
      name: 'Stripe Senior Loop',
      description: 'System design and React',
      cardIds: ['stepper'],
      createdAt: 1000,
      updatedAt: 1000,
    };

    await act(async () => {
      root?.render(
        <DeckEditorModal
          isOpen={true}
          deckToEdit={existingDeck}
          allCards={mockCards}
          onSaveDeck={onSaveDeck}
          onClose={onClose}
        />
      );
    });

    expect(container?.textContent).toContain('Edit Custom Deck');
    expect(container?.textContent).toContain('Editing "Stripe Senior Loop"');

    const nameInput = container?.querySelector('input[data-testid="create-deck-name-input"]') as HTMLInputElement;
    expect(nameInput.value).toBe('Stripe Senior Loop');

    // Expand react-components topic accordion
    const reactHeader = container?.querySelector('[data-testid="deck-editor-topic-header-react-components"]') as HTMLElement;
    expect(reactHeader).toBeTruthy();
    await act(async () => {
      reactHeader.click();
    });

    // Deselect stepper and select node card
    const stepperCheckbox = container?.querySelector('[data-testid="deck-editor-card-checkbox-stepper"]') as HTMLInputElement;
    expect(stepperCheckbox.checked).toBe(true);

    await act(async () => {
      stepperCheckbox.click();
    });

    // Expand node topic accordion
    const nodeHeader = container?.querySelector('[data-testid="deck-editor-topic-header-node"]') as HTMLElement;
    expect(nodeHeader).toBeTruthy();
    await act(async () => {
      nodeHeader.click();
    });

    const nodeCheckbox = container?.querySelector('[data-testid="deck-editor-card-checkbox-node-event-emitter"]') as HTMLInputElement;
    expect(nodeCheckbox).toBeTruthy();
    await act(async () => {
      nodeCheckbox.click();
    });

    // Submit
    const form = container?.querySelector('form') as HTMLFormElement;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(onSaveDeck).toHaveBeenCalledWith({
      id: 'custom-stripe-sprint',
      name: 'Stripe Senior Loop',
      description: 'System design and React',
      cardIds: ['node-event-emitter'],
      dossierId: undefined,
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('selects and deselects entire topic category via topic header checkbox', async () => {
    await act(async () => {
      root?.render(
        <DeckEditorModal
          isOpen={true}
          allCards={mockCards}
          onSaveDeck={vi.fn()}
          onClose={vi.fn()}
        />
      );
    });

    const topicCheckbox = container?.querySelector('[data-testid="deck-editor-topic-checkbox-react-components"]') as HTMLInputElement;
    expect(topicCheckbox).toBeTruthy();
    expect(topicCheckbox.checked).toBe(false);

    // Click to select all react-components cards (stepper + tabs-accordion-compound)
    await act(async () => {
      topicCheckbox.click();
    });

    expect(topicCheckbox.checked).toBe(true);
    expect(container?.textContent).toContain('Selected: 2 of 3 cards');

    // Click again to deselect all in that topic
    await act(async () => {
      topicCheckbox.click();
    });

    expect(topicCheckbox.checked).toBe(false);
    expect(container?.textContent).toContain('Selected: 0 of 3 cards');
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
