import React, { useState, useEffect } from 'react';
import { Monitor, Keyboard, X, Smartphone, ArrowRight } from 'lucide-react';

const STORAGE_KEY = 'leitner_mobile_modal_dismissed';

const MOBILE_QUERY = '(max-width: 820px)';

/** True only on narrow viewports; tracks resizes. The notice must not exist in the DOM on desktop. */
function useIsNarrowViewport(): boolean {
  const [narrow, setNarrow] = useState<boolean>(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(MOBILE_QUERY).matches : false
  );
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia(MOBILE_QUERY);
    const onChange = (e: MediaQueryListEvent) => setNarrow(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return narrow;
}

export const MobileNoticeModal: React.FC = () => {
  const narrow = useIsNarrowViewport();
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Lock body scroll only while the notice is actually visible (narrow viewport, not dismissed).
  const visible = narrow && !isDismissed;
  useEffect(() => {
    if (!visible) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [visible]);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore sessionStorage exceptions
    }
  };

  if (!visible) return null;

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
        <div className="mobile-notice-icon-box">
          <Monitor size={28} />
        </div>

        {/* Modal Title */}
        <h2 id="mobile-modal-title" className="mobile-notice-title">
          Desktop & Keyboard Recommended
        </h2>

        {/* Subtitle */}
        <p className="mobile-notice-desc">
          <strong>Leitner Coding Trainer</strong> is specifically designed for a full-sized screen and physical keyboard coding experience.
        </p>

        {/* Highlight Callout Box */}
        <div className="mobile-notice-callout">
          <div className="mobile-notice-item">
            <Keyboard size={15} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '11.5px', color: 'var(--text-primary)', lineHeight: 1.4, wordBreak: 'break-word' }}>
              Writing solutions from muscle memory, indenting code, running tests, and using keyboard shortcuts requires a full keyboard.
            </span>
          </div>

          <div className="mobile-notice-item">
            <Smartphone size={15} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4, wordBreak: 'break-word' }}>
              A reduced flashcard review version may come in the future, but for now we strongly recommend using a desktop or laptop.
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          className="btn btn-primary mobile-notice-btn"
          onClick={handleDismiss}
        >
          <span>Continue to Trainer Anyway</span>
          <ArrowRight size={15} style={{ flexShrink: 0 }} />
        </button>
      </div>
    </div>
  );
};
