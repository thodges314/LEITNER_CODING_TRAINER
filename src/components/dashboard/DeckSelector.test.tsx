// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { DeckSelector } from './DeckSelector';
import seed from '../../data/topics.json';
import type { TopicItem } from '../../lib/leitner';
import type { CustomDeck } from '../../lib/decks';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const cards = seed as unknown as TopicItem[];

describe('DeckSelector component', () => {
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

  it('renders with default Full Library active', () => {
    act(() => {
      root!.render(
        <DeckSelector
          activeDeckId="full-library"
          allCards={cards}
          onSelectDeck={vi.fn()}
        />
      );
    });

    expect(container!.textContent).toContain('Study Deck');
    expect(container!.textContent).toContain('Full Library (All Cards)');
    expect(container!.textContent).toContain('291 Cards');
  });

  it('renders Frontend Specialist active deck info', () => {
    act(() => {
      root!.render(
        <DeckSelector
          activeDeckId="frontend-specialist"
          allCards={cards}
          onSelectDeck={vi.fn()}
        />
      );
    });

    expect(container!.textContent).toContain('Frontend Specialist');
    expect(container!.textContent).toContain('211 Cards');
  });

  it('opens dropdown on click and displays all presets with their descriptions', () => {
    act(() => {
      root!.render(
        <DeckSelector
          activeDeckId="full-library"
          allCards={cards}
          onSelectDeck={vi.fn()}
        />
      );
    });

    const trigger = container!.querySelector('[data-testid="deck-dropdown-trigger"]') as HTMLButtonElement;
    expect(container!.querySelector('[data-testid="deck-dropdown-menu"]')).toBeNull();

    act(() => {
      trigger.click();
    });

    expect(container!.querySelector('[data-testid="deck-dropdown-menu"]')).not.toBeNull();
    expect(container!.textContent).toContain('Built-in Starter Decks');
    expect(container!.querySelector('[data-testid="deck-option-full-library"]')).not.toBeNull();
    expect(container!.querySelector('[data-testid="deck-option-full-stack"]')).not.toBeNull();
    expect(container!.querySelector('[data-testid="deck-option-frontend-specialist"]')).not.toBeNull();
    expect(container!.querySelector('[data-testid="deck-option-algorithms"]')).not.toBeNull();
  });

  it('calls onSelectDeck and closes dropdown when an option is clicked', () => {
    const handleSelect = vi.fn();
    act(() => {
      root!.render(
        <DeckSelector
          activeDeckId="full-library"
          allCards={cards}
          onSelectDeck={handleSelect}
        />
      );
    });

    const trigger = container!.querySelector('[data-testid="deck-dropdown-trigger"]') as HTMLButtonElement;
    act(() => {
      trigger.click();
    });

    const algoOption = container!.querySelector('[data-testid="deck-option-algorithms"]') as HTMLButtonElement;
    act(() => {
      algoOption.click();
    });

    expect(handleSelect).toHaveBeenCalledWith('algorithms');
    expect(container!.querySelector('[data-testid="deck-dropdown-menu"]')).toBeNull();
  });

  it('renders personal custom decks if provided', () => {
    const customDecks = [
      {
        id: 'stripe-screen',
        name: 'Stripe Screen',
        description: 'Targeted cards for Stripe frontend loop',
        cardIds: ['tabs-accordion-compound', 'two-sum-hashmap'],
        createdAt: 100,
        updatedAt: 100,
      },
    ];

    act(() => {
      root!.render(
        <DeckSelector
          activeDeckId="stripe-screen"
          allCards={cards}
          onSelectDeck={vi.fn()}
          customDecks={customDecks}
        />
      );
    });

    expect(container!.textContent).toContain('Stripe Screen');
    expect(container!.textContent).toContain('2 Cards');

    const trigger = container!.querySelector('[data-testid="deck-dropdown-trigger"]') as HTMLButtonElement;
    act(() => {
      trigger.click();
    });

    expect(container!.textContent).toContain('Personal Decks');
    expect(container!.querySelector('[data-testid="deck-option-stripe-screen"]')).not.toBeNull();
  });

  it('closes dropdown when Escape key is pressed', () => {
    act(() => {
      root!.render(
        <DeckSelector
          activeDeckId="full-library"
          allCards={cards}
          onSelectDeck={vi.fn()}
        />
      );
    });

    const trigger = container!.querySelector('[data-testid="deck-dropdown-trigger"]') as HTMLButtonElement;
    act(() => {
      trigger.click();
    });
    expect(container!.querySelector('[data-testid="deck-dropdown-menu"]')).not.toBeNull();

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(container!.querySelector('[data-testid="deck-dropdown-menu"]')).toBeNull();
  });

  it('calls onCreateCustomDeckClick when Create Custom Deck button is clicked', () => {
    const onCreateClick = vi.fn();
    act(() => {
      root!.render(
        <DeckSelector
          activeDeckId="full-library"
          allCards={cards}
          onSelectDeck={vi.fn()}
          onCreateCustomDeckClick={onCreateClick}
        />
      );
    });

    const trigger = container!.querySelector('[data-testid="deck-dropdown-trigger"]') as HTMLButtonElement;
    act(() => {
      trigger.click();
    });

    const createBtn = container!.querySelector('[data-testid="deck-dropdown-create-btn"]') as HTMLButtonElement;
    expect(createBtn).not.toBeNull();
    act(() => {
      createBtn.click();
    });

    expect(onCreateClick).toHaveBeenCalledTimes(1);
    expect(container!.querySelector('[data-testid="deck-dropdown-menu"]')).toBeNull();
  });

  it('calls onDeleteCustomDeck when trash icon is clicked on a custom deck', () => {
    const onDelete = vi.fn();
    const customDecks: CustomDeck[] = [
      {
        id: 'deck-to-delete',
        name: 'Temporary Practice',
        cardIds: ['c1'],
        createdAt: 1000,
        updatedAt: 1000,
      },
    ];

    act(() => {
      root!.render(
        <DeckSelector
          activeDeckId="full-library"
          allCards={cards}
          onSelectDeck={vi.fn()}
          customDecks={customDecks}
          onDeleteCustomDeck={onDelete}
        />
      );
    });

    const trigger = container!.querySelector('[data-testid="deck-dropdown-trigger"]') as HTMLButtonElement;
    act(() => {
      trigger.click();
    });

    const deleteBtn = container!.querySelector('[data-testid="deck-delete-deck-to-delete"]') as HTMLButtonElement;
    expect(deleteBtn).not.toBeNull();
    act(() => {
      deleteBtn.click();
    });

    expect(onDelete).toHaveBeenCalledWith('deck-to-delete');
  });

  it('calls onTailorWithAIClick and closes dropdown when AI tailor button is clicked', () => {
    const onTailorClick = vi.fn();

    act(() => {
      root!.render(
        <DeckSelector
          activeDeckId="full-library"
          allCards={cards}
          onSelectDeck={vi.fn()}
          onTailorWithAIClick={onTailorClick}
        />
      );
    });

    const trigger = container!.querySelector('[data-testid="deck-dropdown-trigger"]') as HTMLButtonElement;
    act(() => {
      trigger.click();
    });

    const aiBtn = container!.querySelector('[data-testid="deck-dropdown-ai-btn"]') as HTMLButtonElement;
    expect(aiBtn).not.toBeNull();
    act(() => {
      aiBtn.click();
    });

    expect(onTailorClick).toHaveBeenCalledTimes(1);
    expect(container!.querySelector('[data-testid="deck-dropdown-menu"]')).toBeNull();
  });
});
