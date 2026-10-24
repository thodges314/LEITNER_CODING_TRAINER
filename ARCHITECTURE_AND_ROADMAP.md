# Leitner Coding Trainer — Architecture and Roadmap

Audience: a future human or AI assistant picking this project up cold. Read this first, then `README.md`.
Pushing `master` deploys GitHub Pages. Work happens on branches; `npm run e2e` (real Chromium) is the pre-merge gate in addition to `npm test`.

## 1. What this is

A personal, client-only spaced-repetition trainer for **front-end coding-interview building blocks**. You are shown a
prompt with strictly no autocomplete or IntelliSense, write the solution from memory in a **CodeMirror 6** cold-start buffer
(with rainbow bracket pair colorization, autoclosing brackets/quotes, and in-browser Prettier formatting), run it against
a hidden harness, and the card moves through spaced-retrieval boxes or graduated tiers based on pass/fail. Everything runs
in the browser; state lives in `localStorage`.

- Stack: React 19, Vite, TypeScript (strict), CodeMirror 6, Vitest (+ jsdom), ESLint. No backend.
- Scheduling: Choice of **Classic Leitner Boxes** (5 boxes) or **Graduated Interval Recall & Chaining** (7 tiers with micro-spaced chaining and half-tier setbacks).
- Owner use: personal. Quality bar: every card must have a *correct reference solution*, a *real harness*, and
  *explicit input/expected test cases* (the owner reads these to understand what "success" means).
- **Card authoring pipeline & verification:** Cards are primarily AI-authored across structured batch pipelines into `scripts/cards/` and `scripts/testcases/`. Rather than unverified generative scrapers, every card must strictly satisfy quality gates: an explicit test harness, concrete input/expected test cases, a passing reference solution, failure on empty solution, label parity, and mutation test verification. Never generate test cases with unverified regexes or loose LLM bulk fixtures; the old `generate_all_fixtures.cjs` corrupted cards and was deleted.

## 2. Current state (snapshot)

| Item | Value |
|---|---|
| Cards | 271 total = **218 default + 53 in the optional `algorithms-advanced` pack** (89 default cards active at first run) |
| Documented test cases | 1934 (each shown as input → expected in the UI) |
| Markdown formatting | **100% complete** across all 271 cards (Batches 1–23 merged into `master`) with structured descriptions, parameters, returns, constraints, and edge cases |
| Difficulty spread | all 271: d1 36 · d2 91 · d3 105 · d4 37 · d5 2; default 218: d1 33 · d2 78 · d3 79 · d4 26 · d5 2 |
| Tracks (default deck / total) | algorithms 47/80, js-utilities 34, react-components 31, js-language 25, react 23, async-js 22, typescript-patterns 14, dom-browser 9, testing-tooling 4. 9 tracks, **every concept (difficulty ladder) lives in exactly one track** (enforced by `src/lib/tracks.test.ts`). Retired track ids (`react-patterns`, `async-web-plumbing`, `js-runtime-fundamentals`, `collections-transformations`, `data-structures`, `algorithmic-screens`) are mapped by `TRACK_ALIASES` in `leitner.ts` for saved Focus filters/presets, custom cards and imported backups |
| Tracks defined but empty | *(none)* |
| Complexity metadata | `targetTime`, `targetSpace`, `complexityExplanation` exist only on algorithm-style cards: track `algorithms`, plus the `collections`, `flatten`, `array-polyfills`, `equality-clone` and `lru` concepts of `js-utilities` (see `wantsComplexity` in `scripts/enrich-complexities.mjs`); UI, hook, TS and language cards intentionally have none and the UI hides the complexity badges for them (see §4) |
| Automated tests | 1,490 Vitest tests (jsdom/node): every card's harness must pass with its reference solution **and fail with an empty solution**, plus preview guard tests mounting reference solutions, scheduling, packs, ladder, drafts, focus, formatter and runner tests. Timing-based harnesses can flake when the machine is heavily loaded (e.g. while the browser suite runs); run `npm test` on an idle machine |
| Browser verification | `npm run e2e` runs ALL 271 cards in real Chromium against the production build (reference solution PASSES, empty solution FAILS; 542 card tests + 12 navigation/shortcut tests + 10 preview tests + 4 answer-flow tests + 6 guided-tour tests + 2 catalog-hint tests + 4 backup advisory tests + 1 stats-view test + 4 starter-buffer tests + 1 key-warning test + 3 activity tests = 589 browser tests, ~6 min on an idle machine with 4 workers). **Last full run: 589 passed, 0 flaky, 0 failed.** See §7.4a. Re-run after changing cards, the runner or `domTools` |

## 3. Repository map

```
src/
  App.tsx                      app shell: deck state, view switch, header (Focus / Settings / Add Topic)
  components/
    PracticeArena.tsx          CodeMirror 6 buffer, Run Code, Submit, timer, console, Prettier format, draft autosave
    DeckDashboard.tsx          catalog table, filters, lock/unlock/reset/delete, tier/box badges
    FocusModal.tsx             practice focus: include/exclude tracks+tags, difficulty range, presets
    DifficultyBadge.tsx        ●●●○○ label
    AddTopicModal.tsx, SettingsModal.tsx, EvaluationPanel.tsx
    practice/                  consoleFormat.ts (log -> pass/fail classification), starterSnippet.ts, ReactTestErrorBoundary.tsx
  lib/
    leitner.ts                 ALL scheduling/state logic (Leitner + Graduated Interval Recall, localStorage persistence)
    leitner.test.ts            unit tests for Leitner & Graduated Interval algorithms
    formatter.ts               in-browser Prettier standalone formatting for JS/TS/JSX
    formatter.test.ts          unit tests for formatting and syntax error resilience
    runner.ts                  sandbox + harness execution (see §5)
    domTools.ts, mockFetch.ts  headless DOM test tools ($dom) and deterministic fetch mock
    harnessContracts.ts        extracts the "Target Contract" table shown for a card; `sanitizeCallSignature` only turns `\n` into line breaks OUTSIDE string literals
    ai.ts                      optional AI evaluator (Gemini/OpenAI-compatible; replies are validated by `parseEvaluationPayload`, unparseable ones are shown raw via `rawOutput`): the tests decide whether code works; the AI can fail a passing run (shown as a note, overridable) but never rescue a failing one
    drafts.ts                  per-card editor autosave (localStorage `leitner_draft:<id>`)
  types/
    rainbowbrackets.d.ts       type declarations for rainbowbrackets extension
  utils/typeChecker.ts         lazy-loaded TS compiler + real ES2022 lib files for strict-mode checking
  data/topics.json             GENERATED seed deck (do not hand-edit; see §4)
scripts/
  build-cards.mjs              builds topics.json from the sources below   (npm run build:cards; `npm run check:cards` = read-only staleness check, exits 1 if topics.json is out of date)
  difficulty.json              id -> { difficulty 1-5, concept }
  cards/<id>.{meta.json,prompt.txt,ref.js,harness.js,extra.js}
  testcases/part1-8.mjs, index.mjs   hand-written input/expected pairs
```

State keys in `localStorage`: `leitner_coding_deck` (deck + filter + presets + algorithm preference; **stored slim**: built-in cards keep only their progress and small metadata, because `slimForStorage` in `leitner.ts` strips `HEAVY_SEED_FIELDS` and `mergeStoredWithSeed` refills them from the bundled deck on load; custom cards are stored in full; a stored card that is gone from the bundled deck and has no content is dropped), `leitner_draft:<cardId>`, AI settings keys
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

**Complexity metadata (second pipeline step, not part of `build:cards`).** `targetTime`, `targetSpace` and `complexityExplanation` are stored
on each card in `topics.json` and shown in the UI as the target complexity. They come from `scripts/complexity-cache.json` (id → fields),
applied by `scripts/enrich-complexities.mjs`, which asks a cheap model (Groq `openai/gpt-oss-120b`, key via `GROQ_API_KEY`/`OPENAI_API_KEY`) only for
cards missing from the cache, then merges the cache into `topics.json`. Cached cards need no network (`GROQ_API_KEY=unused` works). Batch-13 entries
were written by hand into the cache. **Checklist after adding cards:** `npm run build:cards` → add cache entries (or run the enrich script with a key)
→ `node scripts/enrich-complexities.mjs` → `npm test`. A card with no cache entry has no complexity fields. `enrich-complexities.mjs` only applies/generates them for `COMPLEXITY_TRACKS` (algorithm-style cards), strips them from every other card, and normalises notation to lowercase `n`.

Adding a card: create the files above, add cases to a `testcases/partN.mjs` registered in `newcards.mjs`, add a `difficulty.json`
entry, run `npm run build:cards && npm test`. New seed cards start locked at the end of the deck (existing users' progress is kept;
see `mergeStoredWithSeed`).

Case fields: `v:false` = "documentation only, asserted elsewhere"; `t:'TypeError'` = expect a throw matching the regex; `ev` = evaluate this
expression to produce the expected value instead of the display text `x`.

## 5. Execution model and code editor

### 5.1 Cold-start editor & aesthetics (`PracticeArena.tsx`)
- Replaces raw textareas with **CodeMirror 6** (`@uiw/react-codemirror` and `@codemirror/lang-javascript`).
- **Autocompletion & IntelliSense strictly disabled**: `basicSetup={{ autocompletion: false, completionKeymap: false }}`. No autocomplete popups or suggestions appear, strictly honoring the "cold-start interview recall" training philosophy.
- **Autoclosing brackets & quotes**: Parentheses `()`, brackets `[]`, braces `{}`, and quotes (`""`, `''`, `` ` ``) auto-close upon typing, with jump-over on closing characters and balanced pair deletion on backspace (`closeBrackets`, `closeBracketsKeymap`).
- **Rainbow bracket pair colorization (Path B)**: Integrated via `rainbowbrackets` with tailored neon/pastel dark-mode palette (`#f43f5e`, `#fb923c`, `#facc15`, `#4ade80`, `#38bdf8`, `#818cf8`, `#c084fc`) in `src/index.css`.
- **In-browser code formatting (`src/lib/formatter.ts`)**: Prettier standalone (`prettier/standalone` with `@prettier/plugins/babel`, `estree`, and `typescript`) runs 100% in-browser with zero backend dependencies. Format triggered via UI button or shortcuts:
  - `Shift + Alt + F` or `Cmd + Shift + F` (`Ctrl + Shift + F` on Win/Linux): Format code
  - `Cmd + Enter` / `Ctrl + Enter`: Run Code / Test
  - `Cmd + Shift + Enter` / `Ctrl + Shift + Enter`: Submit final answer
  - `Tab`: Indent 2 spaces (`indentWithTab`, `indentUnit.of('  ')`)
  - `Cmd + /` / `Ctrl + /`: Toggle line comments (`defaultKeymap`)

### 5.2 Sandbox runner
`PracticeArena` -> `transpileForExecution` (lazy-loaded TypeScript, JS or TS mode) -> `runHarness(card, code, mode)`.
User code + harness are concatenated and run inside an `AsyncFunction` in the **page itself** (not an iframe/worker).

Injected globals: React hooks and `React`, `createContext`, `forwardRef`, `useImperativeHandle`, `useSyncExternalStore`,
`$dom` (render, renderHook, renderError, fire.click/change/keyDown/submit/focus/event, q, qa, wait, flush, act, intersect),
`$test` (check, equal, run, rejects, logs, sleep), `MockIntersectionObserver`, and a mocked `fetch` for the jsonplaceholder URLs.
Helpers are `$`-prefixed so they cannot collide with user declarations. Harness authors: `mount`, `render`? (`render` is destructured from `$dom` inside harnesses, which is fine), but **`mount` is an injected global** — do not declare `const mount` in a harness (use `setup`).
Do **not** add common bare words (`memo`, `render`) as
injected parameters: a user `const memo = ...` would throw "already declared".

Console classification (`consoleFormat.ts`): only assertion lines containing the word `FAIL`, compile errors and uncaught
exceptions count as failures. `console.error` is neutral output.

Gotchas learned the hard way:
- Production React has no `act`; `domTools.ts` falls back to `flushSync` + settling (`fallbackAct`).
- Built-in prototypes patched by a solution (polyfill cards) are snapshotted and restored after each run.
- Strict TS uses TypeScript's real `lib.es2022.d.ts` (bundled with `import.meta.glob(...?raw)` into the lazy chunk, ~4 MB);
  DOM types are intentionally replaced by a small `SANDBOX_GLOBALS` declaration.
- **jsdom passes ≠ browser passes.** In the production build `act` is the `flushSync` fallback: sync updates and discrete events flush at once, but
  state set from an *effect* and *continuous* events (`mouseover`, `scroll`) render on the next tick. Harnesses that check such results must
  `await wait(30)` first (5 cards needed this when first smoke-tested). Always run new React cards through "Run Code" in `vite preview`.
- Runaway code: `loopGuards.ts` instruments `while/for/do/for-of/for-in` loops and throws after 3 s, which covers the common case. Code is still executed in the page (not a worker/iframe), so other kinds of runaway (endless `await` chains, work outside instrumented loops) can still hang the tab; `runWithTimeout` (Worker) exists in `runner.ts` but is not used by the app. Drafts are autosaved so nothing is lost.

## 6. Scheduling models (all in `src/lib/leitner.ts`)

The trainer supports two user-selectable algorithms via the Settings modal (`algorithm: 'leitner' | 'graduated-interval'`):

### 6.1 Classic Leitner Boxes (`leitner`)
- **Boxes 1–5**, intervals in *trials* (completed reviews), not calendar time: `BOX_INTERVALS = {1: 1, 2: 4, 3: 10, 4: 22, 5: 45}`.
- **Pass**: Box promotes (`box + 1`, max 5), streak incremented (`streak + 1`), `nextEligibleTrial = reviews + interval(box)`.
- **Fail**: Hard reset to **Box 1**, streak reset to 0, eligible for immediate replay (`nextEligibleTrial = reviews`). The trainer immediately reloads the card with a clean cold-start buffer so the user can replicate the correct pattern from memory before moving on.

### 6.2 Graduated Interval Recall & Chaining (`graduated-interval`)
- **Tiers 1–9**, geometric spaced intervals: `GRADUATED_INTERVALS = {1: 1, 2: 3, 3: 7, 4: 16, 5: 35, 6: 75, 7: 165, 8: 360, 9: 800}`.
- **Extensible Tier 10+ Scaling**: Dynamic geometric growth factor (~2.2x per tier, `Math.round(800 * Math.pow(2.2, tier - 9))`) for cards continuing maintenance past Tier 9.
- **Active Deck Ceiling Guard**: If a tier offset exceeds active deck size $N$, the offset is capped to $N$ trials out so cards don't disappear past a full deck cycle.
- **Pass**: Tier promotes (`tier + 1`), streak incremented (`streak + 1`), `nextEligibleTrial = reviews + min(interval(tier), activeDeckSize)`.
- **Fail (Immediate Replication & Setback)**: Half-tier setback `Math.max(1, Math.floor(tier / 2))` with streak reset to 0, scheduled at setback interval, followed by an immediate practice drill.
- **Chaining Queue Prioritization**: In-flight cards due for graduated recall are prioritized immediately into review slots before introducing new unseen rungs into the active working chain.

### 6.3 Shared Scheduling Engine
- **getNextCard**: candidates = active cards matching the practice filter, excluding the current card; eligible =
  `nextEligibleTrial <= reviews`; prefer a different track than the last one; sort by **tier/box asc, then difficulty asc**, then earliest
  eligibility, then streak.
- **Staged unlocks**: every 4 active cards in box/tier ≥ 3 unlocks 4 more. They are chosen **easiest-first**, and only if the card's
  *ladder is open*.
- **Difficulty ladder**: `difficulty` 1 Warm-up · 2 Basic · 3 Intermediate · 4 Advanced · 5 Expert. Cards that share a `concept`
  (e.g. `rate-limiting`, `promise`, `lru`) form a ladder. A locked card is unlock-eligible only when every *easier* card of the same
  concept is active and in box/tier ≥ 2 (`isLadderOpen`, `LADDER_PASS_BOX`). Custom cards without a concept are never gated.
  Manual unlock from the catalog bypasses the ladder on purpose.
- **Practice focus** (`PracticeFilter`): include/exclude tracks and tags (excludes win; empty include = all) plus an inclusive
  difficulty range. Only matching active cards are scheduled; others keep their state. Stored in the deck state, included in
  backup export/import, with named presets.
- **Merge on load** (`mergeStoredWithSeed`): progress (box/tier, streak, schedule, status) comes from the stored deck; content fields
  (`track,title,tags,difficulty,concept,promptSeed,starterCode,testHarness,solution,referenceSolution,testCases`) are refreshed from
  the seed so edits to cards take effect; new seed cards are appended locked; seed cards the user deleted stay deleted
  (`deletedSeedIds`).
- **UI Dynamic Terms**: All badges, headers, modals, tooltips, and dashboard filters dynamically switch between "Box" and "Tier" terminology depending on the active algorithm.
- **Backup Advisory & Export Highlighting**: After completing 4 problems (scored reviews, excluding unscored reinforcement repeats), a modal informs users that all progress, box tiers, and review history reside strictly in browser `localStorage`. It advises downloading a JSON backup regularly (at least at the end of each session) to avoid accidental data loss. Dismissing records the advisory as seen. Agreeing navigates the user to the Deck Catalog, where the 'Export Progress' button is spotlighted with an attention-grabbing amber pulse and a dismissible callout bubble guiding the user to download their `.json` backup file.

## 7. Roadmap

### 7.0 Coverage assessment against contemporary front-end interviews

Basis: what typical front-end loops ask (JS-utility rounds, "build this component" rounds, React/hooks questions, a11y, light
algorithms, TS). This is a judgement from experience with those formats, not a live survey. Re-assess when the deck changes.

| Area | Status | Default deck | What is there / what is missing |
|---|---|---|---|
| JS utilities (debounce, throttle, memoize, curry, bind, deep-clone, emitter, LRU) | **Strong** (some duplication) | 34 (`js-utilities`) | Full ladders for rate-limiting, currying, LRU, clone/equality. Duplicates are intentional variants (§7.3) |
| Async plumbing (pool, retry, queue, allSettled, abort, timeout) | **Strong** | 22 (`async-js`) | Promise class, promisify, `Promise.any`/`AggregateError`, cancelable promise, polling with backoff, async generators, pub/sub. Missing: little |
| Core language (closures, `this`, prototypes, iterators, Proxy, WeakMap, descriptors, TDZ, tagged templates) | **Strong** | 25 (`js-language`) | Missing: class fields/static blocks, `Reflect` depth, `Symbol` well-knowns beyond a few |
| String/format utilities | **Medium** | ~8 | classNames, query string, formatters, style parsing, CSS specificity, anagram/palindrome. Missing: template engine, markdown-lite, slugify, diffing |
| DOM and browser APIs | **Medium-good** | 15 | event delegation, vnode→DOM, router, storage TTL, path params, safe JSON, keyboard shortcut matcher, cookie parse/serialize, copy to clipboard (with fallback), lazy-load images (IntersectionObserver), drag-and-drop drop index + reorder, rAF throttle. Missing: Mutation/Resize observers, `history.pushState` (small version), key chords, workers |
| React hooks and state (`react`) | **Medium-strong** | 23 | fetch/debounce/throttle/previous/latest/interval/local-storage/click-outside/store/forwardRef/memo/error-boundary/reducer, undo/redo, form state, `useIsMounted`, `useMediaQuery`, theme switcher (context + localStorage). Missing: `useLayoutEffect`, `useDeferredValue`/`useTransition`, React 19 APIs |
| React components ("build this") | **Medium** | 31 (`react-components`) | typeahead, modal, tabs, infinite list, star rating, countdown, file tree, accordion, data table, dropdown menu, virtual list, toast queue, carousel, optimistic like, breadcrumbs, transfer list, nested checkbox tree. multi-step form wizard, tag input, pagination controls, tic-tac-toe, stopwatch with laps, progress bar, tooltip. Still missing: popover (positioning), drag-sortable list, stepper, lazy image, copy button, kanban, nested comments |
| Algorithms | **Medium (core) + opt-in pack** | 47 core (+33 pack) | Core: arrays, hashing, two pointers, sliding window, stack, binary search, linked lists, trees/BST, **basic graph theory (BFS adjacency, components, grid BFS/islands, clone/bipartite, topological sort)**, intro DP, sorting, trie, matrix, bits. Pack: 2D DP, heaps beyond basics, monotonic stack, hard backtracking, k-group reversal, serialization. Missing in both: Dijkstra, union-find |
| TypeScript | **Medium** | 14 | unions, generics, utility types, guards, typed emitter, conditional `infer`, template literals, branded types, overloads, mapped modifiers. Missing: `satisfies`, assertion functions |
| Accessibility | **Medium-strong** | ~15 tagged `a11y` | switch (`role=switch`), accessible field, tooltip, dropdown roving focus, modal with focus trap and focus return, tabs ARIA, full ARIA combobox (`typeahead-autocomplete`), pagination, `aria-live` announcer, roving-tabindex toolbar, SPA route focus + skip link, form error summary. Missing: a standalone reusable focus-trap hook (the modal card covers trapping), `aria-describedby` tooltips on touch, live-region patterns for loading states |
| CSS/layout | **Deliberately thin** | 3 tagged `css` | specificity and style parsing only. Owner decision: layout practice is better done with Flexbox Froggy / Grid Garden; auto-grading layout would need real-browser checks. Tailwind is a possible later addition (hard to grade automatically) |
| Testing (Jest/RTL) | **Pure-logic stand-ins only** | 4 (`testing-tooling`) | `mockFn`, `fakeTimers`, `miniExpect`, a test-runner lifecycle (`nextRouteMatcher` now lives in `dom-browser`). Missing: RTL-style queries/user-event, snapshot basics |
| Frameworks/libs (Next.js, D3) | **Minimal, by choice** | 1 | only `nextRouteMatcher`. Owner decision: **D3 is on hold** (not standard enough interview material); Next.js stays pure-logic only |
| System-design style prompts | **None** | 0 | Out of scope for auto-graded cards; see "complete projects" note |

Bottom line: JS utilities, async and core language are the strongest parts. Relative to interview frequency the thinnest are
**CSS/layout, accessibility, DOM/browser extras, the remaining React component builds, testing-library-style tests, and any framework content**. Algorithms are no longer the
bulk of the default deck (core 47 of 201); the heavier ones are opt-in (§7.4b).

### 7.1 Difficulty ladder holes (the owner wants "simple first, then harder" on every concept)
**Status (current):** the starter rungs for the pure-function and TypeScript concepts exist. Concepts in the default deck whose lowest rung is **still ≥ 3**
(all React/DOM or tooling; each needs a hand-written DOM or pure harness and a `npm run e2e` run): `architecture`(1 card, lowest d5), `wizard`(1 card, lowest d4). `react-fetch` lost its d2 entry card when its near-duplicate was removed; a plain fetch-hook warm-up (no abort/race) would be the natural new first rung. Intro rungs done so far (branch `feature/intro-cards`): `calculate-winner` (game-board, d1), `paginate-items` (pagination, d1), `create-store-basic` (state-management, d2); batch 2: `flatten-visible-tree` (tree-ui, d2), `add-tag-rules` (tag-input, d1), `visible-window-range` (virtualization, d2); batch 3: `history-stack-basic` (history-state, d2), `carousel-index-math` (carousel, d1), `move-between-lists` (dual-list, d2); batch 4: `toast-queue-logic` (notifications, d2), `wizard-step-logic` (wizard, d2), `optimistic-list-update` (optimistic-ui, d2); batch 5: `call-recorder-spy` (testing-tools, d2), `use-fetch-basic` (react-fetch, d2; browser harness).
Only two d5 cards exist.
The original table below is kept for the proposed rung designs (the React rows are still open).
Add the rung(s) below; each must follow §4 (reference, cases, harness, empty-solution test, `difficulty.json` entry, same `concept`).

| concept | proposed easy rung (d1/d2) | the ladder then continues with |
|---|---|---|
| event-loop | d2 "order of sync/microtask/timeout": function `order()` returning the log array for a fixed snippet it must *schedule itself* | existing trace card (d3), then d4 `nextTick`/`setImmediate`-style scheduler |
| promise-combinators | d2 "all by hand": `all(promises)` using a counter, no `Promise.all` | existing allSettled/all polyfill (d3), d4 `any` + `AggregateError`, d4 `race` with cancellation |
| compound | d1 static `Tabs` (no context); d2 `Accordion` with `useState` | Tabs compound (d3), d4 controlled/uncontrolled + roving focus |
| resilience | d2 minimal `ErrorBoundary` (fallback only) | reset/resetKeys (d3), d4 retry with backoff around Suspense |
| react-perf | d1 "why did it re-render" counter component; d2 `useMemo` for a derived list | `memo` + `useCallback` (d3), d4 context-split to avoid re-renders, d5 virtualization |
| state-management | d2 read-only `useSyncExternalStore` subscribe to `window` width | external store (d4), d5 middleware/devtools-style store |
| a11y-components | d2 accessible `Button` toggle (`aria-pressed`), d2 labelled form field with error (`aria-describedby`) | modal focus (d4), menu with roving focus (d4), d5 combobox |
| typeahead | d2 filter-as-you-type list (no async) | async typeahead with race handling (d4), d5 keyboard + a11y combobox |
| infinite-scroll | d2 "paginated list with Load more" | observer-based (d3), list variant (d4), d5 virtualized infinite list |
| middleware | d2 `compose(fns)` for `(ctx, next)` functions | express chain (d4), d5 error-handling + async middleware |
| iterators | d1 class with `[Symbol.iterator]`; d2 custom `Range` iterable | generators/lazy utilities (d3), d4 async generators + `for await` |
| serialization | d1 serialize primitives/arrays only | `JSON.stringify` full (d4), d5 `JSON.parse` from scratch |
| ts-generics | d1 identity/`first<T>(arr)`; d2 `Box<T>`/`Result<T,E>` | api client (d3), props generics (d3), d4 constrained/`keyof` generics |
| ts-unions | d1 narrow with `typeof`/`in`; d2 discriminated union switch | exhaustiveness (d3), d4 reducer action unions |
| ts-types | d1 re-implement `Partial`/`Readonly`/`Pick`; d2 `Record`, `Omit` | custom utility types (d4), d5 `infer` + template-literal types |

How to fill: authoring recipe is §4. Keep the rung's **concept** string identical to its siblings so the ladder gates correctly; for a
new concept pick a short kebab-case name and add it to `difficulty.json`. Aim for 4-8 explicit cases per card; each case a concrete
input and a concrete expected value, never "returns something sensible".

### 7.2 Missing card families — what to build and how to grade it

Grading approaches available today: (a) **pure functions** graded from input/expected pairs (generated harness; best, cheapest);
(b) **React/DOM** graded with `$dom` in jsdom/real DOM (hand-written harness + labelled `r()` cases);
(c) **type-level** graded with `@ts-expect-error` lines in `<id>.extra.js` (TS mode, strict).

1. **React components** (new cards go in the empty `react-components` track; hand-written harness, approach b). Specs already drafted:
   - DONE: `StarRating`, `Countdown`, `FileTree` (track `react-components`; see `scripts/cards/*` for the DOM-contract style to copy).
   - `DataTable({rows,columns,pageSize})` sortable headers with `aria-sort` cycling, numeric vs string sort, filter input, `Page x of y`
     (d4). Add an easy rung: static table from rows/columns (d1) and sort-only (d2).
   - `VirtualList({items,itemHeight,height,overscan})` windowed rendering from `scrollTop` (d4; note jsdom has no layout, so the
     harness defines `scrollTop` via `Object.defineProperty` and fires `scroll`).
   - `DropdownMenu` roving focus, Escape/outside-click close, disabled items (d4). `useHistory` undo/redo (d3), `useForm` (d3).
   - Further: toast queue, multi-step form, optimistic like button (rollback on rejection), drag-sortable list (keyboard fallback),
     image carousel, star/like counters, accordion, pagination, progress bar, tooltip/popover positioning, theme switcher.
   - Each component card should state its **exact DOM contract** (roles, labels, button texts) in the prompt, because the harness queries by those.
2. **Algorithms** (pure functions, approach a; track `algorithms`). **DONE in batch 13** (20 cards, `scripts/testcases/part13.mjs`): linked list (`reverseList`, `hasCycle`, `mergeTwoLists`; nodes `{val,next}`
   built with a one-line helper in each case), `MinStack` + queue from two stacks, BST (`isValidBST`, `invertTree`, `lowestCommonAncestor`),
   `numIslands` (grid DFS/BFS) + `floodFill`, `Trie` (+ `wordsWithPrefix`), `MinHeap` + `topKFrequent`, DP (`climbStairs`, `coinChange`, LIS),
   backtracking (`permute`, `subsets`, `generateParenthesis` — normalise ordering in the case input), sorting (`mergeSort`, `quickSort`
   compared with native sort), matrix (`rotate90`, `spiralOrder`), strings (`isAnagram`, `isPalindrome`, `groupAnagrams`, `longestCommonPrefix`),
   binary-search variants (`lowerBound`, rotated array, `sqrt`). Give each family a d1 rung (e.g. `reverseList` before `hasCycle`).
3. **TypeScript** (approach c; track `typescript-patterns`): conditional types with `infer` (`ReturnTypeOf`, `Unwrap`, `ElementOf`), template-literal
   types (`CamelCase`, `EventName`), overloads, branded IDs, `satisfies`/`as const`, assertion functions, typed reducer/context. The harness is
   mostly `// @ts-expect-error` lines plus a few runtime `$test.check`s (see `ts-custom-utility-types.extra.js`). Real lib types are available.
4. **Testing & libraries** (`testing-tooling`; pure functions): `mockFn()` (`calls`, `mockReturnValue`, `mockImplementation`), `spyOn`, fake timers
   (`advanceTimersByTime`), a mini `expect().toBe/toEqual`; D3-flavoured `scaleLinear`/`scaleBand`/SVG `linePath`; Next.js-flavoured file-route
   matcher (`[id]`, `[...slug]`, route groups) — all gradable as pure input/output without the real libraries.
5. **CSS/layout**: jsdom has no layout engine, so only logic-level cards work there (specificity, shorthand parsing, BEM name builders,
   media-query matching, grid-template parsing). For real "make this centre/flex" cards add **Playwright** (7.4) and grade with
   `getBoundingClientRect` assertions in a real browser; until then treat CSS as out of scope and say so in the UI.
6. **DOM/browser**: drag-and-drop reorder (simulate `dragstart/dragover/drop`), `MutationObserver` wrapper, `ResizeObserver`/
   `IntersectionObserver` lazy loader (mock exists), keyboard-shortcut manager, `history.pushState` router bound to `window`, `postMessage`
   channel, `requestAnimationFrame` throttling, `Worker` message protocol (grade with a fake worker).
7. **Language depth** (**partly DONE in batch 15**, `part15.mjs`, 14 cards: Proxy, WeakMap/WeakSet, descriptors, prototypes; still open: output-prediction, hoisting/TDZ, tagged templates, `Symbol.asyncIterator`): output-prediction drills expressed as functions that return the observed order/values (hoisting, TDZ, closures in loops,
   `this` in callbacks), `Proxy`/`Reflect` validators, `WeakMap` private data, getters/setters, tagged templates, `Symbol.asyncIterator`.
8. **React 19**: `useOptimistic`, `useActionState`, `use(promise)`, `useTransition`. Needs these hooks injected into the sandbox (add to
   `runner.ts` names *carefully*, see §5) and an async-safe `act` path in `domTools.ts`.
9. **"Build a complete project"**: not auto-gradable end to end. Keep this deck as the *building blocks*; optionally add "project recipes"
   (checklists of which cards compose a todo app, typeahead page, kanban board) in the catalog as a reading aid, not graded cards.

Priority for filling (value ÷ effort): ladder holes (7.1) → React components → algorithm families → TS type-level → testing/D3/Next pure-logic →
DOM/browser extras → language depth → React 19 → CSS (needs Playwright).

### 7.3 Product features
1. **Stats view**: per-track/concept accuracy, weak spots, streaks, time-to-solve (needs a review-history log: add
   `history: {cardId, ts, passed, ms}[]` to deck state, capped).
2. **Staged unlocks that respect the practice focus**: DONE (`checkStagedUnlocks` gets the Focus + pack filter; unlock credit is only spent on cards that really unlock). Still open: a "session mode" (N cards drawn only from the focus).
3. **Sandboxed execution**: run harnesses in a sandboxed iframe or Worker with a watchdog timeout so `while(true)` cannot freeze the
   tab. DOM harnesses need a document, so use an iframe (`srcdoc`, `sandbox="allow-scripts"`) and `postMessage` the logs back.
**React preview window (DONE, built on branch feature/react-preview; spec below; React component problems only).**
Goal: while solving a React problem that renders a component UI, show the component the user is writing in a live separate
pane or pop-out window, without disturbing the editor, Run Code or Submit.
- **Explicit Component Rendering Declaration**: Whether a card displays a component rendering box is determined explicitly at build time:
  - Author annotation: `"rendersComponent": true` in `scripts/cards/<id>.meta.json`.
  - Component card list: inclusion in `scripts/component-cards.json`.
  - Dedicated preview script: presence of `scripts/cards/<id>.preview.js` (automatically stamps `rendersComponent: true`).
  Heuristic or tag-based guessing is never used; custom hooks and pure logic cards omit `rendersComponent` and show no preview box.
- Clean, respectable interface: opens with a clean, quiet "Ready to Preview" placeholder without premature errors. Once the user clicks "Run Code / Test" (or Cmd+Enter) or submits, the live sandbox activates, mounts the preview, updates automatically as they edit (debounced ~500 ms), and reveals callback/console logs.
- Pop-out window support: a "Pop out" button opens the preview in an external browser window with live two-way synchronization and seamless dock-back.
- **Safety (tested in `e2e/preview.spec.ts`)**: preview code runs in a sandboxed iframe, never on the main page. A `while(true)` is stopped by the loop guard / timeout; an effect that sets state on every render is stopped by a render-loop watchdog in `reactPreviewFrame.ts` (React `Profiler`, more than 100 commits in one second means unmount and show an error). The Profiler callback is skipped by React production builds, so `scripts/build-preview-bundle.mjs` bundles `react-dom/profiling`; do not switch it back to `react-dom/client`.
- **Loaded on demand**: the 235 KB React runtime for the iframe (`reactPreviewBundle.ts`) is a separate chunk, fetched only when a card with a preview opens (`ReactPreview.tsx` uses a dynamic import).
- **Planned (not built)**: a separate Props panel driven by an optional `controls` export in `<id>.preview.js` (type, range, options per prop) plus named presets, so props can be changed without editing code and the controls sit apart from the rendered component. Today a few previews render prop-combination buttons next to the component.
- **Every previewable card defines what to render in `scripts/cards/<id>.preview.js`** (props, callbacks, providers: nothing is guessed from the harness).
  `build-cards.mjs` copies it into the generated card as `previewCode`. The file contains plain JSX that may use the names the card asks the user to write, plus a
  `log(name, returnValue?)` helper. Examples:
  - component: `<Toolbar label="Text formatting" items={[{ id: 'b', label: 'Bold' }, { id: 'i', label: 'Italic' }]} />`
  - callback props: `<Switch checked={on} onChange={log('onChange')}>Wi-Fi</Switch>`. `log('onChange')` returns a function that appends `onChange(true)` (name + arguments) to an
    event-log panel under the preview and returns `undefined`. Pass a second argument for callbacks that must return something: `log('fetchPage', Promise.resolve({ items: [], hasMore: false }))`.
    Async props are written inline: `fetchPage={async (page) => ({ items: ['a', 'b'], hasMore: page < 3 })}`.
  - controlled components that need state: define a small `function Demo() { const [on, setOn] = useState(false); return <Switch checked={on} onChange={setOn}>Wi-Fi</Switch>; }` and end the file with `<Demo />`.
  - hooks: a demo component that calls the hook and shows its result and a couple of buttons that use it (`function Demo() { const [n, inc] = useCounter(); return <button onClick={inc}>{n}</button>; }`).
  - providers/context: wrap in the provider the card asks for (`<AnnouncerProvider><Demo /></AnnouncerProvider>`).
  The last expression of the file is the element to render. Pure-function cards and cards with no UI have no preview file.
- Run the user's code + the preview file in a **sandboxed iframe** (`sandbox="allow-scripts"`, `srcdoc`) that loads React/ReactDOM and transpiles with the same pipeline as `runner.ts`.
  Send code to the iframe with `postMessage`; send console output, thrown errors and `log(...)` events back and show them under the preview.
- Re-render on a debounce (about 500 ms) as the user types; a render error shows a small error box, never breaks the main app.
- Watchdog timeout protects against infinite loops and freezes in the preview sandbox without affecting the main app.
- **Automated check (the guard that keeps preview files honest):** a unit test mounts every card's `previewCode` together with that card's **reference solution** in jsdom: it must render without throwing and
  produce non-empty DOM (and any `log` callback must not throw). Plus Playwright tests (`e2e/preview.spec.ts`) that test live rendering, events, pop-out windows, and infinite loop protection.
- Work split: (1) the iframe window + `previewCode` plumbing + guard test (DONE, branch `feature/react-preview`); (2) writing `<id>.preview.js` for the remaining React cards (DONE, task A2: all 44 React component cards have authored `.preview.js` files, passing all guard tests);
  (3) from then on every new React card ships its preview file (rule 10 in `DELEGATION.md`).
- **Test Runner Isolation**: The starter buffer (`practice/starterSnippet.ts`) ends with the card's own example checks (`// Test runner example:` followed by `$test.run(...)` / `$dom` code) as **live, uncommented code**, so Run shows each check as PASS/FAIL straight away (there is no comment toggle any more; `runHarness` does not append the checks a second time when the buffer already contains them). Only the generic React `Harness` template and the hints of cards without a harness stay commented. Because that test code is live in React cards too, `ReactPreview.tsx` isolates it via `stripTestRunnerBlock` so only component implementation code is combined with `previewCode`. The preview iframe sandbox also provides no-op shims for `$dom`, `$test`, and `mount`, preventing `ReferenceError: $dom is not defined` from halting preview evaluation.
4. **Duplicate cards**: RESOLVED by the 2026-10 audit (8 near-duplicates removed, the rest are deliberate progressions; see §7.4e).
5. **Difficulty in the catalog**: sort/filter by difficulty and concept; show the ladder (which rung unlocks next and why a card is locked).
6. Optional: per-card hints that reveal the reference solution progressively; export/import of drafts.

### 7.4 Engineering / quality
- **Browser smoke test**: DONE, see §7.4a (`npm run e2e`; CI workflow `e2e.yml` runs on PRs and non-master pushes, and `deploy.yml` runs it as a required job, so a deploy waits for it).
- **Not yet done**: wrong-answer checks (a few deliberately wrong solutions per card that the harness must reject), every card now has at least 4 documented cases (enforced by `seedCards.test.ts`), and the complexity fields on algorithm cards were bulk-generated by a small model (`scripts/enrich-complexities.mjs`) with no human review (scoped to algorithm-style tracks and normalised to lowercase `n` in the metadata cleanup; a human spot-check is still open).
- **Timing tests**: hook/typeahead harnesses use real timers. Their delays and waits were scaled ×3 (e.g. debounce 180 ms with margins of 30-90 ms)
  and passed 3 consecutive runs; the countdown card polls with `until()` instead of fixed waits. Still possible: one retry on failure, or fake timers.
- Bundle: main chunk ≈ 0.65 MB; lazy TypeScript chunk ≈ 4.1 MB (acceptable for personal use; `chunkSizeWarningLimit` raised).
- AI evaluator (`ai.ts`) was only exercised offline (heuristic, harness-aware). The live Gemini/OpenAI call path (key sent in a header) is
  untested against real APIs; default model names may be stale.
- Consider moving seed-deck merge/migration into a versioned schema (`deckVersion`) before the next breaking change.


### 7.4a Browser smoke test (DONE): `npm run e2e`
`e2e/cards.spec.ts` + `playwright.config.ts` run EVERY seed card in the production build (`vite preview`) in real Chromium: the reference solution
must show **PASSED**, an empty buffer must show **NEEDS REVISION** (2 tests per card, ~6 min for 234 cards with 4 workers on an idle machine, ~16 min if the machine is busy; CI workflow
`.github/workflows/e2e.yml` runs it on PRs and non-master pushes; `deploy.yml` runs it again as a required job before every Pages deploy). The code is injected through the draft autosave key (`leitner_draft:<id>`) so the
CodeMirror editor is never driven; the deck is rewritten so exactly one card is active. Filter with `npx playwright test -g "<card id>"`.
Flaky-on-first-try cards in the last full run (all passed on retry): the fetch/promise-timing cards (`async-fetch-error-handling`, `fetch-abort-controller`, `promise-all-vs-settled`, `promise-chaining-syntax`) and `breadcrumbs-router`; `retries: 1` absorbs them but they are candidates for wider margins. First run found a real bug: `MobileNoticeModal` stayed in the DOM (CSS-hidden, `role="dialog"`, `body{overflow:hidden}`) on desktop and broke
`modal-portal-focus`; it now mounts only on narrow viewports. TS cards show no "Tests:" badge when compilation fails, so the spec never waits for it.


### 7.4b Optional card packs (DONE): `algorithms-advanced`
Why: this is a **front-end interview** trainer; LeetCode-style and academic CS material should not dominate the deck. `scripts/packs.json` lists the **53** cards of the pack; the build sets `pack` on them and deck state
`enabledPacks` (default `[]`) turns packs on in **Settings → Optional card packs**. A card of a disabled pack is excluded from scheduling
(`scheduleFilter` → `cardMatchesFilter`), staged unlocks (`checkStagedUnlocks(..., isAllowed)`), the catalog, the Focus match counts and the header
counts; its progress is untouched, so re-enabling restores it. To move a card between core and pack, edit `packs.json` and run `npm run build:cards`
(never edit `topics.json` by hand: only the `pack` field changes). The Playwright smoke test enables the pack so it still covers every card.

**Classification rubric (decided by the maintainer; apply it to every new algorithm card):**
- **Core / practical (24 cards):** linear stream and string/array processing (sliding window, two pointers, binary search, prefix sums, intervals, matrices), practical collection utilities (hashing, grouping, anagrams, dedupe), linked lists, stack utilities (valid parentheses, MinStack), basic sorting, and realistic object/DOM hierarchy traversal (n-ary `{ id, children }` trees, `tree-traversal-dom`).
- **Advanced pack (53 cards):** pointer-based academic structures (binary trees and BSTs with `{ val, left, right }`: depth/sum/count, validation, level order, path sum, diameter, serialization), graph algorithms (adjacency list/BFS, components, bipartite, topological sort, grid BFS/DFS, word ladder), heaps, tries, dynamic programming (1D and 2D), backtracking, bit manipulation, monotonic stacks, greedy puzzles and similar whiteboard material.
- The second pass moved 21 cards (`tree-depth-sum`, `bst-search-insert`, `bst-validate-lca-invert`, `tree-level-order`, `tree-path-sum`, `tree-diameter-balanced`, `graph-adjacency-bfs`, `graph-components-paths`, `graph-clone-bipartite`, `graph-grid-bfs`, `course-schedule-topo`, `flood-fill-islands`, `heap-array-basics`, `heap-kth-largest`, `climb-stairs-fib-dp`, `coin-change-dp`, `binary-strings-combinations`, `permutations-subsets-backtracking`, `bit-basics`, `trie-nested-object`, `trie-prefix-tree`) from the default deck into the pack. Side effect: the first-run active set went from 99 to 89 cards (algorithm cards among them from 23 to 13).

### 7.4d Mutation check (`npm run mutation`): are the harnesses strict enough?
`src/lib/mutate.ts` makes small single-site mistakes in a card's reference solution (`===`/`!==`, `<`/`<=`, `&&`/`||`, `+`/`-`, off-by-one integers, dropped `await`,
`push`/`unshift`, negated `if`, `return undefined && ...`, ...). `scripts/mutation.test.ts` (own config, `vitest.mutation.config.ts`; not part of `npm test`) runs every mutant
through the card's harness; a good harness FAILS every mutant. A **survivor** is either an *equivalent* mutant (same behaviour, e.g. the `<` after an early `===` return,
`shift` vs `pop` when order does not matter, `Date.now() - startedAt : 0` at centisecond precision) or a **missing hand-written case**. This tool never writes cases.
- Run: `npm run mutation` (all, slow), or `VITE_MUT_ONLY='^(card-a|card-b)$' npm run mutation`; env: `VITE_MUT_MAX` (mutants per card, default 25), `VITE_MUT_OUT` (JSONL
  results, default `/tmp/mutation-report.jsonl`, finished cards are skipped on re-run). TypeScript cards are skipped (type-level code is not covered by these operators).
  Run it in small isolated batches (a runaway mutant can kill a worker); the first full run used batches of 6 cards, 4 in parallel (~15 min).
- Result of the first full run: 3,693 valid mutants over 223 cards, 87.9% killed; 12 cards were strengthened (tic-tac-toe, polling, binary search, two-pointer, rotated search,
  top-k, retry, unique-sort, format-utilities, polyfills, throttle, use-media-query ...) and 13 thin cards got more cases. `scripts/mutation-baseline.jsonl` holds the per-card
  results (survivors with operator and line) to triage the rest; most remaining survivors are equivalent mutants. Five cards produced no result because their mutants crashed the
  worker (`iterable-range-class`, `matrix-basics`, `promise-all-by-hand`, `simple-stringify`, `trie-nested-object`).
- **Hardened (second pass):** `typeahead-autocomplete` (21 -> 6 survivors, all equivalent: default delay +/-1 ms, initial state values the mount effect resets), `fake-timers` (11 -> 4, equivalent: the tie-break
  clause duplicates Map insertion order, an unused factory), `mini-expect` (25 -> 11, equivalent after the type check made some guards redundant) and `test-runner-lifecycle` (20 -> 1, a single `push`
  into a one-element list). Two real **reference bugs** surfaced and were fixed: `fake-timers` ignored `advanceTimersByTime(0)` (the prompt says `ms >= 0` runs timers that are already due) and
  `mini-expect` called a Date or RegExp "equal" to `{}`. `test-runner-lifecycle`'s prompt now states the rules the new cases pin down (same-kind hook order, afterEach/afterAll errors, beforeAll failures,
  the unnamed top-level suite). Still the weakest by survivor count: graph-word-ladder, tabs-accordion-compound. Check each survivor by hand before adding a case: ask "can a correct solution behave
  differently here?"; if the answer needs an unstated rule, put the rule in the prompt first.
- **The mutation run does not prove your new cases are right.** A wrong case makes every mutant "die" and the reference fail, which looks like a perfect score. After adding cases always run the real gates
  (`npm test` -> `seedCards.test.ts` runs the reference against the harness, and the Chromium card tests), and use `--repeat-each=5` for cards that use real timers (typeahead, fake-timers, test-runner-lifecycle).
- Harness hygiene learned from this: harnesses must not assume a clean page (other dialogs, body scroll lock, `window.matchMedia`, `localStorage` keys). `modal-portal-focus` now
  measures the ambient state first; `use-media-query` restores `window.matchMedia`; `stopwatch`/`theme-switcher` restore what they patch in a `finally`.

### 7.4e Difficulty rubric and the near-duplicate rule (used by the 2026-10 audit)
Rate by the **task a user actually does**, not by solution length (many cards bundle 2-3 small functions, so length misleads; TypeScript type cards are short but not easy).
| d | Meaning | Typical examples |
|---|---|---|
| 1 | warm-up, one idea, under ~10 min | `memoizeOne`, `shallowCopy`, `usePrevious`, depth sum |
| 2 | easy interview question, a couple of ideas or a small component | basic debounce/throttle, custom `reduce`, accordion, linked-list cycle + merge, LC-easy BFS |
| 3 | medium: edge cases or an API-shaped spec | `curry`, cancel/flush debounce, `useLocalStorage` with cross-tab sync, level-order variants, LC-medium graph/DP |
| 4 | hard: several interacting parts or a known "hard" pattern | virtual list, external store hook, `promise-pool`, word ladder, merge-k-lists with your own heap |
| 5 | rare, multi-part systems | (2 cards today) |
Rules the audit applied: (1) a card that is a strict subset of another card must not sit above it on the ladder, (2) two cards with the same task in different packaging are duplicates: keep the richer one, delete the other,
(3) progressions are NOT duplicates and stay: basic -> production variant (`debounce-implementation` -> `debounce`, `throttle-implementation` -> `throttle`), `object-deep-clone` -> `deep-clone` (circular refs, Map/Set/Date),
`custom-array-reduce` -> `array-method-polyfills`, `use-reducer-todo-list` -> `todo-list-reducer`. Deleting a seed card: remove `scripts/cards/<id>.*`, its entries in `scripts/testcases/part*.mjs` (including `part4` overrides/appends),
`scripts/difficulty.json`, `scripts/packs.json`, `scripts/complexity-cache.json`, `scripts/mutation-baseline.jsonl`, the card in `src/data/topics.json`, and **add its id to `RETIRED_SEED_IDS` in `src/lib/leitner.ts`** so saved decks drop it.
Audit result: 17 cards re-rated (see git log `Difficulty audit`), 8 duplicates removed: `hook-fetch-cleanup`, `infinite-scroll-observer`, `sliding-window-dynamic`, `tree-level-order-bfs`, `hook-use-debounce`, `event-loop-microtasks`, `currying-function`, `interval-merge-sliding-window`.

### 7.5 Recent milestones and suggested next steps

#### Completed Milestones
1. **Deck-Wide Markdown Instruction Formatting (100% Complete — Batches 1–23)**:
   - All 271 cards across the entire deck now feature clean, structured GitHub-flavored Markdown instructions.
   - Standardized format includes problem statements, function/component target signatures, parameters, return values, constraints, and edge case breakdowns.
   - All 23 formatting batches merged cleanly into `master`.
2. **First-4-Problems Backup Advisory & Deck Export Spotlight**:
   - Gentle backup reminder modal triggers after 4 scored card reviews, spotlighting the Deck Catalog export button with an amber pulse and guidance bubble.
3. **CI Deployment Optimization**:
   - Deploy workflow (`.github/workflows/deploy.yml`) ignores Markdown (`paths-ignore: ["**.md", "docs/**"]`), conserving GitHub Actions minutes and eliminating in-flight deploy cancellations during documentation updates.

#### Current Work in Progress: Comprehensive TypeScript Support (`feature/typescript-support`)
- See [TYPESCRIPT_SUPPORT_PLAN.md](TYPESCRIPT_SUPPORT_PLAN.md) for detailed technical architecture.
- **Phase 1 Infrastructure (Complete)**:
  - Added optional `referenceSolutionTs?: string` to `TopicItem` in `src/lib/leitner.ts`.
  - Ingestion of `<id>.ref.ts` into `topics.json` via `scripts/build-cards.mjs`.
  - Ambient data structures (`ListNode<T>`, `TreeNode<T>`) declared in `SANDBOX_GLOBALS` (`src/utils/typeChecker.ts`).
  - Context-aware solution reveal in `EvaluationPanel.tsx`: renders `referenceSolutionTs` with a blue TypeScript badge when `executionMode === 'ts'`, falling back gracefully to `referenceSolution` with an amber JavaScript badge.
  - Automated unit tests in `src/components/EvaluationPanel.test.tsx`.
- **Phase 2 Buffer Policy (Complete)**:
  - Cold-start recall integrity is strictly preserved: the editor buffer is NOT overwritten or injected with stubs upon switching between JS and TS modes.
  - Typed signatures are embedded into prompt headings (`### fn(arg: Type): ReturnType`).
- **Phase 3 Dual Solutions Rollout** (in progress; 204 of 271 cards have a `.ref.ts`; `npm run report:ts` prints the live numbers; `TYPESCRIPT_SUPPORT_PLAN.md` is the authoritative batch-by-batch status):
  - Complete: Algorithms, Async JS, JS Language, TypeScript Patterns, JS Utilities, and DOM/Browser tracks (6 tracks, 100% complete), plus part of React.
  - Remaining: rest of React, React Components, Testing/Tooling.

#### Next Steps (in priority order)
1. Complete remaining TypeScript dual-solution batches on `feature/typescript-support` (Trees/Graphs -> Lists/Heaps -> React -> JS Utilities).
2. Keep `npm run e2e` green on `master` (run after card/runner modifications).
3. Wrong-answer ("mutation") checks per card across `scripts/mutation-baseline.jsonl`.
4. Content gaps: accessibility rungs, CSS (needs real-browser layout grading), DOM/browser extras, remaining ladder holes (§7.1), then React 19 APIs.
5. Product: "Front-end screen" Focus preset + interview-importance weighting, stats/history view (staged unlocks respect Focus).
6. Complexity fields: maintain algorithm-only scoping, normalized notation, human spot-check.
7. Sandboxed execution (iframe) so no runaway code can freeze the tab.

### 7.6 History of card categories (batches 13-26; kept for context)
> Most rows below are DONE. For what is still open, use §7.0 and §7.5 above, which are the current sources of truth.
Algorithms were filled in batch 13. Candidates, with the owner's goal in mind (re-typing interview algorithms by hand), in recommended order:

| # | Category | Why | Grading | Effort |
|---|---|---|---|---|
| 1 | **Algorithms, round 2** | Still the most common interview content: 2D DP (LCS, edit distance, knapsack), Dijkstra, union-find, monotonic stack, bit tricks, greedy/intervals, LRU with a doubly linked list | pure input/expected | low |
| 2 | **Ladder holes (§7.1)** — DONE for pure/TS concepts in batch 14; React/DOM holes remain | Every concept should start at d1/d2 | DOM harness | medium |
| 3 | **Language depth (§7.2.7)** — ALL DONE (batch 15 & 22): Proxy/Weak*/descriptors/prototypes, hoisting/TDZ, this resolution, tagged templates, Symbol.asyncIterator, coroutines | pure input/expected | low |
| 4 | **TypeScript type-level (§7.2.3)** — DONE (batch 24): conditional `infer`, template literals, branded types, overloads, mapped modifiers | type-level + runtime | low |
| 5 | **Testing & libs, pure logic (§7.2.4)** — ALL DONE (batch 25): `mockFn`, `fakeTimers`, `miniExpect`, `nextRouteMatcher`, `testRunnerLifecycle` (d5 Expert) | pure input/expected | low |
| 6 | **DOM/browser extras (§7.2.6)** | drag-and-drop, observers, `pushState` router | DOM harness | medium |
| 7 | **React 19 / a11y** | `useOptimistic`, `useTransition`, roving focus, `aria-live` | needs sandbox changes (§7.2.8) | high |

**Round 3 progress (batches 18+):** sliding window, strings, 1D DP DONE (batch 18, `part18.mjs`). Trees + linked lists r2 DONE (batch 19, `part19.mjs`, 9 cards: level order, path sum, diameter/balanced, BST kth/insert/build, build+serialize, max path sum, remove-nth/reorder, add numbers, reverse k-group). Heaps + graph search r2 DONE (batch 20, `part20.mjs`, 7 cards: kth largest, merge k lists, median stream, components/paths, clone/bipartite/valid tree, grid BFS, word ladder). Backtracking r2 DONE (batch 21, `part21.mjs`). Language depth remaining DONE (batch 22, `part22.mjs`: hoisting/TDZ scope, this context, tagged templates, Symbol.asyncIterator, coroutines/mini-co). Async depth DONE (batch 23, `part23.mjs`: Promise.any with AggregateError, cancelable promise + withTimeout, polling with backoff, async generator pagination/stream, pub/sub with wildcards). TypeScript type-level DONE (batch 24, `part24.mjs`: infer conditional unpack, template literal strings/dot paths, branded nominal types, overloads/exhaustive narrowing, mapped modifiers/deep readonly). Testing & libs pure logic DONE (batch 25, `part25.mjs`: mockFn call/result tracking, fakeTimers micro-clock harness, miniExpect assertion runner + not chaining, nextRouteMatcher dynamic/catch-all router, testRunnerLifecycle d5 expert runner with nested describe/lifecycle hooks/hierarchical report). React depth & patterns DONE (batch 26, `part26.mjs`: useIsMounted mount guard hook, useMediaQuery responsive listener, breadcrumbsRouter dynamic navigation trail, transferList dual-column selector, nestedCheckboxTree tri-state indeterminate selection tree).

Pick the order; each batch follows the §4 checklist including the complexity step.

### 7.7 Parked features
- **Quick Add Topic with AI** (`AddTopicModal`, switch `FEATURES.quickAdd` in `src/lib/features.ts`, currently `false`). Parked because the AI writes both the reference solution and the tests and nothing checks that they agree, so a draft can silently mark correct answers wrong, and cheap models (Groq `gpt-oss-120b`, `gemini-2.5-flash`) are the ones users are encouraged to pick. The code is still in the app, just hidden.
  The longer-term idea (the user describes a whole topic, such as PostgreSQL, and gets a verified track) is evaluated in `AI_TRACK_GENERATION.md`: custom tracks in the data model, a SQL runtime (PGlite), an outline-first verified pipeline, phases and risks.
  To bring it back: (1) merge the work saved on branch `feature/quick-add-verified` (`caseHarness.ts`: build the test script from input -> expected pairs; `draftVerify.ts`: the reference must pass the drafted tests and an empty solution must fail), (2) change `draftTopicWithAI` in `ai.ts` to ask the model for input/expected pairs instead of a test script, verify the draft, and show the model its own failure and ask for a fix (max 2 rounds), (3) never mark a template or unverified draft as verified, (4) label AI-drafted cards, stop adding default Big-O to non-algorithm cards, (5) tell the user in the dialog to use a stronger model for drafting (Claude 3.5 Sonnet, Gemini 2.5 Pro, GPT-4o, Mistral Large) and keep cheap models for critiques.

### 7.8 Keyboard shortcut hints (DONE)
`src/lib/shortcuts.ts` is the single table of shortcuts (run = Ctrl/Cmd+Enter, submit = Ctrl/Cmd+Shift+Enter, format = Shift+Alt+F or Ctrl/Cmd+Shift+F) with Mac and non-Mac labels (`detectPlatform`: `userAgentData.platform`, then `navigator.platform`, then the user agent).
Buttons get `{...shortcutAttrs(id)}` (`data-shortcut` shows a CSS tooltip on hover and keyboard focus, hidden on touch-only devices; plus `aria-keyshortcuts`), and Settings has a collapsible "Keyboard shortcuts" list. If you change a handler in `PracticeArena`, change `SHORTCUTS` too. Tests: `shortcuts.test.ts`, `e2e/shortcuts.spec.ts`.

### 7.9 Answer flow (DONE): one obvious next step
The flow is designed so the user always knows what to press. `e2e/flow.spec.ts` locks it in.
1. **Answering** (`PracticeArena`): `Skip Card`, `Run Code / Test` (free, unscored, the console shows the checks) and **`Submit Final Answer`** (the one scored attempt; a line under the buttons says so). Inside a practice drill the same button reads **`Check My Practice`** and the line says nothing changes the score.
2. **After a result** (`EvaluationPanel`): the answering controls disappear and the editor is locked ("Your Submitted Answer (locked)"). There is exactly one next step: pass -> **Continue to Next Card**; fail -> **Practice the Pattern** (records the attempt and starts the unscored drill). There is no "retest" of a submitted answer; use Run Code / Test before submitting. The "Override verdict" checkbox stays on the result panel.
3. **Failed attempt**: the critique names the failed checks ("Failed checks: ..."), and the reference solution appears once, in the Reveal panel, which opens automatically after a failure (it is no longer pasted into the critique, and the offline structural checks ignore comments, so the commented-out starter examples are never credited).
4. **Inside the drill**: pass -> **Continue to Next Card**; miss -> **Try Again** or **Skip Drill & Continue** (the banner also has Skip Drill).

### 7.10 Guided tour (DONE)
A dismissable 7-step spotlight walkthrough. It is **offered, never forced**: the welcome screen's default (first, highlighted and focused, so Enter starts it) is "Take a 1-minute tour", with "Start practicing" next to it, and About has "Replay the quick tour". Nothing starts automatically, so existing tests and flows are unaffected.
- Steps and copy live in `src/lib/tour.ts` (`TOUR_STEPS`): (1) the problem description **and** the contract table together, (2) editor, (3) Run/Submit/Skip bar, (4) a centered "one next step" note, then the top bar one control at a time: (5) Practice Arena / Deck Catalog, (6) Focus (says the catalog filters only change what you see; Focus decides what you practice), (7) Settings.
- A step lists `anchors`: values of `data-tour="<anchor>"` attributes (set in `PracticeArena.tsx` and `App.tsx`); with several anchors the spotlight is the box that covers all of them. `tour.test.ts` fails if a step names an anchor that is not in the source, so renaming or removing one of those attributes is caught. `e2e/tour.spec.ts` checks that every spotlight really surrounds its target.
- `GuidedTour.tsx` mounts to start and unmounts to end. It skips steps whose anchors are not on the page, follows scroll/resize, keeps the tooltip inside the viewport (`placeTooltip`), and supports Skip, Back/Next, arrow keys and Escape. Starting it from About switches back to the practice screen first.
- To add or change a step: edit `TOUR_STEPS`, add the `data-tour` anchor(s), and update the step count in `e2e/tour.spec.ts` and `tour.test.ts`.

### 7.11 One-time hints (DONE: first one)
`src/lib/hints.ts` (`isHintSeen` / `markHintSeen`, keys in localStorage, never nags if storage fails). The first hint: the first time someone uses the **Filter Tracks** chips in the Deck Catalog, a callout explains that this filter is for inspecting cards and that choosing what to practice is done with the **Focus** button (with an "Open Focus" button). Shown once ever (`leitner_hint_track_filter`), covered by `e2e/catalog-hint.spec.ts`. Reuse `hints.ts` for any further first-use hint.

### 7.12 Who decides the verdict (DONE: wording and panel)
Rule in code (`ai.ts`): with an AI key, `passed = AI says passed && the harness did not fail`; offline, `passed = harness passed`. So **the tests are the objective check, a failing test run is never a pass, and the AI reviewer can additionally fail a passing run** (it checks things tests cannot, such as using the construct the card asks for) **but it can be wrong** (for example about newer JavaScript such as `Set.prototype.intersection`; the evaluation prompt now states ES2024+ is supported). The result panel (`EvaluationPanel`, `lib/verdict.ts`) therefore shows `Result`, `Tests passed/failed (summary)` and `AI reviewer: pass / needs revision` separately, and when the tests passed but the AI failed the answer it shows an amber note saying so; the human override is always available. Keep About, README and this section in step with that rule.

### 7.13 Activity view and the daily review log (DONE)
- **Data** (`src/lib/dailyStats.ts`): `LeitnerDeckState.dailyStats` maps a local date `YYYY-MM-DD` to `{ reviews, passes }`. `commitCardReview` records every **scored** review (unscored practice drills never reach it). About 20 bytes per active day, kept for 400 days (`DAILY_STATS_KEEP_DAYS`). `sanitizeDailyStats` cleans it on load and on backup import (bad dates and impossible counts are dropped; old backups without the field are fine). History starts on the day logging began; it cannot be reconstructed from the 20-entry `recentReviews` list.
- **View** (`src/components/ActivityView.tsx`): the fourth mode of `DeckStatsWidget` (tabs: Skill Matrix, Track Orbit, Mastery Tiers, **Activity**; the chevrons cycle through all four). Bars are reviews per day over the last 30 days and the green line is the share that passed; the summary reads `N reviews · N active days · N% passed`. It is shown even when no cards are active, and has an explanatory empty state. Plain SVG (no d3), sized like the other three views (280 px wide).
- **Tests:** `dailyStats.test.ts`, `dailyStatsState.test.ts` (recording, reload, backup round trip), `ActivityView.test.tsx` (view and widget wiring, chevron wrap-around), `e2e/activity.spec.ts` (a real scored review and a failed attempt show up; the log survives a reload).

## 8. Conventions and pitfalls for assistants

> Delegable tasks with acceptance criteria, and the rules every contributor follows: see [DELEGATION.md](DELEGATION.md).

- Never run or recreate a bulk fixture generator. Write cases by hand: concrete input and concrete expected value.
- After touching cards: `npm run build:cards && npm test && npm run lint && npx tsc -b`. Then (ideally) smoke-test in the browser.
- Do not edit `src/data/topics.json` directly; it is overwritten by `build:cards`. `npm run check:cards` reports stale cards without writing. Contributor quick rules live in `AGENTS.md`.
- Test files that need `localStorage`/DOM start with `// @vitest-environment jsdom` (default environment is `node`).
- `scripts/cards/**` is excluded from ESLint (the files are sandbox snippets, not modules).
- Keep titles, prompts, and reference solutions consistent (a past audit found cards whose titles promised functions the prompt never asked for).
- **Suspense / transitions / `use()` harnesses (learned the hard way, see `suspense-use-promise` and `tabs-transition-suspense`):**
  (1) mount with `await act(async () => { r = render(ui); })` and click with `await act(async () => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })))`;
  a plain `render()` / `fire.click()` (sync `act`) leaves a suspended render or transition stuck in jsdom. (2) `ReactDOM.createRoot` is stubbed during grading, so never create your own root.
  (3) Never use fixed sleeps for retries: poll with a `waitFor(cond)` that runs `await act(async () => sleep(15))` until the condition holds (production React uses `fallbackAct`, whose timing differs).
  (4) React hides suspended content with `display: none` instead of removing it, so read only visible text. (5) Run the card in real Chromium with `--repeat-each=5` before committing.
- The sandbox exposes a fixed list of React names (`SANDBOX_NAMES` in `runner.ts` + declarations in `typeChecker.ts`): hooks incl. `use`, `useTransition`, `useDeferredValue`, `useOptimistic`, `useActionState`, `startTransition`, and `Suspense`.
  A new name becomes a function parameter, so any card that declares `const <name> = …` at top level breaks: add names sparingly and run the whole suite.
- Work on a branch; do not merge or push `master` unless asked.
