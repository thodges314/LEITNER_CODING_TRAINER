/**
 * @file TYPESCRIPT_SUPPORT_PLAN.ts
 *
 * Comprehensive TypeScript Support & Dual-Solution Roadmap.
 * Deterministic batch catalog covering all 271 cards in the deck.
 */

export interface BatchDefinition {
  batchNumber: number;
  title: string;
  track:
    | 'algorithms'
    | 'async-js'
    | 'js-language'
    | 'typescript-patterns'
    | 'js-utilities'
    | 'dom-browser'
    | 'react'
    | 'react-components'
    | 'testing-tooling';
  status: 'completed' | 'planned';
  cardCount: number;
  cardIds: string[];
}

export interface TrackStats {
  track: BatchDefinition['track'];
  total: number;
  completed: number;
  status: 'COMPLETE' | 'IN_PROGRESS' | 'PLANNED';
}

/**
 * 1. MASTER MERGE GUARANTEE
 *
 * Can the user merge `feature/typescript-support` into `master` at any checkpoint?
 * YES - 100% safe at any point.
 *
 * Why:
 * 1. Zero half-migrated state: The execution engine and UI check for `card.referenceSolutionTs`.
 *    If present, TS mode is active; if absent, it falls back seamlessly to standard JS mode.
 * 2. Backwards compatibility: All 271 JavaScript solutions and test harnesses remain untouched.
 * 3. Every batch is verified: 100% passing tests (`seedCards.test.ts`), `eslint .`, `tsc -b`, and `vite build`.
 * 4. Immediate value: Master branch gets the full TypeScript engine, QuickInfo hover tooltips,
 *    and 98 fully typed cards (100% of Algorithms & 100% of Async JS) with zero regressions.
 */
export const MASTER_MERGE_SAFE = true;

/**
 * 2. TRACK BREAKDOWN
 */
export const TRACK_STATS: TrackStats[] = [
  { track: 'algorithms', total: 77, completed: 77, status: 'COMPLETE' },
  { track: 'async-js', total: 21, completed: 21, status: 'COMPLETE' },
  { track: 'js-language', total: 25, completed: 0, status: 'PLANNED' },
  { track: 'typescript-patterns', total: 14, completed: 0, status: 'PLANNED' },
  { track: 'js-utilities', total: 37, completed: 0, status: 'PLANNED' },
  { track: 'dom-browser', total: 20, completed: 0, status: 'PLANNED' },
  { track: 'react', total: 27, completed: 0, status: 'PLANNED' },
  { track: 'react-components', total: 45, completed: 0, status: 'PLANNED' },
  { track: 'testing-tooling', total: 5, completed: 0, status: 'PLANNED' },
];

/**
 * 3. COMPLETED BATCHES (Batches 1–15: 98 cards total)
 */
export const COMPLETED_BATCHES: BatchDefinition[] = [
  {
    batchNumber: 1,
    title: 'DSA Foundations',
    track: 'algorithms',
    status: 'completed',
    cardCount: 8,
    cardIds: [
      'binary-search-exact',
      'two-pointer-sorted-sum',
      'sliding-window-fixed',
      'valid-parentheses-stack',
      'merge-intervals',
      'two-sum-hashmap',
      'interval-overlap',
      'anagram-palindrome',
    ],
  },
  {
    batchNumber: 2,
    title: 'Trees & BSTs',
    track: 'algorithms',
    status: 'completed',
    cardCount: 9,
    cardIds: [
      'bst-search-insert',
      'bst-validate-lca-invert',
      'tree-depth-sum',
      'tree-diameter-balanced',
      'tree-level-order',
      'tree-max-path-sum',
      'tree-path-sum',
      'tree-build-serialize',
      'tree-traversal-dom',
    ],
  },
  {
    batchNumber: 3,
    title: 'Linked Lists, Stacks & Heaps',
    track: 'algorithms',
    status: 'completed',
    cardCount: 13,
    cardIds: [
      'reverse-linked-list',
      'linked-list-cycle-merge',
      'list-add-numbers',
      'list-remove-reorder',
      'list-reverse-k-group',
      'min-stack',
      'monotonic-stack-basics',
      'monotonic-stack-histogram',
      'heap-array-basics',
      'min-heap-class',
      'heap-kth-largest',
      'heap-median-stream',
      'heap-merge-k-lists',
    ],
  },
  {
    batchNumber: 4,
    title: 'Graphs & Topo Sort',
    track: 'algorithms',
    status: 'completed',
    cardCount: 7,
    cardIds: [
      'graph-adjacency-bfs',
      'graph-components-paths',
      'graph-grid-bfs',
      'graph-word-ladder',
      'graph-clone-bipartite',
      'flood-fill-islands',
      'course-schedule-topo',
    ],
  },
  {
    batchNumber: 5,
    title: 'Backtracking & Combinations',
    track: 'algorithms',
    status: 'completed',
    cardCount: 6,
    cardIds: [
      'permutations-subsets-backtracking',
      'backtrack-combination-sum',
      'backtrack-n-queens',
      'backtrack-palindrome-partition',
      'backtrack-subsets-permute-unique',
      'backtrack-word-search',
    ],
  },
  {
    batchNumber: 6,
    title: 'Dynamic Programming Fundamentals',
    track: 'algorithms',
    status: 'completed',
    cardCount: 7,
    cardIds: [
      'climb-stairs-fib-dp',
      'coin-change-dp',
      'lis-house-robber-dp',
      'kadane-prefix-sum',
      'unique-paths-grid',
      'min-path-sum-grid',
      'stock-profit-dp',
    ],
  },
  {
    batchNumber: 7,
    title: 'Advanced DP & Subsequences',
    track: 'algorithms',
    status: 'completed',
    cardCount: 5,
    cardIds: [
      'lcs-subsequence',
      'edit-distance-knapsack',
      'word-break-decode',
      'partition-subset-sum',
      'dp-array-variants',
    ],
  },
  {
    batchNumber: 8,
    title: 'Strings & Window Variants',
    track: 'algorithms',
    status: 'completed',
    cardCount: 6,
    cardIds: [
      'group-anagrams-top-k',
      'longest-substring-window',
      'min-window-permutation',
      'longest-palindrome-substring',
      'window-replacement-ones',
      'strings-basics',
    ],
  },
  {
    batchNumber: 9,
    title: 'Binary Search, Sorting & BST Variants',
    track: 'algorithms',
    status: 'completed',
    cardCount: 5,
    cardIds: [
      'binary-search-variants',
      'search-rotated-array',
      'merge-sort-quick-sort',
      'insertion-sort-basic',
      'bst-kth-insert-build',
    ],
  },
  {
    batchNumber: 10,
    title: 'Matrix, Bits & Math',
    track: 'algorithms',
    status: 'completed',
    cardCount: 6,
    cardIds: [
      'matrix-rotate-spiral',
      'matrix-basics',
      'bit-basics',
      'bit-tricks-more',
      'binary-strings-combinations',
      'string-arithmetic',
    ],
  },
  {
    batchNumber: 11,
    title: 'Tries, Greedy & Two Pointers',
    track: 'algorithms',
    status: 'completed',
    cardCount: 5,
    cardIds: [
      'trie-prefix-tree',
      'trie-nested-object',
      'greedy-intervals-circuit',
      'jump-game-greedy',
      'container-water-two-pointer',
    ],
  },
  {
    batchNumber: 12,
    title: 'Core Promises & Delays',
    track: 'async-js',
    status: 'completed',
    cardCount: 5,
    cardIds: [
      'sleep-and-delay',
      'promise-chaining-syntax',
      'event-loop-order',
      'promisify-callback',
      'promise-all-by-hand',
    ],
  },
  {
    batchNumber: 13,
    title: 'Combinators & Polyfills',
    track: 'async-js',
    status: 'completed',
    cardCount: 5,
    cardIds: [
      'promise-all-polyfill',
      'promise-all-vs-settled',
      'promise-any-aggregate',
      'run-in-sequence',
      'promise-class-scratch',
    ],
  },
  {
    batchNumber: 14,
    title: 'Networking & Cancellation',
    track: 'async-js',
    status: 'completed',
    cardCount: 5,
    cardIds: [
      'async-fetch-error-handling',
      'fetch-abort-controller',
      'cancelable-promise-abort',
      'fetch-timeout-dedupe',
      'polling-exponential-backoff',
    ],
  },
  {
    batchNumber: 15,
    title: 'Concurrency, Queues & Middleware',
    track: 'async-js',
    status: 'completed',
    cardCount: 6,
    cardIds: [
      'promise-pool',
      'retry-with-backoff',
      'async-queue-scheduler',
      'express-middleware-chain',
      'compose-middleware',
      'async-generator-pagination',
    ],
  },
];

/**
 * 4. MASTER ROADMAP FOR REMAINING WORK (Batches 16–48: 173 cards total)
 */
export const REMAINING_BATCHES: BatchDefinition[] = [
  // --- js-language track (25 cards, Batches 16–20) ---
  {
    batchNumber: 16,
    title: 'this, Scope & Function Polyfills',
    track: 'js-language',
    status: 'planned',
    cardCount: 5,
    cardIds: [
      'bind-call-apply',
      'closures-private-state',
      'bind-method-partial',
      'this-context-binding',
      'hoisting-tdz-scope',
    ],
  },
  {
    batchNumber: 17,
    title: 'Object Prototypes & Constructor Inheritance',
    track: 'js-language',
    status: 'planned',
    cardCount: 5,
    cardIds: [
      'new-instanceof-create',
      'manual-prototype-linking',
      'proto-chain-hasinstance',
      'proto-object-create',
      'copy-descriptors-mixin',
    ],
  },
  {
    batchNumber: 18,
    title: 'Property Descriptors & Templates',
    track: 'js-language',
    status: 'planned',
    cardCount: 4,
    cardIds: [
      'descriptor-basics',
      'getter-setter-pairs',
      'tagged-template-literals',
      'weak-tag-seen',
    ],
  },
  {
    batchNumber: 19,
    title: 'Weak Collections & Iterators',
    track: 'js-language',
    status: 'planned',
    cardCount: 4,
    cardIds: [
      'weakmap-memoize-object',
      'weakmap-private-state',
      'weakset-cycle-detection',
      'iterators-generators',
    ],
  },
  {
    batchNumber: 20,
    title: 'Iterators, Coroutines & Proxies',
    track: 'js-language',
    status: 'planned',
    cardCount: 7,
    cardIds: [
      'iterable-range-class',
      'generators-coroutines',
      'symbol-async-iterator',
      'proxy-default-logging',
      'proxy-negative-index',
      'proxy-revocable-readonly',
      'proxy-validation-traps',
    ],
  },

  // --- typescript-patterns track (14 cards, Batches 21–23) ---
  {
    batchNumber: 21,
    title: 'Generics & Narrowing',
    track: 'typescript-patterns',
    status: 'planned',
    cardCount: 5,
    cardIds: [
      'ts-identity-first-generics',
      'ts-narrowing-typeof-in',
      'ts-custom-type-guards',
      'ts-branded-nominal-types',
      'ts-discriminated-unions-exhaustiveness',
    ],
  },
  {
    batchNumber: 22,
    title: 'Utility Types & Conditional Types',
    track: 'typescript-patterns',
    status: 'planned',
    cardCount: 5,
    cardIds: [
      'ts-reimplement-utility-types',
      'ts-custom-utility-types',
      'ts-infer-conditional-unpack',
      'ts-mapped-modifiers-deep-readonly',
      'ts-template-literal-strings',
    ],
  },
  {
    batchNumber: 23,
    title: 'Advanced Overloads & Generic Components',
    track: 'typescript-patterns',
    status: 'planned',
    cardCount: 4,
    cardIds: [
      'ts-overloads-exhaustive-narrowing',
      'ts-generic-api-client',
      'ts-generic-component-props',
      'ts-typed-event-emitter',
    ],
  },

  // --- js-utilities track (37 cards, Batches 24–30) ---
  {
    batchNumber: 24,
    title: 'Function Timing & Throttling',
    track: 'js-utilities',
    status: 'planned',
    cardCount: 5,
    cardIds: [
      'debounce-implementation',
      'throttle-implementation',
      'debounce',
      'throttle',
      'rate-limiter-middleware',
    ],
  },
  {
    batchNumber: 25,
    title: 'Memoization & Functional Patterns',
    track: 'js-utilities',
    status: 'planned',
    cardCount: 5,
    cardIds: [
      'memoize-basics',
      'memoize',
      'curry-compose',
      'infinite-currying-sum',
      'classnames-utility',
    ],
  },
  {
    batchNumber: 26,
    title: 'Collections, Maps & Sets',
    track: 'js-utilities',
    status: 'planned',
    cardCount: 5,
    cardIds: [
      'map-frequency-counter',
      'set-unique-operations',
      'group-by-count-by',
      'unique-sort-dedupe',
      'custom-array-reduce',
    ],
  },
  {
    batchNumber: 27,
    title: 'Array Manipulation & Polyfills',
    track: 'js-utilities',
    status: 'planned',
    cardCount: 5,
    cardIds: [
      'array-method-polyfills',
      'array-flatten-recursive',
      'flatten-array-object',
      'format-utilities',
      'calendar-month-grid',
    ],
  },
  {
    batchNumber: 28,
    title: 'Object Cloning, Equality & Diffing',
    track: 'js-utilities',
    status: 'planned',
    cardCount: 5,
    cardIds: [
      'shallow-copy-equal',
      'object-deep-clone',
      'deep-clone',
      'deep-equal',
      'object-diff',
    ],
  },
  {
    batchNumber: 29,
    title: 'Object Path Access & Merging',
    track: 'js-utilities',
    status: 'planned',
    cardCount: 6,
    cardIds: [
      'get-set-path',
      'deep-merge-objects',
      'highlight-matches',
      'simple-stringify',
      'json-stringify-polyfill',
      'query-string-url',
    ],
  },
  {
    batchNumber: 30,
    title: 'Caching & Event Architectures',
    track: 'js-utilities',
    status: 'planned',
    cardCount: 6,
    cardIds: [
      'fifo-cache',
      'lru-cache-implementation',
      'lru-cache-ttl',
      'callback-emitter',
      'event-emitter',
      'pub-sub-wildcard-emitter',
    ],
  },

  // --- dom-browser track (20 cards, Batches 31–34) ---
  {
    batchNumber: 31,
    title: 'Routing & URL Patterns',
    track: 'dom-browser',
    status: 'planned',
    cardCount: 5,
    cardIds: [
      'parse-path-params',
      'client-side-router',
      'mini-history-router',
      'next-route-matcher',
      'css-specificity',
    ],
  },
  {
    batchNumber: 32,
    title: 'Browser Storage & Cookies',
    track: 'dom-browser',
    status: 'planned',
    cardCount: 5,
    cardIds: [
      'safe-json-storage',
      'storage-ttl-wrapper',
      'cookie-parse-serialize',
      'copy-to-clipboard',
      'parse-style-string',
    ],
  },
  {
    batchNumber: 33,
    title: 'Events & User Interaction',
    track: 'dom-browser',
    status: 'planned',
    cardCount: 5,
    cardIds: [
      'event-delegation',
      'keyboard-shortcut-matcher',
      'key-sequence-matcher',
      'focus-trap-keydown',
      'drop-index-from-pointer',
    ],
  },
  {
    batchNumber: 34,
    title: 'DOM Observers & Animation',
    track: 'dom-browser',
    status: 'planned',
    cardCount: 5,
    cardIds: [
      'vnode-to-dom',
      'raf-throttle',
      'lazy-load-observer',
      'resize-breakpoints',
      'watch-added-elements',
    ],
  },

  // --- react track (27 cards, Batches 35–39) ---
  {
    batchNumber: 35,
    title: 'Core State & Input Hooks',
    track: 'react',
    status: 'planned',
    cardCount: 5,
    cardIds: [
      'controlled-vs-uncontrolled-input',
      'use-toggle-counter',
      'focus-on-mount',
      'form-state-hook',
      'hook-use-previous',
    ],
  },
  {
    batchNumber: 36,
    title: 'Advanced Refs & Lifecycle Hooks',
    track: 'react',
    status: 'planned',
    cardCount: 5,
    cardIds: [
      'use-previous-latest-ref',
      'use-is-mounted',
      'on-click-outside-hook',
      'use-media-query',
      'use-local-storage-hook',
    ],
  },
  {
    batchNumber: 37,
    title: 'Reducers, History & Stores',
    track: 'react',
    status: 'planned',
    cardCount: 5,
    cardIds: [
      'todo-list-reducer',
      'use-reducer-todo-list',
      'undo-redo-hook',
      'history-stack-basic',
      'create-store-basic',
    ],
  },
  {
    batchNumber: 38,
    title: 'Context, External Stores & Performance',
    track: 'react',
    status: 'planned',
    cardCount: 6,
    cardIds: [
      'context-provider-consumer',
      'theme-switcher',
      'external-store-hook',
      'forward-ref-imperative-handle',
      'memo-derived-list',
      'memo-stable-callbacks',
    ],
  },
  {
    batchNumber: 39,
    title: 'Async, Debouncing & React 19 Concurrent',
    track: 'react',
    status: 'planned',
    cardCount: 6,
    cardIds: [
      'use-debounce-hook',
      'use-fetch-basic',
      'use-fetch-hook',
      'action-state-form',
      'suspense-use-promise',
      'tabs-transition-suspense',
    ],
  },

  // --- react-components track (45 cards, Batches 40–47) ---
  {
    batchNumber: 40,
    title: 'Essential UI Widgets',
    track: 'react-components',
    status: 'planned',
    cardCount: 6,
    cardIds: [
      'star-rating-component',
      'countdown-component',
      'stopwatch',
      'progress-bar',
      'tooltip',
      'dropdown-menu',
    ],
  },
  {
    batchNumber: 41,
    title: 'Accordions, Tabs & Modals',
    track: 'react-components',
    status: 'planned',
    cardCount: 5,
    cardIds: [
      'accordion-component',
      'tabs-accordion-compound',
      'modal-portal-focus',
      'error-boundary-reset',
      'simple-error-boundary',
    ],
  },
  {
    batchNumber: 42,
    title: 'Lists, Filtering & Pagination',
    track: 'react-components',
    status: 'planned',
    cardCount: 6,
    cardIds: [
      'filter-list',
      'paginate-items',
      'load-more-list',
      'pagination-controls',
      'simple-table',
      'data-table',
    ],
  },
  {
    batchNumber: 43,
    title: 'Virtualization, Images & Infinite Scroll',
    track: 'react-components',
    status: 'planned',
    cardCount: 5,
    cardIds: [
      'infinite-scroll-list',
      'virtual-list',
      'visible-window-range',
      'image-carousel',
      'carousel-index-math',
    ],
  },
  {
    batchNumber: 44,
    title: 'Complex Form Inputs & Chips',
    track: 'react-components',
    status: 'planned',
    cardCount: 5,
    cardIds: [
      'typeahead-autocomplete',
      'tag-input',
      'add-tag-rules',
      'multi-step-form',
      'wizard-step-logic',
    ],
  },
  {
    batchNumber: 45,
    title: 'Trees & Multi-Lists',
    track: 'react-components',
    status: 'planned',
    cardCount: 5,
    cardIds: [
      'file-explorer-tree',
      'flatten-visible-tree',
      'nested-checkbox-tree',
      'transfer-list',
      'move-between-lists',
    ],
  },
  {
    batchNumber: 46,
    title: 'Games, Notifications & Optimistic Updates',
    track: 'react-components',
    status: 'planned',
    cardCount: 6,
    cardIds: [
      'tic-tac-toe',
      'calculate-winner',
      'optimistic-like-button',
      'optimistic-list-update',
      'toast-queue',
      'toast-queue-logic',
    ],
  },
  {
    batchNumber: 47,
    title: 'Accessibility (A11y) & Routing',
    track: 'react-components',
    status: 'planned',
    cardCount: 7,
    cardIds: [
      'a11y-form-field',
      'live-announcer',
      'roving-tabindex-toolbar',
      'switch-toggle-a11y',
      'form-error-summary',
      'breadcrumbs-router',
      'route-focus-and-skip-link',
    ],
  },

  // --- testing-tooling track (5 cards, Batch 48) ---
  {
    batchNumber: 48,
    title: 'Testing Utilities & Spies',
    track: 'testing-tooling',
    status: 'planned',
    cardCount: 5,
    cardIds: [
      'call-recorder-spy',
      'mock-fn',
      'fake-timers',
      'mini-expect',
      'test-runner-lifecycle',
    ],
  },
];

export const TOTAL_CARDS = 271;
export const TOTAL_COMPLETED = COMPLETED_BATCHES.reduce((sum, b) => sum + b.cardCount, 0);
export const TOTAL_REMAINING = REMAINING_BATCHES.reduce((sum, b) => sum + b.cardCount, 0);
