import React, { useState, useEffect, useRef } from 'react';
import { FolderPlus, X, Sparkles, CheckSquare } from 'lucide-react';
import type { TopicItem } from '../../lib/leitner';

export interface CreateDeckModalProps {
  isOpen: boolean;
  initialCardIds?: string[];
  allCards: TopicItem[];
  onConfirmCreateDeck: (deckName: string, description?: string, cardIds?: string[]) => void;
  onClose: () => void;
}

export const CreateDeckModal: React.FC<CreateDeckModalProps> = (props) => {
  if (!props.isOpen) return null;
  return (
    <CreateDeckModalDialog
      key={`create-deck-${props.initialCardIds?.length ?? 0}`}
      {...props}
    />
  );
};

const CreateDeckModalDialog: React.FC<CreateDeckModalProps> = ({
  initialCardIds = [],
  onConfirmCreateDeck,
  onClose,
}) => {
  const [deckName, setDeckName] = useState('');
  const [description, setDescription] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = deckName.trim();
    if (!trimmedName) return;
    onConfirmCreateDeck(
      trimmedName,
      description.trim() || undefined,
      initialCardIds.length > 0 ? [...initialCardIds] : []
    );
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-deck-modal-title"
      data-testid="create-deck-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content glass-panel" style={{ maxWidth: 480 }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-header-icon" aria-hidden="true">
              <FolderPlus size={20} />
            </div>
            <div>
              <h2 id="create-deck-modal-title" className="modal-title">
                Create Custom Deck
              </h2>
              <div className="modal-subtitle">Custom Study Collection</div>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '20px 24px' }}>
            {/* Deck Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              <label
                htmlFor="create-deck-name-input"
                style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}
              >
                Deck Name *
              </label>
              <input
                id="create-deck-name-input"
                ref={inputRef}
                type="text"
                className="input"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: 14,
                  borderRadius: 6,
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-input, var(--bg-card))',
                  color: 'var(--text-primary)',
                }}
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="e.g. Stripe Senior Screen or Algorithms Sprint"
                required
                data-testid="create-deck-name-input"
              />
            </div>

            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              <label
                htmlFor="create-deck-description-input"
                style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}
              >
                Description (optional)
              </label>
              <textarea
                id="create-deck-description-input"
                className="input"
                rows={2}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: 13,
                  lineHeight: 1.4,
                  borderRadius: 6,
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-input, var(--bg-card))',
                  color: 'var(--text-primary)',
                  resize: 'vertical',
                }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Targeted drills for component architecture, async flows, etc."
                data-testid="create-deck-description-input"
              />
            </div>

            {/* Initial cards status badge */}
            {initialCardIds.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 6,
                  backgroundColor: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                }}
                data-testid="create-deck-selected-cards-notice"
              >
                <CheckSquare size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                <span>
                  Deck will be initialized with <strong>{initialCardIds.length}</strong> selected{' '}
                  {initialCardIds.length === 1 ? 'card' : 'cards'} from the catalog.
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 6,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-medium)',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                }}
              >
                <Sparkles size={15} style={{ color: 'var(--accent-amber, #f59e0b)', flexShrink: 0 }} />
                <span>
                  You can add cards to this deck anytime from the Deck Catalog table using multi-select checkboxes.
                </span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div
            className="modal-footer"
            style={{
              padding: '14px 24px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              borderTop: '1px solid var(--border-medium)',
            }}
          >
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
              Create Deck
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
