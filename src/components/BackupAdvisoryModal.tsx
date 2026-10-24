import React, { useEffect } from 'react';
import { X, HardDrive, Download, ArrowRight } from 'lucide-react';

export interface BackupAdvisoryModalProps {
  isOpen: boolean;
  onAgree: () => void;
  onDismiss: () => void;
}

export const BackupAdvisoryModal: React.FC<BackupAdvisoryModalProps> = ({
  isOpen,
  onAgree,
  onDismiss,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onDismiss]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-advisory-title"
      data-testid="backup-advisory-modal"
    >
      <div
        className="modal-content"
        style={{ maxWidth: '560px', padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div
              className="modal-header-icon"
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-amber)',
                borderColor: 'rgba(245, 158, 11, 0.3)',
              }}
            >
              <HardDrive size={22} />
            </div>
            <div>
              <div className="modal-subtitle">
                Session Advisory • 4 Problems Completed
              </div>
              <h2 id="backup-advisory-title" className="modal-title">
                Back Up Your Practice Progress
              </h2>
            </div>
          </div>
          <button
            onClick={onDismiss}
            aria-label="Dismiss warning"
            className="modal-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="modal-body">
          <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)' }}>
            You've completed your first <strong>4 problems</strong>! To protect your hard work, we strongly recommend downloading a backup of your progress regularly—<strong>at least at the end of every session</strong>.
          </p>

          {/* Key Callout Boxes */}
          <div className="modal-callout">
            <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
              <strong style={{ color: 'var(--text-primary)' }}>100% Private in Browser Storage:</strong>{' '}
              <span style={{ color: 'var(--text-secondary)' }}>
                All your active cards, Leitner spacing tiers, mastery stats, and review history are stored exclusively inside your browser's local storage.
              </span>
            </div>

            <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Risk of Reset:</strong>{' '}
              <span style={{ color: 'var(--text-secondary)' }}>
                Should browser storage get cleared, site cookies reset, or if you use an incognito window, your progress data will be permanently wiped, requiring you to start again from the beginning.
              </span>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
            Exporting generates a timestamped <code>.json</code> file on your computer. You can import this file anytime to restore your exact progress on this device or any other computer.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onDismiss}
            data-testid="backup-advisory-dismiss-btn"
            style={{ fontSize: '13px' }}
          >
            Dismiss Warning
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onAgree}
            data-testid="backup-advisory-agree-btn"
            style={{ fontSize: '13px' }}
          >
            <Download size={15} />
            Go to Export Progress
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
