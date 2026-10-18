# Delegation brief: tasks any assistant can pick up

Read `ARCHITECTURE_AND_ROADMAP.md` first (system map, card pipeline, gotchas). This file lists **self-contained tasks with acceptance
criteria**, plus the rules every contributor follows. Tasks marked **[owner decision]** need the owner's approval before coding.

## Rules (non-negotiable)
1. **Never bulk-generate test cases.** Every case is hand-written with a concrete input and a concrete expected value. Do not run or recreate any fixture generator.
2. Work on a **branch** (`feature/...` or `cleanup/...`), commit small batches (2-3 cards or one feature), **push the branch, do not merge to `master`** (pushing `master` deploys the site).
3. Before every commit all of these must pass: `npm run build:cards` (after card changes, then `GROQ_API_KEY=unused node scripts/enrich-complexities.mjs`), `npx tsc -b`, `npm run lint`,
   `npm test`, and `npx playwright test -g "<ids you touched>"` (real Chromium; run `npx vite build` first). For UI work also run `npx playwright test e2e/navigation.spec.ts`.
4. New card = files in `scripts/cards/<id>.{meta.json,prompt.txt,ref.js,harness.js}` + cases in `scripts/testcases/partN.mjs` **imported and spread in `scripts/testcases/newcards.mjs`** +
   an entry in `scripts/difficulty.json`. Harness labels must equal the case descriptions. Every card needs **at least 4 documented cases** (enforced by a test).
5. New or changed **cards must survive the mutation check**: `VITE_MUT_ONLY='^(id1|id2)$' npm run mutation`, then read `/tmp/mutation-report.jsonl`. Survivors are either equivalent
   mutants (explain why in the commit message) or missing cases (add them by hand). Target: no logic-operator survivors on new cards.
6. Harnesses must not assume a clean page (other dialogs, `body` scroll lock, `window.matchMedia`, `localStorage`): measure ambient state first, restore what you patch (`try/finally`).
   React harnesses that read effect- or hover-driven state need `await wait(30)` (production React has no `act`).
7. Update the counts and the relevant roadmap rows in `ARCHITECTURE_AND_ROADMAP.md` in the same commit. No absolute `file:///` links in docs.
8. Do not edit `src/data/topics.json` by hand (it is generated).

## Good to delegate (well-specified, verifiable by the gates above)
| # | Task | Notes / acceptance |
|---|---|---|
| A | **React preview window** (spec in roadmap §7.3) | Opt-in, React cards only, sandboxed iframe, debounced re-render, console/errors panel, never blocks the editor. Acceptance: Playwright test renders a trivial component; an infinite loop inside the preview does not freeze the page. Largest task; best for a long Gemini session. |
| B | **Accessibility cards** (batches of 3) | `aria-live` announcer, focus-trap utility, roving-tabindex hook, skip link / focus after route change, accessible combobox (d5). DOM harness style like `tooltip` / `dropdown-menu`. |
| C | **DOM/browser API cards** (batches of 3) | keyboard-accessible drag-sortable list, `history.pushState` router, clipboard copy button, keyboard shortcut manager (chords), `MutationObserver`/`ResizeObserver` wrappers, `requestAnimationFrame` loop. Mock browser APIs inside the harness and restore them. |
| D | **Remaining "build this" screens** | popover with positioning logic, stepper/progress steps, lazy image (IntersectionObserver), copy button, kanban board, nested comments. |
| E | **Ladder-hole starter cards** | 10 concepts start at difficulty 3+ (see roadmap §7.1: `carousel`, `dual-list`, `history-state`, `notifications`, `optimistic-ui`, `state-management`, `testing-tools`, `tree-ui`, `virtualization`, `game-board`). One easy (d1/d2) card each, same `concept` string. |
| F | **Survivor triage** | Work through `scripts/mutation-baseline.jsonl` (worst first: typeahead-autocomplete, fake-timers, mini-expect, test-runner-lifecycle, graph-word-ladder, tabs-accordion-compound). For each survivor decide: equivalent, or add a hand-written case. Re-run the mutation check on the card and update the baseline file. |
| G | **Five cards the mutation run could not finish** | `iterable-range-class`, `matrix-basics`, `promise-all-by-hand`, `simple-stringify`, `trie-nested-object`: find which mutant crashes the worker (memory/infinite loop), make the harness or runner robust, then run the check. |
| H | **Staged unlocks respect the user's Focus** | In `src/lib/leitner.ts` `checkStagedUnlocks(topics, stage, isAllowed)`: pass the Focus filter as part of `isAllowed` (packs already do). Unit tests in `src/lib/ladder.test.ts` / `practiceFilter.test.ts`. |
| I | **"Front-end interview" Focus preset** | Ship a default preset (include `js-language`, `async-*`, `react*`, `dom-browser`, `typescript-patterns`, core algorithms; exclude the optional pack). Needs a small UI affordance in the Focus modal. |
| J | **Stats view** | Add a capped review-history log to deck state (`{cardId, ts, passed, ms}[]`), then a view with per-track/concept accuracy, weak spots, streaks. Include backup import/export + migration for decks without history. |
| K | **README refresh** | Commands (`e2e`, `mutation`, `build:cards`), features (Focus, packs, Back button, welcome), screenshots optional. |
| L | **Run `e2e` on `master` before deploy** | Add the Playwright job as a `needs:` of the Pages deploy workflow (`.github/workflows/`), keep it ~5 min; upload the report on failure. |

## Keep for the owner / a reasoning-heavy session
- **Difficulty audit**: judging whether a card's 1-5 label is right (needs to read prompt + reference; propose changes, owner approves).
- **Track / concept consolidation**: done (9 tracks, one track per concept; see roadmap §2 and `src/lib/tracks.test.ts`). New cards must go into one of the 9 tracks and reuse the concept already living there.
- **Reviewing delegated work**: read each branch diff against the rules above (case quality, "can a correct solution behave differently here?", harness assumptions), then merge.
- **Scheduler / unlock design changes**, and anything that changes how existing users' saved decks are interpreted (`mergeStoredWithSeed`, backup format).

## Parked by the owner
D3 cards (not standard interview material), CSS layout cards (use Flexbox Froggy / Grid Garden), Tailwind (maybe later).
