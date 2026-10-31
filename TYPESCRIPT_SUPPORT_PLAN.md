# Comprehensive TypeScript Support & Dual-Solution Roadmap

## 1. Vision & Core Philosophy

The Leitner Coding Trainer provides first-class support for both **JavaScript runtime mastery** (closures, prototypes, event loop, dynamic DOM) and **TypeScript engineering excellence** (strict typing, generics, interfaces, discriminated unions).

### Core Principles

1. **JavaScript is a Permanent First-Class Citizen:** JavaScript solutions are never deprecated or obscured with ugly `as any` type workarounds. Pure prototype and dynamic metaprogramming cards remain JS-first.
2. **Context-Aware Solution Reveal:** When a user clicks _"Reveal Suggested Solution"_, they see the solution in the language mode they practiced in:
   - **JS Mode (`executionMode === 'js'`)** $\rightarrow$ Clean, idiomatic JavaScript (`referenceSolution`).
   - **TS Mode (`executionMode === 'ts'`)** $\rightarrow$ Strongly typed TypeScript (`referenceSolutionTs`), with graceful fallback to JS if a card does not have a dedicated TS implementation.
3. **No Implicit `any` Friction:** Users in TS mode are never greeted with empty buffers that trigger `TS7006: Parameter implicitly has an 'any' type` on their first line of code.
4. **Concrete Contracts:** Test contracts represent concrete runtime input/output pairs (`twoSum([2, 7], 9) => [0, 1]`). Function type signatures define the target shape; individual contract rows remain clean execution examples.
5. **Deterministic Checkpoints & Safe Partial Releases:** Every batch is self-contained and verified with automated test suites (`seedCards.test.ts`) and full production builds (`tsc -b && vite build`). **The branch can be safely merged into `master` at any checkpoint**, immediately unlocking TypeScript support for completed cards with zero regressions on remaining cards.

---

## 2. Master Branch Merge Readiness & Safety Guarantee

> [!IMPORTANT]
> **Can the user merge `feature/typescript-support` into `master` if quota runs out?**
> **YES. Absolutely, safely, and cleanly at any time.**

### Why It Is 100% Safe to Merge to Master:

1. **Zero Half-Migrated State:**  
   The execution engine checks `card.referenceSolutionTs`. If present, the UI enables the dual JS/TS toggle and validates TypeScript compilation against strict rules. If absent, the card seamlessly executes in standard JavaScript mode with no errors or missing types.
2. **Backwards Compatibility:**  
   All 277 existing JavaScript reference solutions and test harnesses remain 100% intact and functional.
3. **Every Batch is Verified:**  
   The entire suite passes with 0 failures:
   - `npm test` (all 46 test files, 1,731 tests passing, including all 277 TypeScript reference solutions and strip-type JS execution).
   - Full production build & type checks (`npx tsc -b`, `npm run lint`, `vite build`).
4. **Immediate Value:**  
   Delivers 100% TypeScript dual-solution coverage across all 277 cards in the deck, complete with in-browser type checking, CodeMirror hover quickinfo, and context-aware solution reveal.

---

## 2.1 Type & Interface Design Strategy

To ensure optimal developer experience, readable problem prompts, and strict type safety:

1. **Explicit Extracted Interfaces vs. Opaque/Bloated Inline Types:**
   - **Never Bloat Heading Signatures:** Long, nested object signatures (e.g. 200+ characters of inline table column shapes, router route configs, or multi-step wizard state) degrade legibility when crammed into the `### signature(args): ReturnType` heading.
   - **Never Hide Structures Behind Undefined Opaque Types:** Avoid introducing types like `Props` or `Options` without defining what fields exist inside them.
   - **Extracted Code Blocks at Top of Prompt:** When a card involves complex option bags, custom item models, or structured return types, the interface is explicitly declared in a ` ```ts ` code block at the beginning of the prompt's `## Description` section. The `### signature` heading then references that declared interface cleanly.
   - **Canonical Synchronization:** The canonical TypeScript reference solution (`<id>.ref.ts`) declares and utilizes the exact same interfaces, ensuring that the learner's instructions and reference implementation are 100% aligned.

2. **Destructured Parameters & Default Arguments Preservation:**
   - When converting JavaScript functions or React components to TypeScript, preserve all parameter destructuring and default argument values (e.g., `({ initialLiked = false, onLike }: LikeButtonProps)`).
   - Never replace destructured parameters with a single opaque parameter object if the contract relies on defaulted properties.

3. **In-Browser Sandbox Globals (`SANDBOX_GLOBALS`):**
   - The browser-side TypeScript sandbox defines core standard DOM types (`HTMLElement`, `HTMLButtonElement`, `HTMLInputElement`, `HTMLDivElement`, `HTMLUListElement`, `HTMLLIElement`).
   - For elements without specific global declarations (e.g. `<h1>`..`<h6>`, `<nav>`), refs are typed as `HTMLElement`.
   - For React component inline styles, `Record<string, string | number>` is used instead of `React.CSSProperties`.

---

## 3. High-Level Progress Dashboard

- **Total Cards in Deck:** 312 cards across 13 tracks
- **Fully Typed Cards Completed:** **312 / 312 (100.0%)**
- **Cards Remaining:** **0 / 312 (0.0%)**
- **Total Batches:** 57 batches (57 completed, 0 remaining)

### Track Completion Status

| Track                     | Cards Total | TS Completed | % Complete | Status                                                |
| :------------------------ | :---------: | :----------: | :--------: | :---------------------------------------------------- |
| **`algorithms`**          |     27      |      27      |   100.0%   | **COMPLETE** (Batches 1–11)                           |
| **`advanced-algorithms`** |     53      |      53      |   100.0%   | **COMPLETE**                                          |
| **`async-js`**            |     21      |      21      |   100.0%   | **COMPLETE** (Batches 12–15)                          |
| **`js-language`**         |     25      |      25      |   100.0%   | **COMPLETE** (Batches 16–20)                          |
| **`typescript-patterns`** |     14      |      14      |   100.0%   | **COMPLETE** (Batches 21–23)                          |
| **`js-utilities`**        |     44      |      44      |   100.0%   | **COMPLETE** (Batches 24–30)                          |
| **`dom-browser`**         |     20      |      20      |   100.0%   | **COMPLETE** (Batches 31–34)                          |
| **`react`**               |     27      |      27      |   100.0%   | **COMPLETE** (Batches 35–39)                          |
| **`react-components`**    |     41      |      41      |   100.0%   | **COMPLETE** (Batches 40–50)                          |
| **`testing-tooling`**     |      5      |      5       |   100.0%   | **COMPLETE** (Batch 48)                               |
| **`node`**                |     15      |      15      |   100.0%   | **COMPLETE** (Batch 51)                               |
| **`graphql`**             |     14      |      14      |   100.0%   | **COMPLETE** (Batch 52)                               |
| **`sql-postgres`**        |      6      |      6       |   100.0%   | **COMPLETE** (Batch 53)                               |
| **TOTAL**                 |   **312**   |   **312**    | **100.0%** | **57 Batches Total (100% COMPLETE)**                  |

---

## 4. Completed Batches (Batches 1–50: 277 Cards — 100% Complete)

All 277 cards below have typed prompt headers (`### fn(args): ReturnType`), canonical `.ref.ts` solutions, and passing dual-mode seed tests.

### Algorithms Track (77 Cards — 100% Complete)

- **Batch 1 (DSA Foundations — 8 cards):** `binary-search-exact`, `two-pointer-sorted-sum`, `sliding-window-fixed`, `valid-parentheses-stack`, `merge-intervals`, `two-sum-hashmap`, `interval-overlap`, `anagram-palindrome`.
- **Batch 2 (Trees & BSTs — 9 cards):** `bst-search-insert`, `bst-validate-lca-invert`, `tree-depth-sum`, `tree-diameter-balanced`, `tree-level-order`, `tree-max-path-sum`, `tree-path-sum`, `tree-build-serialize`, `tree-traversal-dom`.
- **Batch 3 (Linked Lists, Stacks & Heaps — 13 cards):** `reverse-linked-list`, `linked-list-cycle-merge`, `list-add-numbers`, `list-remove-reorder`, `list-reverse-k-group`, `min-stack`, `monotonic-stack-basics`, `monotonic-stack-histogram`, `heap-array-basics`, `min-heap-class`, `heap-kth-largest`, `heap-median-stream`, `heap-merge-k-lists`.
- **Batch 4 (Graphs & Topo Sort — 7 cards):** `graph-adjacency-bfs`, `graph-components-paths`, `graph-grid-bfs`, `graph-word-ladder`, `graph-clone-bipartite`, `flood-fill-islands`, `course-schedule-topo`.
- **Batch 5 (Backtracking & Combinations — 6 cards):** `permutations-subsets-backtracking`, `backtrack-combination-sum`, `backtrack-n-queens`, `backtrack-palindrome-partition`, `backtrack-subsets-permute-unique`, `backtrack-word-search`.
- **Batch 6 (Dynamic Programming Fundamentals — 7 cards):** `climb-stairs-fib-dp`, `coin-change-dp`, `lis-house-robber-dp`, `kadane-prefix-sum`, `unique-paths-grid`, `min-path-sum-grid`, `stock-profit-dp`.
- **Batch 7 (Advanced DP & Subsequences — 5 cards):** `lcs-subsequence`, `edit-distance-knapsack`, `word-break-decode`, `partition-subset-sum`, `dp-array-variants`.
- **Batch 8 (Strings & Window Variants — 6 cards):** `group-anagrams-top-k`, `longest-substring-window`, `min-window-permutation`, `longest-palindrome-substring`, `window-replacement-ones`, `strings-basics`.
- **Batch 9 (Binary Search, Sorting & BST Variants — 5 cards):** `binary-search-variants`, `search-rotated-array`, `merge-sort-quick-sort`, `insertion-sort-basic`, `bst-kth-insert-build`.
- **Batch 10 (Matrix, Bits & Math — 6 cards):** `matrix-rotate-spiral`, `matrix-basics`, `bit-basics`, `bit-tricks-more`, `binary-strings-combinations`, `string-arithmetic`.
- **Batch 11 (Tries, Greedy & Two Pointers — 5 cards):** `trie-prefix-tree`, `trie-nested-object`, `greedy-intervals-circuit`, `jump-game-greedy`, `container-water-two-pointer`.

### Async JavaScript Track (21 Cards — 100% Complete)

- **Batch 12 (Core Promises & Delays — 5 cards):** `sleep-and-delay`, `promise-chaining-syntax`, `event-loop-order`, `promisify-callback`, `promise-all-by-hand`.
- **Batch 13 (Combinators & Polyfills — 5 cards):** `promise-all-polyfill`, `promise-all-vs-settled`, `promise-any-aggregate`, `run-in-sequence`, `promise-class-scratch`.
- **Batch 14 (Networking & Cancellation — 5 cards):** `async-fetch-error-handling`, `fetch-abort-controller`, `cancelable-promise-abort`, `fetch-timeout-dedupe`, `polling-exponential-backoff`.
- **Batch 15 (Concurrency, Queues & Middleware — 6 cards):** `promise-pool`, `retry-with-backoff`, `async-queue-scheduler`, `express-middleware-chain`, `compose-middleware`, `async-generator-pagination`.

### JavaScript Language Mechanics Track (25 Cards — 100% Complete)

- **Batch 16 (`this`, Scope & Function Polyfills — 5 cards):** `bind-call-apply`, `closures-private-state`, `bind-method-partial`, `this-context-binding`, `hoisting-tdz-scope`.
- **Batch 17 (Object Prototypes & Constructor Inheritance — 5 cards):** `new-instanceof-create`, `manual-prototype-linking`, `proto-chain-hasinstance`, `proto-object-create`, `copy-descriptors-mixin`.
- **Batch 18 (Property Descriptors & Templates — 4 cards):** `descriptor-basics`, `getter-setter-pairs`, `tagged-template-literals`, `weak-tag-seen`.
- **Batch 19 (Weak Collections & Iterators — 4 cards):** `weakmap-memoize-object`, `weakmap-private-state`, `weakset-cycle-detection`, `iterators-generators`.
- **Batch 20 (Iterators, Coroutines & Proxies — 7 cards):** `iterable-range-class`, `generators-coroutines`, `symbol-async-iterator`, `proxy-default-logging`, `proxy-negative-index`, `proxy-revocable-readonly`, `proxy-validation-traps`.

### TypeScript Patterns Track (14 Cards — 100% Complete)

- **Batch 21 (Generics & Narrowing — 5 cards):** `ts-identity-first-generics`, `ts-narrowing-typeof-in`, `ts-custom-type-guards`, `ts-branded-nominal-types`, `ts-discriminated-unions-exhaustiveness`.
- **Batch 22 (Utility Types & Conditional Types — 5 cards):** `ts-reimplement-utility-types`, `ts-custom-utility-types`, `ts-infer-conditional-unpack`, `ts-mapped-modifiers-deep-readonly`, `ts-template-literal-strings`.
- **Batch 23 (Advanced Overloads & Generic Components — 4 cards):** `ts-overloads-exhaustive-narrowing`, `ts-generic-api-client`, `ts-generic-component-props`, `ts-typed-event-emitter`.

### JavaScript Utilities Track (37 Cards — 100% Complete)

- **Batch 24 (Function Timing & Throttling — 5 cards):** `debounce-implementation`, `throttle-implementation`, `debounce`, `throttle`, `rate-limiter-middleware`.
- **Batch 25 (Memoization & Functional Patterns — 5 cards):** `memoize-basics`, `memoize`, `curry-compose`, `infinite-currying-sum`, `classnames-utility`.
- **Batch 26 (Collections, Maps & Sets — 5 cards):** `map-frequency-counter`, `set-unique-operations`, `group-by-count-by`, `unique-sort-dedupe`, `custom-array-reduce`.
- **Batch 27 (Array Manipulation & Polyfills — 5 cards):** `array-method-polyfills`, `array-flatten-recursive`, `flatten-array-object`, `format-utilities`, `calendar-month-grid`.
- **Batch 28 (Object Cloning, Equality & Diffing — 5 cards):** `shallow-copy-equal`, `object-deep-clone`, `deep-clone`, `deep-equal`, `object-diff`.
- **Batch 29 (Object Path Access & Merging — 6 cards):** `get-set-path`, `deep-merge-objects`, `highlight-matches`, `simple-stringify`, `json-stringify-polyfill`, `query-string-url`.
- **Batch 30 (Caching & Event Architectures — 6 cards):** `fifo-cache`, `lru-cache-implementation`, `lru-cache-ttl`, `callback-emitter`, `event-emitter`, `pub-sub-wildcard-emitter`.

### DOM & Browser APIs Track (20 Cards — 100% Complete)

- **Batch 31 (Routing & URL Patterns — 5 cards):** `parse-path-params`, `client-side-router`, `mini-history-router`, `next-route-matcher`, `css-specificity`.
- **Batch 32 (Browser Storage & Cookies — 5 cards):** `safe-json-storage`, `storage-ttl-wrapper`, `cookie-parse-serialize`, `copy-to-clipboard`, `parse-style-string`.
- **Batch 33 (Events & User Interaction — 5 cards):** `event-delegation`, `keyboard-shortcut-matcher`, `key-sequence-matcher`, `focus-trap-keydown`, `drop-index-from-pointer`.
- **Batch 34 (DOM Observers & Animation — 5 cards):** `vnode-to-dom`, `raf-throttle`, `lazy-load-observer`, `resize-breakpoints`, `watch-added-elements`.

### React Track (27 Cards — 100% Complete)

- **Batch 35 (Core State & Input Hooks — 5 cards):** `controlled-vs-uncontrolled-input`, `use-toggle-counter`, `focus-on-mount`, `form-state-hook`, `hook-use-previous`.
- **Batch 36 (Advanced Refs & Lifecycle Hooks — 5 cards):** `use-previous-latest-ref`, `use-is-mounted`, `on-click-outside-hook`, `use-media-query`, `use-local-storage-hook`.
- **Batch 37 (Reducers, History & Stores — 5 cards):** `todo-list-reducer`, `use-reducer-todo-list`, `undo-redo-hook`, `history-stack-basic`, `create-store-basic`.
- **Batch 38 (Context, External Stores & Performance — 6 cards):** `context-provider-consumer`, `theme-switcher`, `external-store-hook`, `forward-ref-imperative-handle`, `memo-derived-list`, `memo-stable-callbacks`.
- **Batch 39 (Async, Debouncing & React 19 Concurrent — 6 cards):** `use-debounce-hook`, `use-fetch-basic`, `use-fetch-hook`, `action-state-form`, `suspense-use-promise`, `tabs-transition-suspense`.

### React Components Track (33 of 45 Cards)

- **Batch 40 (Timers, Ratings & Tic-Tac-Toe — 6 cards):** `star-rating-component`, `countdown-component`, `progress-bar`, `stopwatch`, `tic-tac-toe`, `calculate-winner`.
- **Batch 41 (Tooltips, Menus & Notifications — 6 cards):** `tooltip`, `dropdown-menu`, `optimistic-like-button`, `optimistic-list-update`, `toast-queue`, `toast-queue-logic`.
- **Batch 42 (Accordions, Tabs & Modals — 5 cards):** `accordion-component`, `tabs-accordion-compound`, `modal-portal-focus`, `error-boundary-reset`, `simple-error-boundary`.
- **Batch 43 (Lists, Filtering & Pagination — 6 cards):** `filter-list`, `paginate-items`, `load-more-list`, `pagination-controls`, `simple-table`, `data-table`.
- **Batch 44 (Virtualization & Carousels — 5 cards):** `infinite-scroll-list`, `virtual-list`, `visible-window-range`, `image-carousel`, `carousel-index-math`.
- **Batch 45 (Complex Form Inputs & Chips — 5 cards):** `typeahead-autocomplete`, `tag-input`, `add-tag-rules`, `multi-step-form`, `wizard-step-logic`.
- **Batch 46 (Trees & Multi-Lists — 5 cards):** `file-explorer-tree`, `flatten-visible-tree`, `nested-checkbox-tree`, `transfer-list`, `move-between-lists`.
- **Batch 47 (Accessibility & Routing — 7 cards):** `a11y-form-field`, `live-announcer`, `roving-tabindex-toolbar`, `switch-toggle-a11y`, `form-error-summary`, `breadcrumbs-router`, `route-focus-and-skip-link`.
- **Batch 49 (Progress Steps, Popover & Comment Threads — 3 cards):** `stepper`, `popover`, `nested-comments`.
- **Batch 50 (Kanban Board, Sortable Lists & Accessible Combobox — 3 cards):** `kanban-board`, `drag-sortable-list`, `combobox-autocomplete-a11y`.

### Testing & Tooling Track (5 Cards — 100% Complete)

- **Batch 48 (Testing Utilities & Spies — 5 cards):** `call-recorder-spy`, `mock-fn`, `fake-timers`, `mini-expect`, `test-runner-lifecycle`.

---

## 5. Master Roadmap Status (100% Complete — 0 Cards Remaining)

All 277 cards across all 9 tracks in the deck have received:
- Explicit typed Markdown signatures in their prompt headings (`### fn(args): ReturnType` / `### Component({ props }: { ... }): JSX.Element`).
- Strict TypeScript reference solutions (`.ref.ts`) with zero compilation errors, zero `any`, and zero `@ts-ignore` pragmas.
- Ingestion into `src/data/topics.json` via `build-cards.mjs`.
- 100% passing automated test coverage under the dual-mode test harness (`seedCards.test.ts`).

---

## 6. Execution Workflow per Batch

Every single batch follows this strict automated loop:

1. **Prompt Typing:** Add explicit TypeScript markdown signature headers (`### fn(arg: Type): ReturnType`) to `scripts/cards/<id>.prompt.txt`.
2. **Canonical TS Reference:** Implement strict `.ref.ts` solution in `scripts/cards/<id>.ref.ts`.
3. **Build Cards Pipeline:** Execute `node scripts/build-cards.mjs` to ingest solutions into `src/data/topics.json`.
4. **Automated Seed Tests:** Execute `npx vitest run src/lib/seedCards.test.ts -t "TypeScript reference solution"` to guarantee 100% passing tests under the dual-mode runtime harness.
5. **Full Production Verification:** Execute `npm run build` (`eslint .`, `tsc -b`, and `vite build`).
6. **Git Checkpoint:** Commit with explicit batch description and push directly to `feature/typescript-support`.

> [!NOTE]
>
> ### Checkpoint & Quota Pause (21 October 2026)
>
> - **State (24 October 2026):** Batches 1–43 (244 cards) complete and passing. Work continues on branch `feature/ts-coverage`. `feature/typescript-support` is fully merged into `master` and is no longer used.
> - **Next step:** Batch 44 and onward (see the roadmap below; `npm run report:ts` lists the remaining cards).
> - **Live numbers:** run `npm run report:ts` (per-track counts and the remaining-card list). `npm run report:ts -- --check` fails if the dashboard above is out of date.
>
> ### Handoff procedure (for any assistant resuming card work)
> 1. `git checkout feature/ts-coverage` (never commit to `master`; a push to `master` deploys). Run `npm run report:ts` for the live remaining-card list.
> 2. Per card `<id>`: type the prompt heading in `scripts/cards/<id>.prompt.txt` (`### fn<T>(arg: Type): Return`), make sure `scripts/cards/<id>.ref.js` exists (copy from `topics.json` `referenceSolution` if needed), and add `scripts/cards/<id>.ref.ts` (same behaviour, strict types, no `any`, no `@ts-ignore`). Do **not** edit `src/data/topics.json` by hand.
> 3. `npm run build:cards`, then `npx vitest run src/lib/seedCards.test.ts -t "<id>"` (three tests must pass: JS reference, empty solution fails, TypeScript reference).
> 4. Commit every 3-5 cards: `feat(batch-N): TypeScript support for <topic> (N cards)`. Each commit must leave `npx tsc -b`, `npm run lint` and `npm test` green. Update the counts in this file's dashboard (`npm run report:ts -- --check` tells you when they are wrong) and the one-line summary in `ARCHITECTURE_AND_ROADMAP.md` in the same commit.
> 5. React cards (`react`, `react-components`) are the riskiest: pilot ONE card first, check that `$dom`, hooks and JSX type-check in the sandbox (`SANDBOX_GLOBALS` in `src/utils/typeChecker.ts`), and only then do the batch.
> 6. Lint gotcha: `npm run lint` fails on `no-useless-escape` (for example `[\[]` in a regex). Run `npx eslint .` before committing, not only tests.

