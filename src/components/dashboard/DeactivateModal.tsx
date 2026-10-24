import React from 'react';
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
  if (!topic) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="deactivate-confirm-title"
    >
      <div
        className="modal-content"
        style={{ maxWidth: '440px', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '14px',
            color: 'var(--accent-orange, #f97316)',
          }}
        >
          <Archive size={22} />
          <h3 id="deactivate-confirm-title" style={{ fontSize: '17px', fontWeight: 600 }}>
            Deactivate Card
          </h3>
        </div>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            marginBottom: '22px',
          }}
        >
          Deactivate card '{topic.title}'? It will be pulled out of your active spaced
          repetition study cycle. You can reactivate it at any time from this catalog table.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
