# Leitner Coding Trainer — Architecture and Roadmap

Audience: a future human or AI assistant picking this project up cold. Read this first, then `README.md`.
Last updated on branch `improvements/audit-fixes` (not yet merged to `master`; pushing `master` deploys GitHub Pages).

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
- **Hard rule from the owner:** cards are authored by hand under `scripts/cards/` and `scripts/testcases/`. Never generate
  test cases with regexes or LLM bulk fixtures; the old `generate_all_fixtures.cjs` corrupted cards and was deleted.

## 2. Current state (snapshot)

| Item | Value |
|---|---|
| Cards | 178 (74 active at first run) |
| Documented test cases | 1150 (each shown as input → expected in the UI) |
| Difficulty spread | d1: 31 · d2: 59 · d3: 59 · d4: 28 · d5: 1 |
| Tracks with cards | async-js, data-structures, react, algorithms (29), js-runtime-fundamentals, async-web-plumbing, collections-transformations, react-patterns, algorithmic-screens, typescript-patterns, js-language, dom-browser, react-components (16) |
| Tracks defined but empty | `testing-tooling` |
| Complexity metadata | every card has `targetTime`, `targetSpace`, `complexityExplanation` (see §4) |
| Automated tests | ~600 (Vitest; 508 in the card-content suites alone). Every card's harness must pass with its reference solution **and fail with an empty solution**, plus unit tests for scheduling algorithms and formatting |
| Manual verification | The 66 original cards and all React cards (31 cards incl. every `react-components` card) were run in the production build in a real browser. The other cards added later pass in jsdom only |

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
    harnessContracts.ts        extracts the "Target Contract" table shown for a card
    ai.ts                      optional AI evaluator (Gemini/OpenAI-compatible); advisory only
    drafts.ts                  per-card editor autosave (localStorage `leitner_draft:<id>`)
  types/
    rainbowbrackets.d.ts       type declarations for rainbowbrackets extension
  utils/typeChecker.ts         lazy-loaded TS compiler + real ES2022 lib files for strict-mode checking
  data/topics.json             GENERATED seed deck (do not hand-edit; see §4)
scripts/
  build-cards.mjs              builds topics.json from the sources below   (npm run build:cards)
  difficulty.json              id -> { difficulty 1-5, concept }
  cards/<id>.{meta.json,prompt.txt,ref.js,harness.js,extra.js}
  testcases/part1-8.mjs, index.mjs   hand-written input/expected pairs
```

State keys in `localStorage`: `leitner_coding_deck` (deck + filter + presets + algorithm preference), `leitner_draft:<cardId>`, AI settings keys
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
→ `node scripts/enrich-complexities.mjs` → `npm test`. A card with no cache entry has no complexity fields.

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
  - `Cmd + Shift + Enter` / `Ctrl + Shift + Enter`: Submit for Evaluation
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
- A synchronous infinite loop freezes the tab (no timeout is possible in-page). Drafts are autosaved so nothing is lost.

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

## 7. Roadmap

### 7.0 Coverage assessment against contemporary front-end interviews

Basis: what typical front-end loops ask (JS-utility rounds, "build this component" rounds, React/hooks questions, a11y, light
algorithms, TS). This is a judgement from experience with those formats, not a live survey. Re-assess when the deck changes.

| Area | Status | Cards now | What is there / what is missing |
|---|---|---|---|
| JS utilities (debounce, throttle, memoize, curry, bind, deep-clone, emitter, LRU) | **Strong** (some duplication) | ~35 | Full ladders for rate-limiting, currying, LRU, clone/equality. Duplicates are intentional variants (see 7.3) |
| Async plumbing (pool, retry, queue, allSettled, abort, timeout) | **Strong** | ~20 | Plus `Promise` class from scratch and `promisify`. Missing: `Promise.any`/`AggregateError`, cancelable promise, polling, async generators |
| Core language (closures, `this`, prototypes, iterators) | **Medium-strong** (batch 15) | ~24 | closures, `new`/`instanceof`/`Object.create`, generators, `JSON.stringify`, plus batch 15: `Proxy` (defaults, negative index, validation, revocable read-only), `WeakMap`/`WeakSet` (tags, private state, memoize, cycles), property descriptors (hidden/constant, getter/setter, clone/mixin), prototype inheritance (Object.create, ES5 Animal/Dog, chain walking, `Symbol.hasInstance`). Missing: output-prediction/hoisting/TDZ quizzes, `Symbol` registry/well-knowns beyond `hasInstance`, class fields/static blocks, tagged templates, `Reflect` depth |
| String/format utilities | **Medium** | 5 | classNames, query string, formatters, style parsing, CSS specificity. Missing: template engine, markdown-lite, slugify, diffing |
| DOM and browser APIs | **Weak-medium** | 6 | event delegation, vnode→DOM, router, storage TTL, path params, safe JSON. Missing: drag and drop, Mutation/Resize/Intersection observers (outside React), `history.pushState`, clipboard, keyboard shortcuts, `requestAnimationFrame` loops, Web Workers |
| React hooks and state | **Medium** | ~25 | fetch/debounce/throttle/previous/latest/interval/local-storage/click-outside/store/forwardRef/memo/error-boundary/reducer. Missing: undo/redo, form-state hook, `useLayoutEffect`, `useDeferredValue`/`useTransition`, optimistic updates, React 19 APIs |
| React components ("build this") | **Weak** | ~11 | Typeahead, modal, tabs, infinite list, star rating, countdown, file tree, filter list, accordion, error boundary, a11y field, load-more list, memo list, simple + full data table, dropdown menu, virtual list; hooks: useToggle/useCounter, useHistory, useForm. Still missing: multi-step form wizard, tooltip/popover, drag-sortable list (keyboard fallback), pagination controls, tag/chip input, stepper/progress bar, lazy image (IntersectionObserver), copy-to-clipboard button, theme switcher (context + localStorage), kanban board, nested comments, React 19 APIs |
| Algorithms | **Medium-strong** (batch 13) | ~39 | arrays/hash/two-pointer/window/stack/BFS/intervals/trees, plus batch 13: linked lists, MinStack/queue, strings, anagrams, DP (fib, coin change, LIS, robber), BST/LCA, grid DFS, topo sort, trie, heap, sorting, backtracking, binary-search variants, matrix, Kadane/prefix sums. Missing: graph shortest path (Dijkstra, union-find), bit tricks, monotonic stack/deque, 2D DP (LCS, edit distance, knapsack), intervals/greedy variants, LRU-style design with linked lists |
| TypeScript | **Weak-medium** | 6 | unions, generics, utility types, guards, typed emitter. Missing: conditional/`infer`, template-literal types, overloads, branded types, `satisfies`, assertion functions |
| Accessibility | **Weak** | 3 | modal focus, tabs ARIA, typeahead. Missing: menu/dropdown roving focus, `aria-live`, accessible forms/errors, skip links, focus trap utilities |
| CSS/layout | **None** (specificity only) | 1 | Needs a different grading approach (see below) |
| Testing (Jest/RTL) | **None** | 0 | `testing-tooling` track empty |
| Frameworks/libs (Next.js, D3) | **None** | 0 | listed in the owner's stack; see pure-logic approach below |
| System-design style prompts | **None** | 0 | Out of scope for auto-graded cards; see "complete projects" note |

Bottom line: JS utilities and async are the strongest part of the deck. The weakest relative to interview frequency are
**React component builds, algorithms (graph/DP/linked-list/heap/trie), accessibility, TypeScript type-level, CSS and testing**.

### 7.1 Difficulty ladder holes (the owner wants "simple first, then harder" on every concept)
**Status after batch 14** (`scripts/testcases/part14.mjs`, authored via `scripts/cards-batch14.mjs`, deletable): 14 starter rungs were added for
`sorting`, `heap`, `trie`, `backtracking`, `matrix`, `graphs`, `event-loop`, `promise-combinators`, `iterators`, `middleware`, `serialization`,
`ts-generics`, `ts-unions`, `ts-types` (all pure-function or type-level cards, 570 tests passing). Concepts whose lowest rung is **still ≥ 3** (all React/DOM,
need a hand-written DOM harness and a browser smoke test): `state-management`(4), `tree-ui`(3), `history-state`(3), `virtualization`(4),
`carousel`(3), `optimistic-ui`(3), `notifications`(3). Also only one d5 card exists.
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
2. **Algorithms** (pure functions, approach a; track `algorithms`). **DONE in batch 13** (20 cards, `scripts/testcases/part13.mjs`, authored via `scripts/cards-batch13.mjs`, which can be deleted): linked list (`reverseList`, `hasCycle`, `mergeTwoLists`; nodes `{val,next}`
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
7. **Language depth** (**partly DONE in batch 15**, `scripts/cards-batch15.mjs` + `part15.mjs`, 14 cards: Proxy, WeakMap/WeakSet, descriptors, prototypes; still open: output-prediction, hoisting/TDZ, tagged templates, `Symbol.asyncIterator`): output-prediction drills expressed as functions that return the observed order/values (hoisting, TDZ, closures in loops,
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
1. Fill ladder holes (§7.1) so every concept starts at d1/d2. 2. Playwright smoke test + wider timing margins (batch 13 and later cards are jsdom-only).
3. Stats/history. 4. Next card category (see below). 5. Sandboxed execution.

### 7.6 DECISION NEEDED: next card categories
Algorithms were filled in batch 13. Candidates, with the owner's goal in mind (re-typing interview algorithms by hand), in recommended order:

| # | Category | Why | Grading | Effort |
|---|---|---|---|---|
| 1 | **Algorithms, round 2** | Still the most common interview content: 2D DP (LCS, edit distance, knapsack), Dijkstra, union-find, monotonic stack, bit tricks, greedy/intervals, LRU with a doubly linked list | pure input/expected | low |
| 2 | **Ladder holes (§7.1)** — DONE for pure/TS concepts in batch 14; React/DOM holes remain | Every concept should start at d1/d2 | DOM harness | medium |
| 3 | **Language depth (§7.2.7)** — Proxy/Weak*/descriptors/prototypes DONE (batch 15); output-prediction, hoisting/TDZ, tagged templates open | Output-prediction, hoisting/TDZ, tagged templates | pure input/expected | low |
| 4 | **TypeScript type-level (§7.2.3)** | Conditional/`infer`, template-literal types, overloads | `@ts-expect-error` extras | medium |
| 5 | **Testing & libs, pure logic (§7.2.4)** | `mockFn`, fake timers, mini `expect`, D3 scales, Next route matcher | pure input/expected | low |
| 6 | **DOM/browser extras (§7.2.6)** | drag-and-drop, observers, `pushState` router | DOM harness | medium |
| 7 | **React 19 / a11y** | `useOptimistic`, `useTransition`, roving focus, `aria-live` | needs sandbox changes (§7.2.8) | high |

Pick the order; each batch follows the §4 checklist including the complexity step.

## 8. Conventions and pitfalls for assistants

- Never run or recreate a bulk fixture generator. Write cases by hand: concrete input and concrete expected value.
- After touching cards: `npm run build:cards && npm test && npm run lint && npx tsc -b`. Then (ideally) smoke-test in the browser.
- Do not edit `src/data/topics.json` directly; it is overwritten by `build:cards`.
- Test files that need `localStorage`/DOM start with `// @vitest-environment jsdom` (default environment is `node`).
- `scripts/cards/**` is excluded from ESLint (the files are sandbox snippets, not modules).
- Keep titles, prompts, and reference solutions consistent (a past audit found cards whose titles promised functions the prompt never asked for).
- Work on a branch; do not merge or push `master` unless asked.
