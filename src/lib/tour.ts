/** The guided tour: short, dismissable walkthroughs for the Deck Catalog and Practice Arena. */
export interface TourStep {
  id: string;
  /** Values of the `data-tour` attribute of the elements to spotlight together (empty: a centered note). */
  anchors: string[];
  title: string;
  body: string;
}

export const CATALOG_TOUR_STEPS: TourStep[] = [
  {
    id: 'action-hero',
    anchors: ['action-hero'],
    title: '1. Your Practice Hub',
    body: 'This is your daily command center. Track your 24-hour momentum: cards attempted, promoted to higher tiers, or demoted for review. When you are ready to drill, the Resume Practice Arena button jumps directly into your spaced repetition queue.',
  },
  {
    id: 'catalog-table',
    anchors: ['catalog-table'],
    title: '2. Cards & Spaced Repetition',
    body: 'Every coding challenge here is an active flashcard governed by a spaced repetition system. When you solve a card correctly, it gets promoted to higher tiers (Boxes 1 to 9) and appears less frequently over time. When you miss a card, it is demoted for prompt review. Advanced cards unlock progressively as you pass foundational ones, but you can always manually lock or unlock any card using the lock icon.',
  },
  {
    id: 'deck-selector',
    anchors: ['deck-selector'],
    title: '3. Study Decks & Preset Curricula',
    body: 'The trainer comes pre-loaded with focused preset decks (like Frontend Specialist, React Architect, or Algorithm Fundamentals), and lets you build your own custom decks. If a card does not fit your current study goals, you can remove it from your active deck at any time using the remove button on the far right of any row, or directly from the practice arena.',
  },
  {
    id: 'interview-strategy',
    anchors: ['interview-strategy'],
    title: '4. AI Interview Strategy & Privacy',
    body: 'We strongly recommend adding an AI key in Settings; it unlocks powerful coaching features across the app. With Interview Strategy, enter your target company and position, and paste in any job descriptions, recruiter notes, or interview details you have. The coach researches expected technical questions, constructs a tailored custom deck, and flags external study resources for topics outside our catalog.\n\nYour Privacy Matters: Your API keys and personal notes remain stored strictly in your browser\'s local storage. All AI requests communicate directly with your chosen provider API. No user data is ever collected or tracked by the creator of Leitner Coding.',
  },
  {
    id: 'catalog-filters',
    anchors: ['catalog-filters'],
    title: '5. Inspecting the Library',
    body: 'Use the category pills and search bar to explore cards by track, difficulty, or mastery tier. Important note: filtering here only changes what you see on this page for browsing; it does not alter what you study. To change the cards served during practice, select or build a custom deck.',
  },
  {
    id: 'focus',
    anchors: ['focus'],
    title: '6. Focus Mode',
    body: 'Want to narrow your focus for a specific study session without building a whole new deck? Click Focus to temporarily restrict your active deck to specific tracks, tags, or difficulty levels while staying on your current deck.',
  },
  {
    id: 'deck-nav',
    anchors: ['deck-nav'],
    title: '7. Switch Views Anytime',
    body: 'Use these tabs to switch between the Deck Catalog and the Practice Arena. The first time you launch the Practice Arena, a brief tour will show you the editor, contract assertions, and evaluation flow.',
  },
];

export const ARENA_TOUR_STEPS: TourStep[] = [
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
    id: 'settings',
    anchors: ['settings'],
    title: '5. Settings & AI Reviews',
    body: 'Add an AI key in Settings for written critiques, back up or export your progress, change the theme, and review keyboard shortcuts. You can replay either tour at any time from About.',
  },
];

export const TOUR_STEPS: TourStep[] = CATALOG_TOUR_STEPS;

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
