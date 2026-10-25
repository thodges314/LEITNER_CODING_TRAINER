# AGENTS.md: quick rules for any assistant or contributor

Short version only. Read `DELEGATION.md` (rules, claim table) and `ARCHITECTURE_AND_ROADMAP.md` (system map, gotchas) for the full picture.

## Terminology: Cards vs Topics
- **Card**: An individual flashcard / coding challenge / exercise (e.g. `tic-tac-toe`, `two-sum`, `stepper`). A card has an ID, prompt, test harness, reference solutions (`.ref.js` and `.ref.ts`), difficulty, box/tier, and streak.
- **Topic**: The high-level subject track / category (e.g. `react-components`, `algorithms`, `async-js`, `js-utilities`, `dom-browser`) that groups cards. In UI controls and filters, category pills and table headers are labeled "Topic" / "Topics", while individual problem items are called "Cards".

## Card content: edit the sources, not `src/data/topics.json`
`src/data/topics.json` is **generated** by `npm run build:cards`. It is committed, but never edit it by hand: the next build would overwrite the change. Edit the source instead:

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
3. `npm run check:cards` is a read-only check that `topics.json` matches the sources. It lists any stale cards and exits 1. It never writes.

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
- **Sandbox globals and ambient types (`src/utils/typeChecker.ts`)**:
  - Browser DOM element types available in the sandbox include: `HTMLElement`, `HTMLInputElement`, `HTMLButtonElement`, `HTMLDivElement`, `HTMLUListElement`, `HTMLLIElement`.
  - For heading or section tags (`<h1>`..`<h6>`, `<nav>`), type refs as `HTMLElement` (avoid `HTMLHeadingElement` which is not in `SANDBOX_GLOBALS`).
  - For inline React styles, use `Record<string, string | number>` instead of `React.CSSProperties`.

## Component and Live Preview Conventions
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
- **Live Preview Props Panel & Uncontrolled Components**:
  - The live preview sandbox features a dedicated Props Control Panel (`PropsControlPanel`, `previewPropsConfig.ts`, `usePreviewProps`) supporting `string`, `number`, `boolean`, `enum`, `function`, and `json` prop types, component grouping, and postMessage synchronization.
  - For uncontrolled React components (components that initialize local state from a prop via `useState(defaultValue)` upon mount), preview wrappers must pass `key={defaultValue}` so changing the default prop in the Props panel triggers a clean re-mount and state re-initialization.

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
