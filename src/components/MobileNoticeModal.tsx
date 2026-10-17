import React, { useState, useEffect } from 'react';
import { Monitor, Keyboard, X, Smartphone, ArrowRight } from 'lucide-react';

const STORAGE_KEY = 'leitner_mobile_modal_dismissed';

export const MobileNoticeModal: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Lock body scroll while modal is active to prevent horizontal/vertical background shift on mobile
  useEffect(() => {
    if (isDismissed) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore sessionStorage exceptions
    }
  };

  if (isDismissed) return null;

  return (
    <div
      className="mobile-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-modal-title"
      onClick={handleDismiss}
    >
      <div
        className="mobile-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          className="mobile-modal-close"
          onClick={handleDismiss}
          aria-label="Close mobile notice"
        >
          <X size={18} />
        </button>

        {/* Header Icon Layout */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              boxShadow: '0 0 20px -2px rgba(56, 189, 248, 0.25)',
            }}
          >
            <Monitor size={28} />
          </div>
        </div>

        {/* Modal Title */}
        <h2
          id="mobile-modal-title"
          style={{
            margin: '0 0 8px 0',
            fontSize: '17px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            textAlign: 'center',
            lineHeight: 1.3,
            wordBreak: 'break-word',
          }}
        >
          Desktop & Keyboard Recommended
        </h2>

        {/* Subtitle */}
        <p
          style={{
            margin: '0 0 14px 0',
            fontSize: '12.5px',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            lineHeight: 1.45,
            wordBreak: 'break-word',
          }}
        >
          <strong>Leitner Coding Trainer</strong> is specifically designed for a full-sized screen and physical keyboard coding experience.
        </p>

        {/* Highlight Callout Box */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            marginBottom: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            textAlign: 'left',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Keyboard size={15} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '11.5px', color: 'var(--text-primary)', lineHeight: 1.4, wordBreak: 'break-word' }}>
              Writing solutions from muscle memory, indenting code, running tests, and using keyboard shortcuts requires a full keyboard.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Smartphone size={15} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4, wordBreak: 'break-word' }}>
              A reduced flashcard review version may come in the future, but for now we strongly recommend using a desktop or laptop.
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: 600,
            gap: '8px',
            whiteSpace: 'normal',
            lineHeight: 1.3,
            boxSizing: 'border-box',
          }}
          onClick={handleDismiss}
        >
          <span>Continue to Trainer Anyway</span>
          <ArrowRight size={15} style={{ flexShrink: 0 }} />
        </button>
      </div>
    </div>
  );
};
