import { useEffect, useRef } from 'react';

/** Two Back presses within this window leave the app. */
export const DOUBLE_BACK_WINDOW_MS = 2000;

export type AppView = 'practice' | 'dashboard';

export type BackDecision = { exit: true } | { exit: false; hint: boolean };

/**
 * What a Back press should do.
 * - A second Back within the window leaves the app.
 * - Otherwise Back goes to the deck (dashboard) and stays in the app; when we were already on the deck we also hint
 *   that pressing Back again will leave.
 */
export function decideBack(view: AppView, lastBackAt: number | null, now: number, windowMs = DOUBLE_BACK_WINDOW_MS): BackDecision {
  if (lastBackAt !== null && now - lastBackAt < windowMs) return { exit: true };
  return { exit: false, hint: view === 'dashboard' };
}

interface BackState {
  lt?: 'root' | 'app';
}

/**
 * Makes the browser Back button behave like in a native app:
 *  - the history is [guard entry, app entry]; Back from the app entry lands on the guard, and we immediately push a
 *    fresh app entry so the user stays inside;
 *  - Back from a problem shows the deck; Back again within DOUBLE_BACK_WINDOW_MS leaves the app.
 * View switches inside the app do not touch the history.
 */
export function useBackNavigation(opts: { view: AppView; onShowDeck: () => void; onHint: () => void }): void {
  const viewRef = useRef(opts.view);
  const showDeckRef = useRef(opts.onShowDeck);
  const hintRef = useRef(opts.onHint);
  useEffect(() => {
    viewRef.current = opts.view;
    showDeckRef.current = opts.onShowDeck;
    hintRef.current = opts.onHint;
  });

  useEffect(() => {
    const state = window.history.state as BackState | null;
    if (state?.lt === 'app') {
      // already initialised (reload or React StrictMode re-run)
    } else if (state?.lt === 'root') {
      window.history.pushState({ lt: 'app' } satisfies BackState, '');
    } else {
      window.history.replaceState({ lt: 'root' } satisfies BackState, '');
      window.history.pushState({ lt: 'app' } satisfies BackState, '');
    }

    let lastBackAt: number | null = null;
    const onPopState = (e: PopStateEvent) => {
      if ((e.state as BackState | null)?.lt !== 'root') return; // forward onto our own entry: nothing to do
      const now = Date.now();
      const decision = decideBack(viewRef.current, lastBackAt, now);
      if (decision.exit) {
        window.removeEventListener('popstate', onPopState);
        window.history.back();
        return;
      }
      lastBackAt = now;
      window.history.pushState({ lt: 'app' } satisfies BackState, ''); // stay inside the app
      showDeckRef.current();
      if (decision.hint) hintRef.current();
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
}
