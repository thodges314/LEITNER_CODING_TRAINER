# Topic Expansion Roadmap: Extension Tracks & Modern Interview Packs

> **Status:** Strategic Roadmap & Authoring Specification  
> **Target Tracks:** `tailwind-css`, `graphql`, `sql-postgres`, `realtime-streaming`, `web-performance`, `offline-storage`, `frontend-security`  
> **Architecture:** Zero-backend, 100% in-browser client execution  
> **Delivery Model:** **Optional Extension Packs** (Strictly preserves the 224-card core default deck untouched)  
> **Use Case:** Self-study, AI generation with Claude, and targeted full-stack/frontend interview preparation

---

## 1. Executive Summary & Pack Architecture

The core Leitner Coding Trainer deck currently consists of **224 default cards** (plus the 53-card `algorithms-advanced` pack).

### Core Deck Protection Principle
To avoid overwhelming learners or resetting existing mastery streaks, **all upcoming topics in this roadmap will be authored as Optional Extension Packs** (configured via `scripts/packs.json`).
- Learners can enable/disable them at will from the **Focus Modal** (`FocusModal.tsx`).
- The AI Interview Prep Copilot can pull from these packs when tailoring targeted company curricula (e.g. enabling `realtime-streaming` for a Linear or Figma interview).
- The default 224-card starter deck remains clean, fast, and focused on core JS/TS/DOM/React fundamentals.

### Zero-Backend In-Browser Execution Strategy
Every proposed track runs **100% client-side with zero server infrastructure**:

| Track | In-Browser Execution Engine | How It Works |
|---|---|---|
| **Tailwind CSS** | `@tailwindcss/browser` + Live Preview Iframe | Preview iframe loads Tailwind from CDN. Cards test utility string generators (e.g. `cva`, `twMerge`) in pure JS, or mount React components and assert computed CSS styles / DOM attributes. |
| **GraphQL** | `graphql` / AST parser or mock runner | Light in-browser AST parsing. Cards test query construction, SDL syntax verification, resolver pipeline execution, and custom `DataLoader` batching algorithms. |
| **SQL (Postgres)** | `sql.js` (SQLite compiled to WebAssembly) | WebAssembly runs directly in the client. SQLite is configured with PostgreSQL-compatible ANSI syntax. The harness sets up mock tables, runs the learner's SQL string, and asserts output rows. |
| **Real-Time & Streaming** | Deterministic Mock Streams / Mock Sockets | Harness mocks `ReadableStream` / `WebSocket` to assert reconnection backoff, buffer parsing, and event-boundary splitting. |
| **Web Performance** | Fake Timers + `PerformanceObserver` Polyfill | Evaluates `scheduler.yield()`, frame budget chunking, and layout shift tracking. |
| **Offline-First Storage** | In-Memory `fake-indexeddb` / Sandbox Mock | Tests raw `indexedDB` transactions and async promise wrappers in browser memory. |
| **Frontend Security** | Headless DOM Tree Validation | Validates element stripping, attribute sanitization, and origin checks. |

---

## 2. Track 1: Tailwind CSS (`tailwind-css`)

### Pedagogical Focus
Exercises drill **utility architecture, composition patterns, and design system contracts**:

| Card ID | Title | Difficulty | Description & Learning Target |
|---|---|:---:|---|
| `tailwind-merge-classes` | Tailwind Class Conflict Resolver | T3 (Medium) | Write a utility that merges class lists and properly resolves conflicts (e.g. `p-2` + `p-4` -> `p-4`, `text-red-500` + `text-blue-500` -> `text-blue-500`). |
| `tailwind-cva-variants` | Component Variant Authority (`cva`) | T3 (Medium) | Implement a type-safe variant generator function that accepts base classes, variant maps, and default variants to output merged class strings. |
| `tailwind-responsive-card` | Responsive Product Card Layout | T2 (Easy) | Build a React component utilizing Tailwind classes for mobile-first stack to desktop horizontal card layout (`flex-col md:flex-row`). |
| `tailwind-button-states` | Interactive Button with Pseudo-states | T1 (Warm-up) | Implement accessible interactive button styling with `hover:`, `focus-visible:ring-2`, `active:scale-95`, and `disabled:opacity-50`. |
| `tailwind-arbitrary-parser` | Arbitrary Value Parser & Validator | T3 (Medium) | Parse and validate arbitrary Tailwind class expressions (e.g. `w-[calc(100%-2rem)]`, `grid-cols-[200px_1fr]`). |
| `tailwind-badge-component` | Dynamic Status Badge with Color Mapping | T2 (Easy) | Build a React badge component that maps semantic status props (`success`, `warning`, `danger`, `info`) to corresponding Tailwind background and text color tokens. |

---

## 3. Track 2: GraphQL (`graphql`)

### Pedagogical Focus
Focus on the contracts tested in senior full-stack and frontend interviews:

| Card ID | Title | Difficulty | Description & Learning Target |
|---|---|:---:|---|
| `graphql-dataloader-batch` | DataLoader Batching & Caching | T4 (Hard) | Implement a simplified `DataLoader` class that batches multiple `load(key)` calls within a single event loop tick into a single `batchFunction([keys])` call. |
| `graphql-query-builder` | Object-to-GraphQL Query Serializer | T3 (Medium) | Convert nested JavaScript query definition objects into formatted GraphQL query strings with field selections and arguments. |
| `graphql-schema-validator` | SDL Syntax & Type Validator | T3 (Medium) | Parse a schema string and verify that all referenced types, inputs, and scalar fields exist and are syntactically valid. |
| `graphql-resolver-pipeline` | Field Resolver Pipeline | T3 (Medium) | Implement the core execution logic that resolves an object graph by calling field resolvers with `(parent, args, context, info)`. |
| `graphql-error-formatter` | GraphQL Response Error Normalizer | T2 (Easy) | Format and mask execution errors into standard GraphQL execution responses (`{ data, errors: [{ message, path, locations }] }`). |
| `graphql-fragment-matcher` | Union & Interface Type Matcher | T4 (Hard) | Implement `__resolveType` or fragment condition matching for polymorphic GraphQL queries (`... on AdminUser`). |

---

## 4. Track 3: SQL / PostgreSQL (`sql-postgres`)

### Why PostgreSQL (ANSI SQL)?
- **Universal Standard**: Supabase, Prisma, Neon, AWS RDS, and backend screens at Stripe, Uber, Meta, and Shopify test PostgreSQL / ANSI SQL.
- **Portability**: ANSI SQL query logic executes cleanly in `sql.js` (SQLite WASM) without requiring an external database.

| Card ID | Title | Difficulty | Concepts Tested |
|---|---|:---:|---|
| `sql-second-highest-salary` | Second Highest Salary | T2 (Easy) | `LIMIT/OFFSET`, subqueries, handling `NULL` when only 1 record exists. |
| `sql-top-k-per-category` | Top N Records Per Category | T3 (Medium) | `DENSE_RANK()` or `ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY score DESC)`. |
| `sql-consecutive-login-streaks` | Consecutive Active Streaks | T4 (Hard) | Window functions with `LAG()`, date arithmetic, or `ROW_NUMBER()` grouping technique. |
| `sql-monthly-retention-cohorts` | Monthly User Cohort Retention | T4 (Hard) | Common Table Expressions (`WITH`), date truncation (`DATE_TRUNC`), self-joins. |
| `sql-department-average-salary` | Employees Earning Above Department Average | T3 (Medium) | Correlated subqueries or `AVG() OVER (PARTITION BY dept_id)`. |
| `sql-aggregate-having-filter` | Customer Order Volume Filtering | T2 (Easy) | `INNER JOIN`, `GROUP BY`, `HAVING count(*) >= N`, `COALESCE`. |
| `sql-running-total-cumulative` | Running Total Sales Over Time | T3 (Medium) | `SUM(amount) OVER (ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)`. |
| `sql-cancellation-rate` | Ride Cancellation Rate Analysis | T3 (Medium) | `ROUND()`, `CASE WHEN status != 'completed' THEN 1 ELSE 0 END`, filtering banned users. |

---

## 5. Track 4: Real-Time & Streaming (`realtime-streaming`)

### Pedagogical Focus
Ubiquitous in AI chat streaming (ChatGPT/Claude/Cursor), live collaboration (Figma, Linear), and financial dashboards:

| Card ID | Title | Difficulty | Description & Learning Target |
|---|---|:---:|---|
| `sse-stream-parser` | Server-Sent Events (SSE) Stream Reader | T3 (Medium) | Parse chunked `ReadableStream` outputs, handling partial UTF-8 multi-byte characters and splitting lines on `data: ...\n\n` boundaries. |
| `reconnecting-websocket` | Resilient Reconnecting WebSocket Client | T4 (Hard) | Implement a WebSocket wrapper that handles disconnections with exponential backoff, jitter, and an offline outbound message buffer. |
| `websocket-heartbeat-monitor` | WebSocket Heartbeat Ping/Pong Monitor | T2 (Easy) | Detect zombie connections by scheduling periodic ping frames and forcefully reconnecting if no pong is received within a timeout window. |

---

## 6. Track 5: Web Performance & Core Web Vitals (`web-performance`)

### Pedagogical Focus
INP (Interaction to Next Paint) is the official Google responsiveness standard. Senior frontend screens test keeping the main thread free:

| Card ID | Title | Difficulty | Description & Learning Target |
|---|---|:---:|---|
| `main-thread-chunking-yield` | Long Task Yielding (`scheduler.yield`) | T3 (Medium) | Process a 100,000-item array in time-sliced chunks, yielding back to the browser via `scheduler.yield()` or `setTimeout(0)` when a 16ms frame budget is exceeded. |
| `performance-observer-cls` | Cumulative Layout Shift (CLS) Aggregator | T3 (Medium) | Use `PerformanceObserver` to track unexpected layout shift entries and calculate session window CLS scores. |
| `resource-hint-preloader` | Dynamic Resource Preloader & Priority Hint | T2 (Easy) | Inject optimal `<link rel="preload">` / `<link rel="prefetch">` tags with `fetchpriority="high"` for critical image and chunk URLs. |

---

## 7. Track 6: Offline-First & Storage (`offline-storage`)

### Pedagogical Focus
Modern local-first architectures (Linear, Notion) rely on robust client databases:

| Card ID | Title | Difficulty | Description & Learning Target |
|---|---|:---:|---|
| `promisified-indexeddb` | Promisified IndexedDB Wrapper | T4 (Hard) | Wrap `window.indexedDB` callbacks into a clean async/await API for `openDatabase`, `get(store, key)`, and `put(store, val)`. |
| `offline-mutation-replay` | Offline Mutation Replay Queue | T3 (Medium) | Buffer failed API mutations in local storage and drain them sequentially upon the `window.online` event. |

---

## 8. Track 7: Frontend Security & Sanitization (`frontend-security`)

### Pedagogical Focus
High-priority screening topic for fintech, healthtech, and enterprise SaaS:

| Card ID | Title | Difficulty | Description & Learning Target |
|---|---|:---:|---|
| `xss-html-sanitizer` | Zero-Dependency HTML Sanitizer | T3 (Medium) | Parse HTML text and strip disallowed elements (`<script>`, `<iframe>`) and dangerous attributes (`onload`, `onerror`, `href="javascript:..."`). |
| `secure-postmessage-bridge` | Origin-Checked `postMessage` Bridge | T3 (Medium) | Build a cross-window messenger that strictly verifies `event.origin` against an allowlist and uses cryptographic nonces to prevent unauthorized execution. |

---

## 9. Authoring Guide for Claude (Prompt Template)

When using Claude (e.g. Claude 3.5 Sonnet) to generate cards for any of these extension packs, use this prompt template:

```markdown
You are authoring a new flashcard for the Leitner Coding Trainer.
Follow these repository rules strictly:

1. Terminology & Structure:
   - Provide Card ID: `<id>` (kebab-case)
   - Prompt file: `scripts/cards/<id>.prompt.txt`
   - Canonical JavaScript solution: `scripts/cards/<id>.ref.js`
   - Canonical TypeScript solution: `scripts/cards/<id>.ref.ts`
   - Metadata: `scripts/cards/<id>.meta.json` (specify pack: e.g. "realtime-streaming" or "tailwind-css")
   - Test cases: `scripts/testcases/partXX.mjs`

2. TypeScript & Prompt Rules:
   - Clean markdown formatting (bullet lists only, NO markdown tables).
   - Signatures must be clean: `### functionName(arg: Type): ReturnType`.
   - If complex types are used, extract an `interface` or `type` block in ```ts above the signature.
   - Preserve destructured parameters and default arguments.

3. Canonical Solution Rules:
   - Cold-start active recall focus.
   - Minimal, direct, functional code without decorative classes or extraneous dependencies.

4. Test Case Rules:
   - Provide at least 5-8 edge-case-tested inputs with expected outputs.
   - Use String.raw for escaping characters.
```

---

## 10. Implementation Phasing

1. **Extension Packs**: Add pack definitions to `scripts/packs.json` so all new cards stay outside the default seed deck.
2. **Phase 1 (Frontend Modernization)**: `tailwind-css` & `realtime-streaming` (SSE + WebSocket).
3. **Phase 2 (Senior Architecture)**: `web-performance` (INP chunking) & `offline-storage` (IndexedDB).
4. **Phase 3 (Enterprise & Full-Stack)**: `graphql`, `sql-postgres` (`sql.js` WASM), & `frontend-security`.
