# Comprehensive TypeScript Support & Dual-Solution Roadmap

## 1. Vision & Core Philosophy

The Leitner Coding Trainer provides first-class support for both **JavaScript runtime mastery** (closures, prototypes, event loop, dynamic DOM) and **TypeScript engineering excellence** (strict typing, generics, interfaces, discriminated unions).

### Core Principles
1. **JavaScript is a Permanent First-Class Citizen:** JavaScript solutions are never deprecated or obscured with ugly `as any` type workarounds. Pure prototype and dynamic metaprogramming cards remain JS-first.
2. **Context-Aware Solution Reveal:** When a user clicks *"Reveal Suggested Solution"*, they see the solution in the language mode they practiced in:
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
   All 271 existing JavaScript reference solutions and test harnesses remain 100% intact and functional.
3. **Every Batch is Verified:**  
   No batch is committed without passing:
   - `npx vitest run src/lib/seedCards.test.ts` (currently 98/98 TypeScript reference solutions pass runtime tests).
   - `npm run build` (`eslint .`, `tsc -b`, and `vite build`).
4. **Immediate Value:**  
   Merging today immediately delivers:
   - The TypeScript compilation & test harness engine (in-browser `tsc` diagnostics + Sucrase transpilation).
   - CodeMirror QuickInfo hover tooltips for type inspection.
   - Dual-solution reveal panel (`referenceSolutionTs` vs `referenceSolution`).
   - **98 fully typed cards** covering 100% of the **Algorithms** track and 100% of the **Async JS** track.
   - When quota resets, work can resume on the exact next planned batch without any rework.

---

## 3. High-Level Progress Dashboard

- **Total Cards in Deck:** 271 cards across 9 tracks
- **Fully Typed Cards Completed:** **112 / 271 (41.3%)**
- **Cards Remaining:** **159 / 271 (58.7%)**
- **Total Batches:** 48 batches (18 completed, 30 remaining)

### Track Completion Status

| Track | Cards Total | TS Completed | % Complete | Status |
| :--- | :---: | :---: | :---: | :--- |
| **`algorithms`** | 77 | 77 | 100.0% | **COMPLETE** (Batches 1–11) |
| **`async-js`** | 21 | 21 | 100.0% | **COMPLETE** (Batches 12–15) |
| **`js-language`** | 25 | 14 | 56.0% | **IN PROGRESS** (Batches 16–18 done, 19–20 remaining) |
| **`typescript-patterns`** | 14 | 0 | 0.0% | Planned (Batches 21–23) |
| **`js-utilities`** | 37 | 0 | 0.0% | Planned (Batches 24–30) |
| **`dom-browser`** | 20 | 0 | 0.0% | Planned (Batches 31–34) |
| **`react`** | 27 | 0 | 0.0% | Planned (Batches 35–39) |
| **`react-components`** | 45 | 0 | 0.0% | Planned (Batches 40–47) |
| **`testing-tooling`** | 5 | 0 | 0.0% | Planned (Batch 48) |
| **TOTAL** | **271** | **112** | **41.3%** | **48 Batches Total** |

---

## 4. Completed Batches (Batches 1–18: 112 Cards)

All 112 cards below have typed prompt headers (`### fn(args): ReturnType`), canonical `.ref.ts` solutions, and passing dual-mode seed tests.

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

### JavaScript Language Mechanics Track (14 of 25 Complete)
- **Batch 16 (`this`, Scope & Function Polyfills — 5 cards):** `bind-call-apply`, `closures-private-state`, `bind-method-partial`, `this-context-binding`, `hoisting-tdz-scope`.
- **Batch 17 (Object Prototypes & Constructor Inheritance — 5 cards):** `new-instanceof-create`, `manual-prototype-linking`, `proto-chain-hasinstance`, `proto-object-create`, `copy-descriptors-mixin`.
- **Batch 18 (Property Descriptors & Templates — 4 cards):** `descriptor-basics`, `getter-setter-pairs`, `tagged-template-literals`, `weak-tag-seen`.

---

## 5. Master Roadmap for Remaining Work (Batches 19–48: 159 Cards)

Every remaining card in the deck is cataloged below into deterministic, conceptually grouped batches of 4–7 cards.

### Track: `js-language` (11 cards remaining — Batches 19 to 20)
*Focus: Clean typing for prototype methods, descriptor definitions, symbol iterators, and proxies.*

- **Batch 19: Weak Collections & Iterators (4 cards)**
  - `weakmap-memoize-object`: WeakMap: Memoize By Object and Stable IDs
  - `weakmap-private-state`: WeakMap: Private Instance State (Counter, Stack)
  - `weakset-cycle-detection`: WeakSet: Cycle Detection and Object Counting
  - `iterators-generators`: Iterators and Generators

- **Batch 20: Iterators, Coroutines & Proxies (7 cards)**
  - `iterable-range-class`: Iterators: Iterable Range Class and take()
  - `generators-coroutines`: Generators: Coroutines, Bidirectional Communication, Mini-Co Runner
  - `symbol-async-iterator`: Async Iterators: Symbol.asyncIterator, For-Await-Of, Async Range
  - `proxy-default-logging`: Proxy: Default Values and Access Counting
  - `proxy-negative-index`: Proxy: Negative Array Indexing
  - `proxy-revocable-readonly`: Proxy: Revocable Deep Read-Only View
  - `proxy-validation-traps`: Proxy: Validation, Delete and Has Traps

---

### Track: `typescript-patterns` (14 cards — Batches 21 to 23)
*Focus: Ingesting dedicated `.ref.ts` solutions and prompt type signatures for existing TypeScript cards.*

- **Batch 21: Generics & Narrowing (5 cards)**
  - `ts-identity-first-generics`: TS Generics: identity, first, Box<T>
  - `ts-narrowing-typeof-in`: TS Unions: Narrowing With typeof and in
  - `ts-custom-type-guards`: Custom User-Defined Type Guards (isRecord, isError)
  - `ts-branded-nominal-types`: TS Branded Types: Nominal IDs, Validated Email, Brand Helpers
  - `ts-discriminated-unions-exhaustiveness`: Discriminated Unions & Exhaustiveness Checking

- **Batch 22: Utility Types & Conditional Types (5 cards)**
  - `ts-reimplement-utility-types`: TS Types: Rebuild Partial, Readonly, Pick, Record
  - `ts-custom-utility-types`: Custom Utility Types (DeepPartial & PickByType)
  - `ts-infer-conditional-unpack`: TS Conditional Types: infer, Function Unwrappers, DeepAwaited
  - `ts-mapped-modifiers-deep-readonly`: TS Mapped Modifiers: DeepReadonly, Mutable, Concrete, KeyRemap
  - `ts-template-literal-strings`: TS Template Literals: KebabCase, Split, and DotPaths

- **Batch 23: Advanced Overloads & Generic Components (4 cards)**
  - `ts-overloads-exhaustive-narrowing`: TS Function Overloads: Type-Safe Event Map, assertNever
  - `ts-generic-api-client`: Generic Fetch Client with Typed Payloads
  - `ts-generic-component-props`: Generic React Component Props (Generic Select<T>)
  - `ts-typed-event-emitter`: Strictly Typed Event Emitter Map

---

### Track: `js-utilities` (37 cards — Batches 24 to 30)
*Focus: Generic parameters `<T, R>`, function types, and mapped object constraints.*

- **Batch 24: Function Timing & Throttling (5 cards)**
  - `debounce-implementation`: Debounce Function Implementation
  - `throttle-implementation`: Throttle Function Implementation
  - `debounce`: Debounce with Cancel and Flush
  - `throttle`: Throttle with Leading/Trailing Options
  - `rate-limiter-middleware`: In-Memory Rate Limiter Middleware

- **Batch 25: Memoization & Functional Patterns (5 cards)**
  - `memoize-basics`: Memoize a Single-Argument Function
  - `memoize`: Memoize with Custom Key Resolver
  - `curry-compose`: Curry and Compose/Pipe
  - `infinite-currying-sum`: Infinite Currying: sum(1)(2)(3)()
  - `classnames-utility`: classNames / clsx Utility

- **Batch 26: Collections, Maps & Sets (5 cards)**
  - `map-frequency-counter`: Frequency Counter via Native Map
  - `set-unique-operations`: Set Operations & Array Deduplication
  - `group-by-count-by`: groupBy / countBy / keyBy with reduce
  - `unique-sort-dedupe`: Immutable Dedupe and Multi-Key Sort
  - `custom-array-reduce`: Custom Array.prototype.reduce

- **Batch 27: Array Manipulation & Polyfills (5 cards)**
  - `array-method-polyfills`: Array map / filter / reduce Polyfills
  - `array-flatten-recursive`: Recursive Array Flattening
  - `flatten-array-object`: Flatten Nested Arrays and Objects
  - `format-utilities`: Formatting: Numbers, Bytes, Relative Time, Truncate
  - `calendar-month-grid`: Calendar Month Grid

- **Batch 28: Object Cloning, Equality & Diffing (5 cards)**
  - `shallow-copy-equal`: Shallow Copy and Shallow Equal
  - `object-deep-clone`: Deep Clone of Plain Objects
  - `deep-clone`: Deep Clone with Cycles
  - `deep-equal`: Deep Equality Comparison
  - `object-diff`: Object Diff (changed, added, removed)

- **Batch 29: Object Path Access & Merging (6 cards)**
  - `get-set-path`: Safe get / set by Path
  - `deep-merge-objects`: Deep Merge Objects
  - `highlight-matches`: Highlight Search Matches
  - `simple-stringify`: Serialization: simpleStringify (Primitives and Arrays)
  - `json-stringify-polyfill`: JSON.stringify Polyfill
  - `query-string-url`: Query String Parse / Stringify

- **Batch 30: Caching & Event Architectures (6 cards)**
  - `fifo-cache`: Fixed-Size Cache (evict oldest)
  - `lru-cache-implementation`: LRU Cache Implementation
  - `lru-cache-ttl`: LRU Cache with TTL
  - `callback-emitter`: Tiny Event Emitter (on / emit)
  - `event-emitter`: Event Emitter (on / off / once / emit)
  - `pub-sub-wildcard-emitter`: Event Architecture: PubSub with Wildcard Topics and Once Listeners

---

### Track: `dom-browser` (20 cards — Batches 31 to 34)
*Focus: DOM event types (`KeyboardEvent`, `MouseEvent`), element interfaces, and browser storage models.*

- **Batch 31: Routing & URL Patterns (5 cards)**
  - `parse-path-params`: Parse Path Params from a URL Pattern
  - `client-side-router`: Client-Side Router with Params and History
  - `mini-history-router`: Mini Router (history.pushState)
  - `next-route-matcher`: Next.js Dynamic Route Matcher (Static, Params, Catch-all, Optional)
  - `css-specificity`: CSS Selector Specificity Calculator

- **Batch 32: Browser Storage & Cookies (5 cards)**
  - `safe-json-storage`: Safe JSON Read and Write
  - `storage-ttl-wrapper`: localStorage Wrapper with TTL and Namespacing
  - `cookie-parse-serialize`: Cookie Parse and Serialize
  - `copy-to-clipboard`: Copy to Clipboard with Fallback
  - `parse-style-string`: Parse and Build Inline Style Strings

- **Batch 33: Events & User Interaction (5 cards)**
  - `event-delegation`: Event Delegation
  - `keyboard-shortcut-matcher`: Keyboard Shortcut Matcher
  - `key-sequence-matcher`: Key Sequence Matcher (g then i)
  - `focus-trap-keydown`: Focus Trap for a Dialog (Tab handling)
  - `drop-index-from-pointer`: Drag and Drop: Drop Index and Reorder

- **Batch 34: DOM Observers & Animation (5 cards)**
  - `vnode-to-dom`: Render a Virtual Node Tree to the DOM
  - `raf-throttle`: requestAnimationFrame Throttle
  - `lazy-load-observer`: Lazy-Load Images with IntersectionObserver
  - `resize-breakpoints`: Element Breakpoints (ResizeObserver)
  - `watch-added-elements`: Watch for Added Elements (MutationObserver)

---

### Track: `react` (27 cards — Batches 35 to 39)
*Focus: Hook signatures (`usePrevious<T>`, `useLocalStorage<T>`), reducer actions, and React 19 types.*

- **Batch 35: Core State & Input Hooks (5 cards)**
  - `controlled-vs-uncontrolled-input`: Controlled Search Form
  - `use-toggle-counter`: useToggle and useCounter
  - `focus-on-mount`: Focus an Input on Mount (useRef + useEffect)
  - `form-state-hook`: useForm: Values, Errors, Touched, Submit
  - `hook-use-previous`: usePrevious Hook via useRef

- **Batch 36: Advanced Refs & Lifecycle Hooks (5 cards)**
  - `use-previous-latest-ref`: usePrevious, useLatest, and useInterval
  - `use-is-mounted`: useIsMounted Hook: Component Mount Status Guard
  - `on-click-outside-hook`: useOnClickOutside Hook
  - `use-media-query`: useMediaQuery Hook: Responsive MatchMedia Listener
  - `use-local-storage-hook`: useLocalStorage Hook

- **Batch 37: Reducers, History & Stores (5 cards)**
  - `todo-list-reducer`: Todo List State: Reducer + Selectors
  - `use-reducer-todo-list`: Complex State with useReducer
  - `undo-redo-hook`: useHistory: Undo / Redo
  - `history-stack-basic`: Undo / Redo History Stack
  - `create-store-basic`: A Tiny Store: getState, setState, subscribe

- **Batch 38: Context, External Stores & Performance (6 cards)**
  - `context-provider-consumer`: React Context Provider with Custom Hook
  - `theme-switcher`: Theme Switcher (Context + localStorage)
  - `external-store-hook`: External Store with useSyncExternalStore
  - `forward-ref-imperative-handle`: forwardRef and useImperativeHandle
  - `memo-derived-list`: useMemo for a Derived List
  - `memo-stable-callbacks`: React.memo and Stable Callbacks

- **Batch 39: Async, Debouncing & React 19 Concurrent (6 cards)**
  - `use-debounce-hook`: useDebounce and useThrottle Hooks
  - `use-fetch-basic`: useFetch: Load JSON on Mount
  - `use-fetch-hook`: useFetch with Race-Condition Safety
  - `action-state-form`: React 19 Form Action with useActionState
  - `suspense-use-promise`: React 19 use(promise) with Suspense
  - `tabs-transition-suspense`: Tabs with useTransition + Suspense

---

### Track: `react-components` (45 cards — Batches 40 to 47)
*Focus: React props interfaces (`interface ButtonProps`, `SelectProps<T>`), compound components, and accessibility.*

- **Batch 40: Essential UI Widgets (6 cards)**
  - `star-rating-component`: Star Rating Component
  - `countdown-component`: Countdown Timer Component
  - `stopwatch`: Stopwatch with Laps
  - `progress-bar`: Accessible Progress Bar
  - `tooltip`: Accessible Tooltip
  - `dropdown-menu`: Accessible Dropdown Menu

- **Batch 41: Accordions, Tabs & Modals (5 cards)**
  - `accordion-component`: Accordion Component
  - `tabs-accordion-compound`: Compound Components (Tabs)
  - `modal-portal-focus`: Accessible Modal with Portal and Focus Trap
  - `error-boundary-reset`: Error Boundary with Reset
  - `simple-error-boundary`: Minimal Error Boundary

- **Batch 42: Lists, Filtering & Pagination (6 cards)**
  - `filter-list`: Filterable List
  - `paginate-items`: Paginate a List
  - `load-more-list`: Paginated List with "Load more"
  - `pagination-controls`: Pagination Controls with Ellipsis
  - `simple-table`: Simple Data Table
  - `data-table`: Data Table: Sort, Filter, Paginate

- **Batch 43: Virtualization, Images & Infinite Scroll (5 cards)**
  - `infinite-scroll-list`: Infinite Scroll with IntersectionObserver
  - `virtual-list`: Virtualized (Windowed) List
  - `visible-window-range`: Windowing Math for a Virtual List
  - `image-carousel`: Carousel with Dots and Autoplay
  - `carousel-index-math`: Carousel Index Math

- **Batch 44: Complex Form Inputs & Chips (5 cards)**
  - `typeahead-autocomplete`: Typeahead / Autocomplete Component
  - `tag-input`: Tag / Chip Input
  - `add-tag-rules`: Tag Input Rules: Add, Remove, Paste
  - `multi-step-form`: Multi-Step Form Wizard
  - `wizard-step-logic`: Wizard Step Logic

- **Batch 45: Trees & Multi-Lists (5 cards)**
  - `file-explorer-tree`: File Explorer Tree
  - `flatten-visible-tree`: Flatten a Tree into Visible Rows
  - `nested-checkbox-tree`: Nested Checkbox Tree: Tri-State Parent Selection (Indeterminate)
  - `transfer-list`: Transfer List: Dual-Column Item Picker
  - `move-between-lists`: Move Items Between Two Lists

- **Batch 46: Games, Notifications & Optimistic Updates (6 cards)**
  - `tic-tac-toe`: Tic-Tac-Toe Board
  - `calculate-winner`: Tic-Tac-Toe: Who Won?
  - `optimistic-like-button`: Optimistic Like Button with Rollback
  - `optimistic-list-update`: Optimistic Update: Apply, Confirm, Roll Back
  - `toast-queue`: Toast Notifications (Provider + useToast)
  - `toast-queue-logic`: Toast Queue Logic

- **Batch 47: Accessibility (A11y) & Routing (7 cards)**
  - `a11y-form-field`: Accessible Form Field and Toggle Button
  - `live-announcer`: Screen-Reader Announcer (aria-live)
  - `roving-tabindex-toolbar`: Toolbar with Roving tabindex
  - `switch-toggle-a11y`: Accessible Switch (role=switch)
  - `form-error-summary`: Accessible Form Error Summary
  - `breadcrumbs-router`: Breadcrumbs: Dynamic Path Breadcrumb Generator
  - `route-focus-and-skip-link`: SPA Route Change: Skip Link and Focus

---

### Track: `testing-tooling` (5 cards — Batch 48)
*Focus: Typed assertion chains, spy functions, and mock lifecycle hooks.*

- **Batch 48: Testing Utilities & Spies (5 cards)**
  - `call-recorder-spy`: A Call-Recording Spy
  - `mock-fn`: Mock Function: Call & Argument Tracker (Jest-Style fn)
  - `fake-timers`: Fake Timers: Virtual Micro-Clock Harness
  - `mini-expect`: Mini Expect: Assertion Runner with Deep Equality & Not Chaining
  - `test-runner-lifecycle`: Test Runner Lifecycle: Nested Describe, Hooks & Hierarchical Reporter

---

## 6. Execution Workflow per Batch

Every single batch follows this strict automated loop:
1. **Prompt Typing:** Add explicit TypeScript markdown signature headers (`### fn(arg: Type): ReturnType`) to `scripts/cards/<id>.prompt.txt`.
2. **Canonical TS Reference:** Implement strict `.ref.ts` solution in `scripts/cards/<id>.ref.ts`.
3. **Build Cards Pipeline:** Execute `node scripts/build-cards.mjs` to ingest solutions into `src/data/topics.json`.
4. **Automated Seed Tests:** Execute `npx vitest run src/lib/seedCards.test.ts -t "TypeScript reference solution"` to guarantee 100% passing tests under the dual-mode runtime harness.
5. **Full Production Verification:** Execute `npm run build` (`eslint .`, `tsc -b`, and `vite build`).
6. **Git Checkpoint:** Commit with explicit batch description and push directly to `feature/typescript-support`.
