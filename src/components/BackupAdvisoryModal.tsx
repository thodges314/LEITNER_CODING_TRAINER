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

  const isLight =
    typeof document !== 'undefined' &&
    document.documentElement.getAttribute('data-theme') === 'apple-gsos';

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
        style={{
          maxWidth: '560px',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '16px',
          boxShadow: isLight
            ? '0 20px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.1)'
            : '0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--border-medium)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
          }}
        >
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: isLight ? 'rgba(217, 119, 6, 0.12)' : 'rgba(245, 158, 11, 0.18)',
                color: isLight ? '#b45309' : '#fbbf24',
                border: isLight ? '1px solid rgba(217, 119, 6, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <HardDrive size={22} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: isLight ? '#b45309' : '#fbbf24',
                  marginBottom: '2px',
                }}
              >
                Session Advisory • 4 Problems Completed
              </div>
              <h2
                id="backup-advisory-title"
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                }}
              >
                Back Up Your Practice Progress
              </h2>
            </div>
          </div>
          <button
            onClick={onDismiss}
            aria-label="Dismiss warning"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)' }}>
            You've completed your first <strong>4 problems</strong>! To protect your hard work, we strongly recommend downloading a backup of your progress regularly—<strong>at least at the end of every session</strong>.
          </p>

          {/* Key Callout Boxes */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '16px',
              borderRadius: '10px',
              background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-medium)',
            }}
          >
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
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-medium)',
            background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
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
            style={{
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
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
