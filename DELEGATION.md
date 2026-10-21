# Delegation brief: tasks any assistant can pick up

Read `ARCHITECTURE_AND_ROADMAP.md` first (system map, card pipeline, gotchas). This file lists **self-contained tasks with acceptance
criteria**, plus the rules every contributor follows. Tasks marked **[owner decision]** need the owner's approval before coding.

## Current state (keep this block up to date in the same commit as any change it describes)
- `master` = the deployed app. **271 cards** (218 in the default deck + 53 in the optional "algorithms-advanced" pack), **1,934 documented cases**, 1,108 unit tests, 589 browser tests (2 per card + 12 navigation/shortcut tests + 10 preview tests + 4 answer-flow tests + 6 guided-tour tests + 2 catalog-hint tests + 4 backup advisory tests + 1 stats-view test + 4 starter-buffer tests + 1 key-warning test + 3 activity tests). A push to `master` deploys, and the deploy waits for the browser suite (`.github/workflows/deploy.yml`, job `e2e`).
- First-4-problems backup advisory & export spotlight feature: alerts users after 4 completed problems (scored reviews, excluding unscored reinforcement repeats) to export their `localStorage` state to JSON, with spotlight pulse & callout bubble on the Deck Catalog export button. Verified by unit tests (`src/lib/backupAdvisory.test.ts`) and Playwright E2E (`e2e/backup-advisory.spec.ts`).
- Quick Add Topic (AI card creation) is **parked and hidden** (`FEATURES.quickAdd` in `src/lib/features.ts`). See task M. Do not re-enable it without the verification work.
- The React preview window and preview files are **built** on `feature/react-preview` (task A: sandboxed iframe, pop-out window with live sync, `previewCode` plumbing, guard unit test, e2e tests; task A2: all 44 React component cards have authored `.preview.js` files, passing all guard tests).
- Authoring pitfalls for Suspense / transitions / `use()` harnesses are in the roadmap, section 8. Read them before writing React 19 cards.

## Claim table (add your row in your first commit on a branch; remove it when the branch is merged)
| Task | Who | Branch | Status |
|---|---|---|---|


## How to pick up a task
1. `git fetch && git checkout master && git pull`, then read the roadmap, this file and the claim table above. Pick a task nobody has claimed.
2. Branch from `master` (`feature/<topic>`), add your row to the claim table, commit and push that first.
3. Work in small batches; every commit passes the gates in rule 3; push the branch after each batch.
4. When done, tell the owner the branch name and the gate results. **The owner merges**, then removes your claim row.

## Rules (non-negotiable)
1. **Never bulk-generate test cases.** Every case is hand-written with a concrete input and a concrete expected value. Do not run or recreate any fixture generator (`generate_all_fixtures.cjs` corrupts cards).
2. Work on a **branch** (`feature/...` or `cleanup/...`), commit small batches (2-3 cards or one feature), **push the branch, do not merge to `master`** (pushing `master` deploys the site).
3. Before every commit all of these must pass: `npm run build:cards` (after card changes, then `GROQ_API_KEY=unused node scripts/enrich-complexities.mjs`), `npx tsc -b`, `npm run lint`,
   `npm test`, and `npx playwright test -g "<ids you touched>"` (real Chromium; run `npx vite build` first). For UI work also run `npx playwright test e2e/navigation.spec.ts e2e/shortcuts.spec.ts`.
4. New card = files in `scripts/cards/<id>.{meta.json,prompt.txt,ref.js}` (+ `harness.js` for React/DOM/async cards; pure-function cards get their harness built from the cases) + cases in `scripts/testcases/partN.mjs` **imported and spread in `scripts/testcases/newcards.mjs`** +
   an entry in `scripts/difficulty.json`. Harness labels must equal the case descriptions. Every card needs **at least 4 documented cases** (enforced by a test).
5. New or changed **cards must survive the mutation check**: `VITE_MUT_ONLY='^(id1|id2)$' npm run mutation`, then read `/tmp/mutation-report.jsonl`. Survivors are either equivalent
   mutants (explain why in the commit message) or missing cases (add them by hand). Target: no logic-operator survivors on new cards.
6. Harnesses must not assume a clean page (other dialogs, `body` scroll lock, `window.matchMedia`, `localStorage`): measure ambient state first, restore what you patch (`try/finally`).
   React harnesses that read effect- or hover-driven state need `await wait(30)` (production React has no `act`). For Suspense, transitions and `use()` follow roadmap section 8
   (mount with `await act(async () => ...)`, poll with a `waitFor` instead of fixed sleeps, read only visible text, repeat the card 5 times in Chromium).
7. Update the counts and the relevant roadmap rows in `ARCHITECTURE_AND_ROADMAP.md` in the same commit. No absolute `file:///` links in docs.
8. Do not edit `src/data/topics.json` by hand (it is generated). To DELETE a card follow the checklist in roadmap section 7.4e (and add its id to `RETIRED_SEED_IDS`).
9. Rate difficulty with the rubric in roadmap section 7.4e and check the card is not a duplicate/subset of an existing one (same concept) before adding it. New cards go into one of the 9 tracks and reuse that track's existing concept.
10. **React component preview rendering**: For cards that author and render a React component UI (distinguishing them from custom hooks and pure logic), declare that it has a rendering box either by annotating `"rendersComponent": true` in `scripts/cards/<id>.meta.json`, adding its ID to `scripts/component-cards.json`, or providing a preview script `scripts/cards/<id>.preview.js`. Never use heuristic guessing. Pure-function, algorithm, and custom hook cards must NOT render a component box. See roadmap section 7.3 for preview file guidelines.
11. Keyboard shortcuts live in one table, `src/lib/shortcuts.ts`; change it together with the handlers in `PracticeArena.tsx` (roadmap section 7.8).

## Good to delegate (well-specified, verifiable by the gates above)
| # | Task | Notes / acceptance |
|---|---|---|
| B | **Accessibility cards** (batches of 2-3) | Done so far: `switch-toggle-a11y`, `live-announcer`, `roving-tabindex-toolbar`, `route-focus-and-skip-link`, `form-error-summary`. Remaining: focus-trap utility, accessible combobox (d5). DOM harness style like `tooltip` / `dropdown-menu`. |
| C | **DOM/browser API cards** (batches of 3) | **Batches 1 and 2 are being written by Hermes** (see the claim table): `keyboard-shortcut-matcher`, `cookie-parse-serialize`, `copy-to-clipboard` (batch 1, merged), then `lazy-load-observer` (IntersectionObserver), `drop-index-from-pointer`, `raf-throttle` (batch 2, merged), then `key-sequence-matcher` ("g then i"), `watch-added-elements` (MutationObserver) and `resize-breakpoints` (ResizeObserver) (batch 3, merged), then `focus-trap-keydown` and `mini-history-router` (batch 4, merged). Still open afterwards: accessible combobox, a Mutation/Resize-based "sticky header" style card, a DOM-level keyboard-accessible drag-sortable list (the pure logic is already covered by `drop-index-from-pointer`). Mock browser APIs inside the harness and restore them. |
| D | **Remaining "build this" screens** | popover with positioning logic, stepper/progress steps, kanban board, nested comments. (Copy button and lazy image are covered by C.) |
| F | **Survivor triage** | Work through `scripts/mutation-baseline.jsonl` (worst first: typeahead-autocomplete, fake-timers, mini-expect, test-runner-lifecycle, graph-word-ladder, tabs-accordion-compound). For each survivor decide: equivalent, or add a hand-written case. Re-run the mutation check on the card and update the baseline file. |
| G | **Five cards the mutation run could not finish** | `iterable-range-class`, `matrix-basics`, `promise-all-by-hand`, `simple-stringify`, `trie-nested-object`: find which mutant crashes the worker (memory/infinite loop), make the harness or runner robust, then run the check. |
| J | **Stats view** | Add a capped review-history log to deck state (`{cardId, ts, passed, ms}[]`), then a view with per-track/concept accuracy, weak spots, streaks. Include backup import/export + migration for decks without history. |
| K | **README refresh** | Commands (`e2e`, `mutation`, `build:cards`), features (Focus, packs, Back button, welcome, keyboard shortcut hints, staged unlocks respect Focus), note that Quick Add is parked. Screenshots optional. |

## Done (kept for reference, do not redo)
- **A, React preview window**: the feature (spec in roadmap section 7.3). Sandboxed iframe window (`sandbox="allow-scripts"`), pop-out window with live syncing and dock-back, `previewCode` plumbing in `build-cards.mjs`, guard unit test (`reactPreviewGuard.test.ts`), Playwright tests (`e2e/preview.spec.ts`), and 2 sample preview files (`switch-toggle-a11y.preview.js`, `star-rating-component.preview.js`).
- **A2, React preview files for all component cards**: 42 preview files created in `scripts/cards/*.preview.js` covering every component-rendering card in `react-components` and `react`, bundled via `build-cards.mjs`, validated by `reactPreviewGuard.test.ts` and Playwright `e2e/preview.spec.ts`.
- **E, ladder-hole starter cards**: 15 intro cards shipped; only `architecture` (the single d5 card) has no starter and stays a capstone.
- **H, staged unlocks respect the user's Focus**: `checkStagedUnlocks` receives the Focus + pack filter; unlock credit is only spent on cards that really unlock (`src/lib/unlockFocus.test.ts`).
- **L, run `e2e` before deploy**: required `e2e` job in `.github/workflows/deploy.yml`.
- **First-4-problems backup advisory & export spotlight**: modal advisory after 4 completed scored problems reminding users that progress lives in browser localStorage, plus 1-click navigation to the Deck Catalog spotlighting the Export Progress button with an amber pulse and dismissible callout bubble.
- Keyboard shortcut hints (tooltips, Settings list), React 19 cards (`use`, `useTransition`, `useActionState`), track consolidation, difficulty audit.

## Keep for the owner / a reasoning-heavy session
- **M, revive Quick Add Topic** [owner decision] **(LOW PRIORITY, owner decided to push all AI-generation work way back; do not start it)**: the AI writes both the answer and the tests, and nothing checked they agree. Design and a starting point are in roadmap section 7.7 and on branch `feature/quick-add-verified` (draft verifier + input/output-pair test builder, already tested). Needs the provider-call rework in `src/lib/ai.ts`, the verify-and-repair loop and a "use a stronger model for drafting" notice. Not for cheap models. The bigger version (whole AI-generated tracks, e.g. PostgreSQL) is evaluated in `AI_TRACK_GENERATION.md`; do not start it in parallel with the stats view (both change `LeitnerDeckState`).
- **Difficulty audit**: done once (2026-10, roadmap section 7.4e); repeat it per batch of new cards.
- **Reviewing delegated work**: read each branch diff against the rules above (case quality, "can a correct solution behave differently here?", harness assumptions), then merge.
- **Scheduler / unlock design changes**, and anything that changes how existing users' saved decks are interpreted (`mergeStoredWithSeed`, backup format).

## Parked or dropped by the owner
D3 cards (not standard interview material), CSS layout cards (use Flexbox Froggy / Grid Garden), Tailwind (maybe later). **Dropped:** a "Front-end interview" Focus preset (the whole app is front-end interview prep, and Focus already excludes the optional pack and any track in a couple of clicks).
