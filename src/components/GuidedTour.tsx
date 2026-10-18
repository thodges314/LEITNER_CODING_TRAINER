import React, { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { availableSteps, placeTooltip, TOUR_STEPS, tourAnchorSelector } from '../lib/tour';
import type { Box } from '../lib/tour';

interface GuidedTourProps {
  onClose: () => void;
}

const PAD = 6;
const TOOLTIP_WIDTH = 340;
const TOOLTIP_HEIGHT_ESTIMATE = 240; // generous, so the tooltip is always placed fully inside the viewport

/**
 * The spotlight rectangle covering all the anchors of a step that are on the page, as a short string (a stable value
 * for useSyncExternalStore), or '' if there is nothing to point at.
 */
function readBox(anchors: string[]): string {
  let top = Infinity;
  let left = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const anchor of anchors) {
    const el = document.querySelector(tourAnchorSelector(anchor));
    if (!el) continue;
    const r = el.getBoundingClientRect();
    top = Math.min(top, r.top);
    left = Math.min(left, r.left);
    right = Math.max(right, r.right);
    bottom = Math.max(bottom, r.bottom);
  }
  if (!Number.isFinite(top)) return '';
  return [top - PAD, left - PAD, right - left + PAD * 2, bottom - top + PAD * 2].map(Math.round).join('|');
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('resize', onChange);
  window.addEventListener('scroll', onChange, true);
  const poll = window.setInterval(onChange, 300); // catches layout shifts that fire no event (images, fonts, panels opening)
  return () => {
    window.removeEventListener('resize', onChange);
    window.removeEventListener('scroll', onChange, true);
    window.clearInterval(poll);
  };
}

function parseBox(value: string): Box | null {
  if (!value) return null;
  const [top, left, width, height] = value.split('|').map(Number);
  return { top, left, width, height };
}

/**
 * A dismissable spotlight tour. Mount it to start it, unmount it to end it. It only points at things that are on the
 * page (missing anchors are skipped), follows scrolling and resizing, and works with the keyboard (arrows, Escape).
 */
export const GuidedTour: React.FC<GuidedTourProps> = ({ onClose }) => {
  const [steps] = useState(() => availableSteps(TOUR_STEPS, (selector) => document.querySelector(selector) !== null));
  const [index, setIndex] = useState(0);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const step = steps[index];

  const boxValue = useSyncExternalStore(
    subscribe,
    () => readBox(step ? step.anchors : []),
    () => ''
  );
  const box = parseBox(boxValue);

  // Bring the target into view when the step changes.
  useLayoutEffect(() => {
    if (step) {
      const first = step.anchors.map((a) => document.querySelector(tourAnchorSelector(a))).find((el) => el !== null);
      first?.scrollIntoView({ block: 'center', behavior: 'auto' });
    }
  }, [step]);

  useEffect(() => {
    nextRef.current?.focus();
  }, [index]);

  const last = index >= steps.length - 1;
  const next = useCallback(() => {
    if (last) onClose();
    else setIndex((i) => i + 1);
  }, [last, onClose]);
  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
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
  }, [next, back, onClose]);

  if (!step) return null;

  const placement = placeTooltip(box, { width: TOOLTIP_WIDTH, height: TOOLTIP_HEIGHT_ESTIMATE }, { width: window.innerWidth, height: window.innerHeight });

  return createPortal(
    <div data-testid="guided-tour" style={{ position: 'fixed', inset: 0, zIndex: 3000 }}>
      {/* Blocks clicks on the page behind the tour. */}
      <div style={{ position: 'absolute', inset: 0 }} aria-hidden="true" />
      {box ? (
        <div
          data-testid="tour-spotlight"
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: box.top,
            left: box.left,
            width: box.width,
            height: box.height,
            borderRadius: '10px',
            border: '2px solid var(--accent-primary, #38bdf8)',
            boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.72)',
            pointerEvents: 'none',
            transition: 'top 0.18s ease, left 0.18s ease, width 0.18s ease, height 0.18s ease',
          }}
        />
      ) : (
        <div aria-hidden="true" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.72)', pointerEvents: 'none' }} />
      )}
      <div
        role="dialog"
        aria-label="Guided tour"
        aria-live="polite"
        style={{
          position: 'fixed',
          top: placement.top,
          left: placement.left,
          width: TOOLTIP_WIDTH,
          maxWidth: 'calc(100vw - 24px)',
          padding: '16px 18px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-card, #141b29)',
          color: 'var(--text-primary, #f1f5f9)',
          border: '1px solid var(--border-medium, rgba(255,255,255,0.16))',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.55)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ fontSize: '11.5px', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted, #64748b)' }}>
          Step {index + 1} of {steps.length}
        </div>
        <div style={{ fontSize: '16px', fontWeight: 700 }}>{step.title}</div>
        <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.5, color: 'var(--text-secondary, #94a3b8)' }}>{step.body}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '4px' }}>
          <button type="button" className="btn btn-outline" onClick={onClose} style={{ fontSize: '12.5px' }}>
            Skip tour
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            {index > 0 && (
              <button type="button" className="btn btn-outline" onClick={back} style={{ fontSize: '12.5px' }}>
                Back
              </button>
            )}
            <button ref={nextRef} type="button" className="btn btn-primary" onClick={next} style={{ fontSize: '13px', fontWeight: 600 }}>
              {last ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
