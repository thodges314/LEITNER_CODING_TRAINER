import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FolderPlus,
  Pencil,
  X,
  ChevronRight,
  Search,
  Layers,
  CheckSquare,
} from 'lucide-react';
import { DifficultyBadge } from '../DifficultyBadge';
import { getTrackMeta, isCardAttempted } from '../../lib/leitner';
import type { TopicItem, TrackType } from '../../lib/leitner';
import type { CustomDeck } from '../../lib/decks';

export interface DeckEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  allCards: TopicItem[];
  deckToEdit?: CustomDeck | null;
  initialCardIds?: string[];
  onSaveDeck?: (deckData: {
    id?: string;
    name: string;
    description?: string;
    cardIds: string[];
    dossierId?: string;
  }) => void;
  /** Backward-compatible signature with earlier CreateDeckModal */
  onConfirmCreateDeck?: (deckName: string, description?: string, cardIds?: string[]) => void;
}

const ORDERED_TRACKS: TrackType[] = [
  'react',
  'react-components',
  'dom-browser',
  'async-js',
  'js-utilities',
  'js-language',
  'node',
  'graphql',
  'sql-postgres',
  'testing-tooling',
  'typescript-patterns',
  'algorithms',
  'advanced-algorithms',
];

export const DeckEditorModal: React.FC<DeckEditorModalProps> = (props) => {
  if (!props.isOpen) return null;
  const key = props.deckToEdit
    ? `edit-deck-${props.deckToEdit.id}-${props.deckToEdit.updatedAt || 0}`
    : `create-deck-${props.initialCardIds?.length ?? 0}`;
  return <DeckEditorModalDialog key={key} {...props} />;
};

/** Tri-state Checkbox component supporting indeterminate state */
const TriStateCheckbox: React.FC<{
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
  label: string;
  testId?: string;
}> = ({ checked, indeterminate, onChange, label, testId }) => {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={checkboxRef}
      type="checkbox"
      className="deck-editor-topic-checkbox"
      checked={checked}
      aria-checked={checked ? 'true' : indeterminate ? 'mixed' : 'false'}
      aria-label={label}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
      data-testid={testId}
    />
  );
};

const DeckEditorModalDialog: React.FC<DeckEditorModalProps> = ({
  onClose,
  allCards,
  deckToEdit,
  initialCardIds = [],
  onSaveDeck,
  onConfirmCreateDeck,
}) => {
  const isEditMode = Boolean(deckToEdit);
  const [deckName, setDeckName] = useState(deckToEdit?.name ?? '');
  const [description, setDescription] = useState(deckToEdit?.description ?? '');
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(() => {
    if (deckToEdit) {
      return new Set(deckToEdit.cardIds);
    }
    return new Set(initialCardIds);
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [seenFilter, setSeenFilter] = useState<'all' | 'seen' | 'unseen'>('all');

  // Track which topic accordions are expanded (all closed by default)
  const [expandedTopics, setExpandedTopics] = useState<Set<TrackType>>(() => new Set<TrackType>());

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Compute card statistics across allCards
  const allCardStats = useMemo(() => {
    let seenCount = 0;
    let unseenCount = 0;
    for (const card of allCards) {
      if (isCardAttempted(card)) seenCount++;
      else unseenCount++;
    }
    return { seenCount, unseenCount, total: allCards.length };
  }, [allCards]);

  // Group cards by topic track in ordered fashion
  const groupedCards = useMemo(() => {
    const map = new Map<TrackType, TopicItem[]>();
    for (const trk of ORDERED_TRACKS) {
      map.set(trk, []);
    }
    for (const card of allCards) {
      const list = map.get(card.track);
      if (list) {
        list.push(card);
      } else {
        map.set(card.track, [card]);
      }
    }
    return map;
  }, [allCards]);

  // Filtered cards map based on search query & seen filter
  const filteredGroupedCards = useMemo(() => {
    const map = new Map<TrackType, TopicItem[]>();
    const query = searchQuery.trim().toLowerCase();

    for (const [track, cards] of groupedCards.entries()) {
      const filtered = cards.filter((card) => {
        // Seen filter check
        if (seenFilter === 'seen' && !isCardAttempted(card)) return false;
        if (seenFilter === 'unseen' && isCardAttempted(card)) return false;

        // Query check
        if (!query) return true;
        const matchTitle = card.title.toLowerCase().includes(query);
        const matchConcept = card.concept?.toLowerCase().includes(query);
        const matchTags = card.tags.some((t) => t.toLowerCase().includes(query));
        return matchTitle || matchConcept || matchTags;
      });
      map.set(track, filtered);
    }
    return map;
  }, [groupedCards, searchQuery, seenFilter]);

  // Auto-expand topics that match search when search query is active
  const effectiveExpandedTopics = useMemo(() => {
    if (searchQuery.trim().length > 0) {
      const matchingTracks = new Set<TrackType>();
      for (const [track, cards] of filteredGroupedCards.entries()) {
        if (cards.length > 0) matchingTracks.add(track);
      }
      return matchingTracks;
    }
    return expandedTopics;
  }, [searchQuery, filteredGroupedCards, expandedTopics]);

  // Total selected counts
  const selectedCounts = useMemo(() => {
    let seen = 0;
    let unseen = 0;
    const cardMap = new Map(allCards.map((c) => [c.id, c]));
    for (const id of selectedCardIds) {
      const card = cardMap.get(id);
      if (card) {
        if (isCardAttempted(card)) seen++;
        else unseen++;
      }
    }
    return { total: selectedCardIds.size, seen, unseen };
  }, [selectedCardIds, allCards]);

  // Topic accordion toggle
  const toggleTopicAccordion = (track: TrackType) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(track)) next.delete(track);
      else next.add(track);
      return next;
    });
  };

  const handleToggleExpandAll = () => {
    if (expandedTopics.size === ORDERED_TRACKS.length) {
      setExpandedTopics(new Set());
    } else {
      setExpandedTopics(new Set(ORDERED_TRACKS));
    }
  };

  // Toggle single card
  const handleToggleCard = (cardId: string) => {
    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  // Toggle entire topic
  const handleToggleTopic = (_track: TrackType, cardsInTopic: TopicItem[]) => {
    if (cardsInTopic.length === 0) return;
    const areAllSelected = cardsInTopic.every((c) => selectedCardIds.has(c.id));

    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      if (areAllSelected) {
        // Deselect all in this topic
        for (const card of cardsInTopic) {
          next.delete(card.id);
        }
      } else {
        // Select all in this topic
        for (const card of cardsInTopic) {
          next.add(card.id);
        }
      }
      return next;
    });
  };

  // Select all visible / Deselect all
  const handleSelectAllVisible = () => {
    const next = new Set(selectedCardIds);
    for (const [, cards] of filteredGroupedCards.entries()) {
      for (const card of cards) {
        next.add(card.id);
      }
    }
    setSelectedCardIds(next);
  };

  const handleDeselectAllVisible = () => {
    const next = new Set(selectedCardIds);
    for (const [, cards] of filteredGroupedCards.entries()) {
      for (const card of cards) {
        next.delete(card.id);
      }
    }
    setSelectedCardIds(next);
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = deckName.trim();
    if (!trimmedName) return;

    const finalCardIds = Array.from(selectedCardIds);

    if (onSaveDeck) {
      onSaveDeck({
        id: deckToEdit?.id,
        name: trimmedName,
        description: description.trim() || undefined,
        cardIds: finalCardIds,
        dossierId: deckToEdit?.dossierId,
      });
    } else if (onConfirmCreateDeck) {
      onConfirmCreateDeck(
        trimmedName,
        description.trim() || undefined,
        finalCardIds
      );
    }
    onClose();
  };

  const isAllExpanded = effectiveExpandedTopics.size === ORDERED_TRACKS.length;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deck-editor-modal-title"
      data-testid="create-deck-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content glass-panel deck-editor-modal-container"
        data-testid="deck-editor-modal"
      >
        {/* Header */}
        <div className="modal-header deck-editor-header">
          <div className="modal-header-left">
            <div className="modal-header-icon" aria-hidden="true">
              {isEditMode ? <Pencil size={20} /> : <FolderPlus size={20} />}
            </div>
            <div>
              <h2 id="deck-editor-modal-title" className="modal-title">
                {isEditMode ? `Edit Custom Deck` : `Create Custom Deck`}
              </h2>
              <div className="modal-subtitle">
                {isEditMode
                  ? `Editing "${deckToEdit?.name}"`
                  : `Custom Study Collection · Select cards across topics`}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
            data-testid="create-deck-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="deck-editor-form">
          <div className="deck-editor-body">
            {/* Metadata inputs row */}
            <div className="deck-editor-meta-inputs">
              <div className="deck-editor-input-group name-group">
                <label
                  htmlFor="create-deck-name-input"
                  className="deck-editor-label"
                >
                  Deck Name *
                </label>
                <input
                  id="create-deck-name-input"
                  ref={inputRef}
                  type="text"
                  className="input deck-editor-input"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  placeholder="e.g. Stripe Senior Screen or Algorithms Sprint"
                  required
                  data-testid="create-deck-name-input"
                />
              </div>

              <div className="deck-editor-input-group desc-group">
                <label
                  htmlFor="create-deck-description-input"
                  className="deck-editor-label"
                >
                  Description (optional)
                </label>
                <input
                  id="create-deck-description-input"
                  type="text"
                  className="input deck-editor-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Targeted drills for component architecture, async flows, etc."
                  data-testid="create-deck-description-input"
                />
              </div>
            </div>

            {/* Selection Toolbar */}
            <div className="deck-editor-toolbar">
              <div className="deck-editor-search-box">
                <Search size={15} className="deck-editor-search-icon" aria-hidden="true" />
                <input
                  type="text"
                  className="deck-editor-search-input"
                  placeholder="Filter cards by title, concept, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="deck-editor-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="deck-editor-search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Seen / Unseen Filter Pills */}
              <div className="deck-editor-pill-filters" role="radiogroup" aria-label="Filter cards by practice status">
                <button
                  type="button"
                  className={`deck-editor-pill ${seenFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setSeenFilter('all')}
                  data-testid="deck-editor-filter-all"
                >
                  All ({allCardStats.total})
                </button>
                <button
                  type="button"
                  className={`deck-editor-pill seen ${seenFilter === 'seen' ? 'active' : ''}`}
                  onClick={() => setSeenFilter('seen')}
                  data-testid="deck-editor-filter-seen"
                >
                  <span className="seen-dot" aria-hidden="true" />
                  Practiced ({allCardStats.seenCount})
                </button>
                <button
                  type="button"
                  className={`deck-editor-pill unseen ${seenFilter === 'unseen' ? 'active' : ''}`}
                  onClick={() => setSeenFilter('unseen')}
                  data-testid="deck-editor-filter-unseen"
                >
                  <span className="unseen-dot" aria-hidden="true" />
                  Unseen ({allCardStats.unseenCount})
                </button>
              </div>

              {/* Quick Action Buttons */}
              <div className="deck-editor-quick-actions">
                <button
                  type="button"
                  className="deck-editor-action-btn"
                  onClick={handleSelectAllVisible}
                  data-testid="deck-editor-select-all-btn"
                  title="Select all currently visible cards"
                >
                  <CheckSquare size={13} />
                  <span>Select All</span>
                </button>
                <button
                  type="button"
                  className="deck-editor-action-btn"
                  onClick={handleDeselectAllVisible}
                  data-testid="deck-editor-deselect-all-btn"
                  title="Deselect all cards"
                >
                  <span>Deselect All</span>
                </button>
                <button
                  type="button"
                  className="deck-editor-action-btn"
                  onClick={handleToggleExpandAll}
                  data-testid="deck-editor-expand-toggle-btn"
                >
                  <span>{isAllExpanded ? 'Collapse All' : 'Expand All'}</span>
                </button>
              </div>
            </div>

            {/* Accordion Categories Container */}
            <div className="deck-editor-accordion-scroll" data-testid="deck-editor-accordion">
              {ORDERED_TRACKS.map((track) => {
                const allCardsInTopic = groupedCards.get(track) || [];
                const visibleCardsInTopic = filteredGroupedCards.get(track) || [];
                if (allCardsInTopic.length === 0) return null;

                const trkMeta = getTrackMeta(track);
                const isExpanded = effectiveExpandedTopics.has(track);

                // Calculate selection state for this topic
                const selectedInTopicCount = allCardsInTopic.filter((c) =>
                  selectedCardIds.has(c.id)
                ).length;
                const totalInTopicCount = allCardsInTopic.length;
                const isAllSelected =
                  totalInTopicCount > 0 && selectedInTopicCount === totalInTopicCount;
                const isPartial =
                  selectedInTopicCount > 0 && selectedInTopicCount < totalInTopicCount;

                return (
                  <div
                    key={track}
                    className={`deck-editor-topic-card ${isExpanded ? 'expanded' : ''}`}
                    data-testid={`deck-editor-topic-${track}`}
                  >
                    {/* Topic Header Accordion Trigger */}
                    <div
                      className="deck-editor-topic-header"
                      onClick={() => toggleTopicAccordion(track)}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleTopicAccordion(track);
                        }
                      }}
                      data-testid={`deck-editor-topic-header-${track}`}
                    >
                      <div className="topic-header-left">
                        {/* Rotating Caret Icon */}
                        <div
                          className={`deck-editor-caret-wrap ${isExpanded ? 'rotated' : ''}`}
                          aria-hidden="true"
                        >
                          <ChevronRight size={17} />
                        </div>

                        {/* Tri-state Topic Checkbox */}
                        <TriStateCheckbox
                          checked={isAllSelected}
                          indeterminate={isPartial}
                          onChange={() => handleToggleTopic(track, allCardsInTopic)}
                          label={`Select or deselect all cards in topic ${trkMeta.label}`}
                          testId={`deck-editor-topic-checkbox-${track}`}
                        />

                        {/* Topic Track Badge & Label */}
                        <span className="track-badge" data-track={track}>
                          {trkMeta.label}
                        </span>
                      </div>

                      <div className="topic-header-right">
                        {/* Selection Counter Badge */}
                        <span
                          className={`topic-selection-counter ${
                            selectedInTopicCount > 0 ? 'has-selected' : ''
                          }`}
                        >
                          <strong>{selectedInTopicCount}</strong> / {totalInTopicCount} cards
                        </span>
                      </div>
                    </div>

                    {/* Expandable Topic Cards List */}
                    {isExpanded && (
                      <div
                        className="deck-editor-topic-card-list"
                        data-testid={`deck-editor-topic-list-${track}`}
                      >
                        {visibleCardsInTopic.length === 0 ? (
                          <div className="deck-editor-no-match">
                            No cards in this topic match your current filter.
                          </div>
                        ) : (
                          visibleCardsInTopic.map((card) => {
                            const isSelected = selectedCardIds.has(card.id);
                            const isSeen = isCardAttempted(card);

                            return (
                              <div
                                key={card.id}
                                className={`deck-editor-card-row ${
                                  isSelected ? 'selected' : ''
                                }`}
                                onClick={() => handleToggleCard(card.id)}
                                role="checkbox"
                                aria-checked={isSelected}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleToggleCard(card.id);
                                  }
                                }}
                                data-testid={`deck-editor-card-row-${card.id}`}
                              >
                                <div className="card-row-left">
                                  {/* Individual Card Checkbox */}
                                  <input
                                    type="checkbox"
                                    className="deck-editor-card-checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleCard(card.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label={`Select card ${card.title}`}
                                    data-testid={`deck-editor-card-checkbox-${card.id}`}
                                  />

                                  {/* Card Title */}
                                  <span className="card-row-title">{card.title}</span>

                                  {/* Difficulty Badge */}
                                  <DifficultyBadge card={card} showLabel={false} />

                                  {/* Seen vs Unseen Colour-Coded Indicator */}
                                  {isSeen ? (
                                    <span
                                      className="deck-editor-seen-badge seen"
                                      title={`Practiced card (Box ${card.box ?? 1}, Streak ${
                                        card.streak ?? 0
                                      })`}
                                      data-testid={`deck-editor-card-seen-${card.id}`}
                                    >
                                      <span className="seen-indicator-dot" />
                                      <span>Practiced</span>
                                      {card.box && card.box > 1 && (
                                        <span className="seen-tier-tag">B{card.box}</span>
                                      )}
                                    </span>
                                  ) : (
                                    <span
                                      className="deck-editor-seen-badge unseen"
                                      title="New card (0 reviews completed)"
                                      data-testid={`deck-editor-card-unseen-${card.id}`}
                                    >
                                      <span className="unseen-indicator-dot" />
                                      <span>Unseen</span>
                                    </span>
                                  )}
                                </div>

                                <div className="card-row-right">
                                  {/* Concept & Tags */}
                                  <div className="card-tags-group">
                                    {card.concept && (
                                      <span className="card-concept-chip">
                                        {card.concept}
                                      </span>
                                    )}
                                    {card.tags.slice(0, 2).map((tg) => (
                                      <span key={tg} className="table-tag-chip">
                                        #{tg}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer deck-editor-footer">
            <div className="deck-editor-footer-stats" data-testid="deck-editor-footer-stats">
              <Layers size={15} className="footer-stats-icon" />
              <span>
                Selected: <strong>{selectedCounts.total}</strong> of {allCards.length} cards (
                <span className="stats-seen-text">{selectedCounts.seen} Practiced</span> ·{' '}
                <span className="stats-unseen-text">{selectedCounts.unseen} Unseen</span>)
              </span>
            </div>

            <div className="deck-editor-footer-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
                data-testid="create-deck-cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!deckName.trim()}
                data-testid="create-deck-submit-btn"
              >
                {isEditMode
                  ? `Save Changes (${selectedCounts.total})`
                  : `Create Deck (${selectedCounts.total})`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
