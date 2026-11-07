# AGENTS.md: quick rules for any assistant or contributor

Short version only. Read `DELEGATION.md` (rules, claim table) and `ARCHITECTURE_AND_ROADMAP.md` (system map, gotchas) for the full picture.

## Terminology: Cards vs Topics
- **Card**: An individual flashcard / coding challenge / exercise (e.g. `tic-tac-toe`, `two-sum`, `stepper`). A card has an ID, prompt, test harness, reference solutions (`.ref.js` and `.ref.ts`), difficulty, box/tier, and streak.
- **Topic**: The high-level subject track / category (e.g. `react-components`, `algorithms`, `async-js`, `js-utilities`, `dom-browser`) that groups cards. In UI controls and filters, category pills and table headers are labeled "Topic" / "Topics", while individual problem items are called "Cards".

## Card content: edit the sources, not `src/data/topics.json` or `src/data/catalogIndex.json`
`src/data/topics.json` and `src/data/catalogIndex.json` are **generated** by `npm run build:cards`. They are committed, but never edit them by hand: the next build would overwrite the change. Edit the source instead:

| To change | Edit |
| --- | --- |
| Instructions shown to the learner | `scripts/cards/<id>.prompt.txt` |
| JavaScript / TypeScript reference solution | `scripts/cards/<id>.ref.js` / `<id>.ref.ts` |
| Title, tags, track, overrides | `scripts/cards/<id>.meta.json` |
| Contract table + generated harness | `scripts/testcases/part*.mjs` |
| Hand-written harness (React, DOM, async) | `scripts/cards/<id>.harness.js` (+ `<id>.extra.js`) |
| React preview | `scripts/cards/<id>.preview.js` |
| Difficulty / concept, packs | `scripts/difficulty.json`, `scripts/packs.json` |

## After any card change
1. `npm run build:cards` (then `GROQ_API_KEY=unused node scripts/enrich-complexities.mjs` per `DELEGATION.md`).
2. `npm test`. It checks every reference solution against its own harness.
3. `npm run check:cards` is a read-only check that `topics.json` and `catalogIndex.json` match the sources. It lists any stale cards and exits 1. It never writes.

## State Schema Migrations (`src/lib/deckMigrations.ts`)
- **Adding new cards or editing existing card content does NOT require a migration**:
  - `mergeStoredWithSeed` automatically discovers new seed cards and appends them to user decks, and automatically refreshes all content fields (instructions, reference solutions, test cases, metadata) from the seed files on load while preserving the user's box, streak, and trial schedule.
- **When to add a migration (`CURRENT_DECK_VERSION++` and `migrateV<N>ToV<N+1>`)**:
  - **Track splits or renames**: When existing cards are moved to a brand-new track name (e.g. splitting `graphql` into `graphql` and `graphql-server`), so existing user decks in `localStorage` update their card tracks and preserved `practiceFilter`/`filterPresets` include the new track.
  - **Track consolidation or retirement**: When a track is retired and mapped to successor tracks (e.g. `TRACK_ALIASES`).
  - **Structural state schema changes**: When top-level fields in `LeitnerDeckState` are added, renamed, or change data types.
  - Increment `CURRENT_DECK_VERSION` and add the new sequential migration function to `deckMigrations.ts`, ensuring past user state is never corrupted or reset.

## Escaping conventions in card text
- Contract inputs and expected values are **JavaScript source text**. `'a\nb'` is a string with a real newline; its expected output `'"a\\nb"'` is the five characters `"a\nb"` (a backslash followed by `n`).
- Don't hand-count backslashes: write expected values with `String.raw` in `testcases/part*.mjs`, and say in the case description what the characters mean.
- Prompts are rendered as Markdown. Tables are **not** supported; use bullet lists.
- The contract table's "input" column is shown by `sanitizeCallSignature` (`src/lib/harnessContracts.ts`). It converts `\n` to a line break only outside string literals.

## AI evaluator output
Model replies are untrusted. Parse them with `parseEvaluationPayload` (`src/lib/ai.ts`); malformed output is shown raw via `rawOutput` instead of being split into lists.

## TypeScript prompt and interface conventions
- **Readable signatures vs extracted interfaces**:
  - Keep `### signature(args): ReturnType` headings clean and readable. Never bloat headings with massive 200+ character inline object literals.
  - Never hide parameter or return structures behind opaque interface names without defining what is inside them.
  - When a card involves complex option objects, custom item/node models, or structured return types (e.g. tree nodes, table columns, router definitions, multi-step wizard configs), extract and declare the `interface` or `type` in a ` ```ts ` block at the top of the prompt's `## Description` section.
  - Reference the extracted type in the `### signature` heading.
  - Ensure the canonical TypeScript reference solution (`<id>.ref.ts`) exports/declares and uses the exact same interface shapes so prompt contracts and reference code are 100% synchronized.
- **Destructured parameters and default arguments**:
  - Preserve all destructured parameters and default argument values in both the prompt signature and the `.ref.ts` solution. Do not replace destructured parameters with a single opaque props object if the original contract expects destructured defaults.
- **Sandbox globals and ambient types (`src/utils/typeChecker.ts` + `src/utils/sandboxD3Types.ts`)**:
  - Browser DOM, SVG, Canvas, and event types available in the sandbox include: `HTMLElement`, `HTMLInputElement`, `HTMLTextAreaElement`, `HTMLSelectElement`, `HTMLFormElement`, `HTMLButtonElement`, `HTMLLabelElement`, `HTMLDivElement`, `HTMLSpanElement`, `HTMLParagraphElement`, `HTMLHeadingElement`, `HTMLAnchorElement`, `HTMLImageElement`, `HTMLUListElement`, `HTMLOListElement`, `HTMLLIElement`, `HTMLTableElement`, `HTMLDialogElement`, `HTMLCanvasElement`, `SVGElement`, `SVGSVGElement`, `SVGGElement`, `SVGPathElement`, `SVGRectElement`, `SVGCircleElement`, `PointerEvent`, `WheelEvent`, `DOMRect`, `NodeListOf`.
  - Full ambient D3 type definitions (`d3.Selection`, scales, shapes, `d3.HierarchyNode<T>`, `d3.Quadtree<T>`, `d3.Delaunay`, force simulations, brushes/zoom, geo projections, contours) and predefined D3 card domain interfaces (`VoronoiPoint`, `TreemapNodeData`, `QuadPoint`, `HierarchyRecord`, etc.) live in `src/utils/sandboxD3Types.ts` so learners in TypeScript mode can reference the prompt's interface names directly without re-typing them.
  - For inline React styles, use `Record<string, string | number>` instead of `React.CSSProperties`.
- **Zero `import` / Zero `export` in Reference Solutions & Test Harnesses**:
  - Execution sandboxes inject runtime libraries (`React`, `ReactDOM`, `d3`, `graphql`) and ambient types directly into the evaluation scope.
  - Never write `import ...` or `export ...` in `.ref.js`, `.ref.ts`, or `.harness.js`. Canonical solutions declare functions/classes directly (`function renderChart(...)`, `interface ChartOptions { ... }`).
  - `extractPromptTypeBlocks()` automatically injects extracted prompt interfaces into the ambient typechecker.
  - `stripPredefinedPromptTypes()` automatically strips predefined prompt interfaces from the revealed solution view so learners see only pure implementation code.
  - `detectRedundantScopeInput()` monitors user typing in real time and triggers an advisory popup if learners type `import` or retype prompt interfaces, reminding them that the symbols are already preloaded in scope.

## Component and Live Preview Conventions
- **Preview Library Ingestion (`<id>.meta.json`)**:
  - The live preview sandbox iframe is lightweight and conditionally injects heavy library bundles based strictly on `<id>.meta.json`'s `"previewLibraries"` array.
  - Whenever authoring a card with `rendersComponent: true` that relies on D3, Tailwind, or React, you **must** declare `"previewLibraries": ["d3"]` (or `["tailwind"]`, `["react"]`) in `<id>.meta.json`. Without this declaration, the library bundle will not be loaded into the preview frame and the preview will throw `ReferenceError: <lib> is not defined`.
- **Clean Live Previews (Zero Extraneous Text / Status Bars)**:
  - Preview scripts (`<id>.preview.js`) must render strictly the graphical component or SVG directly into `#preview-root`.
  - Never inject artificial status bars, instructional text headers ("Click on any...", "Drag nodes to..."), or canvas overlays into the preview DOM.
  - User interactions (clicks, brush selections, drag gestures, zoom changes) must be routed to the Live Preview log drawer via `if (typeof log === 'function') log('eventName', payload)`.
- **Cold-Start Recall vs Styling**:
  - Exercises are strictly for cold retrieval of JavaScript/TypeScript, React architecture, component patterns, state management, and accessibility contracts.
  - They are NOT styling drills. Canonical solutions (`.ref.js` and `.ref.ts`) must remain direct, functional, and structurally minimal without extraneous CSS class names or decorative styles.
  - Custom CSS classes are never required or graded unless spatial layout (e.g. Kanban columns, carousel slide container) or visual active state (e.g. filled star ratings) is strictly necessary to decode the UI.
  - When optional preview CSS classes are provided, always document them in the prompt under:
    ```markdown
    #### Optional Styling (CSS is not graded)
    Optional helper classes are available in the preview environment:
    - `.class-name`: short description.
    You may use these classes, custom styles, or your own class names.
    ```
  - **Zero Hardcoded Hex Colors in Cards**: Never put hardcoded hex color strings (`#3b82f6`, `#10b981`, etc.) or manual fallback hex arrays (`d3.schemeTableau10 || ['#4e79a7', ...]`) in card prompts, reference solutions (`.ref.js` / `.ref.ts`), or test harnesses. Use built-in D3 color schemes/interpolators (`d3.schemeTableau10`, `d3.schemeCategory10`, `d3.interpolateBlues`) or standard named CSS colors (`'steelblue'`, `'orange'`, `'seagreen'`, `'teal'`, `'gray'`, `'slategray'`, `'white'`).
  - **D3 Hover Performance (CSS `:hover` over D3 `mouseover` loops)**: In D3 cards and app visualizations, never require superfluous D3 `mouseover`/`mouseenter`/`mouseleave` handlers that iterate over DOM nodes just for visual hover effects. Delegate visual hover styling and transitions to CSS `:hover` rules in the preview environment (`reactPreviewFrame.ts`), reserving D3 listeners for semantic interactions (`click` selection, `brush`, or coordinate spatial queries). Never mention hover effects in a card's prompt text unless hover behavior is explicitly part of the graded exercise.
- **Live Preview Props Panel & Uncontrolled Components**:
  - The live preview sandbox features a dedicated Props Control Panel (`PropsControlPanel`, `previewPropsConfig.ts`, `usePreviewProps`) supporting `string`, `number`, `boolean`, `enum`, `function`, and `json` prop types, component grouping, and postMessage synchronization.
  - For uncontrolled React components (components that initialize local state from a prop via `useState(defaultValue)` upon mount), preview wrappers must pass `key={defaultValue}` so changing the default prop in the Props panel triggers a clean re-mount and state re-initialization.

## Execution Environment Conventions (`requiresDom` in `<id>.meta.json`)
- **Worker vs DOM Sandbox**:
  - By default, non-UI cards (algorithms, data structures, utilities, async, node, sql, graphql, language) execute inside an isolated Web Worker thread for performance and runaway execution isolation. Web Workers do NOT have access to DOM globals (`document`, `window`, `HTMLElement`).
  - Cards in UI tracks (`react`, `react-components`, `d3`, `tailwind`, `dom-browser`) or with `rendersComponent: true` are automatically compiled with `requiresDom: true` to execute in the main-thread browser DOM sandbox.
  - Whenever authoring a card in a non-DOM track (e.g. `testing-tooling`, `algorithms`) that creates, inspects, or queries DOM nodes using browser globals (`document.createElement`, `HTMLElement`), you **must** declare `"requiresDom": true` in `scripts/cards/<id>.meta.json`.
  - Never rely on heuristic regex sniffing of card code: `requiresDom` is explicitly encoded at build time on the card model.

## Keep the `.md` files current (same commit as the change)
Docs drift quickly, so update them whenever you change what they describe. Don't wait to be reminded.
- **Counts** (cards, cases, Vitest tests, Playwright tests): `README.md`, `DELEGATION.md` "Current state", `ARCHITECTURE_AND_DETAILS.md`, `ARCHITECTURE_AND_ROADMAP.md`. Get the real numbers from `npm test` and `npx playwright test --list`; don't guess.
- **New or moved files, scripts, or `lib/` behaviour**: the file map in `ARCHITECTURE_AND_ROADMAP.md` (§3) and the relevant section of `ARCHITECTURE_AND_DETAILS.md`.
- **TypeScript dual-solution progress** (`.ref.ts` count, batch status): `TYPESCRIPT_SUPPORT_PLAN.md`, then the summary in the roadmap. The `.ts` twin of the plan is a token-saving scratch copy; keep the two consistent.
- **Branch claims**: the `DELEGATION.md` claim table. Add your row on a branch, and remove it when merged.
- **Card or pipeline conventions** (like the ones in this file): update `AGENTS.md` itself.
- Markdown-only commits don't trigger a deploy, so there is no cost to doing this.

## Before you finish
`npx tsc -b`, `npm run lint`, `npm test`. Work on a branch and don't push `master` (a push deploys).
