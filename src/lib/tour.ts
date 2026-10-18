/** The guided tour: a short, dismissable walkthrough of the practice screen. Offered from the welcome screen and from About. */
export interface TourStep {
  id: string;
  /** Value of the `data-tour` attribute of the element to spotlight, or null for a centered note. */
  anchor: string | null;
  title: string;
  body: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'contract',
    anchor: 'contract',
    title: '1. Read the contract',
    body: 'Every card shows the exact calls and the output your code must produce. Nothing is hidden: these are the checks your answer is graded on.',
  },
  {
    id: 'editor',
    anchor: 'editor',
    title: '2. Solve it yourself',
    body: 'The editor starts nearly empty on purpose: no autocomplete, no hints. Working the pattern out unaided is what makes it stick.',
  },
  {
    id: 'actions',
    anchor: 'actions',
    title: '3. Check, then submit',
    body: 'Run Code / Test checks your work as often as you like and never counts. Submit Final Answer is your one scored attempt. Skip Card moves on.',
  },
  {
    id: 'next',
    anchor: null,
    title: '4. One next step',
    body: 'After you submit there is exactly one button: continue, or, if you missed it, practice the pattern in a short unscored drill. Cards you miss come back sooner; cards you nail come back later.',
  },
  {
    id: 'header',
    anchor: 'header',
    title: '5. Everything else lives up here',
    body: 'Deck Catalog lists every card and your progress. Focus narrows practice to what your next interview needs. Settings holds your AI key, backup, and keyboard shortcuts. Replay this tour any time from About.',
  },
];

export const tourAnchorSelector = (anchor: string): string => `[data-tour="${anchor}"]`;

/** Keeps the steps whose anchor exists on the page (steps without an anchor are always kept). */
export function availableSteps(
  steps: TourStep[],
  exists: (selector: string) => boolean
): TourStep[] {
  return steps.filter((s) => s.anchor === null || exists(tourAnchorSelector(s.anchor)));
}

export interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface TooltipPlacement {
  top: number;
  left: number;
}

const GAP = 14;
const MARGIN = 12;

/**
 * Places the tooltip next to the spotlighted box: below it when there is room, otherwise above, otherwise
 * centered over it; always clamped inside the viewport. With no target it is centered on screen.
 */
export function placeTooltip(
  target: Box | null,
  tooltip: { width: number; height: number },
  viewport: { width: number; height: number }
): TooltipPlacement {
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, Math.max(lo, hi)));
  if (!target) {
    return {
      top: Math.max(MARGIN, (viewport.height - tooltip.height) / 2),
      left: Math.max(MARGIN, (viewport.width - tooltip.width) / 2),
    };
  }
  const left = clamp(target.left + target.width / 2 - tooltip.width / 2, MARGIN, viewport.width - tooltip.width - MARGIN);
  const below = target.top + target.height + GAP;
  const above = target.top - tooltip.height - GAP;
  let top: number;
  if (below + tooltip.height + MARGIN <= viewport.height) top = below;
  else if (above >= MARGIN) top = above;
  else top = clamp(viewport.height - tooltip.height - MARGIN, MARGIN, viewport.height); // overlap the lower part of a tall target
  return { top, left };
}
