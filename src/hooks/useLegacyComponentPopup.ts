import { useState, useEffect, useCallback } from 'react';
import type { TopicItem } from '../lib/leitner';
import type { AppTheme } from '../lib/theme';

export function useLegacyComponentPopup(
  currentCard: TopicItem | null,
  theme: AppTheme = 'dark'
) {
  const [legacyPopupWindow, setLegacyPopupWindow] = useState<Window | null>(null);
  const isLegacyPoppedOut = Boolean(legacyPopupWindow && !legacyPopupWindow.closed);

  const handleLegacyPopOut = useCallback(() => {
    if (legacyPopupWindow && !legacyPopupWindow.closed) {
      legacyPopupWindow.focus();
      return;
    }

    const w = 640;
    const h = 540;
    const left = typeof window.screenX === 'number' ? window.screenX + Math.max(0, (window.outerWidth - w) / 2) : 100;
    const top = typeof window.screenY === 'number' ? window.screenY + Math.max(0, (window.outerHeight - h) / 2) : 100;

    const popup = (() => {
      try {
        return window.open(
          'about:blank',
          'leitner_legacy_component_preview',
          `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
        );
      } catch {
        return null;
      }
    })();

    if (!popup) return;

    try {
      popup.document.title = `Component Preview: ${currentCard?.title || 'Hook Test'} — Leitner`;
      popup.document.head.innerHTML = '';
      for (const el of Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))) {
        popup.document.head.appendChild(el.cloneNode(true));
      }
      popup.document.body.style.margin = '0';
      popup.document.body.style.padding = '16px';
      popup.document.body.style.backgroundColor = theme === 'apple-gsos' ? '#ffffff' : '#030712';
      popup.document.body.style.color = theme === 'apple-gsos' ? '#0f172a' : '#cbd5e1';
      popup.document.body.style.fontFamily = getComputedStyle(document.body).fontFamily;
      popup.document.body.style.boxSizing = 'border-box';
      popup.document.body.style.height = '100vh';
      popup.document.body.style.display = 'flex';
      popup.document.body.style.flexDirection = 'column';

      popup.addEventListener('beforeunload', () => {
        setLegacyPopupWindow(null);
      });
    } catch {
      // Ignore
    }

    setLegacyPopupWindow(popup);
  }, [currentCard, theme, legacyPopupWindow]);

  const handleLegacyDockBack = useCallback(() => {
    if (legacyPopupWindow && !legacyPopupWindow.closed) {
      legacyPopupWindow.close();
    }
    setLegacyPopupWindow(null);
  }, [legacyPopupWindow]);

  // Clean up legacy popup window on unmount
  useEffect(() => {
    return () => {
      if (legacyPopupWindow && !legacyPopupWindow.closed) {
        legacyPopupWindow.close();
      }
    };
  }, [legacyPopupWindow]);

  // Heartbeat to detect popup closure via OS close button
  useEffect(() => {
    if (!legacyPopupWindow) return;
    const timer = setInterval(() => {
      if (legacyPopupWindow.closed) {
        setLegacyPopupWindow(null);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [legacyPopupWindow]);

  return {
    legacyPopupWindow,
    isLegacyPoppedOut,
    handleLegacyPopOut,
    handleLegacyDockBack,
  };
}
