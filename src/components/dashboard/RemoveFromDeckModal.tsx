import React, { useState, useEffect, useRef } from 'react';
import { FolderMinus, X, Sparkles } from 'lucide-react';
import type { TopicItem } from '../../lib/leitner';

export interface RemoveFromDeckModalProps {
  isOpen: boolean;
  card: TopicItem | null;
  activeDeckName: string;
  onConfirmForkAndRemove: (cardId: string, newDeckName: string) => void;
  onClose: () => void;
}

export const RemoveFromDeckModal: React.FC<RemoveFromDeckModalProps> = (props) => {
  if (!props.isOpen || !props.card) return null;
  return (
    <RemoveFromDeckModalDialog
      key={`${props.card.id}-${props.activeDeckName}`}
      {...props}
      card={props.card}
    />
  );
};

interface RemoveFromDeckModalDialogProps extends RemoveFromDeckModalProps {
  card: TopicItem;
}

const RemoveFromDeckModalDialog: React.FC<RemoveFromDeckModalDialogProps> = ({
  card,
  activeDeckName,
  onConfirmForkAndRemove,
  onClose,
}) => {
  const [deckName, setDeckName] = useState(`${activeDeckName} (Personal)`);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = deckName.trim();
    if (!trimmed) return;
    onConfirmForkAndRemove(card.id, trimmed);
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fork-deck-modal-title"
      data-testid="remove-from-deck-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content glass-panel" style={{ maxWidth: 480 }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-header-icon" aria-hidden="true">
              <FolderMinus size={20} />
            </div>
            <div>
              <h2 id="fork-deck-modal-title" className="modal-title">
                Remove Card From Deck
              </h2>
              <div className="modal-subtitle">Personal Deck Customization</div>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '20px 24px' }}>
            <p style={{ margin: '0 0 16px', lineHeight: 1.5, color: 'var(--text-secondary)', fontSize: 13 }}>
              <strong>{activeDeckName}</strong> is a built-in preset deck and cannot be modified directly.
              To remove <strong>&ldquo;{card.title}&rdquo;</strong>, create a personal deck copy:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              <label
                htmlFor="personal-deck-name-input"
                style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}
              >
                Personal Deck Name
              </label>
              <input
                id="personal-deck-name-input"
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
                placeholder="e.g. Frontend Specialist (Personal)"
                required
                data-testid="fork-deck-name-input"
              />
            </div>

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
            >
              <Sparkles size={15} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
              <span>
                Your new personal deck will include all cards from {activeDeckName} except &ldquo;{card.title}&rdquo;.
              </span>
            </div>
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
              data-testid="fork-deck-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!deckName.trim()}
              data-testid="fork-deck-submit-btn"
            >
              Create Deck &amp; Remove
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
