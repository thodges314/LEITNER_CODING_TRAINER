# Leitner Coding Trainer — Architecture and Roadmap

> **Live app & quick rules:** [README.md](README.md) · [AGENTS.md](AGENTS.md) · [DELEGATION.md](DELEGATION.md)  
> **Upcoming expansions:** [TOPIC_EXPANSION_ROADMAP.md](TOPIC_EXPANSION_ROADMAP.md)

---

## 1. Current State (Snapshot)

- **Curriculum:** **444 cards** across **17 tracks** with **2,775 documented test cases** and **100% dual JS/TS reference solutions** (`444 / 444`).
- **Verification:** **2,813 Vitest unit tests** (75 test files) and **956 Playwright E2E tests** (17 spec files).
- **Bundle & Startup:** Initial Catalog boot is **`432.1 KB` gzip** (`1,459.2 KB` raw), with [`PracticeArena`](src/components/PracticeArena.tsx) and the next card's track payload prefetched in the background during browser idle time.
- **Persistence:** Zero backend; user progress, settings, custom decks, interview dossiers, and AI keys (multi-key vault) live in `localStorage` via [`src/lib/storage.ts`](src/lib/storage.ts) and [`src/lib/leitner.ts`](src/lib/leitner.ts). `slimForStorage()` strips heavy card payloads before writing to `localStorage`.

---

## 2. Repository Map

### Application Source (`src/`)
- **Entry & Shell:** [`src/App.tsx`](src/App.tsx) (lazy-loads all 9 secondary modals + `PracticeArena` with idle prefetch, hydrates per-track content before mounting Practice), [`src/main.tsx`](src/main.tsx).
- **Design System & Colors:** [`src/styles/colors.ts`](src/styles/colors.ts), [`src/styles/colors.css`](src/styles/colors.css), [`src/styles/components/`](src/styles/components/) (`deck-dashboard.css`, `deck-selector.css`, `interview-prep.css`, `deck-editor.css`, `popovers.css`, etc.).
- **Data & Lazy Track Payloads (`src/data/`):**
  - [`topicsMeta.json`](src/data/topicsMeta.json): Lightweight 444-card metadata loaded synchronously at boot.
  - `src/data/tracks/<track>.json`: 17 per-track chunks containing heavy card fields (`promptSeed`, `testHarness`, `testCases`, `referenceSolution`, `referenceSolutionTs`, `previewCode`, `complexityExplanation`), loaded on demand by [`src/lib/trackContentLoader.ts`](src/lib/trackContentLoader.ts).
  - [`catalogIndex.json`](src/data/catalogIndex.json): Compact catalog summary used by AI Interview Prep & dossier printing.
  - [`topics.json`](src/data/topics.json): Complete combined seed dataset kept for Node/Vitest reference-solution verification and authoring scripts (not bundled into the browser app).
- **Core Engine (`src/lib/`):**
  - Scheduling & State: [`leitner.ts`](src/lib/leitner.ts), [`trackMeta.ts`](src/lib/trackMeta.ts), [`practiceFilter.ts`](src/lib/practiceFilter.ts), [`scheduling.ts`](src/lib/scheduling.ts), [`deckTelemetry.ts`](src/lib/deckTelemetry.ts), [`deckBackup.ts`](src/lib/deckBackup.ts), [`deckMigrations.ts`](src/lib/deckMigrations.ts), [`decks.ts`](src/lib/decks.ts), [`dailyStats.ts`](src/lib/dailyStats.ts), [`storage.ts`](src/lib/storage.ts).
  - Execution & Preview: [`runner.ts`](src/lib/runner.ts), [`sandboxWorker.ts`](src/lib/sandboxWorker.ts), [`workerClient.ts`](src/lib/workerClient.ts), [`sandboxLibraries.ts`](src/lib/sandboxLibraries.ts), [`reactPreviewFrame.ts`](src/lib/reactPreviewFrame.ts), [`reactPreviewBundle.ts`](src/lib/reactPreviewBundle.ts), [`d3PreviewBundle.ts`](src/lib/d3PreviewBundle.ts), [`previewConfig.ts`](src/lib/previewConfig.ts), [`previewPropsConfig.ts`](src/lib/previewPropsConfig.ts), [`formatter.ts`](src/lib/formatter.ts).
  - AI & Interview Prep: [`ai.ts`](src/lib/ai.ts), [`aiProviders.ts`](src/lib/aiProviders.ts), [`aiPrompts.ts`](src/lib/aiPrompts.ts), [`modelDiscovery.ts`](src/lib/modelDiscovery.ts), [`interviewPrep.ts`](src/lib/interviewPrep.ts), [`dossierStorage.ts`](src/lib/dossierStorage.ts), [`printDossier.ts`](src/lib/printDossier.ts).
- **UI & Hooks (`src/components/`, `src/hooks/`, `src/utils/`):**
  - Dashboard & Catalog: [`DeckDashboard.tsx`](src/components/DeckDashboard.tsx), [`DeckStatsWidget.tsx`](src/components/DeckStatsWidget.tsx), [`ActivityView.tsx`](src/components/ActivityView.tsx), [`src/components/dashboard/`](src/components/dashboard/) (`DeckSelector.tsx`, `DeckEditorModal.tsx`, `InterviewPrepModal.tsx`, `RemoveFromDeckModal.tsx`).
  - Practice Arena: [`PracticeArena.tsx`](src/components/PracticeArena.tsx), [`LivePreview.tsx`](src/components/LivePreview.tsx), [`MarkdownContent.tsx`](src/components/MarkdownContent.tsx), [`ArrayTraceBlock.tsx`](src/components/ArrayTraceBlock.tsx), [`LinkedListBlock.tsx`](src/components/LinkedListBlock.tsx), [`GridBoardBlock.tsx`](src/components/GridBoardBlock.tsx), [`DecisionTreeBlock.tsx`](src/components/DecisionTreeBlock.tsx), [`src/components/practice/`](src/components/practice/), [`src/components/evaluation/`](src/components/evaluation/), [`src/hooks/`](src/hooks/) (`usePracticeCodeExecution.ts`, `useTimedPractice.ts`, `useLegacyComponentPopup.ts`, `useCodeMirrorLanguage.ts`, `usePreviewProps.ts`).
  - Settings: [`SettingsModal.tsx`](src/components/SettingsModal.tsx) + [`src/components/settings/`](src/components/settings/).
  - TypeScript Sandbox: [`src/utils/typeChecker.ts`](src/utils/typeChecker.ts), [`sandboxD3Types.ts`](src/utils/sandboxD3Types.ts), [`sandboxNextTypes.ts`](src/utils/sandboxNextTypes.ts), [`nextSandbox.ts`](src/utils/nextSandbox.ts), [`cardPromptTypes.ts`](src/utils/cardPromptTypes.ts).

### Card Authoring & Scripts (`scripts/`)
- Card sources live in `scripts/cards/` (`<id>.{meta.json,prompt.txt,ref.js,ref.ts,harness.js,extra.js,preview.js}`), reusable prompt partials live in `scripts/cards/partials/` (included via `{{include:<filename>.md}}`), contract test cases in `scripts/testcases/part*.mjs`, difficulty ladders in `scripts/difficulty.json`, and optional packs in `scripts/packs.json`.
- `npm run build:cards` ([`scripts/build-cards.mjs`](scripts/build-cards.mjs)) compiles `topics.json`, `topicsMeta.json`, `src/data/tracks/*.json`, and `catalogIndex.json`.
- `npm run check:cards` verifies all generated JSON artifacts match source files without writing.

---

## 3. Execution, Preview & Cold-Start Architecture

- **Cold-Start Editor:** CodeMirror 6 (`@uiw/react-codemirror`) with autocomplete/IntelliSense disabled, rainbow bracket matching, and lazy-loaded DSL grammars (`sql`, `html`, `graphql`) via [`useCodeMirrorLanguage.ts`](src/hooks/useCodeMirrorLanguage.ts).
- **Worker vs. DOM Sandbox:** Pure-logic cards execute in an ES-module Web Worker ([`sandboxWorker.ts`](src/lib/sandboxWorker.ts)) with `worker.terminate()` runaway-loop protection. Cards with `requiresDom: true` (UI tracks or explicit `.meta.json` flag) run in the main-thread DOM sandbox. Heavy runtimes (`@electric-sql/pglite`, `graphql`, `d3`) are dynamically imported per card by [`sandboxLibraries.ts`](src/lib/sandboxLibraries.ts).
- **Live Preview (`sandbox="allow-scripts allow-forms"`):** [`reactPreviewFrame.ts`](src/lib/reactPreviewFrame.ts) injects only the libraries declared in `previewLibraries` (`react`, `d3`, `tailwind`)—loading [`reactPreviewBundle.ts`](src/lib/reactPreviewBundle.ts) (`react-dom/profiling`) and/or [`d3PreviewBundle.ts`](src/lib/d3PreviewBundle.ts) on demand, and Tailwind Play CDN only for Tailwind cards. Includes `Profiler` render-loop watchdog (>100 commits/sec), Props Control Panel (`usePreviewProps.ts`), and external pop-out sync.
- **Verdict Precedence:** With an AI key, `passed = AI_says_passed && harness_passed`; offline, `passed = harness_passed`. The test harness is always the objective arbiter.

---

## 4. Spaced Retrieval Algorithms

Switchable in Settings ([`src/lib/scheduling.ts`](src/lib/scheduling.ts) + [`src/lib/leitner.ts`](src/lib/leitner.ts)):
- **Graduated Interval Recall & Chaining (default):** 7+ tiers (`+1, +3, +7, +16, +35, +75, +165`, then geometric) capped to active deck size `N`, with half-tier setbacks on miss (`Math.max(1, Math.floor(tier / 2))`).
- **Classic Leitner Boxes:** 5 boxes (`+1, +4, +10, +22, +45`), resetting to Box 1 on miss.
- **Immediate Reinforcement Drill:** Failing a scored review enters an unscored drill with solution reveal so muscle memory is rebuilt without double-penalizing stats.
- **Staged Ladder Unlocks:** Every 4 cards promoted to Box/Tier 3+ unlocks the next rung along matching concepts (respecting active Focus and enabled packs).

---

## 5. Open Roadmap (Unaddressed Work)

> Completed tracks, TypeScript migration, React/D3 previews, Custom Decks, AI Interview Prep, and bundle splitting are shipped and tracked in git history. Only **unbuilt / open** items remain below.

### 5.1 Difficulty Ladder Status (Closed)
- Pure-function, TypeScript, and React/DOM starter rungs (`tabs-basic` d1, `render-counter-basics` d1, `two-step-wizard` d1, `switch-toggle-a11y` d1, plus d2 starters `accordion-component`, `simple-error-boundary`, `memo-derived-list`, `filter-list`, `load-more-list`, `a11y-form-field`) are complete. Only `architecture` stays a single d5 capstone.

### 5.2 Remaining Card Families & Tracks
- **Extension Tracks:** See [TOPIC_EXPANSION_ROADMAP.md](TOPIC_EXPANSION_ROADMAP.md) for the 4 unbuilt tracks: `realtime-streaming`, `web-performance`, `offline-storage`, `frontend-security`.
- **DOM / Browser Extras:** `postMessage` channel, `Worker` message protocol.
- **React 19 Depth:** Additional cards exercising `useOptimistic`, `useActionState`, `use(promise)` (with async-safe `act` in `$dom`).
- **CSS / Layout (needs Playwright grading):** Real `getBoundingClientRect` layout cards remain out of scope until browser-graded CSS harnesses are introduced.
- **Project Recipes (optional):** Unscored catalog checklists showing which cards compose a full app (e.g., typeahead page, kanban board).

### 5.3 Product & Quality Backlog
- **Session Mode:** Practice `N` cards drawn strictly from the current Focus filter.
- **Mutation & Complexity Audit:** Complete survivor triage on `scripts/mutation-baseline.jsonl` (`npm run mutation`) and human spot-check on auto-generated `targetTime`/`targetSpace`/`complexityExplanation` fields.
- **Dropped — User-Authored / AI-Generated Cards:** Scrapped (`AddTopicModal` and `FEATURES.quickAdd` removed); existing curated cards already require heavy auditing and fine-tuning.

---

## 6. Conventions & Pitfalls for Assistants

- Never run or recreate bulk unverified fixture generators. Write concrete input → expected cases by hand.
- Never edit generated files (`topics.json`, `topicsMeta.json`, `src/data/tracks/*.json`, `catalogIndex.json`) directly; run `npm run build:cards` and verify with `npm run check:cards`.
- Reserve `<Sparkles />` strictly for AI features and omit trailing `...` ellipses on action buttons ([AGENTS.md](AGENTS.md)).
- Test files needing `localStorage`/DOM must start with `// @vitest-environment jsdom` (default is `node`).
- **Suspense / Transitions / `use()` Harnesses:** Mount with `await act(async () => { r = render(ui); })`, dispatch clicks inside `await act(async () => ...)`, never create your own `ReactDOM.createRoot`, poll with `waitFor` instead of fixed sleeps, and run `--repeat-each=5` in Chromium before committing.
- **Sandbox Scope (`SANDBOX_NAMES` in `runner.ts`):** New injected globals become function parameters in eval; add sparingly and run the full suite. Never put `import`/`export` in `scripts/cards/`.
- **Preview & DOM Flags:** Declare `"previewLibraries"` (`["react"]`, `["d3"]`, `["tailwind"]`) and `"requiresDom": true` explicitly in `<id>.meta.json` whenever needed.
