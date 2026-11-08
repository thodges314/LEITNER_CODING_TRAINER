import React, { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { availableSteps, placeTooltip, TOUR_STEPS, tourAnchorSelector } from '../lib/tour';
import type { Box, TourStep } from '../lib/tour';

interface GuidedTourProps {
  steps?: TourStep[];
  onClose: () => void;
}

const PAD = 6;
const TOOLTIP_WIDTH = 380;
const TOOLTIP_HEIGHT_ESTIMATE = 280;

/**
 * The spotlight rectangles covering all the anchors of a step that are on the page, as a string
 * (a stable value for useSyncExternalStore), or '' if there is nothing to point at.
 */
function readBoxes(step: TourStep | null): Box[] {
  if (!step) return [];

  // Special case 1: deck-selector step - wrap both deck-selector and deck-dropdown in ONE large highlight box with margin
  if (step.id === 'deck-selector') {
    const selEl = document.querySelector(tourAnchorSelector('deck-selector'));
    const dropEl = document.querySelector(tourAnchorSelector('deck-dropdown'));
    if (selEl && dropEl) {
      const r1 = selEl.getBoundingClientRect();
      const r2 = dropEl.getBoundingClientRect();
      if (r1.width > 0 && r2.width > 0) {
        const MARGIN = 10;
        const top = Math.min(r1.top, r2.top) - MARGIN;
        const left = Math.min(r1.left, r2.left) - MARGIN;
        const right = Math.max(r1.right, r2.right) + MARGIN;
        const bottom = Math.max(r1.bottom, r2.bottom) + MARGIN;
        return [{
          top: Math.round(top),
          left: Math.round(left),
          width: Math.round(right - left),
          height: Math.round(bottom - top),
        }];
      }
    }
  }

  // Special case 2: ai-clarification step - if the panel is open, only highlight the open panel, not the question mark
  if (step.id === 'ai-clarification') {
    const panelEl = document.querySelector(tourAnchorSelector('ai-clarification-panel'));
    if (panelEl) {
      const r = panelEl.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        return [{
          top: Math.round(r.top - PAD),
          left: Math.round(r.left - PAD),
          width: Math.round(r.width + PAD * 2),
          height: Math.round(r.height + PAD * 2),
        }];
      }
    }
  }

  // Default: calculate bounding box for each anchor
  const boxes: Box[] = [];
  for (const anchor of step.anchors) {
    const el = document.querySelector(tourAnchorSelector(anchor));
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    boxes.push({
      top: Math.round(r.top - PAD),
      left: Math.round(r.left - PAD),
      width: Math.round(r.width + PAD * 2),
      height: Math.round(r.height + PAD * 2),
    });
  }
  return boxes;
}

function readBoxesString(step: TourStep | null): string {
  const boxes = readBoxes(step);
  if (boxes.length === 0) return '';
  return boxes.map((b) => `${b.top}|${b.left}|${b.width}|${b.height}`).join(';');
}

function parseBoxes(value: string): Box[] {
  if (!value) return [];
  return value.split(';').map((str) => {
    const [top, left, width, height] = str.split('|').map(Number);
    return { top, left, width, height };
  });
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('resize', onChange);
  window.addEventListener('scroll', onChange, true);
  const poll = window.setInterval(onChange, 300); // catches layout shifts that fire no event (images, fonts, panels opening)
  let observer: MutationObserver | null = null;
  if (typeof document !== 'undefined' && document.body) {
    observer = new MutationObserver(() => {
      onChange();
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
  }
  return () => {
    window.removeEventListener('resize', onChange);
    window.removeEventListener('scroll', onChange, true);
    window.clearInterval(poll);
    observer?.disconnect();
  };
}

/**
 * A dismissable spotlight tour. Mount it to start it, unmount it to end it. It only points at things that are on the
 * page (missing anchors are skipped), follows scrolling and resizing, and works with the keyboard (arrows, Escape).
 */
export const GuidedTour: React.FC<GuidedTourProps> = ({ steps: initialSteps, onClose }) => {
  const stepsSource = initialSteps ?? TOUR_STEPS;
  const [steps] = useState(() => availableSteps(stepsSource, (selector) => document.querySelector(selector) !== null));
  const [index, setIndex] = useState(0);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const step = steps[index];

  const handleClose = useCallback(() => {
    const trigger = document.querySelector<HTMLButtonElement>('[data-testid="deck-dropdown-trigger"]');
    if (trigger && trigger.getAttribute('aria-expanded') === 'true') {
      trigger.click();
    }
    const socraticClose = document.querySelector<HTMLButtonElement>('[data-testid="socratic-assistant-close"]');
    if (socraticClose) {
      socraticClose.click();
    }
    onClose();
  }, [onClose]);

  // Dropdown & Socratic panel toggles
  useEffect(() => {
    // 1. Deck selector dropdown
    const trigger = document.querySelector<HTMLButtonElement>('[data-testid="deck-dropdown-trigger"]');
    if (step?.id === 'deck-selector') {
      if (trigger && trigger.getAttribute('aria-expanded') !== 'true') {
        trigger.click();
        window.dispatchEvent(new Event('resize'));
      }
    } else {
      if (trigger && trigger.getAttribute('aria-expanded') === 'true') {
        trigger.click();
        window.dispatchEvent(new Event('resize'));
      }
    }

    // 2. Socratic Clarification panel
    if (step?.id === 'ai-clarification') {
      const socraticBtn = document.querySelector<HTMLButtonElement>('[data-tour="ai-clarification"]');
      if (socraticBtn && socraticBtn.getAttribute('aria-expanded') !== 'true') {
        socraticBtn.click();
        window.dispatchEvent(new Event('resize'));
      }
    } else {
      const socraticClose = document.querySelector<HTMLButtonElement>('[data-testid="socratic-assistant-close"]');
      if (socraticClose) {
        socraticClose.click();
        window.dispatchEvent(new Event('resize'));
      }
    }
  }, [step?.id]);

  const boxesValue = useSyncExternalStore(
    subscribe,
    () => readBoxesString(step ?? null),
    () => ''
  );
  const boxes = parseBoxes(boxesValue);

  const [tipHeight, setTipHeight] = useState(TOOLTIP_HEIGHT_ESTIMATE);

  useLayoutEffect(() => {
    if (tipRef.current) {
      const h = tipRef.current.offsetHeight;
      if (h && Math.abs(h - tipHeight) > 5) {
        setTipHeight(h);
      }
    }
  }, [step, tipHeight]);

  // Bring the target into view when the step changes.
  useLayoutEffect(() => {
    if (step) {
      if (step.id === 'catalog-table') {
        const el = document.querySelector(tourAnchorSelector('catalog-table'));
        if (el) {
          el.scrollIntoView({ block: 'start', behavior: 'auto' });
        }
        return;
      }
      const first = step.anchors.map((a) => document.querySelector(tourAnchorSelector(a))).find((el) => el !== null);
      if (first) {
        const rect = first.getBoundingClientRect();
        if (rect.height > window.innerHeight) {
          first.scrollIntoView({ block: 'start', behavior: 'auto' });
        } else {
          first.scrollIntoView({ block: 'nearest', behavior: 'auto' });
        }
      }
    }
  }, [step]);

  useEffect(() => {
    nextRef.current?.focus();
  }, [index]);

  const last = index >= steps.length - 1;
  const next = useCallback(() => {
    if (last) handleClose();
    else setIndex((i) => i + 1);
  }, [last, handleClose]);
  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [next, back, handleClose]);

  if (!step) return null;

  let placement = placeTooltip(
    boxes[0] ?? null,
    { width: TOOLTIP_WIDTH, height: tipHeight },
    { width: window.innerWidth, height: window.innerHeight }
  );

  // Position overrides so floating menus/drawers remain unobstructed
  if (step?.id === 'deck-selector') {
    const selEl = document.querySelector(tourAnchorSelector('deck-selector'));
    const sRect = selEl?.getBoundingClientRect();
    if (sRect) {
      placement = {
        top: Math.min(window.innerHeight - tipHeight - 16, sRect.bottom + 14),
        left: Math.max(16, sRect.left + 16),
      };
    }
  } else if (step?.id === 'ai-clarification') {
    const problemEl = document.querySelector('[data-tour="problem"]');
    const pRect = problemEl ? problemEl.getBoundingClientRect() : boxes[0];
    if (pRect) {
      placement = {
        top: Math.min(window.innerHeight - tipHeight - 16, Math.max(16, pRect.top + 40)),
        left: Math.max(16, pRect.left + 16),
      };
    }
  } else if (step?.id === 'catalog-table' && boxes[0]) {
    placement = {
      top: Math.max(16, Math.min(window.innerHeight - tipHeight - 20, Math.max(80, boxes[0].top + 60))),
      left: Math.max(16, (window.innerWidth - TOOLTIP_WIDTH) / 2),
    };
  }

  return createPortal(
    <div data-testid="guided-tour" style={{ position: 'fixed', inset: 0, zIndex: 3000 }}>
      {/* Blocks clicks on the page behind the tour. */}
      <div style={{ position: 'absolute', inset: 0 }} aria-hidden="true" />
      {boxes.length > 0 ? (
        <svg
          aria-hidden="true"
          style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 3000 }}
        >
          <defs>
            <mask id="tour-cutout">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {boxes.map((b, i) => (
                <rect
                  key={i}
                  x={b.left}
                  y={b.top}
                  width={b.width}
                  height={b.height}
                  rx="8"
                  fill="black"
                />
              ))}
            </mask>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="rgba(2, 6, 23, 0.72)" mask="url(#tour-cutout)" />
          {boxes.map((b, i) => (
            <rect
              key={i}
              data-testid="tour-spotlight"
              x={b.left}
              y={b.top}
              width={b.width}
              height={b.height}
              rx="8"
              fill="none"
              stroke="var(--accent-primary, #38bdf8)"
              strokeWidth="2"
            />
          ))}
        </svg>
      ) : (
        <div aria-hidden="true" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.72)', pointerEvents: 'none' }} />
      )}

      {/* Tooltip */}
      <div
        ref={tipRef}
        role="dialog"
        aria-label="Guided tour"
        aria-live="polite"
        style={{
          position: 'fixed',
          top: placement.top,
          left: placement.left,
          width: TOOLTIP_WIDTH,
          maxWidth: 'calc(100vw - 24px)',
          maxHeight: 'calc(100vh - 24px)',
          overflowY: 'auto',
          padding: '16px 18px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-card, #141b29)',
          color: 'var(--text-primary, #f1f5f9)',
          border: '1px solid var(--border-medium, rgba(255,255,255,0.16))',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.55)',
          zIndex: 3001,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11.5px', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted, #64748b)' }}>
            Step {index + 1} of {steps.length}
          </span>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '2px 8px', fontSize: '11.5px' }}
            onClick={handleClose}
          >
            Skip tour
          </button>
        </div>

        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {step.title}
        </div>

        <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.5, color: 'var(--text-secondary, #94a3b8)', whiteSpace: 'pre-line' }}>
          {step.body}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '4px' }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ visibility: index > 0 ? 'visible' : 'hidden', fontSize: '12.5px' }}
            onClick={back}
          >
            Back
          </button>
          <button
            ref={nextRef}
            type="button"
            className="btn btn-primary"
            onClick={next}
            style={{ fontSize: '13px', fontWeight: 600 }}
          >
            {last ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
