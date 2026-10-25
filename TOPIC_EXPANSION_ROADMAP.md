# Topic Expansion Roadmap: Tailwind CSS, GraphQL, and SQL (PostgreSQL)

> **Status:** Strategic Roadmap & Authoring Specification  
> **Target Tracks:** `tailwind-css`, `graphql`, `sql-postgres`  
> **Architecture:** Zero-backend, 100% in-browser client execution  
> **Use Case:** Self-study, AI generation with Claude, and targeted full-stack/frontend interview preparation

---

## 1. Executive Summary & Architectural Feasibility

While the trainer currently excels at JavaScript utilities, DOM/browser APIs, data structures, and React components, modern frontend and full-stack interviews increasingly test three practical pillars:
1. **Tailwind CSS**: Rapid UI composition, design tokens, and utility conflict handling (`cva`, `twMerge`).
2. **GraphQL**: Schema definitions (SDL), queries/mutations, resolver patterns, and the classic `DataLoader` batching pattern.
3. **SQL (PostgreSQL / ANSI)**: Window functions, CTEs, cohorts, and aggregations.

### Zero-Backend In-Browser Execution Strategy
All three tracks can be evaluated in the browser with **zero server infrastructure**:

| Track | In-Browser Execution Engine | How It Works |
|---|---|---|
| **Tailwind CSS** | `@tailwindcss/browser` + Live Preview Iframe | The preview iframe loads Tailwind from CDN. Cards either test utility string generators (e.g. `cva`, `twMerge`) in pure JS, or mount React components and assert computed CSS styles / DOM attributes. |
| **GraphQL** | `graphql` / AST parser or mock runner | Light in-browser AST parsing. Cards test query construction, SDL syntax verification, resolver pipeline execution, and custom `DataLoader` batching algorithms. |
| **SQL (Postgres)** | `sql.js` (SQLite compiled to WebAssembly) | WebAssembly runs directly in the client. SQLite is configured with PostgreSQL-compatible ANSI syntax. The harness sets up mock tables, runs the learner's SQL string, and asserts output rows. |

---

## 2. Track 1: Tailwind CSS (`tailwind-css`)

### Pedagogical Focus
Exercises should not be arbitrary trivia or memorizing hex codes. Instead, they should drill **utility architecture, composition patterns, and real-world frontend problems**:

### Card Catalog Blueprint
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
- Constructing and formatting clean queries and mutations.
- Implementing the **DataLoader** pattern (a ubiquitous interview question for preventing N+1 database queries).
- Writing and validating Schema Definition Language (SDL) types, inputs, and enums.
- Resolver execution order and context passing.

### Card Catalog Blueprint
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
- **Universal Industry Standard**: Supabase, Prisma, Neon, AWS RDS, CockroachDB, and standard backend screens at Stripe, Uber, Meta, and Shopify all test PostgreSQL / ANSI SQL.
- **Portability**: ANSI SQL query logic (`SELECT`, `JOIN`, `GROUP BY`, `HAVING`, `UNION`, `CASE WHEN`, Subqueries, CTEs, and Window Functions) executes cleanly in `sql.js` (SQLite WASM) without requiring an external database.

### Card Catalog Blueprint
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

## 5. Authoring Guide for Claude (Prompt Template)

When using Claude (e.g. Claude 3.5 Sonnet) to generate cards for these tracks, use the following strict prompt to ensure 100% compatibility with the trainer's test runner and conventions:

```markdown
You are authoring a new flashcard for the Leitner Coding Trainer.
Follow these repository rules strictly:

1. Terminology & Structure:
   - Provide the Card ID: `<id>` (kebab-case)
   - Prompt file: `scripts/cards/<id>.prompt.txt`
   - Canonical JavaScript solution: `scripts/cards/<id>.ref.js`
   - Canonical TypeScript solution: `scripts/cards/<id>.ref.ts`
   - Metadata: `scripts/cards/<id>.meta.json`
   - Test harness / cases: `scripts/testcases/partXX.mjs`

2. TypeScript & Prompt Rules:
   - Prompts must render clean markdown (bullet lists only, NO markdown tables).
   - Signatures must be clean: `### functionName(arg: Type): ReturnType`.
   - If complex types are used, extract an `interface` or `type` block in ```ts above the signature.
   - Do NOT use opaque generic names without defining them.
   - Preserve destructured parameters and defaults across prompt and .ref.ts.

3. Canonical Solution Rules:
   - Focus strictly on cold-start active recall.
   - Solutions must be functional, minimal, and direct.
   - No unnecessary decorative styling or external third-party dependencies unless part of the sandbox.

4. Test Case Rules:
   - Provide at least 5-8 edge-case-tested inputs with expected outputs.
   - Use String.raw for escaping characters.
```

---

## 6. Implementation Phasing

1. **Phase 1: Tailwind CSS Track**:
   - Zero new dependencies required for pure JS utility cards (`tailwind-merge-classes`, `tailwind-cva-variants`).
   - Add Tailwind CDN script tag to the preview iframe template in `src/lib/reactPreviewFrame.ts` for component styling.
2. **Phase 2: GraphQL Track**:
   - Write standard algorithmic / structural JS/TS cards (`graphql-dataloader-batch`, `graphql-query-builder`, `graphql-schema-validator`).
3. **Phase 3: SQL (PostgreSQL) Track**:
   - Integrate `sql.js` (WASM) into the card runner for SQL challenge types (`sqlRunner.ts`).
   - Define a simple table fixture format in test cases (`schema: "CREATE TABLE...", fixtures: "INSERT INTO...", query: userCode`).
