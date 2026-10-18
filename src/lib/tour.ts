/** The guided tour: a short, dismissable walkthrough of the practice screen. Offered from the welcome screen and from About. */
export interface TourStep {
  id: string;
  /** Values of the `data-tour` attribute of the elements to spotlight together (empty: a centered note). */
  anchors: string[];
  title: string;
  body: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'contract',
    anchors: ['problem', 'contract'],
    title: '1. Read the problem and its contract',
    body: 'The description says what to build. The table under it lists the exact calls and the output your code must produce: these are the checks your answer is graded on.',
  },
  {
    id: 'editor',
    anchors: ['editor'],
    title: '2. Solve it yourself',
    body: 'The editor starts nearly empty on purpose: no autocomplete, no hints. Working the pattern out unaided is what makes it stick.',
  },
  {
    id: 'actions',
    anchors: ['actions'],
    title: '3. Check, then submit',
    body: 'Run Code / Test checks your work as often as you like and never counts. Submit Final Answer is your one scored attempt. Skip Card moves on.',
  },
  {
    id: 'next',
    anchors: [],
    title: '4. One next step',
    body: 'After you submit there is exactly one button: continue, or, if you missed it, practice the pattern in a short unscored drill. Cards you miss come back sooner; cards you nail come back later.',
  },
  {
    id: 'deck',
    anchors: ['deck-nav'],
    title: '5. Practice Arena and Deck Catalog',
    body: 'Practice Arena is where you solve cards, one at a time. Deck Catalog lists every card with your progress, so you can browse and inspect the whole deck.',
  },
  {
    id: 'focus',
    anchors: ['focus'],
    title: '6. Focus: choose what you practice',
    body: 'Focus narrows what you are served: include or exclude tracks and tags (and difficulty) to match your next interview. This is how you shape what you learn. The filters in the Deck Catalog only change what you see there.',
  },
  {
    id: 'settings',
    anchors: ['settings'],
    title: '7. Settings',
    body: 'Add an AI key for written critiques, back up or export your progress, change the theme and review the keyboard shortcuts. You can replay this tour any time from About.',
  },
];

export const tourAnchorSelector = (anchor: string): string => `[data-tour="${anchor}"]`;

/** Keeps the steps with at least one anchor on the page (steps without anchors, the centered notes, are always kept). */
export function availableSteps(
  steps: TourStep[],
  exists: (selector: string) => boolean
): TourStep[] {
  return steps.filter((s) => s.anchors.length === 0 || s.anchors.some((a) => exists(tourAnchorSelector(a))));
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
