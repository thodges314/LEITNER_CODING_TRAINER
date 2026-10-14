# Leitner Coding Trainer — Architecture and Roadmap

Audience: a future human or AI assistant picking this project up cold. Read this first, then `README.md`.
Last updated on branch `improvements/audit-fixes` (not yet merged to `master`; pushing `master` deploys GitHub Pages).

## 1. What this is

A personal, client-only spaced-repetition trainer for **front-end coding-interview building blocks**. You are shown a
prompt with no autocomplete, write the solution from memory in a textarea, run it against a hidden harness, and the card
moves between Leitner boxes based on pass/fail. Everything runs in the browser; state lives in `localStorage`.

- Stack: React 19, Vite, TypeScript (strict), Vitest (+ jsdom), ESLint. No backend.
- Owner use: personal. Quality bar: every card must have a *correct reference solution*, a *real harness*, and
  *explicit input/expected test cases* (the owner reads these to understand what "success" means).
- **Hard rule from the owner:** cards are authored by hand under `scripts/cards/` and `scripts/testcases/`. Never generate
  test cases with regexes or LLM bulk fixtures; the old `generate_all_fixtures.cjs` corrupted cards and was deleted.

## 2. Current state (snapshot)

| Item | Value |
|---|---|
| Cards | 100 (36 active at first run, 64 locked) |
| Documented test cases | 612 (each shown as input → expected in the UI) |
| Difficulty spread | d1: 14 · d2: 29 · d3: 36 · d4: 20 · d5: 1 |
| Tracks with cards | async-js, data-structures, react, algorithms, js-runtime-fundamentals, async-web-plumbing, collections-transformations, react-patterns, algorithmic-screens, typescript-patterns, js-language, dom-browser |
| Tracks defined but empty | `react-components`, `testing-tooling` |
| Automated tests | ~370 (Vitest). Every card's harness must pass with its reference solution **and fail with an empty solution** |
| Manual verification | All 66 original cards were run in the production build in a real browser. The ~34 cards added later pass in jsdom only (browser smoke test not re-run) |

## 3. Repository map

```
src/
  App.tsx                      app shell: deck state, view switch, header (Focus / Settings / Add Topic)
  components/
    PracticeArena.tsx          editor, Run Code, Submit, timer, console, draft autosave
    DeckDashboard.tsx          catalog table, filters, lock/unlock/reset/delete
    FocusModal.tsx             practice focus: include/exclude tracks+tags, difficulty range, presets
    DifficultyBadge.tsx        ●●●○○ label
    AddTopicModal.tsx, SettingsModal.tsx, EvaluationPanel.tsx
    practice/                  consoleFormat.ts (log -> pass/fail classification), starterSnippet.ts, ReactTestErrorBoundary.tsx
  lib/
    leitner.ts                 ALL scheduling/state logic (pure functions + localStorage persistence)
    runner.ts                  sandbox + harness execution (see §5)
    domTools.ts, mockFetch.ts  headless DOM test tools ($dom) and deterministic fetch mock
    harnessContracts.ts        extracts the "Target Contract" table shown for a card
    ai.ts                      optional AI evaluator (Gemini/OpenAI-compatible); advisory only
    drafts.ts                  per-card editor autosave (localStorage `leitner_draft:<id>`)
  utils/typeChecker.ts         lazy-loaded TS compiler + real ES2022 lib files for strict-mode checking
  data/topics.json             GENERATED seed deck (do not hand-edit; see §4)
scripts/
  build-cards.mjs              builds topics.json from the sources below   (npm run build:cards)
  difficulty.json              id -> { difficulty 1-5, concept }
  cards/<id>.{meta.json,prompt.txt,ref.js,harness.js,extra.js}
  testcases/part1-8.mjs, index.mjs   hand-written input/expected pairs
```

State keys in `localStorage`: `leitner_coding_deck` (deck + filter + presets), `leitner_draft:<cardId>`, AI settings keys
(see `ai.ts`). The API key is stored in plaintext in `localStorage` (acceptable for personal use, documented in Settings).

## 4. Card authoring pipeline

`npm run build:cards` regenerates `src/data/topics.json`. Per card id:

| File | Meaning |
|---|---|
| `<id>.meta.json` | `{ track, title, tags }`. For a **new** card this declares it; for an existing card it overrides fields |
| `<id>.prompt.txt` | the prompt shown to the learner (signatures, edge-case rules; must match the title and reference) |
| `<id>.ref.js` | reference solution (also becomes `starterCode`/`solution`; TS cards use TS syntax) |
| `<id>.harness.js` | optional hand-written harness (React/DOM cards). If absent, a harness is **generated from the test cases** |
| `<id>.extra.js` | extra assertions appended to a generated harness (e.g. `@ts-expect-error` compile-time checks) |
| `testcases/partN.mjs` | cases: `c(description, inputCode, expectedExpression, opts)`; `r(...)` documents DOM-harness scenarios |
| `difficulty.json` | difficulty + concept (build fails if a card has no entry) |

Rules that tests enforce (`seedCards.test.ts`, `testCases.test.ts`, `ladder.test.ts`):
1. Reference solution passes its own harness. 2. An empty solution does **not** pass. 3. Every documented case is asserted by the
harness under the **same label** (for hand-written harnesses the `r()` description must equal the `$test.check` label).
4. Every card has difficulty 1-5 and a concept. 5. Seed-active cards are bottom-rung and d ≤ 2.

Adding a card: create the files above, add cases to a `testcases/partN.mjs` registered in `newcards.mjs`, add a `difficulty.json`
entry, run `npm run build:cards && npm test`. New seed cards start locked at the end of the deck (existing users' progress is kept;
see `mergeStoredWithSeed`).

Case fields: `v:false` = "documentation only, asserted elsewhere"; `t:'TypeError'` = expect a throw matching the regex; `ev` = evaluate this
expression to produce the expected value instead of the display text `x`.

## 5. Execution model (runner)

`PracticeArena` -> `transpileForExecution` (lazy-loaded TypeScript, JS or TS mode) -> `runHarness(card, code, mode)`.
User code + harness are concatenated and run inside an `AsyncFunction` in the **page itself** (not an iframe/worker).

Injected globals: React hooks and `React`, `createContext`, `forwardRef`, `useImperativeHandle`, `useSyncExternalStore`,
`$dom` (render, renderHook, renderError, fire.click/change/keyDown/submit/focus/event, q, qa, wait, flush, act, intersect),
`$test` (check, equal, run, rejects, logs, sleep), `MockIntersectionObserver`, and a mocked `fetch` for the jsonplaceholder URLs.
Helpers are `$`-prefixed so they cannot collide with user declarations. Do **not** add common bare words (`memo`, `render`) as
injected parameters: a user `const memo = ...` would throw "already declared".

Console classification (`consoleFormat.ts`): only assertion lines containing the word `FAIL`, compile errors and uncaught
exceptions count as failures. `console.error` is neutral output.

Gotchas learned the hard way:
- Production React has no `act`; `domTools.ts` falls back to `flushSync` + settling (`fallbackAct`).
- Built-in prototypes patched by a solution (polyfill cards) are snapshotted and restored after each run.
- Strict TS uses TypeScript's real `lib.es2022.d.ts` (bundled with `import.meta.glob(...?raw)` into the lazy chunk, ~4 MB);
  DOM types are intentionally replaced by a small `SANDBOX_GLOBALS` declaration.
- A synchronous infinite loop freezes the tab (no timeout is possible in-page). Drafts are autosaved so nothing is lost.

## 6. Scheduling model (all in `leitner.ts`)

- **Boxes 1-5**, intervals in *trials* (completed reviews), not time: `BOX_INTERVALS = {1:1, 2:4, 3:10, 4:22, 5:45}`.
  Pass: box+1, streak+1, `nextEligibleTrial = reviews + interval(box)`. Fail: box 1, streak 0, eligible next trial.
- **getNextCard**: candidates = active cards matching the practice filter, excluding the current card; eligible =
  `nextEligibleTrial <= reviews`; prefer a different track than the last one; sort by **box asc, then difficulty asc**, then earliest
  eligibility, then streak.
- **Staged unlocks**: every 4 active cards in box ≥ 3 unlocks 4 more. They are chosen **easiest-first**, and only if the card's
  *ladder is open*.
- **Difficulty ladder**: `difficulty` 1 Warm-up · 2 Basic · 3 Intermediate · 4 Advanced · 5 Expert. Cards that share a `concept`
  (e.g. `rate-limiting`, `promise`, `lru`) form a ladder. A locked card is unlock-eligible only when every *easier* card of the same
  concept is active and in box ≥ 2 (`isLadderOpen`, `LADDER_PASS_BOX`). Custom cards without a concept are never gated.
  Manual unlock from the catalog bypasses the ladder on purpose.
- **Practice focus** (`PracticeFilter`): include/exclude tracks and tags (excludes win; empty include = all) plus an inclusive
  difficulty range. Only matching active cards are scheduled; others keep their state. Stored in the deck state, included in
  backup export/import, with named presets. Gap: staged unlocks ignore the focus.
- **Merge on load** (`mergeStoredWithSeed`): progress (box, streak, schedule, status) comes from the stored deck; content fields
  (`track,title,tags,difficulty,concept,promptSeed,starterCode,testHarness,solution,referenceSolution,testCases`) are refreshed from
  the seed so edits to cards take effect; new seed cards are appended locked; seed cards the user deleted stay deleted
  (`deletedSeedIds`). Note: a card whose contract changed keeps its old box; reset it manually if you want a fresh start.

## 7. Roadmap

### 7.1 Difficulty ladder holes (highest value: the owner wants "simple first, then harder" on every topic)
Concepts whose lowest rung is still ≥ 3 (so the topic opens at intermediate level): `event-loop`, `promise-combinators`,
`compound`, `resilience`, `react-perf`, `state-management`, `a11y-components`, `typeahead`, `infinite-scroll`, `middleware`,
`iterators`, `serialization`, `ts-types`, `ts-unions`, `ts-generics`. Add d1/d2 cards, e.g.:
event-loop output-ordering quiz as a function; `Promise.all` by hand from loops; static `Tabs` without ARIA; a minimal
`ErrorBoundary`; `useCounter` + `React.memo` basics; `useSyncExternalStore` read-only subscription; `Object.entries` serializers;
basic utility types (`Partial`, `Pick` re-implemented); simple discriminated union `switch`; identity generic `<T>`.
Also only one d5 card exists; add a few expert cards per core area (e.g. Promise/A+ edge cases, virtualized list with variable
heights, reconciler diffing).

### 7.2 Missing card families (from the interview-coverage audit)
- **CSS/layout** (none): centering, flex/grid layouts, specificity (a pure-JS specificity card exists), responsive/sticky. Hard to
  auto-grade in jsdom (no layout engine); consider Playwright-based visual harnesses or "write CSS that satisfies computed-style assertions".
- **React components**: star rating, countdown/stopwatch, data table (sort/filter/paginate), file-explorer tree, virtualized list,
  dropdown menu with roving focus, undo/redo hook, form-state hook, multi-step form, toast queue, optimistic like button,
  drag-sortable list, carousel. (Specs for ~14 of these were drafted; none built yet — the `react-components` track is empty.)
- **Algorithms**: linked lists (reverse, cycle), min-stack / queue-from-stacks, BST (validate, invert, LCA), grid DFS (islands), trie,
  heap/top-K, DP basics (stairs, coin change), backtracking (permutations, subsets, parentheses), sorting implementations,
  matrix rotate/spiral, string basics (anagram, palindrome, longest common prefix), binary-search variants.
- **TypeScript**: conditional types with `infer` (`ReturnType`, `Awaited`), template-literal types, overloads, branded types,
  `satisfies`/`as const`, assertion functions, typed reducer/context.
- **Testing & libraries** (`testing-tooling` track): implement `jest.fn`/spy, fake timers, a tiny `expect`; D3-flavoured pure logic
  (`scaleLinear`, band scale, SVG path generator); Next.js-flavoured pure logic (file-based route matching with `[id]`/`[...slug]`).
- **Modern React 19** (`use`, `useOptimistic`, `useActionState`, `useTransition`): needs sandbox globals and async-transition-safe `act`.

### 7.3 Product features
1. **Stats view**: per-track/concept accuracy, weak spots, streaks, time-to-solve (needs a review-history log: add
   `history: {cardId, ts, passed, ms}[]` to deck state, capped).
2. **Staged unlocks that respect the practice focus** (and a "session mode": N cards drawn only from the focus).
3. **Sandboxed execution**: run harnesses in a sandboxed iframe or Worker with a watchdog timeout so `while(true)` cannot freeze the
   tab. DOM harnesses need a document, so use an iframe (`srcdoc`, `sandbox="allow-scripts"`) and `postMessage` the logs back.
4. **Duplicate cards**: ~12 near-duplicates (debounce ×3, throttle ×2, deep-clone ×2, LRU ×2, useFetch ×2, useDebounce ×2, infinite scroll ×2,
   merge-intervals ×2). Decision pending: keep as spaced-repetition variants but tag them (`variant-of`), or merge.
5. **Difficulty in the catalog**: sort/filter by difficulty and concept; show the ladder (which rung unlocks next and why a card is locked).
6. Optional: per-card hints that reveal the reference solution progressively; export/import of drafts.

### 7.4 Engineering / quality
- **Browser smoke test in CI** (Playwright against `vite preview`): for each card run reference + harness via "Run Code" and assert pass;
  also assert an empty buffer fails. This is the repeatable version of the manual loop used before.
- **Timing tests**: several hook harnesses use 15-60 ms margins with real timers (`useDebounce`, `useThrottle`, `useInterval`,
  countdown-style cards). Widen margins (≈ 60-100 ms), add one retry, or switch those harnesses to fake timers.
- Bundle: main chunk ≈ 0.65 MB; lazy TypeScript chunk ≈ 4.1 MB (acceptable for personal use; `chunkSizeWarningLimit` raised).
- AI evaluator (`ai.ts`) was only exercised offline (heuristic, harness-aware). The live Gemini/OpenAI call path (key sent in a header) is
  untested against real APIs; default model names may be stale.
- Consider moving seed-deck merge/migration into a versioned schema (`deckVersion`) before the next breaking change.

### 7.5 Suggested next steps (in order)
1. Fill ladder holes (§7.1) so every concept starts at d1/d2. 2. Build the `react-components` cards. 3. Playwright smoke test + wider timing margins.
4. Stats/history. 5. Algorithms and TypeScript families. 6. Sandboxed execution.

## 8. Conventions and pitfalls for assistants

- Never run or recreate a bulk fixture generator. Write cases by hand: concrete input and concrete expected value.
- After touching cards: `npm run build:cards && npm test && npm run lint && npx tsc -b`. Then (ideally) smoke-test in the browser.
- Do not edit `src/data/topics.json` directly; it is overwritten by `build:cards`.
- Test files that need `localStorage`/DOM start with `// @vitest-environment jsdom` (default environment is `node`).
- `scripts/cards/**` is excluded from ESLint (the files are sandbox snippets, not modules).
- Keep titles, prompts, and reference solutions consistent (a past audit found cards whose titles promised functions the prompt never asked for).
- Work on a branch; do not merge or push `master` unless asked.
