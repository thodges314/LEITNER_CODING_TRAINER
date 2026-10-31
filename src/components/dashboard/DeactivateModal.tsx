import React, { useEffect } from 'react';
import { Archive } from 'lucide-react';
import type { TopicItem } from '../../lib/leitner';

export interface DeactivateModalProps {
  topic: TopicItem | null;
  onClose: () => void;
  onConfirm: (topicId: string) => void;
}

export const DeactivateModal: React.FC<DeactivateModalProps> = ({
  topic,
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    if (!topic) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [topic, onClose]);

  if (!topic) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deactivate-confirm-title"
    >
      <div
        className="modal-content deactivate-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="deactivate-modal-header">
          <Archive size={22} />
          <h3 id="deactivate-confirm-title" className="deactivate-modal-title">
            Deactivate Card
          </h3>
        </div>
        <p className="deactivate-modal-desc">
          Deactivate card '{topic.title}'? It will be pulled out of your active spaced
          repetition study cycle. You can reactivate it at any time from this catalog table.
        </p>
        <div className="deactivate-modal-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onConfirm(topic.id)}
          >
            Deactivate Card
          </button>
        </div>
      </div>
    </div>
  );
};
