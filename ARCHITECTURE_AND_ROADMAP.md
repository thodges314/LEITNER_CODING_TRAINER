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
| Cards | 103 (36 active at first run, 67 locked) |
| Documented test cases | 631 (each shown as input → expected in the UI) |
| Difficulty spread | d1: 14 · d2: 29 · d3: 36 · d4: 20 · d5: 1 |
| Tracks with cards | async-js, data-structures, react, algorithms, js-runtime-fundamentals, async-web-plumbing, collections-transformations, react-patterns, algorithmic-screens, typescript-patterns, js-language, dom-browser |
| Tracks defined but empty | `testing-tooling` (`react-components` has 3 cards: star rating, countdown, file tree) |
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

### 7.0 Coverage assessment against contemporary front-end interviews

Basis: what typical front-end loops ask (JS-utility rounds, "build this component" rounds, React/hooks questions, a11y, light
algorithms, TS). This is a judgement from experience with those formats, not a live survey. Re-assess when the deck changes.

| Area | Status | Cards now | What is there / what is missing |
|---|---|---|---|
| JS utilities (debounce, throttle, memoize, curry, bind, deep-clone, emitter, LRU) | **Strong** (some duplication) | ~35 | Full ladders for rate-limiting, currying, LRU, clone/equality. Duplicates are intentional variants (see 7.3) |
| Async plumbing (pool, retry, queue, allSettled, abort, timeout) | **Strong** | ~20 | Plus `Promise` class from scratch and `promisify`. Missing: `Promise.any`/`AggregateError`, cancelable promise, polling, async generators |
| Core language (closures, `this`, prototypes, iterators) | **Medium** | ~10 | closures, `new`/`instanceof`/`Object.create`, generators, `JSON.stringify`. Missing: output-prediction/hoisting/TDZ quizzes, `Symbol`/`Proxy`/`WeakMap`, getters/setters, class fields, tagged templates |
| String/format utilities | **Medium** | 5 | classNames, query string, formatters, style parsing, CSS specificity. Missing: template engine, markdown-lite, slugify, diffing |
| DOM and browser APIs | **Weak-medium** | 6 | event delegation, vnode→DOM, router, storage TTL, path params, safe JSON. Missing: drag and drop, Mutation/Resize/Intersection observers (outside React), `history.pushState`, clipboard, keyboard shortcuts, `requestAnimationFrame` loops, Web Workers |
| React hooks and state | **Medium** | ~25 | fetch/debounce/throttle/previous/latest/interval/local-storage/click-outside/store/forwardRef/memo/error-boundary/reducer. Missing: undo/redo, form-state hook, `useLayoutEffect`, `useDeferredValue`/`useTransition`, optimistic updates, React 19 APIs |
| React components ("build this") | **Weak** | ~11 | Typeahead, modal, tabs, infinite list, star rating, countdown, file tree. Still missing data table, virtual list, dropdown menu, forms, undo/redo |
| Algorithms | **Weak** | ~19 | arrays/hash/two-pointer/window/stack/binary-search/BFS/intervals/trees-basics. Missing: linked lists, heaps, tries, graphs (grid DFS, topo sort), DP, backtracking, sorting, matrix, bit tricks |
| TypeScript | **Weak-medium** | 6 | unions, generics, utility types, guards, typed emitter. Missing: conditional/`infer`, template-literal types, overloads, branded types, `satisfies`, assertion functions |
| Accessibility | **Weak** | 3 | modal focus, tabs ARIA, typeahead. Missing: menu/dropdown roving focus, `aria-live`, accessible forms/errors, skip links, focus trap utilities |
| CSS/layout | **None** (specificity only) | 1 | Needs a different grading approach (see below) |
| Testing (Jest/RTL) | **None** | 0 | `testing-tooling` track empty |
| Frameworks/libs (Next.js, D3) | **None** | 0 | listed in the owner's stack; see pure-logic approach below |
| System-design style prompts | **None** | 0 | Out of scope for auto-graded cards; see "complete projects" note |

Bottom line: JS utilities and async are the strongest part of the deck. The weakest relative to interview frequency are
**React component builds, algorithms (graph/DP/linked-list/heap/trie), accessibility, TypeScript type-level, CSS and testing**.

### 7.1 Difficulty ladder holes (the owner wants "simple first, then harder" on every concept)
Concepts whose lowest rung is still ≥ 3 (computed from `scripts/difficulty.json`): `a11y-components`(4), `compound`(3), `event-loop`(3),
`infinite-scroll`(3), `iterators`(3), `middleware`(4), `promise-combinators`(3), `react-perf`(3), `resilience`(3), `serialization`(4),
`state-management`(4), `ts-generics`(3), `ts-types`(4), `ts-unions`(3), `typeahead`(4). Also only one d5 card exists.
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
2. **Algorithms** (pure functions, approach a; track `algorithms`): linked list (`reverseList`, `hasCycle`, `mergeTwoLists`; nodes `{val,next}`
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
7. **Language depth**: output-prediction drills expressed as functions that return the observed order/values (hoisting, TDZ, closures in loops,
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
- **Timing tests**: hook/typeahead harnesses use real timers. Their delays and waits were scaled ×3 (e.g. debounce 180 ms with margins of 30-90 ms)
  and passed 3 consecutive runs; the countdown card polls with `until()` instead of fixed waits. Still possible: one retry on failure, or fake timers.
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
