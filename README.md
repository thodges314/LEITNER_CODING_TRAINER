# Leitner Coding Trainer

A personal spaced-repetition trainer for cold-start coding practice. You rebuild a pattern
from a prompt (debounce, LRU cache, `usePrevious`, a discriminated-union exhaustiveness check, ...),
run it against a test harness, and the Leitner box system decides when the card comes back.

React 19 + TypeScript + Vite. Everything runs in the browser; progress lives in `localStorage`.

## Run it

```bash
npm install
npm run dev        # dev server
npm test           # vitest (scheduler, runner, harness parsing, seed cards)
npm run lint
npm run build      # type-check + production build into dist/
```

## How it works

- **Scheduling Algorithms** (`src/lib/leitner.ts`): Switchable in Settings between two spaced-repetition models:
  - **Classic Leitner Boxes**: 5 boxes with trial-based intervals (+1, +4, +10, +22, +45 reviews). A pass promotes to the next box; a failure resets the card to Box 1 and schedules its setback trial.
  - **Graduated Interval Recall & Chaining**: 7 graduated recall tiers with micro-spaced chaining (+1, +2, +5, +12, +28, +65, +150 reviews). On pass, advances to the next tier; on failure, applies a gentle half-tier setback (`Math.max(1, Math.floor(tier / 2))`) rather than losing all progress.
  - **Immediate Reinforcement Drill**: Committing a card failure launches an isolated practice drill on the same card. The user can replicate the solution and retest until they get it right; practice in the drill has **zero effect on tier/box or streak stats**. Once replicated, they continue to the next card.
  - In both algorithms, tracks are interleaved, and every 4 cards in box/tier 3+ unlock 4 more locked cards along the difficulty ladder.
- **Cold-Start Editor & Aesthetics** (`src/components/PracticeArena.tsx`):
  - Powered by **CodeMirror 6** (`@uiw/react-codemirror`) styled for high-contrast dark themes.
  - **Autocomplete & IntelliSense strictly disabled**: No ghost text, no dropdown suggestions, preserving cold-start recall conditions for realistic interview drills.
  - **Autoclosing brackets & quotes**: Automatic closing and jump-over for `()`, `[]`, `{}`, `""`, `''`, and `` ` ``.
  - **Rainbow Bracket Pair Colorization (Path B)**: Bracket pairs are color-coded in nested neon/pastel hues (`rainbowbrackets`) for rapid structural scanning.
  - **In-Browser Code Formatting**: Client-side formatting powered by **Prettier Standalone** (`prettier/standalone` with Babel, TypeScript, and Estree plugins). Format via the toolbar button or **`Shift + Alt + F`** / **`Cmd + Shift + F`**.
- **Keyboard Shortcuts**:
  - `Shift + Alt + F` / `Cmd + Shift + F`: Format code with Prettier
  - `Cmd + Enter` / `Ctrl + Enter`: Run Code against test harness in sandbox
  - `Cmd + Shift + Enter` / `Ctrl + Shift + Enter`: Submit for evaluation
  - `Tab`: Indent with 2 spaces
  - `Cmd + /` / `Ctrl + /`: Toggle line comments
- **Grading** (`src/lib/runner.ts`): on submit the card's test harness is run headlessly against your code.
  A card passes only if the harness logs at least one `PASS` and no `FAIL`/errors. An AI model (optional) adds
  critique but cannot override a failing harness. You can always override the verdict by hand
  (useful for harnesses that need the network).
- **Offline mode**: with no API key, grading is harness-only plus advisory structural notes.
- **TypeScript mode**: strict type-checking with the TypeScript compiler, loaded lazily on first use.
- **Persistence**: seed content from `src/data/topics.json` is merged into your stored deck on load. Progress is
  kept, content updates flow in, new seed cards are added, and seed cards you delete stay deleted.
- **Timed Recall Mode** (`src/lib/timedMode.ts`): Toggle in Settings to simulate realistic time-pressured interview rounds.
  - Configurable duration: 5, 10 (default), 15, or 20 minutes.
  - Automatically begins countdown as soon as a practice card loads.
  - When the countdown reaches 0:00, the arena automatically submits whatever code is currently in the editor for test harness execution and AI evaluation.
- **Persistence**: seed content from `src/data/topics.json` is merged into your stored deck on load. Progress is
  kept, content updates flow in, new seed cards are added, and seed cards you delete stay deleted.
  Algorithm preference, timed mode settings, multi-key vault, and draft code are persisted in `localStorage`.
  Use the dashboard to export/import JSON backups.

## AI evaluator & Multi-Key Vault (optional)

Settings accepts Gemini, OpenAI, Groq, OpenRouter, or any OpenAI-compatible endpoint:
- **Multi-Key Vault**: Store keys independently for multiple AI providers in `localStorage`.
- **Instant 1-Click Switching**: Seamlessly switch between saved providers without having to re-enter your API keys. Provider buttons show active badges indicating whether a key is saved.
- **Key Prefix Detection**: Pasting or loading a key with recognizable prefixes (`gsk_` for Groq, `AIzaSy` for Gemini, `sk-or-` for OpenRouter, `sk-` for OpenAI) automatically configures the appropriate provider and model.
- Keys are kept locally in your browser's `localStorage` and sent only to the provider you select. Use restricted keys.

## Content

Cards live in `src/data/topics.json` (`promptSeed`, `starterCode`, `testHarness`, `referenceSolution`, `testCases`).
Harnesses report with `console.log('label:', cond ? 'PASS' : 'FAIL')`.

Helper scripts are in `scripts/`:

- `scripts/testcases/*.mjs` holds the hand-written input/output pairs for every card (the "Target Contract" table).
  `scripts/cards/<id>.{prompt.txt,ref.js,harness.js,extra.js}` hold prompts, reference solutions and hand-written harnesses.
  `npm run build:cards` regenerates `promptSeed`, the reference solution, `testCases` and `testHarness` in `topics.json`.
  Harnesses are generated from the cases (each case becomes one `$test.run(...)` assertion) unless a card has a
  hand-written `harness.js` (React/DOM cards), and `extra.js` appends type-level (`@ts-expect-error`) checks for TS cards.
- Harness globals: `$test` (`run`, `rejects`, `logs`, `check`, `equal`, `sleep`) and `$dom` (`render`, `renderHook`,
  `renderError`, `fire.click/change/keyDown/submit/focus`, `wait`, `q`, `qa`, `intersect`, `observers`). They render with
  the page's real DOM in the browser and jsdom in tests, with a mock `IntersectionObserver` and a deterministic `fetch`.
  Built-in prototypes patched by a solution (polyfill cards) are restored after each run.
- The old `generate_all_fixtures.cjs` generator was removed (it corrupted cards); cards are authored in `scripts/cards` and built with `npm run build:cards`.

`src/lib/seedCards.test.ts` runs every card's harness against its reference solution (must pass), checks that every documented
case is asserted under the same label, and checks that an empty solution does NOT pass.

## Deploy

Pushing to `master` builds and deploys to GitHub Pages (`.github/workflows/deploy.yml`), after lint and tests pass.
