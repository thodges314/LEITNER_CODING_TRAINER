import React, { useState, useRef, useEffect } from 'react';
import { Layers, ChevronDown, Check, Sparkles } from 'lucide-react';
import {
  BUILT_IN_DECKS,
  getBuiltInDeck,
  getDeckCardCount,
} from '../../lib/decks';
import type { CustomDeck } from '../../lib/decks';
import type { TopicItem } from '../../lib/leitner';

export interface DeckSelectorProps {
  activeDeckId: string;
  allCards: TopicItem[];
  onSelectDeck: (deckId: string) => void;
  customDecks?: CustomDeck[];
}

export const DeckSelector: React.FC<DeckSelectorProps> = ({
  activeDeckId,
  allCards,
  onSelectDeck,
  customDecks = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeBuiltIn = getBuiltInDeck(activeDeckId);
  const activeCustom = customDecks.find((d) => d.id === activeDeckId);
  const activeDeckName = activeBuiltIn?.name ?? activeCustom?.name ?? 'Full Library (All Cards)';

  const activeCardCount = activeBuiltIn
    ? getDeckCardCount(activeBuiltIn, allCards)
    : activeCustom
    ? getDeckCardCount(activeCustom, allCards)
    : allCards.length;

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (deckId: string) => {
    onSelectDeck(deckId);
    setIsOpen(false);
  };

  return (
    <div className="glass-panel catalog-filter-panel deck-selector-panel" ref={dropdownRef}>
      <div className="deck-selector-header">
        <div className="deck-selector-title-group">
          <div className="deck-selector-icon-wrap" aria-hidden="true">
            <Layers size={17} />
          </div>
          <div>
            <div className="deck-selector-label">
              <span>Study Deck</span>
              <span className="deck-selector-scope-badge">
                {activeCardCount} {activeCardCount === 1 ? 'card' : 'cards'} in scope
              </span>
            </div>
            <p className="deck-selector-subtitle">
              Controls which cards are in your active curriculum and served in practice sessions
            </p>
          </div>
        </div>

        {/* Dropdown Trigger */}
        <div className="deck-dropdown-container">
          <button
            type="button"
            className="deck-dropdown-trigger"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-label={`Current Study Deck: ${activeDeckName}. Click to switch decks.`}
            data-testid="deck-dropdown-trigger"
          >
            <div className="deck-dropdown-trigger-content">
              <span className="deck-dropdown-active-name">{activeDeckName}</span>
              <span className="deck-count-pill">{activeCardCount} Cards</span>
            </div>
            <ChevronDown
              size={16}
              className={`deck-dropdown-chevron ${isOpen ? 'open' : ''}`}
              aria-hidden="true"
            />
          </button>

          {/* Floating Dropdown Menu */}
          {isOpen && (
            <div
              className="deck-dropdown-menu"
              role="listbox"
              aria-label="Available Study Decks"
              data-testid="deck-dropdown-menu"
            >
              <div className="deck-dropdown-section-title">
                <Sparkles size={13} className="deck-section-icon" />
                <span>Built-in Starter Decks</span>
              </div>

              {BUILT_IN_DECKS.map((preset) => {
                const count = getDeckCardCount(preset, allCards);
                const isSelected = activeDeckId === preset.id || (!activeDeckId && preset.id === 'full-library');

                return (
                  <button
                    key={preset.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`deck-dropdown-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(preset.id)}
                    data-testid={`deck-option-${preset.id}`}
                  >
                    <div className="deck-item-indicator">
                      {isSelected ? <Check size={14} /> : <span className="deck-bullet" />}
                    </div>
                    <div className="deck-item-text">
                      <div className="deck-item-header">
                        <span className="deck-item-name">{preset.name}</span>
                        <span className="deck-item-badge">{count} cards</span>
                      </div>
                      <p className="deck-item-description">{preset.description}</p>
                    </div>
                  </button>
                );
              })}

              {/* Personal Custom Decks Section */}
              {customDecks.length > 0 && (
                <>
                  <div className="deck-dropdown-divider" />
                  <div className="deck-dropdown-section-title">
                    <Layers size={13} className="deck-section-icon" />
                    <span>Personal Decks</span>
                  </div>
                  {customDecks.map((custom) => {
                    const count = getDeckCardCount(custom, allCards);
                    const isSelected = activeDeckId === custom.id;

                    return (
                      <button
                        key={custom.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`deck-dropdown-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelect(custom.id)}
                        data-testid={`deck-option-${custom.id}`}
                      >
                        <div className="deck-item-indicator">
                          {isSelected ? <Check size={14} /> : <span className="deck-bullet" />}
                        </div>
                        <div className="deck-item-text">
                          <div className="deck-item-header">
                            <span className="deck-item-name">{custom.name}</span>
                            <span className="deck-item-badge">{count} cards</span>
                          </div>
                          {custom.description && (
                            <p className="deck-item-description">{custom.description}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
