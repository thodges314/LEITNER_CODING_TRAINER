# Leitner Coding Trainer

A personal spaced-repetition trainer for cold-start coding practice. You rebuild a pattern from memory from a prompt (debounce, LRU cache, `usePrevious`, a discriminated-union exhaustiveness check, virtual lists, ...), run it against a hidden test harness, and the Leitner box / graduated tier system decides when the card returns.

Built with **React 19 + TypeScript + Vite**. Zero backend — everything runs locally in the browser, and progress lives in `localStorage`.

---

## Quick Start

```bash
npm install
npm run dev           # Start Vite development server (localhost:5173)
npm test              # Run Vitest suite (1,896 tests across 66 test files)
npm run e2e           # Run Playwright E2E suite in real Chromium (640 tests)
npm run check:cards   # Read-only check: verify topics.json & catalogIndex.json match source cards
npm run build:cards   # Rebuild topics.json & catalogIndex.json from scripts/cards/ sources
npm run lint          # Run ESLint across workspace
npm run build         # Type-check + compile production bundle into dist/
```

---

## Core Features & Architecture

### 1. Spaced-Repetition Scheduling (`src/lib/leitner.ts`)
Switchable in Settings between two spaced-repetition models:
- **Classic Leitner Boxes**: 5 boxes with trial-based intervals (+1, +4, +10, +22, +45 reviews). Passing promotes a card; failing resets it to Box 1 and schedules an immediate setback trial.
- **Graduated Interval Recall & Chaining**: 7 progressive tiers with micro-spaced chaining (Tier 1: +1, Tier 2: +3, Tier 3: +7, Tier 4: +16, Tier 5: +35, Tier 6: +75, Tier 7: +165, and dynamic geometric expansion for Tier 8+).
  - **Active Deck Ceiling Guard**: Caps interval offsets to the active deck size $N$ so cards never disappear past a full deck cycle.
  - **Gentle Half-Tier Setbacks**: On failure, cards drop by half (`Math.max(1, Math.floor(tier / 2))`) rather than resetting to zero.
- **Immediate Reinforcement Drill**: Failing a scored review launches an immediate, isolated practice drill on that same card. Learners can study the reference solution and retest until muscle memory is restored; practice drills have **zero negative effect on tier/box or streak stats**.
- **Difficulty Ladder Unlocks**: Every 4 cards promoted to Box/Tier 3+ automatically unlocks the next rung of cards along the concept ladder.

### 2. Cold-Start Editor & Developer Aesthetics (`src/components/PracticeArena.tsx`)
- Powered by **CodeMirror 6** (`@uiw/react-codemirror`) customized with Synthwave Dark & Apple GS/OS Light themes.
- **Autocomplete & IntelliSense Strictly Disabled**: No dropdown suggestions or ghost text, strictly enforcing cold-start recall conditions for realistic interview drills.
- **Rainbow Bracket Pair Colorization**: Nested bracket pairs (`()`, `[]`, `{}`) are highlighted with neon/pastel hues (`rainbowbrackets`) for rapid structural scanning.
- **Autoclosing Brackets & Quotes**: Auto-pairs and jumps over `()`, `[]`, `{}`, `""`, `''`, and `` ` ``.
- **In-Browser Prettier Formatting**: Client-side code formatting powered by standalone Prettier (`prettier/standalone` with Babel, TypeScript, and Estree plugins). Format via toolbar or **`Shift + Alt + F`** / **`Cmd + Shift + F`**.

### 3. 100% Dual TypeScript Solutions (`283 / 283 Cards`)
- Every card in the catalog features canonical **JavaScript (`<id>.ref.js`)** and **TypeScript (`<id>.ref.ts`)** reference implementations.
- Ambient data structures (`ListNode<T>`, `TreeNode<T>`) and browser globals are baked into the execution sandbox.
- **Clean Type Signatures**: Prompt headings feature readable signatures (`### functionName(arg: Type): ReturnType`), while complex option models and structured return types are extracted into clean ```ts interface blocks.
- **Context-Aware Solution Reveal**: In TypeScript mode, the evaluation panel reveals the canonical TypeScript solution with a blue badge; in JavaScript mode, it displays the JavaScript solution with an amber badge.

### 4. Live React Component Preview & Props Control Panel
- For cards authoring React components, a live sandboxed preview pane (`sandbox="allow-scripts"`) mounts and renders the component in real time.
- **Interactive Props Control Panel**: Dynamic live sliders, text inputs, toggles, enum pickers, and JSON editors for `string`, `number`, `boolean`, `enum`, `function`, and `json` props.
- **Compound Component Grouping**: Multi-part component problems (Tabs, Accordions, Breadcrumbs) group controls by subcomponent.
- **Live Event Logging & External Window**: Captures component callback events live in an interactive log drawer, and supports popping out to an external browser window with two-way postMessage synchronization.

### 5. Timed Recall Mode (`src/lib/timedMode.ts`)
- Configurable countdown timer (5, 10, 15, or 20 minutes) simulating realistic high-pressure interview screens.
- Automatically begins countdown on card mount. When time expires (0:00), the arena automatically submits the current buffer for grading.

### 6. Practice Focus & Presets (`FocusModal.tsx`)
- Filter active practice sessions by Topic/Track, specific tags, and difficulty range (1–5: Warm-up to Expert).
- Save and switch between named focus presets (e.g. "React Component Screen", "Core Algorithms").

### 7. Deck Deactivation & Safe Reactivation
- Cards can be deactivated or hidden without permanent data loss.
- Deactivated cards are clearly viewable under the **Deactivated** filter in the Deck Catalog and can be restored to active rotation with a single click.

### 8. Analytics & Activity View (`DeckStatsWidget.tsx`)
- Interactive dashboard widget featuring 4 diagnostic views:
  1. **Skill Matrix**: Spider-web capability coverage across topics.
  2. **Track Orbit**: Visual distribution of cards across domains.
  3. **Mastery Tiers**: Distribution of cards across boxes/tiers.
  4. **Activity View**: 30-day interactive daily review volume, active days, and pass rate trends.

### 9. Multi-Key Vault & Optional AI Evaluator (`src/lib/ai.ts`)
- Store API keys locally in `localStorage` for multiple providers: **Anthropic Claude**, **OpenAI**, **Google Gemini**, **Groq**, and **OpenRouter**.
- **Instant 1-Click Switching**: Seamlessly switch providers without re-entering keys.
- **Automatic Prefix Detection**: Pasting a key automatically selects the corresponding provider (`sk-ant-` -> Anthropic, `gsk_` -> Groq, `AIzaSy` -> Gemini, `sk-or-` -> OpenRouter).
- **Objective Grading Priority**: The test harness is always the objective arbiter; AI critiques provide qualitative code style reviews and can mark a passing run as needing revision, but can never rescue a failing test harness.

### 10. Persistence & First-4-Problems Backup Advisory
- Progress, algorithm preferences, drafts, and custom presets persist in `localStorage`.
- Full JSON export and import capabilities in the Deck Catalog.
- **Backup Advisory**: After 4 completed scored problems, a gentle advisory prompts users to export their state, spotlighting the Deck Catalog export button with an amber pulse.

---

## Keyboard Shortcuts

| Shortcut (Mac) | Shortcut (Win/Linux) | Action |
|---|---|---|
| `Cmd + Enter` | `Ctrl + Enter` | Run Code against test harness |
| `Cmd + Shift + Enter` | `Ctrl + Shift + Enter` | Submit Final Answer (scored) |
| `Shift + Alt + F` / `Cmd + Shift + F` | `Shift + Alt + F` / `Ctrl + Shift + F` | Format Code with Prettier |
| `Tab` | `Tab` | Indent 2 spaces |
| `Cmd + /` | `Ctrl + /` | Toggle line comment |

---

## Content & Authoring Pipeline

The repository includes **283 curated cards** across 11 topic tracks with **2,001 test cases**:
- **Algorithms** (77 cards)
- **React Components** (51 cards)
- **JS Utilities** (37 cards)
- **React Hooks & Patterns** (27 cards)
- **JS Language Core** (25 cards)
- **Async JS** (21 cards)
- **DOM & Browser APIs** (20 cards)
- **TypeScript Patterns** (14 cards)
- **Testing & Libraries** (5 cards)
- **GraphQL** (6 cards)

### Card Structure (`scripts/cards/`)
Each card consists of audited modular sources:
- `<id>.prompt.txt`: GitHub-flavored Markdown instructions, parameters, constraints, and edge cases.
- `<id>.ref.js`: Canonical JavaScript reference solution.
- `<id>.ref.ts`: Canonical TypeScript reference solution.
- `<id>.meta.json`: Track, title, tags, and component rendering flags.
- `<id>.harness.js`: Specialized DOM/React/Async test harness (or auto-generated from contract cases).
- `<id>.preview.js`: Interactive React preview mount script.
- `scripts/testcases/part*.mjs`: Explicit input-to-expected test cases shown in the Target Contract table.

---

## Roadmaps & Future Extensions

- **[CUSTOM_DECKS_AND_AI_INTERVIEW_PREP_ROADMAP.md](CUSTOM_DECKS_AND_AI_INTERVIEW_PREP_ROADMAP.md)**:
  - Dropdown Deck Switcher (Full-Stack Core, Frontend Specialist, Core Algorithms, MAANG Algorithms, and Custom Decks).
  - AI Interview Prep Copilot (Job description & recruiter note analysis, candidate calibration, curated card assembly).
  - AI Socratic Clarification & Hint Assistant (in-arena `?` button for conceptual hints and contract clarification without code spoilers).
  - One-Click Downloadable PDF Study Guide & 24-Hour Countdown Checklist.
- **[TOPIC_EXPANSION_ROADMAP.md](TOPIC_EXPANSION_ROADMAP.md)**:
  - In-browser execution specifications for upcoming Optional Extension Packs:
    - **Tailwind CSS** (`tailwind-css`): Class conflict resolution (`twMerge`), component variant authorities (`cva`), responsive layouts.
    - **GraphQL** (`graphql`): SDL validation, query builders, resolver pipelines, and `DataLoader` batching.
    - **SQL / PostgreSQL** (`sql-postgres`): In-browser execution via `sql.js` (WebAssembly SQLite) covering window functions, CTEs, cohorts, and aggregations.
    - **Real-Time Streaming** (`realtime-streaming`): Server-Sent Events (SSE) readers and reconnecting WebSockets.
    - **Web Performance** (`web-performance`): Long-task chunking with `scheduler.yield()`, CLS/INP performance observers.
    - **Offline Storage** (`offline-storage`): Promisified IndexedDB and mutation replay queues.
    - **Frontend Security** (`frontend-security`): HTML sanitizers and secure postMessage bridges.

---

## Deployment

Pushing to `master` automatically triggers the GitHub Actions CI/CD workflow (`.github/workflows/deploy.yml`), running lint, type checks, unit tests, and Playwright Chromium verification before deploying to GitHub Pages.
